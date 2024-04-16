
import { createAnimation } from '../utils/animations';

const createBoxAnimations = (scene: Phaser.Scene, frameRate: number) => {
  createAnimation(scene.anims, 'box-open-life', 'box', 1, 3, frameRate, 0);
  createAnimation(scene.anims, 'box-open-key', 'box', 4, 6, frameRate, 0);
  createAnimation(scene.anims, 'box-open-ruby', 'box', 7, 9, frameRate, 0);
  createAnimation(scene.anims, 'box-closed', 'box', 1, 1, frameRate, 0);
  createAnimation(scene.anims, 'box-open-empty', 'box', 2, 2, frameRate, 0);
}

export { createBoxAnimations };
