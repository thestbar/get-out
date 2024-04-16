import Phaser from 'phaser';

const getMouseCoords = (scene: Phaser.Scene) => {
  /*
   * Takes a Camera and updates this Pointer's worldX and worldY values
   * so they are the result of a translation through the given Camera.
   */
  scene.input.activePointer.updateWorldPoint(scene.cameras.main);
  const pointer = scene.input.activePointer
  return {
    mouseX: pointer.worldX,
    mouseY: pointer.worldY,
  }
}

export { getMouseCoords };
