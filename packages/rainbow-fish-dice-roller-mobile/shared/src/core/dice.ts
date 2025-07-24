import { v4 as uuidv4 } from 'uuid';
import { DiceType, DiceResult, DiceRoll, RollContext } from '../types/dice';

export class DiceEngine {
  private static instance: DiceEngine;
  private rollHistory: DiceRoll[] = [];

  public static getInstance(): DiceEngine {
    if (!DiceEngine.instance) {
      DiceEngine.instance = new DiceEngine();
    }
    return DiceEngine.instance;
  }

  /**
   * Roll a single die
   */
  public rollDie(type: DiceType, modifier: number = 0): DiceResult {
    const sides = this.getDiceSides(type);
    const baseValue = Math.floor(Math.random() * sides) + 1;
    
    return {
      id: uuidv4(),
      type,
      value: baseValue,
      timestamp: new Date(),
      modifier
    };
  }

  /**
   * Roll multiple dice with advantage/disadvantage
   */
  public rollWithAdvantage(
    type: DiceType, 
    advantage: boolean = false, 
    disadvantage: boolean = false,
    modifier: number = 0
  ): DiceResult {
    if (advantage && disadvantage) {
      // Cancel out - normal roll
      return this.rollDie(type, modifier);
    }

    if (advantage || disadvantage) {
      const roll1 = this.rollDie(type);
      const roll2 = this.rollDie(type);
      
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
   * Parse and execute dice expression (e.g., "2d6+3", "1d20", "4d8-2")
   */
  public rollExpression(expression: string, context?: RollContext): DiceRoll {
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
            ? this.rollWithAdvantage(type, context.advantage, context.disadvantage)
            : this.rollDie(type);
          
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
    return roll;
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
  public clearHistory(): void {
    this.rollHistory = [];
  }

  /**
   * Get statistics for a dice type
   */
  public getStatistics(type: DiceType, rolls: DiceRoll[]): {
    average: number;
    min: number;
    max: number;
    count: number;
    distribution: Record<number, number>;
  } {
    const relevantRolls = rolls
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
