import { Users } from 'lucide-react';

export default function PlayerList({ players, currentUserId }) {
  const sorted = [...players].sort((a, b) => {
    const aScore = (a.grid || []).filter(c => c.status === 'approved').length;
    const bScore = (b.grid || []).filter(c => c.status === 'approved').length;
    return bScore - aScore;
  });

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 px-8">
        <Users size={40} className="mb-3 text-gray-300" />
        <p className="font-medium text-center">還沒有玩家</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="font-bold text-gray-800 text-base mb-3">玩家列表</h2>
      <div className="space-y-2">
        {sorted.map((player, idx) => {
          const approved = (player.grid || []).filter(c => c.status === 'approved').length;
          const pending = (player.grid || []).filter(c => c.status === 'pending').length;
          const isMe = player.userId === currentUserId;

          return (
            <div
              key={player.userId}
              className={`bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm border ${isMe ? 'border-green-300' : 'border-gray-100'}`}
            >
              <div className="text-sm font-bold text-gray-400 w-5 text-center shrink-0">
                {idx + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="font-semibold text-gray-800 truncate">{player.nickname}</span>
                  {isMe && <span className="text-xs text-green-600 font-medium shrink-0">（我）</span>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${(approved / 9) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 shrink-0">{approved}/9</span>
                </div>
              </div>

              {pending > 0 && (
                <span className="text-xs bg-yellow-50 text-yellow-600 border border-yellow-200 rounded-full px-2 py-0.5 shrink-0">
                  ⏳ {pending}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
