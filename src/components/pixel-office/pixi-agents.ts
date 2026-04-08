import { Container, Sprite, Graphics, Text, TextStyle, Texture } from "pixi.js";
import { AgentEntity } from "./agent-entity";
import { getCharacterSprites, getSpriteTexture, SpriteData } from "./sprites";
import { getStatusColor } from "./office-map";

export interface AgentDisplayObjects {
  container: Container;
  shadow: Graphics;
  sprite: Sprite;
  labelContainer: Container;
  labelBg: Graphics;
  statusDot: Graphics;
  labelText: Text;
  bubbleContainer: Container;
  bubbleBg: Graphics;
  bubbleText: Text;
}

const labelStyle = new TextStyle({
  fontFamily: "monospace",
  fontWeight: "bold",
  fontSize: 10,
  fill: "#e5e5e5",
});

const bubbleStyle = new TextStyle({
  fontFamily: "monospace",
  fontSize: 11,
  fill: "#222222",
});

function getSpriteForAgent(agent: AgentEntity, scale: number): Texture {
  const sprites = getCharacterSprites(agent.paletteId);

  const isSeated =
    (agent.behavior === "working" || agent.behavior === "sitting-idle") &&
    agent.state !== "walking";

  let spriteData: SpriteData;
  let frameKey: string;

  if (isSeated) {
    const frame = agent.state === "typing" ? agent.frame % 2 : 0;
    spriteData = sprites.sitting[frame];
    frameKey = `sitting-${frame}`;
  } else if (agent.state === "walking") {
    const frame = agent.frame % 4;
    switch (agent.facing) {
      case "down":
        spriteData = sprites.walkDown[frame];
        frameKey = `walkDown-${frame}`;
        break;
      case "left":
        spriteData = sprites.walkLeft[frame];
        frameKey = `walkLeft-${frame}`;
        break;
      case "right":
        spriteData = sprites.walkRight[frame];
        frameKey = `walkRight-${frame}`;
        break;
      case "up":
        spriteData = sprites.walkUp[frame];
        frameKey = `walkUp-${frame}`;
        break;
      default:
        spriteData = sprites.idle;
        frameKey = "idle";
    }
  } else {
    // Idle — check for blink
    if (agent.blinkActive) {
      spriteData = sprites.idleBlink;
      frameKey = "idleBlink";
    } else {
      // Idle breathing cycle — alternate between breath frames
      const breathFrame = agent.frame % 2;
      spriteData = sprites.idleBreath[breathFrame];
      frameKey = `idleBreath-${breathFrame}`;
    }
  }

  const cacheKey = `${agent.paletteId}-${frameKey}-s${scale}`;
  return getSpriteTexture(spriteData, cacheKey, scale);
}

export function createAgentDisplay(
  agent: AgentEntity,
  scale: number
): AgentDisplayObjects {
  const container = new Container();
  container.x = agent.x;
  container.y = agent.y;
  container.zIndex = agent.y;

  // Shadow ellipse — 2-layer for softer look
  const shadow = new Graphics();
  // Outer soft shadow
  shadow.ellipse(8 * scale, 23 * scale, 9 * scale, 3 * scale);
  shadow.fill({ color: 0x000000, alpha: 0.06 });
  // Inner sharper shadow
  shadow.ellipse(8 * scale, 23 * scale, 7 * scale, 2 * scale);
  shadow.fill({ color: 0x000000, alpha: 0.12 });
  container.addChild(shadow);

  // Character sprite
  const texture = getSpriteForAgent(agent, scale);
  const sprite = new Sprite(texture);
  container.addChild(sprite);

  // Label — separate container for labelLayer
  const labelContainer = new Container();

  const labelBg = new Graphics();
  const statusDot = new Graphics();
  const labelText = new Text({ text: agent.name, style: labelStyle });
  labelText.anchor.set(0.5, 0.5);

  labelContainer.addChild(labelBg, statusDot, labelText);

  // Bubble container — added to labelContainer so it's in label layer
  const bubbleContainer = new Container();
  bubbleContainer.visible = false;
  const bubbleBg = new Graphics();
  const bubbleText = new Text({ text: "", style: bubbleStyle });
  bubbleText.anchor.set(0.5, 0.5);
  bubbleContainer.addChild(bubbleBg, bubbleText);
  labelContainer.addChild(bubbleContainer);

  // Set initial alpha for stopped agents
  if (agent.status === "stopped") {
    container.alpha = 0.4;
  }

  // Position label
  updateLabelPosition(labelContainer, labelBg, statusDot, labelText, agent, scale);

  return {
    container,
    shadow,
    sprite,
    labelContainer,
    labelBg,
    statusDot,
    labelText,
    bubbleContainer,
    bubbleBg,
    bubbleText,
  };
}

