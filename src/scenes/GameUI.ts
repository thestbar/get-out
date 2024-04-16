import Phaser from 'phaser';
import { sceneEventsEmitter } from '../events/EventsHandler';
import { Events } from '../events/Events';

export default class GameUI extends Phaser.Scene {
  private hearts!: Phaser.GameObjects.Group;

  constructor() {
    super('game-ui');
  }

  create() {
    this.hearts = this.add.group({
      classType: Phaser.GameObjects.Image
    });

    this.hearts.createMultiple({
      key: 'ui-heart-full',
      setXY: {
        x: 10,
        y: 10,
        stepX: 16
      },
      quantity: 3
    });

    sceneEventsEmitter.on(Events.PLAYER_HEALTH_CHANGED, this.handlePlayerTookDamage, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      sceneEventsEmitter.off(Events.PLAYER_HEALTH_CHANGED, this.handlePlayerTookDamage, this);
    });
    
    sceneEventsEmitter.on(Events.SHOW_WIN_SCREEN, this.handleShowWinScreen, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      sceneEventsEmitter.off(Events.SHOW_WIN_SCREEN, this.handleShowWinScreen, this);
    });

    sceneEventsEmitter.on(Events.GAME_OVER, this.handleGameOver, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      sceneEventsEmitter.on(Events.GAME_OVER, this.handleGameOver, this);
    });
  }

  private handlePlayerTookDamage(health: number) {
    if (!this.hearts) throw ('Hearts group not found');

    this.hearts.children.each((gameObject, index) => {
      const heart = gameObject as Phaser.GameObjects.Image;
      if (index < health) {
        heart.setTexture('ui-heart-full');
      } else {
        heart.setTexture('ui-heart-empty');
      }
      return true;
    });
  }

  private handleShowWinScreen() {
    this.add.text(50, 50, 'You win!', { fontSize: '14px', color: '#ffffff' });
    this.add.text(15, 70, 'Thanks for playing! :)', { fontSize: '10px', color: '#ffffff' });
  }

  private handleGameOver() {
    this.add.text(50, 50, 'You died!', { fontSize: '14px', color: '#ffffff' });
    this.add.text(15, 70, 'Refresh to start again!', { fontSize: '10px', color: '#ffffff' });
  }
}
