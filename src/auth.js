// Enterprise-grade Authentication System for Rainbow Fish Dice Roller
class AuthenticationManager {
    constructor() {
        this.currentUser = null;
        this.users = new Map();
        this.init();
    }

    init() {
        this.loadUsersFromStorage();
        this.checkExistingSession();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Handle Enter key in password field
        document.getElementById('password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleLogin();
            }
        });

        // Handle Enter key in username field
        document.getElementById('username').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('password').focus();
            }
        });
    }

    loadUsersFromStorage() {
        try {
            const userData = localStorage.getItem('diceRollerUsers');
            if (userData) {
                const usersArray = JSON.parse(userData);
                this.users = new Map(usersArray);
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
            this.users = new Map();
        }
    }

    saveUsersToStorage() {
        try {
            const usersArray = Array.from(this.users.entries());
            localStorage.setItem('diceRollerUsers', JSON.stringify(usersArray));
        } catch (error) {
            console.error('Failed to save user data:', error);
        }
    }

    checkExistingSession() {
        const currentSession = localStorage.getItem('diceRollerCurrentUser');
        if (currentSession) {
            try {
                const sessionData = JSON.parse(currentSession);
                if (this.isValidSession(sessionData)) {
                    this.currentUser = sessionData.username;
                    this.updateUIForLoggedInUser();
                    this.loadUserRollHistory();
                }
            } catch (error) {
                console.error('Invalid session data:', error);
                localStorage.removeItem('diceRollerCurrentUser');
            }
        }
    }

    isValidSession(sessionData) {
        const now = new Date().getTime();
        const sessionExpiry = sessionData.expiry || 0;
        
        // Session valid for 24 hours
        return sessionData.username && 
               this.users.has(sessionData.username) && 
               now < sessionExpiry;
    }

    handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            this.showMessage('Please enter both username and password', 'error');
            return;
        }

        // Validate username format (enterprise standards)
        if (!this.isValidUsername(username)) {
            this.showMessage('Username must be 3-20 characters, alphanumeric and underscores only', 'error');
            return;
        }

        // Validate password strength
        if (!this.isValidPassword(password)) {
            this.showMessage('Password must be at least 6 characters', 'error');
            return;
        }

        if (this.users.has(username)) {
            // Existing user login
            const userData = this.users.get(username);
            if (this.verifyPassword(password, userData.passwordHash)) {
                this.loginUser(username);
                this.showMessage(`Welcome back, ${username}!`, 'success');
            } else {
                this.showMessage('Invalid password', 'error');
            }
        } else {
            // New user registration
            this.registerUser(username, password);
            this.loginUser(username);
            this.showMessage(`Welcome, ${username}! Your account has been created.`, 'success');
        }
    }

    isValidUsername(username) {
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        return usernameRegex.test(username);
    }

    isValidPassword(password) {
        return password.length >= 6;
    }

    registerUser(username, password) {
        const passwordHash = this.hashPassword(password);
        const userData = {
            username: username,
            passwordHash: passwordHash,
            createdAt: new Date().toISOString(),
            rollHistory: [],
            totalRolls: 0,
            lastLogin: new Date().toISOString()
        };

        this.users.set(username, userData);
        this.saveUsersToStorage();
    }

    hashPassword(password) {
        // Simple hash function - in production, use bcrypt or similar
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }

    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }

    loginUser(username) {
        this.currentUser = username;
        
        // Update last login
        const userData = this.users.get(username);
        userData.lastLogin = new Date().toISOString();
        this.users.set(username, userData);
        this.saveUsersToStorage();

        // Create session
        const sessionData = {
            username: username,
            loginTime: new Date().getTime(),
            expiry: new Date().getTime() + (24 * 60 * 60 * 1000) // 24 hours
        };
        localStorage.setItem('diceRollerCurrentUser', JSON.stringify(sessionData));

        this.updateUIForLoggedInUser();
        this.loadUserRollHistory();
        this.clearLoginForm();
    }

    handleLogout() {
        if (this.currentUser) {
            this.saveCurrentRollHistory();
            this.showMessage(`Goodbye, ${this.currentUser}!`, 'success');
        }

        this.currentUser = null;
        localStorage.removeItem('diceRollerCurrentUser');
        this.updateUIForLoggedOutUser();
        this.clearRollHistory();
    }

    updateUIForLoggedInUser() {
        document.getElementById('username').style.display = 'none';
        document.getElementById('password').style.display = 'none';
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'inline-block';
        document.getElementById('profile-name').style.display = 'inline-block';
        document.getElementById('profile-name').textContent = `Welcome, ${this.currentUser}!`;
    }

    updateUIForLoggedOutUser() {
        document.getElementById('username').style.display = 'inline-block';
        document.getElementById('password').style.display = 'inline-block';
        document.getElementById('login-btn').style.display = 'inline-block';
        document.getElementById('logout-btn').style.display = 'none';
        document.getElementById('profile-name').style.display = 'none';
    }

    clearLoginForm() {
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }

    loadUserRollHistory() {
        if (!this.currentUser) return;

        const userData = this.users.get(this.currentUser);
        if (userData && userData.rollHistory && window.diceRoller) {
            window.diceRoller.rollHistory = userData.rollHistory.slice();
            window.diceRoller.displayHistoryInLog();
        }
    }

    saveCurrentRollHistory() {
        if (!this.currentUser || !window.diceRoller) return;

        const userData = this.users.get(this.currentUser);
        if (userData) {
            userData.rollHistory = window.diceRoller.rollHistory.slice();
            userData.totalRolls = userData.rollHistory.length;
            this.users.set(this.currentUser, userData);
            this.saveUsersToStorage();
        }
    }

    clearRollHistory() {
        if (window.diceRoller) {
            window.diceRoller.rollHistory = [];
            window.diceRoller.displayHistoryInLog();
        }
    }

    showMessage(message, type = 'info') {
        // Create or update message display
        let messageDiv = document.getElementById('auth-message');
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.id = 'auth-message';
            messageDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 10px 20px;
                border-radius: 5px;
                color: white;
                font-weight: bold;
                z-index: 10000;
                max-width: 300px;
                word-wrap: break-word;
            `;
            document.body.appendChild(messageDiv);
        }

        messageDiv.textContent = message;
        messageDiv.className = `message-${type}`;
        
        // Style based on type
        switch (type) {
            case 'success':
                messageDiv.style.backgroundColor = '#4CAF50';
                break;
            case 'error':
                messageDiv.style.backgroundColor = '#f44336';
                break;
            default:
                messageDiv.style.backgroundColor = '#2196F3';
        }

        messageDiv.style.display = 'block';

        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (messageDiv) {
                messageDiv.style.display = 'none';
            }
        }, 3000);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getUserStats() {
        if (!this.currentUser) return null;

        const userData = this.users.get(this.currentUser);
        if (!userData) return null;

        return {
            username: userData.username,
            totalRolls: userData.totalRolls || 0,
            accountAge: new Date() - new Date(userData.createdAt),
            lastLogin: userData.lastLogin
        };
    }
}

// Global functions for HTML onclick handlers
function handleLogin() {
    if (window.authManager) {
        window.authManager.handleLogin();
    }
}

function handleLogout() {
    if (window.authManager) {
        window.authManager.handleLogout();
    }
}

// Initialize authentication when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.authManager = new AuthenticationManager();
    });
} else {
    window.authManager = new AuthenticationManager();
}

// Save roll history when user rolls dice (integrate with existing roller)
document.addEventListener('diceRollComplete', () => {
    if (window.authManager && window.authManager.getCurrentUser()) {
        window.authManager.saveCurrentRollHistory();
    }
});