function updateLabelPosition(
  labelContainer: Container,
  labelBg: Graphics,
  statusDot: Graphics,
  labelText: Text,
  agent: AgentEntity,
  scale: number
) {
  const nameX = agent.x + 8 * scale;
  const nameY = agent.y - 14;

  // Rebuild label background
  labelBg.clear();
  const tw = labelText.width;
  const lw = tw + 14;
  const lh = 18;
  const lx = nameX - lw / 2;
  const ly = nameY - 11;
  const r = 5;

  // Rounded rectangle background
  labelBg.roundRect(lx, ly, lw, lh, r);
  labelBg.fill({ color: 0x141414, alpha: 0.88 });
  labelBg.stroke({ color: 0xffffff, alpha: 0.12, width: 1 });

  // Status dot
  statusDot.clear();
  const statusColor = getStatusColor(agent.status);
  const dotX = nameX - tw / 2 - 4;
  statusDot.circle(dotX, nameY, 3);
  statusDot.fill(statusColor);

  // Text position — match original Canvas2D alphabetic baseline at nameY+3
  labelText.x = nameX + 2;
  labelText.y = nameY + 2;
}

export function updateAgentDisplay(
  display: AgentDisplayObjects,
  agent: AgentEntity,
  scale: number
): void {
  // Update position
  display.container.x = agent.x;
  display.container.y = agent.y;
  display.container.zIndex = agent.y;

  // Update alpha for stopped agents
  display.container.alpha = agent.status === "stopped" ? 0.4 : 1;

  // Swap sprite texture
  display.sprite.texture = getSpriteForAgent(agent, scale);

  // Reset sprite position (textures may vary in size)
  display.sprite.x = 0;
  display.sprite.y = 0;

  // Update shadow position (relative to container, so stays at 0,0 base)
  // Shadow is already positioned relative to container origin — no update needed

  // Update label
  display.labelText.text = agent.name;
  updateLabelPosition(
    display.labelContainer,
    display.labelBg,
    display.statusDot,
    display.labelText,
    agent,
    scale
  );

  // Update bubble
  if (agent.bubbleType !== null && agent.bubbleTimer > 0) {
    display.bubbleContainer.visible = true;
    display.bubbleText.text = agent.bubbleText;

    const nameX = agent.x + 8 * scale;
    const nameY = agent.y - 14;
    const bubbleX = nameX;
    const bubbleY = nameY - 28;

    // Fade in/out alpha
    let bubbleAlpha = 1;
    // We don't know the original timer, so use the remaining timer value
    if (agent.bubbleTimer < 0.3) {
      bubbleAlpha = agent.bubbleTimer / 0.3; // fade out
    }
    display.bubbleContainer.alpha = bubbleAlpha;

    // Draw bubble background
    display.bubbleBg.clear();
    const bw = 24;
    const bh = 20;
    const bx = bubbleX - bw / 2;
    const by = bubbleY - bh / 2;

    if (agent.bubbleType === "speech") {
      // Rounded rectangle with triangle pointer
      display.bubbleBg.roundRect(bx, by, bw, bh, 4);
      display.bubbleBg.fill({ color: 0xffffff, alpha: 0.95 });
      display.bubbleBg.stroke({ color: 0x333333, alpha: 0.5, width: 1 });
      // Triangle pointer
      display.bubbleBg.moveTo(bubbleX - 3, by + bh);
      display.bubbleBg.lineTo(bubbleX, by + bh + 5);
      display.bubbleBg.lineTo(bubbleX + 3, by + bh);
      display.bubbleBg.closePath();
      display.bubbleBg.fill({ color: 0xffffff, alpha: 0.95 });
    } else {
      // Thought bubble — rounded rect with small trailing circles
      display.bubbleBg.roundRect(bx, by, bw, bh, 6);
      display.bubbleBg.fill({ color: 0xffffff, alpha: 0.95 });
      display.bubbleBg.stroke({ color: 0x333333, alpha: 0.5, width: 1 });
      // Trailing circles
      display.bubbleBg.circle(bubbleX - 2, by + bh + 4, 2.5);
      display.bubbleBg.fill({ color: 0xffffff, alpha: 0.9 });
      display.bubbleBg.circle(bubbleX + 1, by + bh + 8, 1.5);
      display.bubbleBg.fill({ color: 0xffffff, alpha: 0.8 });
    }

    display.bubbleText.x = bubbleX;
    display.bubbleText.y = bubbleY;
  } else {
    display.bubbleContainer.visible = false;
  }
}

export function destroyAgentDisplay(display: AgentDisplayObjects): void {
  display.container.destroy({ children: true });
  display.labelContainer.destroy({ children: true });
}
