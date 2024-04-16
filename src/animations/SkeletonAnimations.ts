
import { createAnimation } from '../utils/animations';

const createSkeletonAnimations = (scene: Phaser.Scene, frameRate: number) => {
  createAnimation(scene.anims, 'skeleton-idle', 'skeleton', 1, 5, frameRate);
  createAnimation(scene.anims, 'skeleton-death', 'skeleton', 6, 10, frameRate, 0);
  createAnimation(scene.anims, 'skeleton-move', 'skeleton', 11, 15, frameRate);
  createAnimation(scene.anims, 'skeleton-attack', 'skeleton', 16, 20, frameRate);
}

export { createSkeletonAnimations }
