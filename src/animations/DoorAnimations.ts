import { createAnimation } from '../utils/animations';

const createDoorAnimations = (scene: Phaser.Scene, frameRate: number) => {
  createAnimation(scene.anims, 'door-open', 'door', 1, 3, frameRate, 0);
}

export { createDoorAnimations };
