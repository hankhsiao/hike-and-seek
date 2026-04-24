import { ThumbsUp, ThumbsDown } from 'lucide-react';

export default function ActivityItem({ activity, currentUserId, totalPlayers, onVote }) {
  if (activity.type === 'bingo') {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 text-center animate-bingo-pop">
        <p className="text-3xl mb-1">🎉</p>
        <p className="font-bold text-green-800 text-base">{activity.playerName} 達成連線！</p>
        <p className="text-green-600 text-xs mt-0.5">太厲害了！繼續加油！</p>
      </div>
    );
  }

  const {
    id, playerName, itemEmoji, itemName,
    photoData, activityPhotoData, votes, status, playerId,
  } = activity;

  const isOwner = currentUserId === playerId;
  const myVote = votes?.[currentUserId];
  const voteEntries = Object.entries(votes || {}).filter(([uid]) => uid !== playerId);
  const approvals = voteEntries.filter(([, v]) => v === 'approve').length;
  const rejections = voteEntries.filter(([, v]) => v === 'reject').length;
  const totalVoters = voteEntries.length;

  const displayPhoto = activityPhotoData || photoData;

  const statusBadge = {
    approved: <span className="text-green-700 text-xs bg-green-100 px-2 py-0.5 rounded-full font-medium">✓ 通過</span>,
    rejected: <span className="text-red-500 text-xs bg-red-100 px-2 py-0.5 rounded-full font-medium">✗ 未通過</span>,
    pending:  <span className="text-yellow-600 text-xs bg-yellow-100 px-2 py-0.5 rounded-full font-medium">審核中</span>,
  }[status];

  return (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden border animate-fade-in ${
      status === 'approved' ? 'border-green-200' :
      status === 'rejected' ? 'border-red-100' :
      'border-gray-100'
    }`}>
      <div className="px-3 py-2.5 flex items-center gap-2 border-b border-gray-50">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold text-green-700 flex-shrink-0">
          {playerName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-gray-800 text-sm">{playerName}</span>
          <span className="text-gray-400 text-xs"> 找到了 </span>
          <span className="font-medium text-gray-700 text-sm">{itemEmoji} {itemName}</span>
        </div>
        <div className="flex-shrink-0">{statusBadge}</div>
      </div>

      <div className="flex">
        <div className="w-1/2 bg-gray-50 relative">
          {displayPhoto
            ? <img src={displayPhoto} alt={itemName} className="w-full aspect-square object-cover" />
            : <div className="w-full aspect-square flex items-center justify-center text-gray-300 text-sm">無圖片</div>
          }
          <div className="absolute bottom-1 left-1 bg-black/40 rounded px-1.5 py-0.5">
            <span className="text-white text-xs">玩家照片</span>
          </div>
        </div>
        <div className="w-1/2 flex flex-col items-center justify-center gap-1.5 bg-gray-50 p-3 border-l border-gray-100">
          <span className="text-5xl leading-none">{itemEmoji}</span>
          <span className="text-gray-500 text-xs text-center leading-tight">{itemName}</span>
          <span className="text-gray-300 text-xs">參考圖示</span>
        </div>
      </div>

      {status === 'pending' && !isOwner && (
        <div className="p-3 flex gap-2 border-t border-gray-50">
          <button
            onClick={() => onVote(id, 'approve')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
              myVote === 'approve'
                ? 'bg-green-500 text-white shadow-sm'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            <ThumbsUp size={15} /> 可以！({approvals})
          </button>
          <button
            onClick={() => onVote(id, 'reject')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
              myVote === 'reject'
                ? 'bg-red-500 text-white shadow-sm'
                : 'bg-red-50 text-red-500 hover:bg-red-100'
            }`}
          >
            <ThumbsDown size={15} /> 不行！({rejections})
          </button>
        </div>
      )}

      {status === 'pending' && isOwner && (
        <div className="px-3 py-3 text-center text-gray-400 text-xs border-t border-gray-50">
          等待隊友投票中 · {approvals} 贊成 / {rejections} 反對
        </div>
      )}

      {status !== 'pending' && (
        <div className="px-3 py-2.5 text-center text-xs border-t border-gray-50 text-gray-400">
          {approvals} 贊成 · {rejections} 反對
        </div>
      )}
    </div>
  );
}
