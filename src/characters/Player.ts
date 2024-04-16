import Phaser from 'phaser';
import Box from '../items/Box';
import { Events } from '../events/Events';
import { sceneEventsEmitter } from '../events/EventsHandler';

/*
 * Extend the GameObjectFactory interface to include a new 'player' method
 * that will be used to create instances of the Player class.
 */
declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      player(x: number, y: number, texture: string, frame?: string | number): Player;
    }
  }
}

enum PlayerState {
  IDLE,
  TAKING_DAMAGE,
  DEAD
}

export default class Player extends Phaser.Physics.Arcade.Sprite {
  private playerState = PlayerState.IDLE;
  private takingDamageTimer = 0;
  private movementSpeed = 3;
  private _health = 3;
  private activeBox?: Box;
  private _canPlayerAttack = false;
  private attacks?: Phaser.Physics.Arcade.Group;
  private _isAttacking = false;
  private attackingTimer = 0;
  private keyA: Phaser.Input.Keyboard.Key;
  private keyS: Phaser.Input.Keyboard.Key;
  private keyD: Phaser.Input.Keyboard.Key;
  private keyW: Phaser.Input.Keyboard.Key


  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, frame);

    this.anims.play('player-idle');

    if (!scene.input.keyboard) throw ('Keyboard not found');

    this.keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  }

  setBox(box: Box) {
    this.activeBox = box;
  }

  get isAttacking() {
    return this._isAttacking;
  }

  get health() {
    return this._health;
  }

  get canPlayerAttack() {
    return this._canPlayerAttack;
  }

  setAttacks(attacks: Phaser.Physics.Arcade.Group) {
    this.attacks = attacks;
  }

  canBeAttacked() {
    return this.playerState !== PlayerState.TAKING_DAMAGE &&
      this.playerState !== PlayerState.DEAD;
  }

  preUpdate(time: number, deltaTime: number) {
    super.preUpdate(time, deltaTime);

    switch (this.playerState) {
      case PlayerState.DEAD:
        break;
      case PlayerState.IDLE:
        break;
      case PlayerState.TAKING_DAMAGE:
        this.takingDamageTimer += deltaTime;
        if (this.takingDamageTimer >= 500){
          this.clearTint();
          this.playerState = PlayerState.IDLE;
          this.takingDamageTimer = 0;
        }
        break;
    }

    if (this._isAttacking) {
      this.attackingTimer += deltaTime;
      if (this.attackingTimer >= 2000) {
        this._isAttacking = false;
        this.attackingTimer = 0;
      }
    }
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, deltaTime: number) {
    /*
     * If the player is already taking damage, then we should not
     * allow the player to move.
     */
    if (this.playerState === PlayerState.TAKING_DAMAGE) return;
    if (this.playerState === PlayerState.DEAD) {
      this.setVelocity(0, 0);
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(cursors.space!) && this.activeBox) {
      const collectable = this.activeBox.open();

      switch (collectable) {
        case 'ruby':
          this._canPlayerAttack = true;
          break;
        case 'key':
          sceneEventsEmitter.emit(Events.PLAYER_COLLECTED_KEY);
          break;
        case 'life':
          this._health = Math.min(3, this._health + 1);
          sceneEventsEmitter.emit(Events.PLAYER_HEALTH_CHANGED, this._health);
          break;
      }
    }

    if (cursors.left?.isDown || this.keyA.isDown) {
      this.setVelocity(-1 * this.movementSpeed * deltaTime, 0);
      this.play('player-move-left', true);
    } else if (cursors.right?.isDown || this.keyD.isDown) {
      this.setVelocity(1 * this.movementSpeed * deltaTime, 0);
      this.play('player-move-right', true);
    } else if (cursors.up?.isDown || this.keyW.isDown) {
      this.setVelocity(0, -1 * this.movementSpeed * deltaTime);
      this.play('player-move-up', true);
    } else if (cursors.down?.isDown || this.keyS.isDown) {
      this.setVelocity(0, 1 * this.movementSpeed * deltaTime);
      this.play('player-move-down', true);
    } else {
      this.setVelocity(0, 0);
      this.play('player-idle', true);
    }
  }

  attack(x: number, y: number) {
    this._isAttacking = true;
    if (!this.attacks) throw ('attacks group not found');
    const attack = this.attacks?.get(x, y, 'attack', 'attack1.png') as Phaser.Physics.Arcade.Sprite;

    if (!attack.body) throw ('Attack body not found');
    attack.body.setMass(0);
    attack.anims.play('attack');

  }

  handleDamageTaken(object: Phaser.GameObjects.GameObject) {
    /*
     * If the player is already taking damage, then we should not
     * apply damage to the player again.
     */
    if (this.playerState === PlayerState.TAKING_DAMAGE ||
      this.playerState === PlayerState.DEAD) return;

    const enemy = object as Phaser.Physics.Arcade.Sprite;

    const deltaX = this.x - enemy.x;
    const deltaY = this.y - enemy.y;

    const direction = new Phaser.Math.Vector2(deltaX, deltaY).normalize().scale(100);

    this.setVelocity(direction.x, direction.y);
    this.setTint(0xff0000);
    this.playerState = PlayerState.TAKING_DAMAGE;
    this.takingDamageTimer = 0;

    this._health -= 1;

    if (this._health <= 0) {
      this.playerState = PlayerState.DEAD;
      sceneEventsEmitter.emit(Events.GAME_OVER);
    }
  }
}

/* 
 * Register the Player class as a GameObjectFactory class so that we can create
 * instances of the Player class using this.add.player() method.
 */
Phaser.GameObjects.GameObjectFactory.register(
  'player',
  function(
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    const player = new Player(this.scene, x, y, texture, frame);

    this.displayList.add(player);
    this.updateList.add(player);

    this.scene.physics.world.enableBody(player, Phaser.Physics.Arcade.DYNAMIC_BODY);

    player.setSize(10, 14);

    return player;
  }
) 
