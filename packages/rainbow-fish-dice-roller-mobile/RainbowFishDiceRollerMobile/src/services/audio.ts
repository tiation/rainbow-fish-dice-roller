// import { Audio } from 'expo-av';
import { DicePreferences } from '../types';

export class AudioService {
  private static soundObjects: { [key: string]: any } = {};
  private static isEnabled: boolean = true;

  static async initialize(preferences?: DicePreferences): Promise<void> {
    try {
      // Try to load Audio from expo-av if available
      try {
        const { Audio } = await import('expo-av');
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
          shouldDuckAndroid: true,
        });

        // Load sound effects
        await this.loadSounds();
      } catch (audioError) {
        console.warn('expo-av not available, audio disabled:', audioError);
      }

      // Update enabled status from preferences
      if (preferences) {
        this.isEnabled = preferences.soundEnabled;
      }
    } catch (error) {
      console.error('Failed to initialize audio service:', error);
    }
  }

  private static async loadSounds(): Promise<void> {
    try {
      const { Audio } = await import('expo-av');
      // For now, we'll skip loading actual sound files to avoid bundling issues
      console.log('Audio service initialized without sound files');
    } catch (error) {
      console.warn('Failed to load sounds, audio disabled:', error);
    }
  }

  static async playSound(soundName: string, volume: number = 1.0): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const sound = this.soundObjects[soundName];
      if (sound) {
        await sound.setPositionAsync(0);
        await sound.setVolumeAsync(volume);
        await sound.playAsync();
      }
    } catch (error) {
      console.error(`Failed to play sound ${soundName}:`, error);
    }
  }

  static async playRollSound(diceCount: number = 1): Promise<void> {
    // Play different roll sounds based on dice count
    const volume = Math.min(0.8, 0.3 + (diceCount * 0.1));
    await this.playSound('roll', volume);
  }

  static async playCriticalSound(): Promise<void> {
    await this.playSound('critical', 0.9);
  }

  static async playFailSound(): Promise<void> {
    await this.playSound('fail', 0.7);
  }

  static async playSuccessSound(): Promise<void> {
    await this.playSound('success', 0.8);
  }

  static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  static async cleanup(): Promise<void> {
    try {
      for (const sound of Object.values(this.soundObjects)) {
        await sound.unloadAsync();
      }
      this.soundObjects = {};
    } catch (error) {
      console.error('Failed to cleanup audio service:', error);
    }
  }
}
