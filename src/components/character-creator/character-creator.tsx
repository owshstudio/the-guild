"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CustomPalette } from "@/lib/types";
import { PALETTES, invalidateSpriteCache } from "@/components/pixel-office/sprites";
import {
  getCustomPalette,
  saveCustomPalette,
} from "@/lib/gateway/office-config";
import ColorPicker from "./color-picker";
import SpritePreview from "./sprite-preview";

interface CharacterCreatorProps {
  agentId: string;
  isOpen: boolean;
  onClose: () => void;
}

type HairStyle = "long" | "short" | "puffy" | "spiky";

const SKIN_PRESETS = [
  "#fce4b8", "#e8c890", "#d4a574", "#c68642", "#8d5524",
  "#e0d0f0", "#c0a8d8", "#f5d0c5", "#ffe0bd",
];

const HAIR_PRESETS = [
  "#1a1a1a", "#3a2a1a", "#654321", "#8b6914", "#f59e0b",
  "#d97706", "#5b21b6", "#dc2626", "#f5f5f5", "#c084fc",
];

const SHIRT_PRESETS = [
  "#4c1d95", "#ea580c", "#2563eb", "#16a34a", "#dc2626",
  "#1f1f1f", "#737373", "#e5e5e5", "#0891b2", "#7c3aed",
];

const PANTS_PRESETS = [
  "#1e1040", "#5c3310", "#1e3a5f", "#1a1a1a", "#374151",
  "#2d3748", "#4a3728", "#0f172a",
];

const SHOES_PRESETS = [
  "#1a0f2e", "#2a1a0a", "#1a1a1a", "#333333", "#4a2c2a",
  "#1e293b", "#292524",
];

const HAIR_STYLES: { id: HairStyle; label: string }[] = [
  { id: "long", label: "Long" },
  { id: "short", label: "Short" },
  { id: "puffy", label: "Puffy" },
  { id: "spiky", label: "Spiky" },
];

interface OutfitPreset {
  name: string;
  shirt: string;
  shirtShadow: string;
  shirtAccent: string;
  pants: string;
  pantsShadow: string;
  shoes: string;
}

const OUTFIT_PRESETS: OutfitPreset[] = [
  {
    name: "Night Ops",
    shirt: "#1e1b4b",
    shirtShadow: "#0f0a2a",
    shirtAccent: "#4338ca",
    pants: "#0f0f1a",
    pantsShadow: "#080810",
    shoes: "#0a0a0a",
  },
  {
    name: "Sunrise",
    shirt: "#ea580c",
    shirtShadow: "#c2410c",
    shirtAccent: "#fb923c",
    pants: "#5c3310",
    pantsShadow: "#3a1f08",
    shoes: "#2a1a0a",
  },
  {
    name: "Corporate",
    shirt: "#4b5563",
    shirtShadow: "#374151",
    shirtAccent: "#6b7280",
    pants: "#1f2937",
    pantsShadow: "#111827",
    shoes: "#0a0a0a",
  },
  {
    name: "Casual",
    shirt: "#2563eb",
    shirtShadow: "#1d4ed8",
    shirtAccent: "#60a5fa",
    pants: "#1e3a5f",
    pantsShadow: "#0f2440",
    shoes: "#1a1a1a",
  },
  {
    name: "Stealth",
    shirt: "#1a1a1a",
    shirtShadow: "#0f0f0f",
    shirtAccent: "#333333",
    pants: "#0a0a0a",
    pantsShadow: "#050505",
    shoes: "#0a0a0a",
  },
];

