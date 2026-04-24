import { useState } from 'react';
import { Trophy } from 'lucide-react';

export default function JoinScreen({ user, onJoin }) {
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const handleJoin = () => {
    const name = nickname.trim();
    const room = roomCode.trim().toUpperCase();

    if (!name) return setError('請輸入你的暱稱');
    if (name.length > 12) return setError('暱稱最多 12 個字');
    if (room.length < 4 || room.length > 6) return setError('房間號碼需為 4–6 碼');
    if (!/^[A-Z0-9]+$/.test(room)) return setError('房間號碼只能包含英文字母與數字');

    onJoin({ roomId: room, nickname: name });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleJoin();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(160deg, #071a06 0%, #1a3d0a 35%, #0b2a04 65%, #040d03 100%)',
      }}
    >
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-fade-in">
        <div className="flex justify-center mb-5">
          <div className="bg-green-100 rounded-full p-4">
            <Trophy className="text-green-600 w-10 h-10" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-1">大自然寶果</h1>
        <p className="text-gray-400 text-center mb-7 text-sm">與朋友一起在 Hiking 中尋寶吧！</p>

        <div className="mb-4">
          <label className="block font-semibold text-gray-700 mb-2 text-sm">你的暱稱</label>
          <input
            type="text"
            value={nickname}
            onChange={e => { setNickname(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
            placeholder="例如：山系達人"
            maxLength={12}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
          />
        </div>

        <div className="mb-6">
          <label className="block font-semibold text-gray-700 mb-2 text-sm">房間號碼</label>
          <input
            type="text"
            value={roomCode}
            onChange={e => { setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')); setError(''); }}
            onKeyDown={handleKeyDown}
            placeholder="輸入 4-6 碼 (例如: HIKE1)"
            maxLength={6}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition tracking-widest font-mono"
          />
        </div>

        {error && (
          <p className="text-red-500 text-xs mb-4 text-center bg-red-50 py-2 rounded-xl">{error}</p>
        )}

        <button
          onClick={handleJoin}
          className="w-full bg-green-600 hover:bg-green-700 active:scale-95 text-white rounded-2xl py-4 text-lg font-bold transition-all shadow-md"
        >
          進入遊戲
        </button>
      </div>
    </div>
  );
}
