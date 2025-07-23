// Simplified sound system without Howler dependency
const sounds = {
  roll: './src/assets/sounds/dice-roll.mp3',
  success: './src/assets/sounds/success.mp3',
  critical: './src/assets/sounds/critical.mp3',
};

export function playSound(soundName) {
  if (sounds[soundName]) {
    try {
      const audio = new Audio(sounds[soundName]);
      audio.volume = 0.5;
      audio.play().catch(e => {
        console.log('Sound play failed (likely due to user interaction policy):', e.message);
      });
    } catch (error) {
      console.log('Sound not available:', error.message);
    }
  }
}
