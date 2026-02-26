import KanbanBoard from "@/components/tasks/kanban-board";

export default function TasksPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Tasks</h1>
          <p className="mt-1 text-sm text-[#737373]">
            Kanban board for tracking agent work
          </p>
        </div>
        <button className="rounded-lg bg-gradient-to-r from-[#DF4F15] via-[#F9425F] to-[#A326B5] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
          New Task
        </button>
      </div>
      <KanbanBoard />
    </div>
  );
}
