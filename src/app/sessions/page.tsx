"use client";

import { useState, useCallback } from "react";
import { useSessions } from "@/lib/data/use-sessions";
import { useSessionDetail } from "@/lib/data/use-session-detail";
import SessionList from "@/components/sessions/session-list";
import SessionViewer from "@/components/sessions/session-viewer";

export default function SessionsPage() {
  const { sessions } = useSessions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileShowViewer, setMobileShowViewer] = useState(false);
  const { session, isLoading, isLive, hasMore, setPage } =
    useSessionDetail(selectedId);

  const handleLoadMore = useCallback(() => {
    setPage((p) => p + 1);
  }, [setPage]);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setMobileShowViewer(true);
  }, []);

  const handleBack = useCallback(() => {
    setMobileShowViewer(false);
  }, []);

  return (
    <div className="flex h-[calc(100vh-48px)]">
      <div
        className={`w-full lg:w-80 lg:shrink-0 ${
          mobileShowViewer ? "hidden lg:flex lg:flex-col" : "flex flex-col"
        }`}
      >
        <SessionList
          sessions={sessions}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      </div>

      <div
        className={`flex-1 ${
          mobileShowViewer ? "flex flex-col" : "hidden lg:flex lg:flex-col"
        }`}
      >
        {mobileShowViewer && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 border-b border-[#1f1f1f] bg-[#0c0c0c] px-4 py-2 text-sm text-[#a3a3a3] lg:hidden"
          >
            &larr; Sessions
          </button>
        )}

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
            <div className="text-center">
              <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-[#1f1f1f] border-t-[#DF4F15]" />
              <p className="mt-3 text-sm text-[#525252]">Loading session...</p>
            </div>
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
