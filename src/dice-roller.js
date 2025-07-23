// Dice Roller with automatic logging to visible log panel
class DiceRollerWithLog {
    constructor() {
        this.rollHistory = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadHistoryFromStorage();
        this.hideLoadingScreen();
    }

    setupEventListeners() {
        // Handle individual roll buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('roll')) {
                this.rollSingleLine(e.target.closest('li'));
            }
        });
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        
        setTimeout(() => {
            if (loadingScreen) loadingScreen.style.display = 'none';
            if (app) app.classList.remove('hidden');
        }, 500);
    }

    rollSingleLine(lineElement) {
        const count = parseInt(lineElement.querySelector('.d-count').value) || 1;
        const diceTypeSelect = lineElement.querySelector('.d-type');
        const diceType = this.getDiceTypeFromValue(diceTypeSelect.value);
        const modifier = parseInt(lineElement.querySelector('.d-mod').value) || 0;
        const label = lineElement.querySelector('.label').value || `${count}d${diceType}`;

        const results = this.calculateRoll(diceType, count, modifier);
        const { total, rolls, originalTotal } = results;

        // Update line result display
        const resultDiv = lineElement.querySelector('.line-result');
        if (resultDiv) {
            let displayText = `${total}`;
            if (rolls.length > 1) {
                displayText += ` (${rolls.join(', ')})`;
            }
            if (modifier !== 0) {
                displayText += ` [${originalTotal}${modifier >= 0 ? '+' : ''}${modifier}]`;
            }
            resultDiv.textContent = displayText;
        }

        // Add to log with timestamp
        this.addToLog(label, results, diceType, count, modifier);
    }

    getDiceTypeFromValue(value) {
        const mapping = {
            '0': 2,   // d2
            '3': 6,   // d6 
            '8': 100  // d100
        };
        return mapping[value] || 6;
    }

    calculateRoll(diceType, count, modifier = 0) {
        const rolls = [];
        let originalTotal = 0;

        for (let i = 0; i < count; i++) {
            const roll = Math.floor(Math.random() * diceType) + 1;
            rolls.push(roll);
            originalTotal += roll;
        }

        const total = originalTotal + modifier;
        return { total, rolls, originalTotal, modifier };
    }

    addToLog(label, results, diceType, count, modifier) {
        const { total, rolls, originalTotal } = results;
        const logList = document.getElementById('log-list');
        if (!logList) return;

        const timestamp = new Date().toLocaleTimeString();
        const diceNotation = `${count}d${diceType}`;
        const modifierText = modifier !== 0 ? ` ${modifier >= 0 ? '+' : ''}${modifier}` : '';
        
        const logEntry = document.createElement('li');
        logEntry.innerHTML = `
            <span class="log-timestamp">[${timestamp}]</span> 
            <span class="log-notation">${label || diceNotation}${modifierText}:</span> 
            <span class="log-result">${total}</span>
            ${rolls.length > 1 ? `<span class="log-details">(${rolls.join(', ')})</span>` : ''}
        `;
        
        // Add to beginning of log
        logList.insertBefore(logEntry, logList.firstChild);
        
        // Keep only last 50 entries
        while (logList.children.length > 50) {
            logList.removeChild(logList.lastChild);
        }

        // Save to history and localStorage
        this.rollHistory.unshift({
            timestamp: new Date().toISOString(),
            label: label || diceNotation,
            diceType,
            count,
            modifier,
            total,
            rolls: rolls.slice(),
            originalTotal
        });

        if (this.rollHistory.length > 100) {
            this.rollHistory = this.rollHistory.slice(0, 100);
        }

        this.saveHistoryToStorage();
        
        // Dispatch event for authentication integration
        document.dispatchEvent(new CustomEvent('diceRollComplete', {
            detail: { 
                roll: {
                    timestamp: new Date().toISOString(),
                    label: label || diceNotation,
                    diceType,
                    count,
                    modifier,
                    total,
                    rolls: rolls.slice(),
                    originalTotal
                }
            }
        }));
    }

    saveHistoryToStorage() {
        // Only save to general storage if no user is logged in
        if (!window.authManager || !window.authManager.getCurrentUser()) {
            try {
                localStorage.setItem('diceRollerHistory', JSON.stringify(this.rollHistory));
            } catch (error) {
                console.error('Failed to save history:', error);
            }
        }
        // If user is logged in, auth manager handles storage
    }

    loadHistoryFromStorage() {
        // Only load from general storage if no user is logged in
        if (!window.authManager || !window.authManager.getCurrentUser()) {
            try {
                const saved = localStorage.getItem('diceRollerHistory');
                if (saved) {
                    this.rollHistory = JSON.parse(saved);
                    this.displayHistoryInLog();
                }
            } catch (error) {
                console.error('Failed to load history:', error);
            }
        }
        // If user is logged in, auth manager handles loading
    }

    displayHistoryInLog() {
        const logList = document.getElementById('log-list');
        if (!logList) return;

        logList.innerHTML = '';
        
        // Show last 20 entries from history
        const recentHistory = this.rollHistory.slice(0, 20);
        recentHistory.forEach(entry => {
            const timestamp = new Date(entry.timestamp).toLocaleTimeString();
            const modifierText = entry.modifier !== 0 ? ` ${entry.modifier >= 0 ? '+' : ''}${entry.modifier}` : '';
            
            const logEntry = document.createElement('li');
            logEntry.innerHTML = `
                <span class="log-timestamp">[${timestamp}]</span> 
                <span class="log-notation">${entry.label}${modifierText}:</span> 
                <span class="log-result">${entry.total}</span>
                ${entry.rolls.length > 1 ? `<span class="log-details">(${entry.rolls.join(', ')})</span>` : ''}
            `;
            logList.appendChild(logEntry);
        });
    }
}

