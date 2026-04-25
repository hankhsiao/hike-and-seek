import { Clock, ThumbsUp, ThumbsDown } from 'lucide-react';

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

  const displayPhoto = activityPhotoData || photoData;

  const statusBadge = status === 'approved'
    ? <span className="text-green-600 text-xs font-medium">✓ 通過</span>
    : status === 'rejected'
    ? <span className="text-red-500 text-xs font-medium">✗ 未通過</span>
    : <span className="flex items-center gap-1 text-amber-500 text-xs font-medium"><Clock size={12} /> 大家審核中</span>;

  const borderColor = status === 'approved' ? 'border-green-300'
    : status === 'rejected' ? 'border-red-200'
    : 'border-yellow-300';

  return (
    <div className={`bg-white rounded-2xl overflow-hidden border-2 animate-fade-in ${borderColor}`}>
      <div className="px-4 py-3 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          <span className="font-bold text-gray-900">{playerName}</span> 找到了
        </p>
        {statusBadge}
      </div>

      <div className="flex items-center gap-2 px-3 pb-3">
        <div className="flex-1 relative bg-gray-100 rounded-xl overflow-hidden aspect-square">
          {displayPhoto
            ? <img src={displayPhoto} alt={itemName} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">無圖片</div>
          }
          <div className="absolute top-1.5 left-1.5 bg-black/40 rounded-md px-1.5 py-0.5">
            <span className="text-white text-xs">拍攝照片</span>
          </div>
        </div>

        <span className="text-gray-300 text-xl flex-shrink-0">›</span>

        <div className="flex-1 relative bg-gray-100 rounded-xl aspect-square flex flex-col items-center justify-center gap-1.5">
          <div className="absolute top-1.5 left-1.5 bg-black/20 rounded-md px-1.5 py-0.5">
            <span className="text-gray-700 text-xs">原物參考</span>
          </div>
          <span className="text-5xl leading-none">{itemEmoji}</span>
          <span className="text-gray-600 text-xs font-medium">{itemName}</span>
        </div>
      </div>

      {status === 'pending' && isOwner && (
        <div className="px-4 pb-3 flex items-center gap-3 text-amber-500 text-xs">
          <span>贊成：{approvals} 票</span>
          <span>反對：{rejections} 票</span>
          <span>等待隊友投票...</span>
        </div>
      )}

      {status === 'pending' && !isOwner && (
        <div className="px-3 pb-3 flex gap-2">
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

      {status !== 'pending' && (
        <div className="px-4 pb-3 flex gap-3 text-xs text-gray-400">
          <span>贊成：{approvals} 票</span>
          <span>反對：{rejections} 票</span>
        </div>
      )}
    </div>
  );
}
