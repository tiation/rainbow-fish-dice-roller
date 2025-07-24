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

export interface DiceSet {
  d4: number;
  d6: number;
  d8: number;
  d10: number;
  d12: number;
  d20: number;
  d100: number;
}

export interface RollContext {
  characterId?: string;
  campaignId?: string;
  rollType: 'attack' | 'damage' | 'save' | 'skill' | 'ability' | 'custom';
  advantage?: boolean;
  disadvantage?: boolean;
  modifier?: number;
  notes?: string;
}

export interface DiceAnimation {
  duration: number;
  bounces: number;
  rotations: number;
  hapticFeedback: boolean;
  soundEnabled: boolean;
}

export interface DicePreferences {
  defaultDiceSet: DiceSet;
  animation: DiceAnimation;
  autoSave: boolean;
  hapticFeedback: boolean;
  soundEnabled: boolean;
  theme: 'classic' | 'neon' | 'wooden' | 'metal';
}
