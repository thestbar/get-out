import { createAnimation } from '../utils/animations';

const createPlayerAnimations = (scene: Phaser.Scene, frameRate: number) => {
  createAnimation(scene.anims, 'player-idle', 'player', 1, 5, frameRate);
  createAnimation(scene.anims, 'player-move-right', 'player', 6, 10, frameRate);
  createAnimation(scene.anims, 'player-move-left', 'player', 11, 15, frameRate);
  createAnimation(scene.anims, 'player-move-down', 'player', 16, 20, frameRate);
  createAnimation(scene.anims, 'player-move-up', 'player', 21, 25, frameRate);
}

export { createPlayerAnimations };
