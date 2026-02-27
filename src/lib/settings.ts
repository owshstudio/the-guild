export interface GuildSettings {
  gatewayUrl: string;
  agentNotifications: Record<string, boolean>;
  appearance: {
    pixelScale: number;
    particles: boolean;
    ambientLighting: boolean;
  };
}

const STORAGE_KEY = "guild-settings";

const DEFAULTS: GuildSettings = {
  gatewayUrl:
    typeof window !== "undefined"
      ? (process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:18789")
      : "http://localhost:18789",
  agentNotifications: {},
  appearance: {
    pixelScale: 4,
    particles: true,
    ambientLighting: true,
  },
};

export function loadSettings(): GuildSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(settings: GuildSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage full or unavailable
  }
}
