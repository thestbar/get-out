const debugDraw = (
  layer: Phaser.Tilemaps.TilemapLayer | null,
  scene: Phaser.Scene | null
) => {
  if (!scene) throw ('Scene not found');
  if (!layer) throw ('Layer not found');
  const debugGraphics = scene.add.graphics().setAlpha(0.75);
  layer.renderDebug(debugGraphics, {
    tileColor: null,
    collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
    faceColor: new Phaser.Display.Color(40, 39, 37, 255),
  });
};

export { debugDraw };
