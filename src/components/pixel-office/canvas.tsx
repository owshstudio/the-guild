"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Agent } from "@/lib/types";
import { OFFICE } from "./office-map";
import {
  AgentEntity,
  createAgentEntities,
  updateAgent,
  isAgentHovered,
} from "./agent-entity";
import { RoomManager } from "./room-manager";
import { TileType } from "./tiles";
import {
  EditModeState,
  createEditModeState,
  getAvailableDesks,
} from "./edit-mode";
import {
  loadOfficeConfig,
  saveOfficeConfig,
} from "@/lib/gateway/office-config";
import CharacterCreator from "@/components/character-creator/character-creator";
import { loadSettings, GuildSettings } from "@/lib/settings";

// PixiJS imports
import { createScene, destroyScene, PixelOfficeScene } from "./pixi-scene";
import { buildFloorLayer, buildFurnitureLayer, ChairSprite, clearAllTileTextures } from "./pixi-tiles";
import {
  AgentDisplayObjects,
  createAgentDisplay,
  updateAgentDisplay,
  destroyAgentDisplay,
} from "./pixi-agents";
import {
  createEditButton,
  updateEditButton,
  createEditModeOverlay,
  updateEditModeOverlays,
  updateHoverOverlay,
  EDIT_BTN_W,
  EDIT_BTN_H,
  EDIT_BTN_X,
  EDIT_BTN_Y,
  createRoomTabBar,
  RoomTabBar,
} from "./pixi-overlays";
import { Graphics, Sprite, Text, TextStyle } from "pixi.js";
import { getSpriteTexture, getCharacterSprites, SpriteData, clearAllSpriteTextures } from "./sprites";
import { clearAllFurnitureTextures } from "./furniture-sprites";
import { createEffects, updateEffects, rebuildStaticEffects, EffectsState } from "./pixi-effects";

interface PixelOfficeCanvasProps {
  onAgentClick: (agent: Agent | null) => void;
  agents?: Agent[];
}

