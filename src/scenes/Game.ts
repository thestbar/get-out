import Phaser from 'phaser';
import Settings from '../Settings';
import { debugDraw } from '../utils/debug';
import { createPlayerAnimations } from '../animations/PlayerAnimations';
import { createSkeletonAnimations } from '../animations/SkeletonAnimations';
import { createBoxAnimations } from '../animations/BoxAnimations';
import { createDoorAnimations } from '../animations/DoorAnimations';
import Skeleton from '../enemies/Skeleton';
import '../characters/Player';
import Player from '../characters/Player';
import { sceneEventsEmitter } from '../events/EventsHandler';
import { Events } from '../events/Events';
import Box from '../items/Box';
import { createPlayerAttackAnimations } from '../animations/PlayerAttackAnimations';
import { getMouseCoords } from '../utils/mouse';

enum GameStates {
  RUNNING,
  PAUSED,
  GAME_OVER,
  LEVEL_COMPLETE,
}

export default class Game extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private player!: Player;
  private fpsCounterText!: Phaser.GameObjects.Text;
  private playerCollectedKey = false;
  private gameState = GameStates.RUNNING;
  private pauseSceneTime = 0;

  constructor() {
    super('game');
  }

  preload() {
    if (!this.input.keyboard) {
      throw ('Keyboard not found');
    }
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  create() {
    /*
     * Start the game UI scene. This scene will be used to display
     * the player's health and other UI elements.
     */
    this.scene.run('game-ui');

    createPlayerAnimations(this, Settings.ANIMATION_FRAME_RATE);
    createPlayerAttackAnimations(this, Settings.ANIMATION_FRAME_RATE);
    createSkeletonAnimations(this, Settings.ANIMATION_FRAME_RATE);
    createBoxAnimations(this, Settings.ANIMATION_FRAME_RATE);
    createDoorAnimations(this, Settings.ANIMATION_FRAME_RATE);

    const map: Phaser.Tilemaps.Tilemap = this.make.tilemap({ key: 'dungeon' });
    /* 
     * Tile spacing and tile margin were added after running
     * `tile-extruder` on the tilemap. This helps to reduce image
     * bleeding and other visual artifacts. More information can be
     * found here: https://github.com/sporadic-labs/tile-extruder
     */
    const tileset: Phaser.Tilemaps.Tileset | null = map.addTilesetImage('dungeon', 'tiles', 16, 16, 1, 2);
    if (!tileset) throw ('Tileset not found');

    map.createLayer('Ground', tileset);

    const wallsLayer = map.createLayer('Walls', tileset);
    if (!wallsLayer) throw ('Walls layer not found');

    wallsLayer.setCollisionByProperty({ collides: true });

    if (Settings.DEBUG) {
      debugDraw(wallsLayer, this);
      this.fpsCounterText = this.add.text(0, 0, 'FPS: 0', { font: '10px Arial', color: '#ffffff' });
    }

    const boxesLayer = map.getObjectLayer('Boxes');
    if (!boxesLayer) throw ('Boxes layer not found');
    const boxes = this.physics.add.staticGroup({
      classType: Box
    });
    boxesLayer.objects.forEach(boxObject => {
      const box = boxes.get(
        Math.floor(boxObject.x!) + Math.floor(boxObject.width!) * 0.5,
        Math.floor(boxObject.y!) - Math.floor(boxObject.height!) * 0.5,
        'box',
        'box1.png'
      );
      if (!box) throw ('Box not found');
      if (!boxObject.name) throw ('Box name not found');
      box.setContent(boxObject.name);
    });

    const doorLayer = map.getObjectLayer('Door');
    if (!doorLayer) throw ('Door layer not found');
    const doors = this.physics.add.staticGroup();
    const doorObject = doorLayer.objects[0];
    const door = doors.get(
      Math.floor(doorObject.x!) + Math.floor(doorObject.width!) * 0.5,
      Math.floor(doorObject.y!) - Math.floor(doorObject.height!) * 0.5,
      'door', 
      'door1.png'
    );
    door.setSize(17, 17);

    // Set player
    this.player = this.add.player(32, 32, 'player', 'player1.png');

    const skeletons = this.physics.add.group({
      classType: Skeleton,
      createCallback: (gameObject: Phaser.GameObjects.GameObject) => {
        const skeletonGameObject = gameObject as Skeleton;
        if (!skeletonGameObject.body) throw ('Skeleton body not found');
        skeletonGameObject.body.onCollide = true;
      }
    });

    const skeletonsLayer = map.getObjectLayer('Enemies');
    if (!skeletonsLayer) throw ('Skeletons layer not found');
    skeletonsLayer.objects.forEach(skeletonObject => {
      skeletons.get(skeletonObject.x, skeletonObject.y, 'skeleton', 'skeleton1.png');
    });

    // Set player attacks
    const playerAttacks = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
    });
    this.player.setAttacks(playerAttacks);
    this.input.on('pointerdown', this.handlePlayerAttack, this);

    // Set colliders
    this.physics.add.collider(this.player, wallsLayer);
    this.physics.add.collider(skeletons, wallsLayer);
    this.physics.add.collider(
      skeletons,
      this.player,
      this.handlePlayerAndSkeletonCollisions,
      undefined,
      this
    );
    this.physics.add.collider(this.player, boxes, this.handlePlayerAndBoxCollisions, undefined, this);
    this.physics.add.collider(this.player, doors, this.handlePlayerAndDoorCollisions, undefined, this);
    this.physics.add.collider(playerAttacks, skeletons, this.handlePlayerAttacksAndSkeletonCollisions, undefined, this);

    // Set camera to follow player
    this.cameras.main.startFollow(this.player, true, 0.4, 0.4);

    sceneEventsEmitter.on(Events.PLAYER_COLLECTED_KEY, this.handlePlayerCollectedKey, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      sceneEventsEmitter.off(Events.PLAYER_COLLECTED_KEY, this.handlePlayerCollectedKey, this);
    });
  }

  update(time: number, deltaTime: number) {
    // if (time <= 10000) {
    //   this.scene.pause();
    //   this.scene.run('intro');
    //   return;
    // } else if (time <= 10000)
    if (this.gameState === GameStates.LEVEL_COMPLETE) {
      this.pauseSceneTime += deltaTime;
      if (this.pauseSceneTime >= 2000) {
        this.scene.pause();
      }
      if (this.pauseSceneTime > 0) return;
      this.scene.run('level-complete');
      return;
    }

    if (Settings.DEBUG && this.fpsCounterText) {
      this.fpsCounterText.setText(`FPS: ${Math.floor(this.game.loop.actualFps)}, Time passed: ${time} ms`);
    }
 
    if (!this.cursors) throw ('Cursors not found');
    if (!this.player) throw ('Player not found');

    this.player.update(this.cursors, deltaTime);
  }

  private handlePlayerAndBoxCollisions(
    object1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    object2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    if (object1 !== this.player) return;
    const box = object2 as Box;
    this.player.setBox(box);
  }

  private handlePlayerAndSkeletonCollisions(
    object1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    object2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    /*
     * Do not let the player be attacked multiple times on a small time 
     * period. This is to prevent the player from taking too much damage.
     */
    if (!this.player.canBeAttacked()) return;

    let skeleton: Skeleton;
    if (object1 === this.player) {
      skeleton = object2 as Skeleton;
    } else {
      skeleton = object1 as Skeleton;
    }

    if (skeleton.isDead()) return;

    this.player.handleDamageTaken(object2 as Phaser.GameObjects.GameObject);
    sceneEventsEmitter.emit(Events.PLAYER_HEALTH_CHANGED, this.player.health);
    skeleton.attack();
  }

  private handlePlayerAndDoorCollisions(
    object1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    object2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    let door: Phaser.Physics.Arcade.Sprite;
    if (this.player === object1) {
      door = object2 as Phaser.Physics.Arcade.Sprite;
    } else {
      door = object1 as Phaser.Physics.Arcade.Sprite;
    }
    if (door.anims.currentAnim?.key === 'door-open') return;
    
    if (this.playerCollectedKey) {
      this.scene.pause();
      sceneEventsEmitter.emit(Events.SHOW_WIN_SCREEN);
    }
  }
  
  private handlePlayerAttacksAndSkeletonCollisions(
    object1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    object2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    let skeleton: Skeleton;
    if (object1 instanceof Skeleton) {
      skeleton = object1 as Skeleton;
    } else {
      skeleton = object2 as Skeleton;
    }
    skeleton.takeDamage();
  }

  private handlePlayerAttack() {
    if (!this.player) throw ('Player not found');
    if (!this.player.canPlayerAttack) return;
    if (this.player.isAttacking) return;

    const mouseCoords = getMouseCoords(this);

    this.player.attack(mouseCoords.mouseX, mouseCoords.mouseY);
  }

  private handlePlayerCollectedKey() {
    this.playerCollectedKey = true;
  }
}
