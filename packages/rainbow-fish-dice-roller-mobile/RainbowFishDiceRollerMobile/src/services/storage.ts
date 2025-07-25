// import AsyncStorage from '@react-native-async-storage/async-storage';
import { DiceRoll, DicePreferences } from '../types';

// Fallback storage for web/development
const fallbackStorage = {
  async setItem(key: string, value: string): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  async getItem(key: string): Promise<string | null> {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  async multiRemove(keys: string[]): Promise<void> {
    if (typeof window !== 'undefined') {
      keys.forEach(key => localStorage.removeItem(key));
    }
  }
};

// Get storage implementation
const getStorage = async () => {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    return AsyncStorage.default;
  } catch {
    return fallbackStorage;
  }
};

const KEYS = {
  ROLL_HISTORY: '@dice_roll_history',
  USER_PREFERENCES: '@user_preferences',
  USER_DATA: '@user_data',
  CHARACTERS: '@characters',
  CAMPAIGNS: '@campaigns',
};

export class StorageService {
  static async saveRollHistory(history: DiceRoll[]): Promise<void> {
    try {
      const storage = await getStorage();
      await storage.setItem(KEYS.ROLL_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save roll history:', error);
    }
  }

  static async getRollHistory(): Promise<DiceRoll[]> {
    try {
      const storage = await getStorage();
      const data = await storage.getItem(KEYS.ROLL_HISTORY);
      if (data) {
        const parsed = JSON.parse(data);
        // Convert timestamp strings back to Date objects
        return parsed.map((roll: DiceRoll) => ({
          ...roll,
          timestamp: new Date(roll.timestamp),
          dice: roll.dice.map(die => ({
            ...die,
            timestamp: new Date(die.timestamp),
          })),
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to load roll history:', error);
      return [];
    }
  }

  static async saveUserPreferences(preferences: DicePreferences): Promise<void> {
    try {
      const storage = await getStorage();
      await storage.setItem(KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  }

  static async getUserPreferences(): Promise<DicePreferences | null> {
    try {
      const storage = await getStorage();
      const data = await storage.getItem(KEYS.USER_PREFERENCES);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      return null;
    }
  }

  static async saveUserData(userData: any): Promise<void> {
    try {
      const storage = await getStorage();
      await storage.setItem(KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  }

  static async getUserData(): Promise<any | null> {
    try {
      const storage = await getStorage();
      const data = await storage.getItem(KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load user data:', error);
      return null;
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      const storage = await getStorage();
      await storage.multiRemove(Object.values(KEYS));
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }
}
