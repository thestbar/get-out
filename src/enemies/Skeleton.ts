import Phaser from 'phaser';

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

enum SkeletonState {
  MOVE,
  ATTACK,
  DIE,
}

export default class Skeleton extends Phaser.Physics.Arcade.Sprite {
  private direction = Direction.RIGHT;
  private movementSpeed = 1.5;
  private randomlyChangeDirectionEvent: Phaser.Time.TimerEvent;
  private skeletonState = SkeletonState.MOVE;
  private skeletonAnimationTimer = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame: string | number) {
    super(scene, x, y, texture, frame);

    this.anims.play('skeleton-move');

    scene.physics.world.on(Phaser.Physics.Arcade.Events.TILE_COLLIDE, this.handleTileCollision, this);

    /*
     * Create a timer event that will randomly change the direction
     * of the Skeleton object every 5 seconds. The proc chance 50%.
     */
    this.randomlyChangeDirectionEvent = scene.time.addEvent({
      delay: 5000,
      callback: () => {
        if (Phaser.Math.Between(1, 100) > 50) return;
        this.direction = this.generateRandomDirection();
      },
      loop: true
    });
  }

  isDead() {
    return this.skeletonState === SkeletonState.DIE;
  }

  private handleTileCollision(gameObject: Phaser.GameObjects.GameObject) {
    if (gameObject !== this) return;

    this.direction = this.generateRandomDirection();
  }

  private generateRandomDirection() {
    const probableDirections =
      [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT].
        filter((direction) => direction !== this.direction);

    return probableDirections[Phaser.Math.Between(0, probableDirections.length - 1)];
  }

  preUpdate(time: number, deltaTime: number) {
    super.preUpdate(time, deltaTime);

    if (this.skeletonState === SkeletonState.ATTACK) {
      if (this.skeletonAnimationTimer === 0) {
        this.anims.play('skeleton-attack', true);
        this.setVelocity(0, 0);
      }
      this.skeletonAnimationTimer += deltaTime;
      if (this.skeletonAnimationTimer >= 1000) {
        this.skeletonAnimationTimer = 0;
        this.anims.play('skeleton-move', true);
        this.skeletonState = SkeletonState.MOVE;
      }
      return;
    } else if (this.skeletonState === SkeletonState.DIE) {
      if (this.skeletonAnimationTimer === 0) {
        this.anims.play('skeleton-death', true);
        this.setVelocity(0, 0);

        if (!this.body) throw ('Skeleton body not found');
        this.body.setMass(0);
      }
      this.skeletonAnimationTimer += deltaTime;
      if (this.skeletonAnimationTimer >= 2000) {
        this.destroy();
        this.skeletonAnimationTimer = 0;
      }
      return;
    }

    switch (this.direction) {
      case Direction.UP:
        this.setVelocity(0, -this.movementSpeed * deltaTime);
        break;
      case Direction.DOWN:
        this.setVelocity(0, this.movementSpeed * deltaTime);
        break;
      case Direction.LEFT:
        this.setVelocity(-this.movementSpeed * deltaTime, 0);
        this.anims.play('skeleton-move', true);
        this.flipX = true;
        break;
      case Direction.RIGHT:
        this.setVelocity(this.movementSpeed * deltaTime, 0);
        this.anims.play('skeleton-move', true);
        this.flipX = false;
        break;
    }
  }

  attack() {
    this.skeletonState = SkeletonState.ATTACK;
  }

  takeDamage() {
    this.skeletonState = SkeletonState.DIE;
  }

  /*
   * Override on destroy method in order to ensure that event
   * randomlyChangeDirectionEvent is destroyed when the Skeleton
   * object is destroyed.
   */
  destroy(fromScene?: boolean) {
    this.randomlyChangeDirectionEvent.destroy();
    super.destroy(fromScene);
  }
}
