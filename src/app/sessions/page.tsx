"use client";

import { useState, useCallback } from "react";
import { useSessions } from "@/lib/data/use-sessions";
import { useSessionDetail } from "@/lib/data/use-session-detail";
import SessionList from "@/components/sessions/session-list";
import SessionViewer from "@/components/sessions/session-viewer";

export default function SessionsPage() {
  const { sessions } = useSessions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { session, isLoading, isLive, hasMore, setPage } =
    useSessionDetail(selectedId);

  const handleLoadMore = useCallback(() => {
    setPage((p) => p + 1);
  }, [setPage]);

  return (
    <div className="flex h-[calc(100vh-48px)]">
      <div className="w-80 shrink-0">
        <SessionList
          sessions={sessions}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      <div className="flex-1">
        {!selectedId ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-[#525252]">
                Select a session to view
              </p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-[#525252]">Loading session...</p>
          </div>
        ) : session ? (
          <SessionViewer
            session={session}
            isLive={isLive}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-[#525252]">Session not found</p>
          </div>
        )}
      </div>
    </div>
  );
}
