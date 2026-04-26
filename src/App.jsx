import { useState, useEffect } from 'react';
import { auth, isConfigured, db } from './firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getDocs, query, collection, where } from 'firebase/firestore';
import { derivePlayerId } from './utils/playerUtils';
import JoinScreen from './components/JoinScreen';
import GameScreen from './components/GameScreen';
import AdminScreen from './components/AdminScreen';
import SetupScreen from './components/SetupScreen';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [gameState, setGameState] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isConfigured) {
      setAuthLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        signInAnonymously(auth).catch(console.error);
      }
      setAuthLoading(false);
    });

    return unsub;
  }, []);

  if (!isConfigured) return <SetupScreen />;

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #052e16 100%)' }}>
        <div className="text-white text-xl animate-pulse">載入中...</div>
      </div>
    );
  }

  const handleJoin = async ({ roomId, nickname, password }) => {
    const stablePlayerId = await derivePlayerId(nickname, password);

    // If nickname already exists in this room, password must match
    const snap = await getDocs(query(
      collection(db, 'hiking_players'),
      where('roomId', '==', roomId),
      where('nickname', '==', nickname)
    ));

    if (!snap.empty && snap.docs[0].data().userId !== stablePlayerId) {
      throw new Error('此暱稱在這個房間已有人使用，密碼錯誤');
    }

    setGameState({ roomId, nickname, stablePlayerId });
  };

  const handleAdminJoin = (pw) => {
    if (!ADMIN_PASSWORD) { alert('尚未設定管理員密碼（VITE_ADMIN_PASSWORD）'); return; }
    if (pw !== ADMIN_PASSWORD) { alert('管理員密碼錯誤'); return; }
    setIsAdmin(true);
  };

  if (isAdmin) {
    return <AdminScreen onLeave={() => setIsAdmin(false)} />;
  }

  if (!gameState) {
    return <JoinScreen onJoin={handleJoin} onAdminJoin={handleAdminJoin} />;
  }

  return (
    <GameScreen
      user={user}
      roomId={gameState.roomId}
      nickname={gameState.nickname}
      stablePlayerId={gameState.stablePlayerId}
      onLeave={() => setGameState(null)}
    />
  );
}
