import { createAnimation } from '../utils/animations';

const createPlayerAttackAnimations = (scene: Phaser.Scene, frameRate: number) => {
  createAnimation(scene.anims, 'attack', 'attack', 1, 5, frameRate, 0);
}

export { createPlayerAttackAnimations };
