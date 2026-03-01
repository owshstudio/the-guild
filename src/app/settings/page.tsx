"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { loadSettings, saveSettings, type GuildSettings } from "@/lib/settings";
import { useAgents } from "@/lib/data/use-agents";
import { useToasts } from "@/components/toast-provider";
import { checkGatewayHealth } from "@/lib/gateway";

function useNetworkInfo() {
  const [lanIp, setLanIp] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/gateway/network-info")
      .then((r) => r.json())
      .then((d) => setLanIp(d.lanIp))
      .catch(() => {});
  }, []);
  return lanIp;
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors ${
        checked ? "bg-[#22c55e]" : "bg-[#2a2a2a]"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { agents } = useAgents();
  const { addToast } = useToasts();
  const lanIp = useNetworkInfo();
  const [settings, setSettings] = useState<GuildSettings | null>(() => {
    if (typeof window === "undefined") return null;
    return loadSettings();
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [tokenStatus, setTokenStatus] = useState<"idle" | "saving" | "ok" | "error">("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleSaveToken = async () => {
    if (!tokenInput.trim()) return;
    setTokenStatus("saving");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenInput.trim() }),
      });
      if (res.ok) {
        setTokenStatus("ok");
        setTokenInput("");
        addToast("success", "Token saved", "Auth cookie set for this session");
      } else {
        setTokenStatus("error");
        addToast("error", "Invalid token", "Token did not match server config");
      }
    } catch {
      setTokenStatus("error");
    }
  };

  // Auto-save on change with debounce
  const update = useCallback(
    (patch: Partial<GuildSettings>) => {
      setSettings((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => saveSettings(next), 300);
        return next;
      });
    },
    []
  );

  const updateAppearance = useCallback(
    (patch: Partial<GuildSettings["appearance"]>) => {
      setSettings((prev) => {
        if (!prev) return prev;
        const next = {
          ...prev,
          appearance: { ...prev.appearance, ...patch },
        };
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => saveSettings(next), 300);
        return next;
      });
    },
    []
  );

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const ok = await checkGatewayHealth();
    setTestResult(ok);
    setIsTesting(false);
    if (ok) {
      addToast("success", "Gateway reachable", "Connection test passed");
    } else {
      addToast("error", "Gateway unreachable", "Check the URL and try again");
    }
  };

  if (!settings) return null;

  return (
    <div className="min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="mt-1 text-sm text-[#737373]">
          Guild configuration and preferences
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Gateway Configuration */}
        <div className="rounded-xl border border-[#1f1f1f] bg-[#0c0c0c] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#d4d4d4]">
            Gateway Configuration
          </h2>
          <div className="mt-4">
            <label className="text-xs text-[#737373]">Gateway URL</label>
            <input
              type="text"
              value={settings.gatewayUrl}
              onChange={(e) => update({ gatewayUrl: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-2 font-mono text-sm text-[#e5e5e5] focus:border-[#DF4F15] focus:outline-none"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="rounded-lg border border-[#2a2a2a] px-4 py-2 text-xs font-medium text-[#d4d4d4] transition hover:border-[#3a3a3a] hover:bg-white/[0.03] disabled:opacity-50"
            >
              {isTesting ? "Testing..." : "Test Connection"}
            </button>
            <button
              onClick={handleTestConnection}
              className="rounded-lg bg-gradient-to-r from-[#DF4F15] via-[#F9425F] to-[#A326B5] px-4 py-2 text-xs font-medium text-white transition hover:opacity-90"
            >
              Reconnect
            </button>
            {testResult !== null && (
              <span
                className={`flex items-center gap-1.5 text-xs ${
                  testResult ? "text-[#22c55e]" : "text-[#ef4444]"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    testResult ? "bg-[#22c55e]" : "bg-[#ef4444]"
                  }`}
                />
                {testResult ? "Connected" : "Unreachable"}
              </span>
            )}
          </div>
        </div>

        {/* Security Token */}
        <div className="rounded-xl border border-[#1f1f1f] bg-[#0c0c0c] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#d4d4d4]">
            Security Token
          </h2>
          <p className="mt-2 text-xs text-[#737373]">
            If <code className="rounded bg-[#1a1a1a] px-1.5 py-0.5 font-mono text-[#DF4F15]">GUILD_API_TOKEN</code> is
            set on the server, enter it here to authenticate. Sets an httpOnly cookie
            for all requests including SSE streams.
          </p>
          <div className="mt-3 flex gap-2">
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => {
                setTokenInput(e.target.value);
                setTokenStatus("idle");
              }}
              placeholder="Paste your API token"
              className="flex-1 rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-2 font-mono text-sm text-[#e5e5e5] placeholder:text-[#525252] focus:border-[#DF4F15] focus:outline-none"
            />
            <button
              onClick={handleSaveToken}
              disabled={!tokenInput.trim() || tokenStatus === "saving"}
              className="rounded-lg border border-[#2a2a2a] px-4 py-2 text-xs font-medium text-[#d4d4d4] transition hover:border-[#3a3a3a] hover:bg-white/[0.03] disabled:opacity-50"
            >
              {tokenStatus === "saving" ? "Saving..." : "Authenticate"}
            </button>
            {tokenStatus === "ok" && (
              <span className="flex items-center gap-1.5 text-xs text-[#22c55e]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                Authenticated
              </span>
            )}
            {tokenStatus === "error" && (
              <span className="flex items-center gap-1.5 text-xs text-[#ef4444]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ef4444]" />
                Invalid
              </span>
            )}
          </div>
        </div>

        {/* Network Access */}
        {lanIp && (
          <div className="rounded-xl border border-[#1f1f1f] bg-[#0c0c0c] p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#d4d4d4]">
              Network Access
            </h2>
            <p className="mt-2 text-xs text-[#737373]">
              Access The Guild from other devices on your network.
              Run with <code className="rounded bg-[#1a1a1a] px-1.5 py-0.5 font-mono text-[#DF4F15]">npm run dev:lan</code> to
              enable LAN access.
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-2">
              <span className="text-xs text-[#525252]">LAN URL:</span>
              <code className="font-mono text-sm text-[#e5e5e5]">
                http://{lanIp}:3000
              </code>
            </div>
          </div>
        )}

        {/* Agent Preferences */}
        <div className="rounded-xl border border-[#1f1f1f] bg-[#0c0c0c] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#d4d4d4]">
            Agent Preferences
          </h2>
          <div className="mt-4 space-y-3">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between rounded-lg border border-[#1f1f1f] bg-[#141414] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{agent.emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-[#e5e5e5]">
                      {agent.name}
                    </p>
                    <p className="text-xs text-[#525252]">{agent.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-wider text-[#525252]">
                    Notifications
                  </span>
                  <Toggle
                    checked={settings.agentNotifications[agent.id] !== false}
                    onChange={(v) =>
                      update({
                        agentNotifications: {
                          ...settings.agentNotifications,
                          [agent.id]: v,
                        },
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Appearance */}
        <div className="rounded-xl border border-[#1f1f1f] bg-[#0c0c0c] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#d4d4d4]">
            Appearance
          </h2>
          <div className="mt-4 space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-[#737373]">
                  Pixel Office Scale
                </label>
                <span className="font-mono text-xs text-[#525252]">
                  {settings.appearance.pixelScale}x
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={5}
                step={1}
                value={settings.appearance.pixelScale}
                onChange={(e) =>
                  updateAppearance({ pixelScale: Number(e.target.value) })
                }
                className="mt-2 w-full accent-[#DF4F15]"
              />
              <div className="mt-1 flex justify-between text-[10px] text-[#525252]">
                <span>3x</span>
                <span>4x</span>
                <span>5x</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#e5e5e5]">Particle Effects</p>
                <p className="text-xs text-[#525252]">
                  Floating particles in the pixel office
                </p>
              </div>
              <Toggle
                checked={settings.appearance.particles}
                onChange={(v) => updateAppearance({ particles: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#e5e5e5]">Ambient Lighting</p>
                <p className="text-xs text-[#525252]">
                  Glow effects around active agents
                </p>
              </div>
              <Toggle
                checked={settings.appearance.ambientLighting}
                onChange={(v) => updateAppearance({ ambientLighting: v })}
              />
            </div>
          </div>
        </div>

        {/* About */}
        <div className="rounded-xl border border-[#1f1f1f] bg-[#0c0c0c] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#d4d4d4]">
            About
          </h2>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#737373]">Version</span>
              <span className="font-mono text-sm text-[#e5e5e5]">v0.5.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#737373]">Dashboard</span>
              <span className="text-sm text-[#e5e5e5]">The Guild</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#737373]">Gateway</span>
              <span className="text-sm text-[#e5e5e5]">OpenClaw</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
