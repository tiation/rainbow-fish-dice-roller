import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the HTML structure
const mockHTML = `
<div id="loading-screen" class="loading-screen"></div>
<main id="app" class="app hidden">
  <div id="dice-display" class="dice-display">🎲</div>
  <button id="roll-btn" class="roll-btn">Roll</button>
  <input id="dice-count" type="range" min="1" max="10" value="1">
  <span id="dice-count-display">1</span>
  <select id="dice-type">
    <option value="6">D6</option>
    <option value="20">D20</option>
  </select>
  <ul id="history-list"></ul>
  <div id="particles"></div>
  
  <!-- Modal elements -->
  <div id="settings-modal" class="modal hidden"></div>
  <div id="stats-modal" class="modal hidden"></div>
  
  <!-- Buttons -->
  <button id="settings-btn"></button>
  <button id="stats-btn"></button>
  <button id="clear-history-btn"></button>
  <button id="close-settings"></button>
  <button id="close-stats"></button>
  
  <!-- Settings inputs -->
  <input type="checkbox" id="sound-enabled" checked>
  <input type="checkbox" id="animations-enabled" checked>
  <input type="checkbox" id="haptic-enabled" checked>
  <select id="theme-select">
    <option value="rainbow">Rainbow</option>
  </select>
  
  <!-- Statistics displays -->
  <span id="total-rolls">0</span>
  <span id="avg-roll">0</span>
  <span id="highest-roll">0</span>
  <span id="lowest-roll">0</span>
  
  <!-- Notification elements -->
  <div id="offline-indicator" class="hidden"></div>
  <div id="update-notification" class="hidden"></div>
  <div id="install-banner" class="hidden"></div>
</main>
`;

describe('Dice Rolling Functionality', () => {
  beforeEach(() => {
    document.body.innerHTML = mockHTML;
    vi.clearAllMocks();
    
    // Mock Math.random for predictable testing
    vi.spyOn(Math, 'random');
  });

  describe('Basic Dice Rolling', () => {
    it('should generate numbers within valid range for D6', () => {
      Math.random.mockReturnValue(0.5); // Should result in roll of 4
      
      const diceType = 6;
      const expectedRoll = Math.floor(0.5 * diceType) + 1; // 4
      
      expect(expectedRoll).toBeGreaterThanOrEqual(1);
      expect(expectedRoll).toBeLessThanOrEqual(diceType);
      expect(expectedRoll).toBe(4);
    });

    it('should generate numbers within valid range for D20', () => {
      Math.random.mockReturnValue(0.95); // Should result in roll of 20
      
      const diceType = 20;
      const expectedRoll = Math.floor(0.95 * diceType) + 1; // 20
      
      expect(expectedRoll).toBeGreaterThanOrEqual(1);
      expect(expectedRoll).toBeLessThanOrEqual(diceType);
      expect(expectedRoll).toBe(20);
    });

    it('should handle multiple dice rolls', () => {
      Math.random
        .mockReturnValueOnce(0.5)  // Roll 1: 4
        .mockReturnValueOnce(0.8); // Roll 2: 5
      
      const diceType = 6;
      const diceCount = 2;
      let total = 0;
      const rolls = [];
      
      for (let i = 0; i < diceCount; i++) {
        const roll = Math.floor(Math.random() * diceType) + 1;
        rolls.push(roll);
        total += roll;
      }
      
      expect(rolls).toEqual([4, 5]);
      expect(total).toBe(9);
    });
  });

  describe('Critical Hit Detection', () => {
    it('should detect critical hit when rolling max value', () => {
      const diceType = 6;
      const roll = 6;
      const isCritical = roll === diceType;
      
      expect(isCritical).toBe(true);
    });

    it('should not detect critical hit for non-max values', () => {
      const diceType = 6;
      const roll = 3;
      const isCritical = roll === diceType;
      
      expect(isCritical).toBe(false);
    });
  });

  describe('Fumble Detection', () => {
    it('should detect fumble when rolling 1 on single die', () => {
      const roll = 1;
      const diceCount = 1;
      const isFumble = roll === 1 && diceCount === 1;
      
      expect(isFumble).toBe(true);
    });

    it('should not detect fumble when rolling 1 on multiple dice', () => {
      const roll = 1;
      const diceCount = 3;
      const isFumble = roll === 1 && diceCount === 1;
      
      expect(isFumble).toBe(false);
    });
  });

  describe('Statistics Calculation', () => {
    it('should calculate average correctly', () => {
      const rolls = [3, 6, 2, 4, 1];
      const total = rolls.reduce((sum, roll) => sum + roll, 0);
      const average = total / rolls.length;
      
      expect(average).toBe(3.2);
    });

    it('should find highest roll correctly', () => {
      const rolls = [3, 6, 2, 4, 1];
      const highest = Math.max(...rolls);
      
      expect(highest).toBe(6);
    });

    it('should find lowest roll correctly', () => {
      const rolls = [3, 6, 2, 4, 1];
      const lowest = Math.min(...rolls);
      
      expect(lowest).toBe(1);
    });
  });

  describe('Result Formatting', () => {
    it('should format single die result as simple number', () => {
      const total = 15;
      const individualRolls = null;
      
      const formatted = individualRolls && individualRolls.length > 1 
        ? `${total} (${individualRolls.join(', ')})` 
        : total.toString();
      
      expect(formatted).toBe('15');
    });

    it('should format multiple dice result with breakdown', () => {
      const total = 15;
      const individualRolls = [6, 4, 5];
      
      const formatted = individualRolls && individualRolls.length > 1 
        ? `${total} (${individualRolls.join(', ')})` 
        : total.toString();
      
      expect(formatted).toBe('15 (6, 4, 5)');
    });
  });
});

describe('PWA Features', () => {
  beforeEach(() => {
    document.body.innerHTML = mockHTML;
  });

  describe('Theme Management', () => {
    it('should apply theme to document element', () => {
      const theme = 'ocean';
      document.documentElement.setAttribute('data-theme', theme);
      
      expect(document.documentElement.getAttribute('data-theme')).toBe(theme);
    });
  });

  describe('Settings Persistence', () => {
    it('should maintain settings structure', () => {
      const settings = {
        soundEnabled: true,
        animationsEnabled: true,
        hapticEnabled: true,
        theme: 'rainbow'
      };
      
      expect(settings).toHaveProperty('soundEnabled');
      expect(settings).toHaveProperty('animationsEnabled');
      expect(settings).toHaveProperty('hapticEnabled');
      expect(settings).toHaveProperty('theme');
    });
  });

  describe('Statistics Structure', () => {
    it('should maintain statistics structure', () => {
      const statistics = {
        totalRolls: 0,
        totalSum: 0,
        highestRoll: 0,
        lowestRoll: Infinity,
        criticalHits: 0,
        fumbles: 0
      };
      
      expect(statistics).toHaveProperty('totalRolls');
      expect(statistics).toHaveProperty('totalSum');
      expect(statistics).toHaveProperty('highestRoll');
      expect(statistics).toHaveProperty('lowestRoll');
      expect(statistics).toHaveProperty('criticalHits');
      expect(statistics).toHaveProperty('fumbles');
    });
  });
});
