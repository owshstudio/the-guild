import { Application, Container } from "pixi.js";

export interface PixelOfficeScene {
  app: Application;
  floorLayer: Container;
  furnitureLayer: Container;
  entityLayer: Container;
  labelLayer: Container;
  overlayLayer: Container;
  effectsLayer: Container;
  uiLayer: Container;
}

export async function createScene(
  container: HTMLDivElement,
  width: number,
  height: number
): Promise<PixelOfficeScene> {
  const app = new Application();
  await app.init({
    width,
    height,
    antialias: false,
    roundPixels: true,
    background: "#d4c9a8",
  });

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.style.imageRendering = "pixelated";
  container.appendChild(canvas);

  const floorLayer = new Container();
  const furnitureLayer = new Container();
  const entityLayer = new Container();
  entityLayer.sortableChildren = true;
  const labelLayer = new Container();
  const overlayLayer = new Container();
  const effectsLayer = new Container();
  const uiLayer = new Container();

  app.stage.addChild(
    floorLayer,
    furnitureLayer,
    entityLayer,
    labelLayer,
    overlayLayer,
    effectsLayer,
    uiLayer
  );

  return {
    app,
    floorLayer,
    furnitureLayer,
    entityLayer,
    labelLayer,
    overlayLayer,
    effectsLayer,
    uiLayer,
  };
}

export function destroyScene(scene: PixelOfficeScene): void {
  scene.app.destroy(true, { children: true });
}
