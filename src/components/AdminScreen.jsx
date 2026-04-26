import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, getDocs, query,
  where, writeBatch, doc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Shield, Trash2, RefreshCw, LogOut } from 'lucide-react';

async function batchDelete(docs) {
  for (let i = 0; i < docs.length; i += 500) {
    const batch = writeBatch(db);
    docs.slice(i, i + 500).forEach(d => batch.delete(d.ref));
    await batch.commit();
  }
}

export default function AdminScreen({ onLeave }) {
  const [rooms, setRooms] = useState([]);
  const [players, setPlayers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsubRooms = onSnapshot(collection(db, 'hiking_rooms'), snap =>
      setRooms(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    const unsubPlayers = onSnapshot(collection(db, 'hiking_players'), snap =>
      setPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    const unsubActivities = onSnapshot(collection(db, 'hiking_activities'), snap =>
      setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => { unsubRooms(); unsubPlayers(); unsubActivities(); };
  }, []);

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm(`確定要清除房間「${roomId}」的所有資料嗎？`)) return;
    setBusy(true);
    try {
      const [pSnap, aSnap] = await Promise.all([
        getDocs(query(collection(db, 'hiking_players'), where('roomId', '==', roomId))),
        getDocs(query(collection(db, 'hiking_activities'), where('roomId', '==', roomId))),
      ]);
      const roomDocRef = doc(db, 'hiking_rooms', roomId);
      await batchDelete([...pSnap.docs, ...aSnap.docs]);
      const batch = writeBatch(db);
      batch.delete(roomDocRef);
      await batch.commit();
    } catch (e) {
      console.error(e);
      alert('刪除失敗，請重試');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('確定要清除【所有房間】的全部資料嗎？此操作無法復原。')) return;
    setBusy(true);
    try {
      const [pSnap, aSnap, rSnap] = await Promise.all([
        getDocs(collection(db, 'hiking_players')),
        getDocs(collection(db, 'hiking_activities')),
        getDocs(collection(db, 'hiking_rooms')),
      ]);
      await batchDelete([...pSnap.docs, ...aSnap.docs, ...rSnap.docs]);
    } catch (e) {
      console.error(e);
      alert('刪除失敗，請重試');
    } finally {
      setBusy(false);
    }
  };

  // Derive room list from players (works even without hiking_rooms docs)
  const roomMap = {};
  players.forEach(p => {
    if (!roomMap[p.roomId]) roomMap[p.roomId] = { id: p.roomId, roomPlayers: [], roomActivities: [], meta: null };
    roomMap[p.roomId].roomPlayers.push(p);
  });
  activities.forEach(a => {
    if (!roomMap[a.roomId]) roomMap[a.roomId] = { id: a.roomId, roomPlayers: [], roomActivities: [], meta: null };
    roomMap[a.roomId].roomActivities.push(a);
  });
  rooms.forEach(r => {
    if (roomMap[r.id]) roomMap[r.id].meta = r;
  });

  const derivedRooms = Object.values(roomMap).sort((a, b) => {
    const aTs = a.meta?.createdAt?.seconds ?? (a.roomPlayers[0]?.joinedAt?.seconds ?? 0);
    const bTs = b.meta?.createdAt?.seconds ?? (b.roomPlayers[0]?.joinedAt?.seconds ?? 0);
    return bTs - aTs;
  });

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gray-900 text-white px-4 pt-4 pb-3 shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-yellow-400" />
            <span className="font-bold text-lg">管理員面板</span>
          </div>
          <button
            onClick={onLeave}
            className="flex items-center gap-1 bg-white/10 hover:bg-white/20 rounded-xl px-3 py-1.5 text-sm font-medium transition active:scale-95"
          >
            <LogOut size={14} />
            離開
          </button>
        </div>
        <div className="text-gray-400 text-xs mt-1">
          {derivedRooms.length} 個房間 · {players.length} 位玩家 · {activities.length} 筆活動
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Delete all button */}
        <button
          onClick={handleDeleteAll}
          disabled={busy || derivedRooms.length === 0}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 disabled:opacity-50 text-white rounded-2xl py-3 font-bold transition-all shadow-sm"
        >
          <Trash2 size={16} />
          清除所有房間資料
        </button>

        {/* Room list */}
        {derivedRooms.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🏕️</p>
            <p className="font-medium">目前沒有任何房間</p>
          </div>
        ) : (
          <div className="space-y-3">
            {derivedRooms.map(({ id, roomPlayers, roomActivities, meta }) => {
              const ts = meta?.createdAt?.seconds ?? roomPlayers[0]?.joinedAt?.seconds;
              const createdAt = ts
                ? new Date(ts * 1000).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : '—';

              return (
                <div key={id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold text-gray-800 text-lg tracking-widest font-mono">{id}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{createdAt}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteRoom(id)}
                      disabled={busy}
                      className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl px-3 py-1.5 text-xs font-semibold transition active:scale-95 disabled:opacity-50"
                    >
                      <Trash2 size={12} />
                      刪除
                    </button>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>👥 {roomPlayers.length} 位玩家</span>
                    <span>📸 {roomActivities.length} 筆活動</span>
                  </div>
                  {roomPlayers.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {roomPlayers.map(p => (
                        <span key={p.id} className="bg-gray-100 text-gray-600 text-xs rounded-full px-2 py-0.5">
                          {p.nickname}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {busy && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl px-8 py-6 flex items-center gap-3 shadow-xl">
              <RefreshCw size={20} className="text-green-600 animate-spin" />
              <span className="font-medium text-gray-800">處理中...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
