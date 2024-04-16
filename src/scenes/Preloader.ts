import Phaser from 'phaser';

export default class Preloader extends Phaser.Scene {
  constructor() {
    super('preloader');
  }

  preload() {
    // Preload map tiles
    this.load.image('tiles', 'tiles/tilemap_terrain_extruded.png');
    this.load.tilemapTiledJSON('dungeon', 'tiles/level_1.json');

    // Preload player files
    this.load.atlas('player', 'player/texture.png', 'player/texture.json');
    this.load.atlas('attack', 'player/attack/texture.png', 'player/attack/texture.json');

    // Preload skeleton files
    this.load.atlas('skeleton', 'enemies/skeleton/texture.png', 'enemies/skeleton/texture.json'); 
    
    // Preload UI files
    this.load.image('ui-heart-full', 'ui/ui-heart-full.png');
    this.load.image('ui-heart-empty', 'ui/ui-heart-empty.png');

    // Preload box (chests) files
    this.load.atlas('box', 'items/box/texture.png', 'items/box/texture.json');

    // Preload door files
    this.load.atlas('door', 'door/texture.png', 'door/texture.json');
  }

  create() {
    this.scene.start('game');
  }
}
