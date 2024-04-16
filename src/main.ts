import Phaser from 'phaser';

import Preloader from './scenes/Preloader';
import Game from './scenes/Game';
import GameUI from './scenes/GameUI';
import Settings from './Settings';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: Settings.DEBUG ? 400 : 160,
  height: Settings.DEBUG ? 250 : 120,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: Settings.DEBUG,
    },
  },
  scene: [Preloader, Game, GameUI],
  scale: {
    zoom: Settings.DEBUG ? 2 : 6
  }
};

export default new Phaser.Game(config);
