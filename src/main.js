import { playSound } from './utils/sound.js';
// Simplified version without external dependencies

// PWA State Management
class DiceRollerPWA {
  constructor() {
    this.rollHistory = [];
    this.statistics = {
      totalRolls: 0,
      totalSum: 0,
      highestRoll: 0,
      lowestRoll: Infinity,
      criticalHits: 0,
      fumbles: 0
    };
    this.settings = {
      soundEnabled: true,
      animationsEnabled: true,
      hapticEnabled: true,
      theme: 'rainbow'
    };
    this.isOnline = navigator.onLine;
    this.initializeApp();
  }

  async initializeApp() {
    await this.initializeDatabase();
    await this.loadSettings();
    await this.loadStatistics();
    this.setupEventListeners();
    this.setupPWA();
    this.setupOfflineDetection();
    this.hideLoadingScreen();
    this.checkForUpdates();
  }

  async initializeDatabase() {
    // Use localStorage for simplified data persistence
    this.db = {
      async put(store, data) {
        localStorage.setItem(`rainbowfish_${store}_${data.key || 'data'}`, JSON.stringify(data));
      },
      async add(store, data) {
        const history = JSON.parse(localStorage.getItem(`rainbowfish_${store}`) || '[]');
        history.unshift({ ...data, id: Date.now() });
        localStorage.setItem(`rainbowfish_${store}`, JSON.stringify(history.slice(0, 100)));
      },
      async get(store, key) {
        const item = localStorage.getItem(`rainbowfish_${store}_${key}`);
        return item ? JSON.parse(item) : null;
      },
      transaction(store, mode) {
        return {
          objectStore(name) {
            return {
              async clear() {
                localStorage.removeItem(`rainbowfish_${name}`);
              }
            };
          },
          done: Promise.resolve()
        };
      }
    };
  }