// Global functions expected by the HTML
function clickRoll(event) {
    const lineElement = event.target.closest('li');
    if (lineElement && window.diceRoller) {
        window.diceRoller.rollSingleLine(lineElement);
    }
}

function clickRollAll() {
    const allLines = document.querySelectorAll('#dice-list li');
    allLines.forEach(line => {
        if (window.diceRoller) {
            window.diceRoller.rollSingleLine(line);
        }
    });
}

function addLine() {
    const diceList = document.getElementById('dice-list');
    if (!diceList) return;

    const newLine = document.createElement('li');
    newLine.innerHTML = `
        <div class="button-group">
            <button class="expand-line" onclick="expandLine(event)">△</button>
            <button class="remove-line" onclick="removeLine(event)">-</button>
            <button class="duplicate-line" onclick="duplicateLine(event)">++</button>
        </div>
        <div class="d-line">
            <input type="text" maxlength="22" class="label" placeholder="1d6" />
            <span class="main-controls">
                <input class="d-count" type="number" value="1" min="1" max="99" />
                <select class="d-type">
                    <option value="0">d2</option>
                    <option value="3" selected="selected">d6</option>
                    <option value="8">d100</option>
                </select>
                <input class="d-mod" type="number" value="0" max="99" />
                <button class="roll" onclick="clickRoll(event)">Roll</button>
            </span>
            <span class="option-1-controls">
                <input type="checkbox" class="option-1" />
                <label for="option-1">
                    <select class="ignore-reroll">
                        <option value="0">Drop</option>
                        <option value="1">Reroll</option>
                    </select>
                    <select class="low-high">
                        <option value="0">lowest</option>
                        <option value="1">highest</option>
                    </select>
                    <input class="drop-count" type="number" value="0" min="0" max="5" />
                </label>
            </span>
            <span class="option-2-controls">
                <input type="checkbox" class="option-2" />
                <label for="option-2">
                    <select class="min-max">
                        <option value="0">Minimum</option>
                        <option value="1">Maximum</option>
                    </select>
                    <input class="limiter" type="number" value="1" min="1" max="6" />
                </label>
            </span>
        </div>
        <div class="line-result"></div>
    `;
    
    diceList.appendChild(newLine);
}

function removeLine(event) {
    const line = event.target.closest('li');
    if (line) {
        line.remove();
    }
}

function duplicateLine(event) {
    const line = event.target.closest('li');
    if (line) {
        const clone = line.cloneNode(true);
        line.parentNode.insertBefore(clone, line.nextSibling);
    }
}

function expandLine(event) {
    const line = event.target.closest('.d-line');
    if (line) {
        line.classList.toggle('expanded');
    }
}

function clearLog() {
    const logList = document.getElementById('log-list');
    if (logList) {
        logList.innerHTML = '';
    }
    
    if (window.diceRoller) {
        window.diceRoller.rollHistory = [];
        window.diceRoller.saveHistoryToStorage();
    }
}

function saveCheckedState(event) {
    localStorage.setItem('saveEnabled', event.target.checked);
}

function changeSound(event) {
    localStorage.setItem('soundEnabled', event.target.checked);
}

function expandAll(event) {
    const lines = document.querySelectorAll('.d-line');
    lines.forEach(line => line.classList.add('expanded'));
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.diceRoller = new DiceRollerWithLog();
    });
} else {
    window.diceRoller = new DiceRollerWithLog();
}
