import { Howl } from 'howler';

const sounds = {
  roll: new Howl({ src: ['./assets/sounds/dice-roll.mp3'], volume: 0.5 }),
  success: new Howl({ src: ['./assets/sounds/success.mp3'], volume: 0.5 }),
  critical: new Howl({ src: ['./assets/sounds/critical.mp3'], volume: 0.5 }),
};

export function playSound(soundName) {
  if (sounds[soundName]) {
    sounds[soundName].play();
  }
}
