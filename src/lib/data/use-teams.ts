"use client";

import { useState, useCallback } from "react";
import { usePoll } from "./use-poll";
import type { Team } from "@/lib/types";

const DEFAULT_TEAMS: Team[] = [];

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>(DEFAULT_TEAMS);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeams = useCallback(async () => {
    try {
      const res = await fetch("/api/gateway/teams");
      const json = await res.json();
      setTeams(json.data || DEFAULT_TEAMS);
      setIsLive(json.source === "live");
    } catch {
      setTeams(DEFAULT_TEAMS);
      setIsLive(false);
    }
    setIsLoading(false);
  }, []);

  usePoll(fetchTeams, 30000);

  const createTeam = useCallback(
    async (team: Omit<Team, "id" | "createdAt">) => {
      const res = await fetch("/api/gateway/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(team),
      });
      const json = await res.json();
      if (json.data) setTeams(json.data);
    },
    []
  );

  const updateTeam = useCallback(async (team: Team) => {
    const res = await fetch("/api/gateway/teams", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(team),
    });
    const json = await res.json();
    if (json.data) setTeams(json.data);
  }, []);

  const deleteTeam = useCallback(async (id: string) => {
    const res = await fetch(`/api/gateway/teams?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (json.data) setTeams(json.data);
  }, []);

  return { teams, isLive, isLoading, createTeam, updateTeam, deleteTeam };
}