  setupEventListeners() {
    // Dice rolling
    document.getElementById('roll-btn').addEventListener('click', () => this.rollDice());
    document.getElementById('dice-count').addEventListener('input', () => this.updateDiceCountDisplay());
    
    // Modals
    document.getElementById('settings-btn').addEventListener('click', () => this.openModal('settings'));
    document.getElementById('stats-btn').addEventListener('click', () => this.showStatistics());
    document.getElementById('close-settings').addEventListener('click', () => this.closeModal('settings'));
    document.getElementById('close-stats').addEventListener('click', () => this.closeModal('stats'));
    
    // Quick actions
    document.getElementById('clear-history-btn').addEventListener('click', () => this.clearHistory());
    
    // Settings
    document.getElementById('sound-enabled').addEventListener('change', (e) => this.updateSetting('soundEnabled', e.target.checked));
    document.getElementById('animations-enabled').addEventListener('change', (e) => this.updateSetting('animationsEnabled', e.target.checked));
    document.getElementById('haptic-enabled').addEventListener('change', (e) => this.updateSetting('hapticEnabled', e.target.checked));
    document.getElementById('theme-select').addEventListener('change', (e) => this.updateSetting('theme', e.target.value));
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !e.target.matches('input, select, textarea')) {
        e.preventDefault();
        this.rollDice();
      }
    });
    
    // Touch gestures for mobile
    this.setupTouchGestures();
  }

  setupTouchGestures() {
    const diceDisplay = document.getElementById('dice-display');
    let touchStartY = 0;
    
    diceDisplay.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    diceDisplay.addEventListener('touchend', (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartY - touchEndY;
      
      if (Math.abs(deltaY) > 50) { // Minimum swipe distance
        if (deltaY > 0) {
          // Swipe up - roll dice
          this.rollDice();
        }
      }
    }, { passive: true });
  }

  async rollDice() {
    const rollBtn = document.getElementById('roll-btn');
    const diceDisplay = document.getElementById('dice-display');
    const diceType = parseInt(document.getElementById('dice-type').value);
    const diceCount = parseInt(document.getElementById('dice-count').value);
    
    // Disable button during roll
    rollBtn.disabled = true;
    diceDisplay.classList.add('rolling');
    
    // Haptic feedback
    if (this.settings.hapticEnabled && 'vibrate' in navigator) {
      navigator.vibrate(100);
    }
    
    // Play sound
    if (this.settings.soundEnabled) {
      playSound('roll');
    }
    
    // Animate dice roll
    await this.animateDiceRoll(diceDisplay);
    
    // Calculate results
    const results = this.calculateRoll(diceType, diceCount);
    const { total, rolls, critical, fumble } = results;
    
    // Update display
    diceDisplay.textContent = this.formatDiceResult(total, diceCount > 1 ? rolls : null);
    diceDisplay.classList.remove('rolling');
    
    // Handle special results
    if (critical) {
      diceDisplay.classList.add('critical-success');
      this.createParticleEffect();
      if (this.settings.soundEnabled) playSound('critical');
      if (this.settings.hapticEnabled && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }
      setTimeout(() => diceDisplay.classList.remove('critical-success'), 2000);
    }
    
    if (fumble) {
      diceDisplay.classList.add('fumble');
      setTimeout(() => diceDisplay.classList.remove('fumble'), 1000);
    }
    
    // Save to database and update statistics
    await this.saveRoll({ diceType, diceCount, total, rolls, critical, fumble });
    this.addToHistory(results);
    this.updateStatistics(results);
    
    // Re-enable button
    setTimeout(() => {
      rollBtn.disabled = false;
    }, 500);
  }

  calculateRoll(diceType, diceCount) {
    const rolls = [];
    let total = 0;
    let critical = false;
    let fumble = false;
    
    for (let i = 0; i < diceCount; i++) {
      const roll = Math.floor(Math.random() * diceType) + 1;
      rolls.push(roll);
      total += roll;
      
      if (roll === diceType) critical = true;
      if (roll === 1 && diceCount === 1) fumble = true;
    }
    
    return { total, rolls, critical, fumble };
  }

  formatDiceResult(total, individualRolls) {
    if (individualRolls && individualRolls.length > 1) {
      return `${total} (${individualRolls.join(', ')})`;
    }
    return total.toString();
  }

  async animateDiceRoll(element) {
    if (!this.settings.animationsEnabled) return;
    
    const diceSymbols = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    const duration = 1000;
    const interval = 100;
    const steps = duration / interval;
    
    return new Promise(resolve => {
      let step = 0;
      const animation = setInterval(() => {
        element.textContent = diceSymbols[Math.floor(Math.random() * diceSymbols.length)];
        step++;
        
        if (step >= steps) {
          clearInterval(animation);
          resolve();
        }
      }, interval);
    });
  }

  createParticleEffect() {
    if (!this.settings.animationsEnabled) return;
    
    const particlesContainer = document.getElementById('particles');
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8'];
    
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.animationDelay = Math.random() * 2 + 's';
      
      particlesContainer.appendChild(particle);
      
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 3000);
    }
  }

  async saveRoll(rollData) {
    try {
      await this.db.add('rolls', {
        ...rollData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to save roll:', error);
    }
  }

  addToHistory(results) {
    const historyList = document.getElementById('history-list');
    const { total, critical, fumble } = results;
    
    const historyItem = document.createElement('li');
    historyItem.textContent = total;
    
    if (critical) historyItem.classList.add('critical');
    if (fumble) historyItem.classList.add('fumble');
    
    historyList.insertBefore(historyItem, historyList.firstChild);
    this.rollHistory.unshift(results);
    
    // Limit history display
    while (historyList.children.length > 10) {
      historyList.removeChild(historyList.lastChild);
    }
    
    if (this.rollHistory.length > 100) {
      this.rollHistory = this.rollHistory.slice(0, 100);
    }
  }

  updateStatistics(results) {
    const { total, critical, fumble } = results;
    
    this.statistics.totalRolls++;
    this.statistics.totalSum += total;
    this.statistics.highestRoll = Math.max(this.statistics.highestRoll, total);
    this.statistics.lowestRoll = Math.min(this.statistics.lowestRoll, total);
    
    if (critical) this.statistics.criticalHits++;
    if (fumble) this.statistics.fumbles++;
    
    this.saveStatistics();
  }

  async saveStatistics() {
    try {
      await this.db.put('statistics', { key: 'gameStats', ...this.statistics });
    } catch (error) {
      console.error('Failed to save statistics:', error);
    }
  }

  async loadStatistics() {
    try {
      const saved = await this.db.get('statistics', 'gameStats');
      if (saved) {
        this.statistics = { ...this.statistics, ...saved };
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  }

  showStatistics() {
    const avgRoll = this.statistics.totalRolls > 0 ? (this.statistics.totalSum / this.statistics.totalRolls).toFixed(1) : '0';
    
    document.getElementById('total-rolls').textContent = this.statistics.totalRolls;
    document.getElementById('avg-roll').textContent = avgRoll;
    document.getElementById('highest-roll').textContent = this.statistics.highestRoll === 0 ? '0' : this.statistics.highestRoll;
    document.getElementById('lowest-roll').textContent = this.statistics.lowestRoll === Infinity ? '0' : this.statistics.lowestRoll;
    
    this.openModal('stats');
  }

  async clearHistory() {
    this.rollHistory = [];
    document.getElementById('history-list').innerHTML = '';
    
    // Clear from database
    try {
      const tx = this.db.transaction('rolls', 'readwrite');
      await tx.objectStore('rolls').clear();
      await tx.done;
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }

  updateDiceCountDisplay() {
    const diceCountInput = document.getElementById('dice-count');
    const diceCountDisplay = document.getElementById('dice-count-display');
    diceCountDisplay.textContent = diceCountInput.value;
  }

  openModal(modalId) {
    const modal = document.getElementById(`${modalId}-modal`);
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    
    // Focus trap
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusableElements.length) {
      focusableElements[0].focus();
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(`${modalId}-modal`);
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }

  async updateSetting(key, value) {
    this.settings[key] = value;
    
    if (key === 'theme') {
      document.documentElement.setAttribute('data-theme', value);
    }
    
    await this.saveSettings();
  }

  async saveSettings() {
    try {
      await this.db.put('settings', { key: 'userSettings', ...this.settings });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  async loadSettings() {
    try {
      const saved = await this.db.get('settings', 'userSettings');
      if (saved) {
        this.settings = { ...this.settings, ...saved };
        
        // Apply settings to UI
        document.getElementById('sound-enabled').checked = this.settings.soundEnabled;
        document.getElementById('animations-enabled').checked = this.settings.animationsEnabled;
        document.getElementById('haptic-enabled').checked = this.settings.hapticEnabled;
        document.getElementById('theme-select').value = this.settings.theme;
        
        document.documentElement.setAttribute('data-theme', this.settings.theme);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  setupPWA() {
    // Simplified PWA setup without external dependencies
    // Handle installation prompt
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      this.showInstallBanner();
    });
    
    document.getElementById('install-btn')?.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          this.hideInstallBanner();
        }
        
        deferredPrompt = null;
      }
    });
    
    document.getElementById('dismiss-install')?.addEventListener('click', () => {
      this.hideInstallBanner();
    });
  }

  setupOfflineDetection() {
    const updateOnlineStatus = () => {
      const offlineIndicator = document.getElementById('offline-indicator');
      
      if (navigator.onLine) {
        offlineIndicator.classList.add('hidden');
        this.isOnline = true;
      } else {
        offlineIndicator.classList.remove('hidden');
        this.isOnline = false;
      }
    };
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    updateOnlineStatus();
  }

  showUpdateNotification() {
    const notification = document.getElementById('update-notification');
    notification.classList.remove('hidden');
    
    document.getElementById('update-btn')?.addEventListener('click', () => {
      window.location.reload();
    });
    
    document.getElementById('dismiss-update')?.addEventListener('click', () => {
      notification.classList.add('hidden');
    });
  }

  showInstallBanner() {
    const banner = document.getElementById('install-banner');
    banner.classList.remove('hidden');
  }

  hideInstallBanner() {
    const banner = document.getElementById('install-banner');
    banner.classList.add('hidden');
  }

  checkForUpdates() {
    // Check for app updates periodically
    setInterval(() => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CHECK_UPDATE' });
      }
    }, 60000); // Check every minute
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const app = document.getElementById('app');
    
    setTimeout(() => {
      loadingScreen.style.opacity = '0';
      
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
        app.classList.remove('hidden');
      }, 500);
    }, 1500); // Show loading for at least 1.5 seconds
  }
}

// Initialize the PWA when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new DiceRollerPWA());
} else {
  new DiceRollerPWA();
}

