import ActivityFeed from "@/components/activity/activity-feed";

export default function ActivityPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Activity</h1>
        <p className="mt-1 text-sm text-[#737373]">
          Real-time feed of agent actions and system events
        </p>
      </div>
      <ActivityFeed />
    </div>
  );
}
