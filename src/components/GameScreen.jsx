import { useState, useEffect, useRef } from 'react';
import {
  doc, setDoc, onSnapshot, collection, addDoc,
  updateDoc, serverTimestamp, query, where, runTransaction,
  getDocs, writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { getRandomGrid } from '../utils/gameItems';
import { checkBingo, isNewBingoAtIndex } from '../utils/bingoChecker';
import BingoGrid from './BingoGrid';
import ActivityFeed from './ActivityFeed';
import PlayerList from './PlayerList';
import { Users, LogOut, RotateCcw } from 'lucide-react';

export default function GameScreen({ user, roomId, nickname, stablePlayerId, onLeave }) {
  const [activeTab, setActiveTab] = useState('grid');
  const [myGrid, setMyGrid] = useState(null);
  const [players, setPlayers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [newActivityCount, setNewActivityCount] = useState(0);
  const [roomData, setRoomData] = useState(null);
  const initialized = useRef(false);
  const prevActivityLen = useRef(0);

  const playerDocId = `${roomId}_${stablePlayerId}`;
  const playerRef = doc(db, 'hiking_players', playerDocId);
  const roomRef = doc(db, 'hiking_rooms', roomId);

  const isCreator = roomData?.creatorId === stablePlayerId;

  // Create room if it doesn't exist (first joiner becomes creator), then listen
  useEffect(() => {
    runTransaction(db, async (tx) => {
      const roomSnap = await tx.get(roomRef);
      if (!roomSnap.exists()) {
        tx.set(roomRef, { roomId, creatorId: stablePlayerId, createdAt: serverTimestamp() });
      }
    }).catch(console.error);

    const unsub = onSnapshot(roomRef, (snap) => {
      if (snap.exists()) setRoomData(snap.data());
    });
    return unsub;
  }, []);

  // Initialize + listen to own grid
  useEffect(() => {
    const unsub = onSnapshot(playerRef, (snap) => {
      if (snap.exists()) {
        setMyGrid(snap.data().grid);
        initialized.current = true;
      } else if (!initialized.current) {
        initialized.current = true;
        const grid = getRandomGrid();
        setDoc(playerRef, {
          userId: stablePlayerId,
          nickname,
          roomId,
          grid,
          joinedAt: serverTimestamp(),
        }).catch(console.error);
        setMyGrid(grid);
      }
    });
    return unsub;
  }, []);

  // Listen to all players in room
  useEffect(() => {
    const q = query(
      collection(db, 'hiking_players'),
      where('roomId', '==', roomId)
    );
    const unsub = onSnapshot(q, (snap) => {
      setPlayers(snap.docs.map(d => d.data()));
    });
    return unsub;
  }, [roomId]);

  // Listen to activities (sorted client-side to avoid composite index)
  useEffect(() => {
    const q = query(
      collection(db, 'hiking_activities'),
      where('roomId', '==', roomId)
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setActivities(list);

      if (list.length > prevActivityLen.current && activeTab !== 'activity') {
        setNewActivityCount(c => c + (list.length - prevActivityLen.current));
      }
      prevActivityLen.current = list.length;
    });
    return unsub;
  }, [roomId, activeTab]);

  const bingoLines = myGrid ? checkBingo(myGrid).length : 0;

  const handlePhotoTaken = async (gridIndex, thumbnailData, activityPhotoData) => {
    const cell = myGrid[gridIndex];
    if (cell.status !== 'empty' && cell.status !== 'pending') return;

    const isRetake = cell.status === 'pending';

    setActiveTab('activity');
    setNewActivityCount(0);

    const updatedGrid = myGrid.map((c, i) =>
      i === gridIndex ? { ...c, photoData: thumbnailData } : c
    );

    try {
      if (isRetake && cell.activityId) {
        const activityRef = doc(db, 'hiking_activities', cell.activityId);
        await updateDoc(activityRef, {
          photoData: thumbnailData,
          activityPhotoData: activityPhotoData || thumbnailData,
          votes: {},
          status: 'pending',
          updatedAt: serverTimestamp(),
        });
        await updateDoc(playerRef, { grid: updatedGrid });
      } else {
        const activityRef = await addDoc(collection(db, 'hiking_activities'), {
          roomId,
          playerId: stablePlayerId,
          playerName: nickname,
          gridIndex,
          itemId: cell.id,
          itemName: cell.name,
          itemEmoji: cell.emoji,
          photoData: thumbnailData,
          activityPhotoData: activityPhotoData || thumbnailData,
          votes: {},
          status: 'pending',
          createdAt: serverTimestamp(),
        });

        updatedGrid[gridIndex] = {
          ...updatedGrid[gridIndex],
          status: 'pending',
          activityId: activityRef.id,
        };

        await updateDoc(playerRef, { grid: updatedGrid });
      }
    } catch (e) {
      console.error('Upload failed:', e);
      alert('上傳失敗，請檢查網路連線後重試');
    }
  };

  const handleVote = async (activityId, vote) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity || activity.status !== 'pending') return;
    if (activity.playerId === stablePlayerId) return;

    const activityRef = doc(db, 'hiking_activities', activityId);
    const submitterRef = doc(db, 'hiking_players', `${roomId}_${activity.playerId}`);

    let shouldCelebrate = false;
    let celebrantName = '';

    try {
      await runTransaction(db, async (tx) => {
        const [actSnap, submSnap] = await Promise.all([
          tx.get(activityRef),
          tx.get(submitterRef),
        ]);

        if (!actSnap.exists() || actSnap.data().status !== 'pending') return;

        const currentVotes = actSnap.data().votes || {};
        const newVotes = { ...currentVotes, [stablePlayerId]: vote };

        const eligible = Object.entries(newVotes).filter(([uid]) => uid !== activity.playerId);
        const approvals = eligible.filter(([, v]) => v === 'approve').length;
        const rejections = eligible.filter(([, v]) => v === 'reject').length;

        const totalOthers = Math.max(
          players.filter(p => p.userId !== activity.playerId).length,
          1
        );

        let newStatus = 'pending';
        if (approvals > totalOthers / 2) newStatus = 'approved';
        else if (rejections > totalOthers / 2) newStatus = 'rejected';

        tx.update(activityRef, {
          votes: newVotes,
          ...(newStatus !== 'pending' && { status: newStatus }),
        });

        if (newStatus === 'approved' && submSnap.exists()) {
          const prevGrid = submSnap.data().grid;
          const newGrid = prevGrid.map((cell, i) =>
            i === activity.gridIndex ? { ...cell, status: 'approved' } : cell
          );
          tx.update(submitterRef, { grid: newGrid });

          if (isNewBingoAtIndex(newGrid, activity.gridIndex)) {
            shouldCelebrate = true;
            celebrantName = activity.playerName;
          }
        } else if (newStatus === 'rejected' && submSnap.exists()) {
          const prevGrid = submSnap.data().grid;
          const newGrid = prevGrid.map((cell, i) =>
            i === activity.gridIndex
              ? { ...cell, status: 'empty', photoData: null, activityId: null }
              : cell
          );
          tx.update(submitterRef, { grid: newGrid });
        }
      });

      if (shouldCelebrate) {
        await addDoc(collection(db, 'hiking_activities'), {
          roomId,
          type: 'bingo',
          playerName: celebrantName,
          createdAt: serverTimestamp(),
        });
      }
    } catch (e) {
      console.error('Vote failed:', e);
    }
  };

  const handleRestart = async () => {
    if (!window.confirm('確定要重新開始遊戲嗎？所有進度和照片都會清除。')) return;

    try {
      const [activitiesSnap, playersSnap] = await Promise.all([
        getDocs(query(collection(db, 'hiking_activities'), where('roomId', '==', roomId))),
        getDocs(query(collection(db, 'hiking_players'), where('roomId', '==', roomId))),
      ]);

      const batch = writeBatch(db);
      activitiesSnap.docs.forEach(d => batch.delete(d.ref));
      playersSnap.docs.forEach(d => batch.update(d.ref, { grid: getRandomGrid() }));
      await batch.commit();

      initialized.current = false;
      setActiveTab('grid');
    } catch (e) {
      console.error('Restart failed:', e);
      alert('重新開始失敗，請重試');
    }
  };

  const switchToActivity = () => {
    setActiveTab('activity');
    setNewActivityCount(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      {/* Sticky header + tabs */}
      <div className="sticky top-0 z-30">
        {/* Header */}
        <div className="bg-green-800 text-white px-4 pt-4 pb-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-bold text-lg leading-tight">房間：{roomId}</div>
              <div className="text-green-200 text-xs flex items-center gap-1 mt-0.5">
                <Users size={12} />
                <span>{players.length} 位玩家</span>
                {isCreator && (
                  <span className="ml-1 bg-yellow-500/30 text-yellow-200 rounded px-1 text-xs">房主</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isCreator && (
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white rounded-xl px-3 py-1.5 text-sm font-medium transition active:scale-95"
                >
                  <RotateCcw size={13} />
                  重置
                </button>
              )}
              <button
                onClick={onLeave}
                className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white rounded-xl px-3 py-1.5 text-sm font-medium transition active:scale-95"
              >
                <LogOut size={14} />
                離開
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white border-b border-gray-100 shadow-sm">
          <button
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'grid'
                ? 'text-green-700 border-b-2 border-green-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            onClick={() => setActiveTab('grid')}
          >
            九宮格
          </button>
          <button
            className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
              activeTab === 'activity'
                ? 'text-green-700 border-b-2 border-green-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            onClick={switchToActivity}
          >
            活動與投票
            {newActivityCount > 0 && activeTab !== 'activity' && (
              <span className="absolute top-2 right-4 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {newActivityCount > 9 ? '9+' : newActivityCount}
              </span>
            )}
          </button>
          <button
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'players'
                ? 'text-green-700 border-b-2 border-green-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            onClick={() => setActiveTab('players')}
          >
            玩家
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'grid' && myGrid && (
          <BingoGrid
            grid={myGrid}
            bingoLines={bingoLines}
            onPhotoTaken={handlePhotoTaken}
          />
        )}
        {activeTab === 'grid' && !myGrid && (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin mr-2" />
            載入中...
          </div>
        )}
        {activeTab === 'activity' && (
          <ActivityFeed
            activities={activities}
            currentUserId={stablePlayerId}
            totalPlayers={players.length}
            onVote={handleVote}
          />
        )}
        {activeTab === 'players' && (
          <PlayerList
            players={players}
            currentUserId={stablePlayerId}
          />
        )}
      </div>
    </div>
  );
}
