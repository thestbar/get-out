import Phaser from 'phaser';

export default class Box extends Phaser.Physics.Arcade.Sprite {
  private content: string = '';
  private _collectable: boolean = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, frame);
    this.play('box-closed');
  }

  get collectable() {
    return this._collectable;
  }

  setContent(content: string) {
    this.content = content;
  }

  open() {
    if (!this.anims.currentAnim) return;
    if (this.anims.currentAnim.key !== `box-closed`) {
      this.anims.play('box-open-empty');
      this._collectable = false;
      return this.content;
    }

    this.anims.play(`box-open-${this.content}`);
    return;
  }
}
