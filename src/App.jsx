import { useState, useEffect } from 'react';
import { auth, isConfigured } from './firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
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
    setGameState({ roomId, nickname, stablePlayerId });
  };

  const handleAdminJoin = (pw) => {
    if (!ADMIN_PASSWORD) return alert('尚未設定管理員密碼（VITE_ADMIN_PASSWORD）');
    if (pw !== ADMIN_PASSWORD) return alert('密碼錯誤');
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
