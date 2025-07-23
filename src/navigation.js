// Enterprise Navigation and Modal System
class NavigationManager {
    constructor() {
        this.init();
    }

    init() {
        this.createModalContainer();
        this.updateUserCount();
        this.updateServerStatus();
    }

    createModalContainer() {
        const modalHTML = `
            <div id="enterprise-modal" class="enterprise-modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="modal-title">Title</h2>
                        <button class="modal-close" onclick="closeModal()">&times;</button>
                    </div>
                    <div class="modal-body" id="modal-body">
                        Content goes here
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add modal styles
        const modalStyles = `
            .enterprise-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                backdrop-filter: blur(5px);
            }

            .modal-content {
                background: white;
                border-radius: 12px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                animation: modalSlideIn 0.3s ease-out;
            }

            .modal-header {
                background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                color: white;
                padding: 20px;
                border-radius: 12px 12px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .modal-header h2 {
                margin: 0;
                font-size: 1.5em;
            }

            .modal-close {
                background: none;
                border: none;
                color: white;
                font-size: 2em;
                cursor: pointer;
                padding: 0;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.3s;
            }

            .modal-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .modal-body {
                padding: 30px;
                line-height: 1.6;
                color: #333;
            }

            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: scale(0.9) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }

            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 20px 0;
            }

            .stat-card {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                border: 1px solid #dee2e6;
            }

            .stat-value {
                font-size: 2em;
                font-weight: bold;
                color: #007bff;
                margin-bottom: 5px;
            }

            .stat-label {
                color: #6c757d;
                font-size: 0.9em;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
        `;

        const styleElement = document.createElement('style');
        styleElement.textContent = modalStyles;
        document.head.appendChild(styleElement);
    }

    showModal(title, content) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = content;
        document.getElementById('enterprise-modal').classList.remove('hidden');
        
        // Prevent body scrolling
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('enterprise-modal').classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    updateUserCount() {
        if (window.authManager) {
            const users = window.authManager.users;
            document.getElementById('total-users').textContent = users.size;
        } else {
            // Retry after auth manager loads
            setTimeout(() => this.updateUserCount(), 1000);
        }
    }

    updateServerStatus() {
        const statusElement = document.getElementById('server-status');
        if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
            statusElement.textContent = 'Server: Local Development';
            statusElement.style.color = '#28a745';
        } else {
            statusElement.textContent = 'Server: Production';
            statusElement.style.color = '#007bff';
        }
    }
}

// Global navigation functions
function showHome() {
    if (window.navigationManager) {
        const content = `
            <div style="text-align: center;">
                <h3>🌈 Welcome to Rainbow Fish Dice Roller</h3>
                <p>An enterprise-grade dice rolling application with user authentication, persistent roll history, and advanced features.</p>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">2.0.0</div>
                        <div class="stat-label">Version</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">Enterprise</div>
                        <div class="stat-label">Edition</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">PWA</div>
                        <div class="stat-label">Technology</div>
                    </div>
                </div>

                <h4>Features:</h4>
                <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
                    <li>User Authentication & Profiles</li>
                    <li>Persistent Roll History</li>
                    <li>Advanced Dice Rolling Options</li>
                    <li>Responsive Design</li>
                    <li>Progressive Web App Support</li>
                    <li>Offline Capabilities</li>
                    <li>Legacy Mode Compatibility</li>
                </ul>

                <p style="margin-top: 30px;">
                    <strong>Created by:</strong> Garrett Dillman<br>
                    <strong>Enhanced with:</strong> Enterprise-grade features and user-centric design
                </p>
            </div>
        `;
        window.navigationManager.showModal('Rainbow Fish Dice Roller', content);
    }
}

function showUserStats() {
    if (window.navigationManager && window.authManager) {
        const currentUser = window.authManager.getCurrentUser();
        
        if (!currentUser) {
            const content = `
                <div style="text-align: center;">
                    <h3>📊 User Statistics</h3>
                    <p>Please log in to view your personal statistics.</p>
                    <button onclick="closeModal()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Close</button>
                </div>
            `;
            window.navigationManager.showModal('User Statistics', content);
            return;
        }

        const userStats = window.authManager.getUserStats() || {};
        const rollHistory = window.diceRoller ? window.diceRoller.rollHistory : [];
        
        // Calculate roll statistics
        const totalRolls = rollHistory.length;
        const recentRolls = rollHistory.slice(0, 10);
        const averageResult = totalRolls > 0 ? 
            (rollHistory.reduce((sum, roll) => sum + roll.total, 0) / totalRolls).toFixed(2) : 0;

        const content = `
            <div>
                <h3>📊 Your Statistics</h3>
                <p><strong>Username:</strong> ${currentUser}</p>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${totalRolls}</div>
                        <div class="stat-label">Total Rolls</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${averageResult}</div>
                        <div class="stat-label">Average Result</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${userStats.accountAge ? Math.floor((new Date() - new Date(userStats.createdAt)) / (1000 * 60 * 60 * 24)) : 0}</div>
                        <div class="stat-label">Days Active</div>
                    </div>
                </div>

                <h4>Recent Roll History:</h4>
                <div style="max-height: 200px; overflow-y: auto; background: #f8f9fa; padding: 15px; border-radius: 5px;">
                    ${recentRolls.length > 0 ? 
                        recentRolls.map(roll => 
                            `<div style="margin-bottom: 8px; font-family: monospace;">
                                <strong>${roll.label}:</strong> ${roll.total} 
                                ${roll.rolls.length > 1 ? `(${roll.rolls.join(', ')})` : ''}
                                <span style="color: #666; font-size: 0.8em;">[${new Date(roll.timestamp).toLocaleTimeString()}]</span>
                            </div>`
                        ).join('') : 
                        '<p style="color: #666; font-style: italic;">No rolls recorded yet</p>'
                    }
                </div>
            </div>
        `;
        
        window.navigationManager.showModal('User Statistics', content);
    }
}

function showTerms() {
    if (window.navigationManager) {
        const content = `
            <div>
                <h3>📋 Terms of Service</h3>
                <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
                
                <h4>1. Acceptance of Terms</h4>
                <p>By using the Rainbow Fish Dice Roller application, you agree to these terms of service.</p>

                <h4>2. Use License</h4>
                <p>This application is provided for entertainment and gaming purposes. You may use it for personal tabletop gaming sessions.</p>

                <h4>3. User Accounts</h4>
                <p>User accounts are stored locally on your device. We do not collect or transmit personal data to external servers.</p>

                <h4>4. Data Storage</h4>
                <p>Your roll history and preferences are stored locally in your browser's storage. Clearing browser data will remove your account and history.</p>

                <h4>5. Limitation of Liability</h4>
                <p>This application is provided "as is" without warranties. The dice rolls are generated using pseudorandom algorithms suitable for gaming.</p>

                <h4>6. Changes to Terms</h4>
                <p>We reserve the right to modify these terms. Changes will be effective immediately upon posting.</p>

                <p><strong>Contact:</strong> For questions about these terms, use the Contact link in the footer.</p>
            </div>
        `;
        window.navigationManager.showModal('Terms of Service', content);
    }
}

function showPrivacy() {
    if (window.navigationManager) {
        const content = `
            <div>
                <h3>🔒 Privacy Policy</h3>
                <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
                
                <h4>Data Collection</h4>
                <p>Rainbow Fish Dice Roller operates entirely within your browser. We do not collect, transmit, or store personal data on external servers.</p>

                <h4>Local Storage</h4>
                <p>The following data is stored locally on your device:</p>
                <ul>
                    <li>Username and password hash for authentication</li>
                    <li>Dice roll history and statistics</li>
                    <li>Application preferences and settings</li>
                </ul>

                <h4>Cookies and Tracking</h4>
                <p>This application does not use cookies or external tracking services.</p>

                <h4>Third-Party Services</h4>
                <p>We may load fonts from Google Fonts for styling purposes. This may involve requests to Google's servers.</p>

                <h4>Data Security</h4>
                <p>Your data is stored securely in your browser's local storage with basic password hashing.</p>

                <h4>Data Deletion</h4>
                <p>You can delete your data at any time by:</p>
                <ul>
                    <li>Clearing your browser's local storage</li>
                    <li>Using the "Clear Log" function</li>
                    <li>Logging out and creating a new account</li>
                </ul>

                <h4>Children's Privacy</h4>
                <p>This application is suitable for all ages and does not collect personal information from children.</p>
            </div>
        `;
        window.navigationManager.showModal('Privacy Policy', content);
    }
}

function showContact() {
    if (window.navigationManager) {
        const content = `
            <div style="text-align: center;">
                <h3>📧 Contact Information</h3>
                
                <div style="text-align: left; max-width: 400px; margin: 0 auto;">
                    <h4>Support Channels:</h4>
                    <p><strong>🎲 Original Creator:</strong><br>
                    Garrett Dillman - Creator of the legendary DnD Dice Roller</p>
                    
                    <p><strong>🌈 Enterprise Enhancement:</strong><br>
                    Enhanced with user authentication, persistent storage, and modern PWA features</p>
                    
                    <h4>Technical Support:</h4>
                    <p>For technical issues:</p>
                    <ul>
                        <li>Check browser console for error messages</li>
                        <li>Ensure JavaScript is enabled</li>
                        <li>Try clearing browser cache and reloading</li>
                        <li>Use the legacy version for compatibility</li>
                    </ul>
                    
                    <h4>Feature Requests:</h4>
                    <p>This is an enhanced version of the original dice roller, preserving the core functionality while adding enterprise features.</p>
                </div>
                
                <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                    <h4>🏆 Acknowledgments</h4>
                    <p>Special thanks to Garrett Dillman for creating the original masterpiece that inspired this enhanced version.</p>
                </div>
            </div>
        `;
        window.navigationManager.showModal('Contact & Support', content);
    }
}

function closeModal() {
    if (window.navigationManager) {
        window.navigationManager.closeModal();
    }
}

// Initialize navigation manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.navigationManager = new NavigationManager();
    });
} else {
    window.navigationManager = new NavigationManager();
}
