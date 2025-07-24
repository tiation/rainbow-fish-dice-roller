import { v4 as uuidv4 } from 'uuid';

export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

export interface DiceResult {
  id: string;
  type: DiceType;
  value: number;
  timestamp: Date;
  modifier?: number;
  advantage?: boolean;
  disadvantage?: boolean;
}

export interface DiceRoll {
  id: string;
  dice: DiceResult[];
  total: number;
  expression: string;
  timestamp: Date;
  characterId?: string;
  campaignId?: string;
  notes?: string;
}

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
  public rollExpression(expression: string): DiceRoll {
    const cleanExpr = expression.replace(/\s/g, '').toLowerCase();
    const results: DiceResult[] = [];
    let total = 0;

    // Simple parser for basic expressions like "2d6+3"
    const match = cleanExpr.match(/(\d*)d(\d+)([+-]\d+)?/);
    
    if (match) {
      const count = parseInt(match[1]) || 1;
      const sides = parseInt(match[2]);
      const modifier = match[3] ? parseInt(match[3]) : 0;
      
      const type = `d${sides}` as DiceType;
      
      for (let i = 0; i < count; i++) {
        const result = this.rollDie(type);
        results.push(result);
        total += result.value;
      }
      
      total += modifier;
    }

    const roll: DiceRoll = {
      id: uuidv4(),
      dice: results,
      total,
      expression,
      timestamp: new Date()
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
}