export default function PixelOfficeCanvas({
  onAgentClick,
  agents: agentsProp,
}: PixelOfficeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<PixelOfficeScene | null>(null);
  const roomManagerRef = useRef(new RoomManager());
  const agentsRef = useRef<AgentEntity[]>(
    createAgentEntities(roomManagerRef.current.getCurrentTilemap(), agentsProp)
  );
  const hoveredRef = useRef<string | null>(null);
  const lastTimeRef = useRef(performance.now());
  const editModeRef = useRef<EditModeState>(createEditModeState());
  const pulseRef = useRef(0);
  const settingsRef = useRef<GuildSettings["appearance"]>(loadSettings().appearance);
  const [, forceRender] = useState(0);
  const [creatorAgentId, setCreatorAgentId] = useState<string | null>(null);

  // Display object tracking
  const agentDisplaysRef = useRef<Map<string, AgentDisplayObjects>>(new Map());
  const chairSpritesRef = useRef<ChairSprite[]>([]);
  const editButtonRef = useRef<ReturnType<typeof createEditButton> | null>(null);
  const editOverlayRef = useRef<ReturnType<typeof createEditModeOverlay> | null>(null);
  const hoverGraphicsRef = useRef<Graphics | null>(null);
  const dragSpriteRef = useRef<Sprite | null>(null);
  const effectsRef = useRef<EffectsState | null>(null);
  const roomBannerRef = useRef<{ bg: Graphics; text: Text; fadeTimer: number } | null>(null);
  const roomTabBarRef = useRef<RoomTabBar | null>(null);

  // Load settings on mount and listen for storage changes
  useEffect(() => {
    settingsRef.current = loadSettings().appearance;
    const handleStorage = () => {
      settingsRef.current = loadSettings().appearance;
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Initialize agent rooms in room manager
  useEffect(() => {
    const rm = roomManagerRef.current;
    for (const agent of agentsRef.current) {
      rm.setAgentRoom(agent.id, agent.currentRoom);
    }
  }, []);

  // Sync live agents: add new agents, update existing status
  useEffect(() => {
    if (!agentsProp || agentsProp.length === 0) return;
    const current = agentsRef.current;
    const tilemap = roomManagerRef.current.getCurrentTilemap();

    for (const liveAgent of agentsProp.slice(0, 6)) {
      const existing = current.find((a) => a.id === liveAgent.id);
      if (existing) {
        existing.status = liveAgent.status;
        existing.name = liveAgent.name;
      } else if (current.length < 6) {
        const newEntities = createAgentEntities(tilemap, [liveAgent]);
        if (newEntities.length > 0) {
          const entity = newEntities[0];
          current.push(entity);
          roomManagerRef.current.setAgentRoom(entity.id, entity.currentRoom);
        }
      }
    }

    for (const entity of current) {
      if (!agentsProp.find((a) => a.id === entity.id)) {
        entity.status = "stopped";
      }
    }
  }, [agentsProp]);

  // ── PIXI SCENE LIFECYCLE ────────────────────────────

  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;

    let destroyed = false;

    async function init() {
      const scene = await createScene(div!, OFFICE.width, OFFICE.height);
      if (destroyed) {
        destroyScene(scene);
        return;
      }
      sceneRef.current = scene;

      const rm = roomManagerRef.current;
      const tilemap = rm.getCurrentTilemap();

      // Build static layers
      buildFloorLayer(scene.floorLayer, tilemap);
      chairSpritesRef.current = buildFurnitureLayer(scene.furnitureLayer, tilemap);

      // Create agent displays
      const spriteScale = settingsRef.current.pixelScale;
      const visibleAgents = rm.getCurrentAgents(agentsRef.current);
      for (const agent of visibleAgents) {
        const display = createAgentDisplay(agent, spriteScale);
        scene.entityLayer.addChild(display.container);
        scene.labelLayer.addChild(display.labelContainer);
        agentDisplaysRef.current.set(agent.id, display);
      }

      // Create UI elements
      const editBtn = createEditButton();
      scene.uiLayer.addChild(editBtn);
      editButtonRef.current = editBtn;

      const editOverlay = createEditModeOverlay();
      scene.overlayLayer.addChild(editOverlay);
      editOverlayRef.current = editOverlay;

      const hoverGfx = new Graphics();
      scene.overlayLayer.addChild(hoverGfx);
      hoverGraphicsRef.current = hoverGfx;

      // Create effects layer
      const effects = createEffects(scene.effectsLayer);
      rebuildStaticEffects(effects, tilemap);
      effectsRef.current = effects;

      // Create room name banner
      const bannerBg = new Graphics();
      const bannerStyle = new TextStyle({
        fontFamily: "monospace",
        fontWeight: "bold",
        fontSize: 14,
        fill: "#ffffff",
      });
      const bannerText = new Text({ text: "", style: bannerStyle });
      bannerText.anchor.set(0.5, 0.5);
      bannerBg.visible = false;
      bannerText.visible = false;
      scene.uiLayer.addChild(bannerBg, bannerText);
      roomBannerRef.current = { bg: bannerBg, text: bannerText, fadeTimer: 0 };

      // Create room tab bar
      const tabBar = createRoomTabBar(scene.uiLayer);
      roomTabBarRef.current = tabBar;

      // Start game loop
      lastTimeRef.current = performance.now();
      scene.app.ticker.add(gameLoop);
    }

    init();

    const displays = agentDisplaysRef.current;

    return () => {
      destroyed = true;
      const scene = sceneRef.current;
      if (scene) {
        scene.app.ticker.remove(gameLoop);
        // Clean up agent displays
        for (const display of displays.values()) {
          destroyAgentDisplay(display);
        }
        displays.clear();
        destroyScene(scene);
        sceneRef.current = null;
        dragSpriteRef.current = null;
        // Flush module-level texture caches so remounts start fresh
        clearAllSpriteTextures();
        clearAllFurnitureTextures();
        clearAllTileTextures();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── GAME LOOP ────────────────────────────────────────

  const gameLoop = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const now = performance.now();
    const deltaTime = (now - lastTimeRef.current) / 1000;
    lastTimeRef.current = now;

    const rm = roomManagerRef.current;
    const allAgents = agentsRef.current;
    const appearance = settingsRef.current;
    const spriteScale = appearance.pixelScale;
    const edit = editModeRef.current;

    // Handle room transition alpha
    const prevRoomId = rm.currentRoomId;
    const transitioning = rm.updateTransition(deltaTime);

    // Rebuild layers when room actually switches (at midpoint or end)
    if (rm.currentRoomId !== prevRoomId) {
      rebuildRoom();
    }

    if (transitioning) {
      scene.app.stage.alpha = rm.getTransitionAlpha();

      // Show room name banner
      const banner = roomBannerRef.current;
      if (banner) {
        const targetName = rm.getTransitionTargetName();
        if (targetName) {
          banner.text.text = targetName;
          banner.text.visible = true;
          banner.bg.visible = true;
          banner.fadeTimer = 0.8; // show for 0.8s after transition ends

          // Position at center-top
          const bx = OFFICE.width / 2;
          const by = 30;
          banner.text.x = bx;
          banner.text.y = by;

          // Background
          const tw = banner.text.width + 20;
          const th = 24;
          banner.bg.clear();
          banner.bg.roundRect(bx - tw / 2, by - th / 2, tw, th, 6);
          banner.bg.fill({ color: 0x1a1a1a, alpha: 0.8 });

          // Alpha tied to transition
          const alpha = 1 - rm.getTransitionAlpha(); // visible when scene fades
          banner.bg.alpha = alpha;
          banner.text.alpha = alpha;
        }
      }
    } else {
      scene.app.stage.alpha = 1;

      // Fade out banner after transition
      const banner = roomBannerRef.current;
      if (banner && banner.fadeTimer > 0) {
        banner.fadeTimer -= deltaTime;
        const alpha = Math.max(0, banner.fadeTimer / 0.8);
        banner.bg.alpha = alpha;
        banner.text.alpha = alpha;
        if (banner.fadeTimer <= 0) {
          banner.bg.visible = false;
          banner.text.visible = false;
        }
      }
    }

    // Update all agents
    const currentTilemap = rm.getCurrentTilemap();
    for (const agent of allAgents) {
      const agentRoom = rm.agentRooms[agent.id] || "main-office";
      if (agentRoom === rm.currentRoomId) {
        updateAgent(agent, deltaTime, currentTilemap);
      } else {
        agent.behaviorTimer -= deltaTime;
        if (agent.behaviorTimer <= 0) {
          agent.behaviorTimer = 5 + Math.random() * 10;
        }
      }
    }

    // Sync display objects with visible agents
    const visibleAgents = rm.getCurrentAgents(allAgents);
    const visibleIds = new Set(visibleAgents.map((a) => a.id));

    // Add displays for new agents
    for (const agent of visibleAgents) {
      if (!agentDisplaysRef.current.has(agent.id)) {
        const display = createAgentDisplay(agent, spriteScale);
        scene.entityLayer.addChild(display.container);
        scene.labelLayer.addChild(display.labelContainer);
        agentDisplaysRef.current.set(agent.id, display);
      }
    }

    // Remove displays for agents no longer visible
    for (const [id, display] of agentDisplaysRef.current) {
      if (!visibleIds.has(id)) {
        destroyAgentDisplay(display);
        agentDisplaysRef.current.delete(id);
      }
    }

    // Build set of occupied chairs (seated agents)
    const occupiedChairs = new Set<string>();
    for (const agent of visibleAgents) {
      const isSeated =
        agent.behavior === "working" || agent.behavior === "sitting-idle";
      if (isSeated && agent.state !== "walking") {
        occupiedChairs.add(`${agent.tileCol},${agent.tileRow}`);
      }
    }

    // Show/hide chair sprites based on occupancy
    for (const chair of chairSpritesRef.current) {
      chair.sprite.visible = !occupiedChairs.has(`${chair.col},${chair.row}`);
    }

    // Update agent displays
    for (const agent of visibleAgents) {
      const display = agentDisplaysRef.current.get(agent.id);
      if (!display) continue;

      // Hide dragged agent at its original position
      if (edit.active && edit.draggedAgentId === agent.id && edit.mousePixel) {
        display.container.visible = false;
        display.labelContainer.visible = false;
        continue;
      }

      display.container.visible = true;
      display.labelContainer.visible = true;
      updateAgentDisplay(display, agent, spriteScale);
    }

    // Y-sort the entity layer
    scene.entityLayer.sortChildren();

    // Hover overlay
    if (hoveredRef.current && !edit.active && appearance.ambientLighting) {
      const agent = visibleAgents.find((a) => a.id === hoveredRef.current);
      if (hoverGraphicsRef.current) {
        updateHoverOverlay(hoverGraphicsRef.current, agent ?? null, spriteScale);
      }
    } else if (hoverGraphicsRef.current) {
      hoverGraphicsRef.current.clear();
    }

    // Effects layer update
    if (effectsRef.current && appearance.ambientLighting) {
      const hoveredAgent = hoveredRef.current
        ? visibleAgents.find((a) => a.id === hoveredRef.current) ?? null
        : null;
      updateEffects(effectsRef.current, deltaTime, currentTilemap, hoveredAgent, spriteScale);
      scene.effectsLayer.visible = true;
    } else if (scene.effectsLayer) {
      scene.effectsLayer.visible = false;
    }

    // Edit mode overlays
    pulseRef.current += deltaTime * 3;
    const pulse = 0.3 + Math.sin(pulseRef.current) * 0.2;

    if (editOverlayRef.current) {
      updateEditModeOverlays(
        editOverlayRef.current,
        edit,
        rm.getCurrentRoom(),
        pulse
      );
    }

    // Edit button
    if (editButtonRef.current) {
      updateEditButton(editButtonRef.current, edit.active);
    }

    // Room tab bar
    if (roomTabBarRef.current) {
      roomTabBarRef.current.update(rm.currentRoomId);
    }

    // Drag preview
    updateDragPreview(edit, visibleAgents, spriteScale, scene);
  }, []);

  function updateDragPreview(
    edit: EditModeState,
    visibleAgents: AgentEntity[],
    spriteScale: number,
    scene: PixelOfficeScene
  ) {
    if (edit.active && edit.draggedAgentId && edit.mousePixel) {
      const draggedAgent = visibleAgents.find(
        (a) => a.id === edit.draggedAgentId
      );
      if (draggedAgent) {
        if (!dragSpriteRef.current) {
          dragSpriteRef.current = new Sprite();
          dragSpriteRef.current.alpha = 0.7;
          scene.overlayLayer.addChild(dragSpriteRef.current);
        }

        // Get the sprite texture for the dragged agent
        const sprites = getCharacterSprites(draggedAgent.paletteId);
        const spriteData: SpriteData = sprites.idle;
        const texture = getSpriteTexture(spriteData, `${draggedAgent.paletteId}-idle-s${spriteScale}`, spriteScale);
        dragSpriteRef.current.texture = texture;

        const sw = 16 * spriteScale;
        const sh = 24 * spriteScale;
        dragSpriteRef.current.x = edit.mousePixel.x - sw / 2;
        dragSpriteRef.current.y = edit.mousePixel.y - sh / 2;
        dragSpriteRef.current.visible = true;
      }
    } else {
      if (dragSpriteRef.current) {
        dragSpriteRef.current.visible = false;
      }
    }
  }

  function rebuildRoom() {
    const scene = sceneRef.current;
    if (!scene) return;

    const rm = roomManagerRef.current;
    const tilemap = rm.getCurrentTilemap();

    buildFloorLayer(scene.floorLayer, tilemap);
    chairSpritesRef.current = buildFurnitureLayer(scene.furnitureLayer, tilemap);

    // Rebuild static effects for new room
    if (effectsRef.current) {
      rebuildStaticEffects(effectsRef.current, tilemap);
    }

    // Remove old agent displays and recreate
    for (const display of agentDisplaysRef.current.values()) {
      destroyAgentDisplay(display);
    }
    agentDisplaysRef.current.clear();

    const spriteScale = settingsRef.current.pixelScale;
    const visibleAgents = rm.getCurrentAgents(agentsRef.current);
    for (const agent of visibleAgents) {
      const display = createAgentDisplay(agent, spriteScale);
      scene.entityLayer.addChild(display.container);
      scene.labelLayer.addChild(display.labelContainer);
      agentDisplaysRef.current.set(agent.id, display);
    }
  }

  // ── EVENT HANDLERS ──────────────────────────────────

  const getCanvasCoords = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const scene = sceneRef.current;
      if (!scene) return null;
      const canvas = scene.app.canvas as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (OFFICE.width / rect.width),
        y: (e.clientY - rect.top) * (OFFICE.height / rect.height),
      };
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const edit = editModeRef.current;
      if (!edit.active) return;

      const coords = getCanvasCoords(e);
      if (!coords) return;

      const rm = roomManagerRef.current;
      const visibleAgents = rm.getCurrentAgents(agentsRef.current);
      const roomDef = rm.getCurrentRoom();

      for (const agent of visibleAgents) {
        if (
          isAgentHovered(agent, coords.x, coords.y, settingsRef.current.pixelScale)
        ) {
          const available = getAvailableDesks(
            roomDef,
            roomDef.deskAssignments.filter((d) => d.agentId !== agent.id)
          );
          edit.draggedAgentId = agent.id;
          edit.dragStartTile = {
            col: agent.tileCol,
            row: agent.tileRow,
          };
          edit.mousePixel = { x: coords.x, y: coords.y };
          edit.validDropTargets = available;
          forceRender((n) => n + 1);
          return;
        }
      }
    },
    [getCanvasCoords]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const edit = editModeRef.current;
      if (!edit.active || !edit.draggedAgentId) return;

      const coords = getCanvasCoords(e);
      if (!coords) {
        edit.draggedAgentId = undefined;
        edit.dragStartTile = undefined;
        edit.mousePixel = undefined;
        edit.validDropTargets = [];
        forceRender((n) => n + 1);
        return;
      }

      const ts = OFFICE.tileSize;
      const tileCol = Math.floor(coords.x / ts);
      const tileRow = Math.floor(coords.y / ts);

      const isValid = edit.validDropTargets.some(
        (t) => t.col === tileCol && t.row === tileRow
      );

      if (isValid) {
        const rm = roomManagerRef.current;
        const roomDef = rm.getCurrentRoom();
        const tilemap = rm.getCurrentTilemap();
        const agent = agentsRef.current.find(
          (a) => a.id === edit.draggedAgentId
        );

        if (agent) {
          const layout = roomDef.layout;
          let deskCol = tileCol;
          const deskRow = tileRow - 1;

          if (
            deskRow >= 0 &&
            (layout[deskRow][tileCol] === TileType.DeskLeft ||
              layout[deskRow][tileCol] === TileType.DeskRight)
          ) {
            if (layout[deskRow][tileCol] === TileType.DeskRight && tileCol > 0) {
              deskCol = tileCol - 1;
            }
          }

          tilemap.setOccupied(agent.tileCol, agent.tileRow, false);
          agent.tileCol = tileCol;
          agent.tileRow = tileRow;
          const px = tilemap.tileToPixel(tileCol, tileRow);
          agent.x = px.x;
          agent.y = px.y;
          agent.path = [];
          agent.pathIndex = 0;
          agent.state = "typing";
          agent.behavior = "working";
          tilemap.setOccupied(tileCol, tileRow, true);

          const config = loadOfficeConfig();
          config.deskAssignments[agent.id] = {
            deskCol,
            deskRow,
            chairCol: tileCol,
            chairRow: tileRow,
          };
          saveOfficeConfig(config);
        }
      }

      edit.draggedAgentId = undefined;
      edit.dragStartTile = undefined;
      edit.mousePixel = undefined;
      edit.validDropTargets = [];
      forceRender((n) => n + 1);
    },
    [getCanvasCoords]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const coords = getCanvasCoords(e);
      if (!coords) return;
      const rm = roomManagerRef.current;
      const edit = editModeRef.current;

      // Check room tab bar click
      if (roomTabBarRef.current && !rm.isTransitioning()) {
        const tabRoom = roomTabBarRef.current.hitTest(coords.x, coords.y);
        if (tabRoom) {
          rm.switchRoom(tabRoom);
          return;
        }
      }

      // Check edit button click
      if (
        coords.x >= EDIT_BTN_X &&
        coords.x <= EDIT_BTN_X + EDIT_BTN_W &&
        coords.y >= EDIT_BTN_Y &&
        coords.y <= EDIT_BTN_Y + EDIT_BTN_H
      ) {
        edit.active = !edit.active;
        if (!edit.active) {
          edit.draggedAgentId = undefined;
          edit.dragStartTile = undefined;
          edit.mousePixel = undefined;
          edit.validDropTargets = [];
        }
        forceRender((n) => n + 1);
        return;
      }

      if (edit.active && edit.draggedAgentId) return;

      if (edit.active) {
        const visibleAgents = rm.getCurrentAgents(agentsRef.current);
        for (const agent of visibleAgents) {
          if (
            isAgentHovered(agent, coords.x, coords.y, settingsRef.current.pixelScale)
          ) {
            setCreatorAgentId(agent.id);
            forceRender((n) => n + 1);
            return;
          }
        }
        return;
      }

      // Check door click
      if (!rm.isTransitioning()) {
        const ts = OFFICE.tileSize;
        const tileCol = Math.floor(coords.x / ts);
        const tileRow = Math.floor(coords.y / ts);
        const door = rm.getDoorAt(tileCol, tileRow);
        if (door) {
          rm.switchRoom(door.targetRoom);
          return;
        }
      }

      const visibleAgents = rm.getCurrentAgents(agentsRef.current);
      for (const agent of visibleAgents) {
        if (
          isAgentHovered(agent, coords.x, coords.y, settingsRef.current.pixelScale)
        ) {
          const data = agentsProp?.find((a) => a.id === agent.id) || null;
          onAgentClick(data);
          return;
        }
      }
      onAgentClick(null);
    },
    [onAgentClick, getCanvasCoords, agentsProp]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const scene = sceneRef.current;
      if (!scene) return;
      const coords = getCanvasCoords(e);
      if (!coords) return;

      const canvas = scene.app.canvas as HTMLCanvasElement;
      const rm = roomManagerRef.current;
      const edit = editModeRef.current;

      if (edit.active && edit.draggedAgentId) {
        edit.mousePixel = { x: coords.x, y: coords.y };
        canvas.style.cursor = "grabbing";
        return;
      }

      // Room tab hover
      if (roomTabBarRef.current) {
        const tabRoom = roomTabBarRef.current.hitTest(coords.x, coords.y);
        if (tabRoom) {
          canvas.style.cursor = "pointer";
          if (hoveredRef.current !== null) {
            hoveredRef.current = null;
            forceRender((n) => n + 1);
          }
          return;
        }
      }

      if (
        coords.x >= EDIT_BTN_X &&
        coords.x <= EDIT_BTN_X + EDIT_BTN_W &&
        coords.y >= EDIT_BTN_Y &&
        coords.y <= EDIT_BTN_Y + EDIT_BTN_H
      ) {
        canvas.style.cursor = "pointer";
        if (hoveredRef.current !== null) {
          hoveredRef.current = null;
          forceRender((n) => n + 1);
        }
        return;
      }

      const visibleAgents = rm.getCurrentAgents(agentsRef.current);
      let found = false;
      for (const agent of visibleAgents) {
        if (
          isAgentHovered(agent, coords.x, coords.y, settingsRef.current.pixelScale)
        ) {
          if (hoveredRef.current !== agent.id) {
            hoveredRef.current = agent.id;
            forceRender((n) => n + 1);
          }
          canvas.style.cursor = edit.active ? "grab" : "pointer";
          found = true;
          break;
        }
      }
      if (!found) {
        // Check door hover
        if (!edit.active) {
          const ts = OFFICE.tileSize;
          const tileCol = Math.floor(coords.x / ts);
          const tileRow = Math.floor(coords.y / ts);
          const door = rm.getDoorAt(tileCol, tileRow);
          if (door) {
            canvas.style.cursor = "pointer";
            if (hoveredRef.current !== null) {
              hoveredRef.current = null;
              forceRender((n) => n + 1);
            }
            return;
          }
        }

        if (hoveredRef.current !== null) {
          hoveredRef.current = null;
          forceRender((n) => n + 1);
        }
        canvas.style.cursor = "default";
      }
    },
    [getCanvasCoords]
  );

  const handleMouseLeave = useCallback(() => {
    hoveredRef.current = null;
    const edit = editModeRef.current;
    if (edit.draggedAgentId) {
      edit.draggedAgentId = undefined;
      edit.dragStartTile = undefined;
      edit.mousePixel = undefined;
      edit.validDropTargets = [];
    }
    forceRender((n) => n + 1);
  }, []);

  // ── RESIZE ────────────────────────────────────────

  useEffect(() => {
    const update = () => {
      const el = containerRef.current;
      if (!el) return;
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      const scale = Math.max(
        1,
        Math.min(
          Math.floor(cw / OFFICE.width),
          Math.floor(ch / OFFICE.height)
        )
      );
      const w = OFFICE.width * scale;
      const h = OFFICE.height * scale;

      const scene = sceneRef.current;
      if (scene) {
        const canvas = scene.app.canvas as HTMLCanvasElement;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden"
      style={{ background: "#2a2a2a" }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* PixiJS canvas is appended here by createScene */}
      {creatorAgentId && (
        <CharacterCreator
          agentId={creatorAgentId}
          isOpen={!!creatorAgentId}
          onClose={() => setCreatorAgentId(null)}
        />
      )}
    </div>
  );
}
