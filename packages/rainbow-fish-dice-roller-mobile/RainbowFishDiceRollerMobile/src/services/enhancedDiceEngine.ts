import { v4 as uuidv4 } from 'uuid';
import { DiceType, DiceResult, DiceRoll, RollContext, DicePreferences } from '../types';
import { StorageService } from './storage';
import { AudioService } from './audio';
import { HapticService } from './haptic';

export class EnhancedDiceEngine {
  private static instance: EnhancedDiceEngine;
  private rollHistory: DiceRoll[] = [];
  private preferences: DicePreferences | null = null;
  private isInitialized: boolean = false;

  public static getInstance(): EnhancedDiceEngine {
    if (!EnhancedDiceEngine.instance) {
      EnhancedDiceEngine.instance = new EnhancedDiceEngine();
    }
    return EnhancedDiceEngine.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load preferences and history from storage
      this.preferences = await StorageService.getUserPreferences();
      this.rollHistory = await StorageService.getRollHistory();

      // Initialize services
      await AudioService.initialize(this.preferences || undefined);
      await HapticService.initialize(this.preferences || undefined);

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize enhanced dice engine:', error);
    }
  }

  /**
   * Roll a single die with enhanced feedback
   */
  public async rollDie(type: DiceType, modifier: number = 0): Promise<DiceResult> {
    await this.ensureInitialized();

    const sides = this.getDiceSides(type);
    const baseValue = Math.floor(Math.random() * sides) + 1;
    
    const result: DiceResult = {
      id: uuidv4(),
      type,
      value: baseValue,
      timestamp: new Date(),
      modifier
    };

    // Trigger feedback
    await this.provideFeedback(type, result.value, 1);

    return result;
  }

  /**
   * Roll multiple dice with advantage/disadvantage
   */
  public async rollWithAdvantage(
    type: DiceType, 
    advantage: boolean = false, 
    disadvantage: boolean = false,
    modifier: number = 0
  ): Promise<DiceResult> {
    await this.ensureInitialized();

    if (advantage && disadvantage) {
      // Cancel out - normal roll
      return this.rollDie(type, modifier);
    }

    if (advantage || disadvantage) {
      const roll1 = await this.rollDie(type);
      const roll2 = await this.rollDie(type);
      
      const selectedRoll = advantage 
        ? (roll1.value >= roll2.value ? roll1 : roll2)
        : (roll1.value <= roll2.value ? roll1 : roll2);

      return {
        ...selectedRoll,
        modifier,
        advantage,
        disadvantage
      };
    }

    return this.rollDie(type, modifier);
  }

  /**
   * Parse and execute dice expression with enhanced feedback
   */
  public async rollExpression(expression: string, context?: RollContext): Promise<DiceRoll> {
    await this.ensureInitialized();

    const cleanExpr = expression.replace(/\\s/g, '').toLowerCase();
    const results: DiceResult[] = [];
    let total = 0;

    // Parse complex expressions like "2d6+1d4+3"
    const parts = cleanExpr.split(/([+\\-])/);
    let currentModifier = 1;

    for (const part of parts) {
      if (part === '+') {
        currentModifier = 1;
        continue;
      }
      if (part === '-') {
        currentModifier = -1;
        continue;
      }

      if (part.includes('d')) {
        // Dice roll (e.g., "2d6")
        const [count, diceType] = part.split('d');
        const numDice = parseInt(count) || 1;
        const type = `d${diceType}` as DiceType;

        for (let i = 0; i < numDice; i++) {
          const result = context?.advantage || context?.disadvantage
            ? await this.rollWithAdvantage(type, context.advantage, context.disadvantage)
            : await this.rollDie(type);
          
          results.push(result);
          total += result.value * currentModifier;
        }
      } else if (/^\\d+$/.test(part)) {
        // Static modifier
        total += parseInt(part) * currentModifier;
      }
    }

    const roll: DiceRoll = {
      id: uuidv4(),
      dice: results,
      total,
      expression,
      timestamp: new Date(),
      characterId: context?.characterId,
      campaignId: context?.campaignId,
      notes: context?.notes
    };

    this.rollHistory.push(roll);
    
    // Save to storage
    await this.saveHistory();
    
    // Provide feedback for the entire roll
    await this.provideFeedback(results[0]?.type || 'd20', total, results.length);

    return roll;
  }

  /**
   * Provide audio and haptic feedback
   */
  private async provideFeedback(diceType: DiceType, result: number, diceCount: number): Promise<void> {
    try {
      // Haptic feedback
      if (diceCount === 1) {
        await HapticService.diceRoll(diceType, result);
      } else {
        await HapticService.multipleDiceRoll(diceCount);
      }

      // Audio feedback
      await AudioService.playRollSound(diceCount);

      // Special feedback for critical results
      const maxValue = this.getDiceSides(diceType);
      if (result === maxValue && diceCount === 1) {
        await AudioService.playCriticalSound();
      } else if (result === 1 && diceCount === 1) {
        await AudioService.playFailSound();
      }
    } catch (error) {
      console.error('Failed to provide feedback:', error);
    }
  }

  /**
   * Get the number of sides for a dice type
   */
  private getDiceSides(type: DiceType): number {
    const sides = {
      'd4': 4,
      'd6': 6,
      'd8': 8,
      'd10': 10,
      'd12': 12,
      'd20': 20,
      'd100': 100
    };
    return sides[type];
  }

  /**
   * Get roll history
   */
  public getHistory(limit?: number): DiceRoll[] {
    return limit ? this.rollHistory.slice(-limit) : [...this.rollHistory];
  }

  /**
   * Clear roll history
   */
  public async clearHistory(): Promise<void> {
    this.rollHistory = [];
    await this.saveHistory();
  }

  /**
   * Save history to storage
   */
  private async saveHistory(): Promise<void> {
    try {
      await StorageService.saveRollHistory(this.rollHistory);
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }

  /**
   * Update preferences and save them
   */
  public async updatePreferences(preferences: DicePreferences): Promise<void> {
    this.preferences = preferences;
    await StorageService.saveUserPreferences(preferences);
    
    // Update services
    AudioService.setEnabled(preferences.soundEnabled);
    HapticService.setEnabled(preferences.hapticFeedback);
  }

  /**
   * Get current preferences
   */
  public getPreferences(): DicePreferences | null {
    return this.preferences;
  }

  /**
   * Ensure the engine is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Get statistics for a dice type
   */
  public getStatistics(type: DiceType, rolls?: DiceRoll[]): {
    average: number;
    min: number;
    max: number;
    count: number;
    distribution: Record<number, number>;
  } {
    const rollsToAnalyze = rolls || this.rollHistory;
    const relevantRolls = rollsToAnalyze
      .flatMap(roll => roll.dice)
      .filter(die => die.type === type);

    if (relevantRolls.length === 0) {
      return {
        average: 0,
        min: 0,
        max: 0,
        count: 0,
        distribution: {}
      };
    }

    const values = relevantRolls.map(die => die.value);
    const distribution: Record<number, number> = {};

    values.forEach(value => {
      distribution[value] = (distribution[value] || 0) + 1;
    });

    return {
      average: values.reduce((sum, val) => sum + val, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
      distribution
    };
  }
}
