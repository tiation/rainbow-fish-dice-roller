// import * as Haptics from 'expo-haptics';
import { DicePreferences, DiceType } from '../types';

export class HapticService {
  private static isEnabled: boolean = true;
  private static hapticsModule: any = null;

  static async initialize(preferences?: DicePreferences): Promise<void> {
    try {
      this.hapticsModule = await import('expo-haptics');
    } catch (error) {
      console.warn('expo-haptics not available, haptic feedback disabled:', error);
    }

    if (preferences) {
      this.isEnabled = preferences.hapticFeedback;
    }
  }

  static async light(): Promise<void> {
    if (!this.isEnabled || !this.hapticsModule) return;
    
    try {
      await this.hapticsModule.impactAsync(this.hapticsModule.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Failed to trigger light haptic:', error);
    }
  }

  static async medium(): Promise<void> {
    if (!this.isEnabled || !this.hapticsModule) return;
    
    try {
      await this.hapticsModule.impactAsync(this.hapticsModule.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Failed to trigger medium haptic:', error);
    }
  }

  static async heavy(): Promise<void> {
    if (!this.isEnabled || !this.hapticsModule) return;
    
    try {
      await this.hapticsModule.impactAsync(this.hapticsModule.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.error('Failed to trigger heavy haptic:', error);
    }
  }

  static async success(): Promise<void> {
    if (!this.isEnabled || !this.hapticsModule) return;
    
    try {
      await this.hapticsModule.notificationAsync(this.hapticsModule.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to trigger success haptic:', error);
    }
  }

  static async warning(): Promise<void> {
    if (!this.isEnabled || !this.hapticsModule) return;
    
    try {
      await this.hapticsModule.notificationAsync(this.hapticsModule.NotificationFeedbackType.Warning);
    } catch (error) {
      console.error('Failed to trigger warning haptic:', error);
    }
  }

  static async error(): Promise<void> {
    if (!this.isEnabled || !this.hapticsModule) return;
    
    try {
      await this.hapticsModule.notificationAsync(this.hapticsModule.NotificationFeedbackType.Error);
    } catch (error) {
      console.error('Failed to trigger error haptic:', error);
    }
  }

  static async selection(): Promise<void> {
    if (!this.isEnabled || !this.hapticsModule) return;
    
    try {
      await this.hapticsModule.selectionAsync();
    } catch (error) {
      console.error('Failed to trigger selection haptic:', error);
    }
  }

  // Dice-specific haptic patterns
  static async diceRoll(diceType: DiceType, result: number): Promise<void> {
    if (!this.isEnabled) return;

    const maxValue = this.getDiceMaxValue(diceType);
    
    // Critical hit (max value)
    if (result === maxValue) {
      await this.success();
      return;
    }
    
    // Critical fail (1)
    if (result === 1) {
      await this.error();
      return;
    }
    
    // High roll (75% or higher)
    if (result >= maxValue * 0.75) {
      await this.medium();
      return;
    }
    
    // Low roll (25% or lower)
    if (result <= maxValue * 0.25) {
      await this.warning();
      return;
    }
    
    // Normal roll
    await this.light();
  }

  static async multipleDiceRoll(diceCount: number): Promise<void> {
    if (!this.isEnabled) return;

    if (diceCount === 1) {
      await this.light();
    } else if (diceCount <= 3) {
      await this.medium();
    } else {
      await this.heavy();
    }
  }

  private static getDiceMaxValue(diceType: DiceType): number {
    const maxValues = {
      'd4': 4,
      'd6': 6,
      'd8': 8,
      'd10': 10,
      'd12': 12,
      'd20': 20,
      'd100': 100,
    };
    return maxValues[diceType];
  }

  static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
}
