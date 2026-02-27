// Office config persistence — localStorage for character palettes and desk assignments

import { OfficeConfig, CustomPalette } from "@/lib/types";

const STORAGE_KEY = "guild-office-config";

const DEFAULT_CONFIG: OfficeConfig = {
  version: 1,
  customPalettes: [],
  deskAssignments: {},
};

export function loadOfficeConfig(): OfficeConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as OfficeConfig;
    if (!parsed.version) return DEFAULT_CONFIG;
    return parsed;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveOfficeConfig(config: OfficeConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // localStorage full or unavailable
  }
}

export function getCustomPalette(agentId: string): CustomPalette | null {
  const config = loadOfficeConfig();
  return config.customPalettes.find((p) => p.agentId === agentId) ?? null;
}

export function saveCustomPalette(palette: CustomPalette): void {
  const config = loadOfficeConfig();
  const idx = config.customPalettes.findIndex(
    (p) => p.agentId === palette.agentId
  );
  if (idx >= 0) {
    config.customPalettes[idx] = palette;
  } else {
    config.customPalettes.push(palette);
  }
  saveOfficeConfig(config);
}