function darken(hex: string, amount: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function lighten(hex: string, amount: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function getDefaultPalette(agentId: string): CustomPalette {
  const pal = PALETTES[agentId];
  const defaultHairStyle: HairStyle =
    agentId === "hemera" ? "puffy" : "long";
  if (pal) {
    return {
      agentId,
      skin: pal.skin,
      skinShadow: pal.skinShadow,
      shirt: pal.shirt,
      shirtShadow: pal.shirtShadow,
      shirtAccent: pal.shirtAccent,
      pants: pal.pants,
      pantsShadow: pal.pantsShadow,
      hair: pal.hair,
      hairDark: pal.hairDark,
      hairLight: pal.hairLight,
      shoes: pal.shoes,
      outline: pal.outline,
      hairStyle: defaultHairStyle,
    };
  }
  return {
    agentId,
    skin: "#fce4b8",
    skinShadow: "#e8c890",
    shirt: "#4c1d95",
    shirtShadow: "#2e1065",
    shirtAccent: "#7c3aed",
    pants: "#1e1040",
    pantsShadow: "#140a2a",
    hair: "#5b21b6",
    hairDark: "#3b0f80",
    hairLight: "#8b5cf6",
    shoes: "#1a0f2e",
    outline: "#1a0f2e",
    hairStyle: defaultHairStyle,
  };
}

export default function CharacterCreator({
  agentId,
  isOpen,
  onClose,
}: CharacterCreatorProps) {
  const [palette, setPalette] = useState<CustomPalette>(() => {
    const custom = getCustomPalette(agentId);
    return custom ?? getDefaultPalette(agentId);
  });

  useEffect(() => {
    const custom = getCustomPalette(agentId);
    setPalette(custom ?? getDefaultPalette(agentId));
  }, [agentId]);

  const update = useCallback(
    (partial: Partial<CustomPalette>) => {
      setPalette((prev) => ({ ...prev, ...partial }));
    },
    []
  );

  const handleSkinChange = useCallback(
    (color: string) => {
      update({
        skin: color,
        skinShadow: darken(color, 30),
      });
    },
    [update]
  );

  const handleHairChange = useCallback(
    (color: string) => {
      update({
        hair: color,
        hairDark: darken(color, 40),
        hairLight: lighten(color, 50),
      });
    },
    [update]
  );

  const handleShirtChange = useCallback(
    (color: string) => {
      update({
        shirt: color,
        shirtShadow: darken(color, 30),
        shirtAccent: lighten(color, 40),
      });
    },
    [update]
  );

  const handlePantsChange = useCallback(
    (color: string) => {
      update({
        pants: color,
        pantsShadow: darken(color, 30),
      });
    },
    [update]
  );

  const handleShoesChange = useCallback(
    (color: string) => {
      update({
        shoes: color,
        outline: color,
      });
    },
    [update]
  );

  const handleOutfitPreset = useCallback(
    (preset: OutfitPreset) => {
      update({
        shirt: preset.shirt,
        shirtShadow: preset.shirtShadow,
        shirtAccent: preset.shirtAccent,
        pants: preset.pants,
        pantsShadow: preset.pantsShadow,
        shoes: preset.shoes,
        outline: preset.shoes,
      });
    },
    [update]
  );

  const handleReset = useCallback(() => {
    const defaultPal = getDefaultPalette(agentId);
    setPalette(defaultPal);
    invalidateSpriteCache(agentId);
  }, [agentId]);

  const handleSave = useCallback(() => {
    saveCustomPalette(palette);
    invalidateSpriteCache(agentId);
    onClose();
  }, [palette, agentId, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-[#141414] border-l border-[#1f1f1f] z-50 overflow-y-auto"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[#e5e5e5]">
                  Customize {agentId.toUpperCase()}
                </h2>
                <button
                  onClick={onClose}
                  className="text-[#737373] hover:text-[#e5e5e5] text-lg leading-none"
                >
                  &times;
                </button>
              </div>

              <SpritePreview palette={palette} />

              <div className="mb-4">
                <label className="block text-xs font-medium text-[#a3a3a3] mb-2">
                  Hair Style
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {HAIR_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => update({ hairStyle: style.id })}
                      className="px-2 py-1.5 rounded text-xs font-medium transition-colors"
                      style={{
                        backgroundColor:
                          palette.hairStyle === style.id
                            ? "#333"
                            : "#1a1a1a",
                        color:
                          palette.hairStyle === style.id
                            ? "#e5e5e5"
                            : "#737373",
                        borderWidth: 1,
                        borderColor:
                          palette.hairStyle === style.id
                            ? "#555"
                            : "#1f1f1f",
                      }}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              <ColorPicker
                label="Skin"
                value={palette.skin}
                presets={SKIN_PRESETS}
                onChange={handleSkinChange}
              />
              <ColorPicker
                label="Hair"
                value={palette.hair}
                presets={HAIR_PRESETS}
                onChange={handleHairChange}
              />
              <ColorPicker
                label="Shirt"
                value={palette.shirt}
                presets={SHIRT_PRESETS}
                onChange={handleShirtChange}
              />
              <ColorPicker
                label="Pants"
                value={palette.pants}
                presets={PANTS_PRESETS}
                onChange={handlePantsChange}
              />
              <ColorPicker
                label="Shoes"
                value={palette.shoes}
                presets={SHOES_PRESETS}
                onChange={handleShoesChange}
              />

              <div className="mb-4">
                <label className="block text-xs font-medium text-[#a3a3a3] mb-2">
                  Outfit Presets
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {OUTFIT_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handleOutfitPreset(preset)}
                      className="px-2.5 py-1 rounded text-xs font-medium bg-[#1a1a1a] border border-[#1f1f1f] text-[#a3a3a3] hover:bg-[#252525] hover:text-[#e5e5e5] transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleReset}
                  className="flex-1 px-3 py-2 rounded text-xs font-medium bg-[#1a1a1a] border border-[#1f1f1f] text-[#a3a3a3] hover:bg-[#252525] hover:text-[#e5e5e5] transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-3 py-2 rounded text-xs font-medium bg-[#3b82f6] text-white hover:bg-[#2563eb] transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
