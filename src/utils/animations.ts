const createAnimation = (
  anims: Phaser.Animations.AnimationManager,
  key: string,
  atlasKey: string,
  start: number,
  end: number,
  frameRate: number,
  repeat: number = -1
) => {
  anims.create({
    key: key,
    frames: anims.generateFrameNames(atlasKey, {
      start: start,
      end: end,
      prefix: atlasKey,
      suffix: '.png'
    }),
    repeat: repeat,
    frameRate: frameRate
  });
};

export { createAnimation };
