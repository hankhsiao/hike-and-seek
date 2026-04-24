import ActivityItem from './ActivityItem';

export default function ActivityFeed({ activities, currentUserId, totalPlayers, onVote }) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 px-8">
        <p className="text-5xl mb-4">📷</p>
        <p className="font-medium text-center">還沒有任何活動</p>
        <p className="text-sm text-center mt-1">在「我的九宮格」點擊格子拍照後，照片會出現在這裡等待投票！</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {activities.map(activity => (
        <ActivityItem
          key={activity.id}
          activity={activity}
          currentUserId={currentUserId}
          totalPlayers={totalPlayers}
          onVote={onVote}
        />
      ))}
    </div>
  );
}
