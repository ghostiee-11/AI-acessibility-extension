// Popup script - No imports, inline code
class Popup {
    constructor() {
        this.init();
    }

    async init() {
        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        this.currentTab = tab;

        // Load current state
        await this.loadState();

        // Setup event listeners
        this.setupEventListeners();

        // Check API key status
        await this.checkApiKeyStatus();

        // Check if this tab supports content scripts
        this.checkTabSupport();
    }

    // Check if the current tab can receive messages (not chrome://, edge://, etc.)
    isTabSupported() {
        if (!this.currentTab || !this.currentTab.url) return false;
        const url = this.currentTab.url;
        return url.startsWith('http://') || url.startsWith('https://');
    }

    // Safely send a message to the content script; injects it first if needed
    async sendToTab(message, callback) {
        if (!this.isTabSupported()) {
            this.updateStatus('Not available on this page', 'warning');
            return;
        }

        try {
            // Try injecting content script first in case it's not loaded yet
            await chrome.scripting.executeScript({
                target: { tabId: this.currentTab.id },
                files: ['content/content.js']
            }).catch(() => { /* already injected, ignore */ });

            await chrome.scripting.insertCSS({
                target: { tabId: this.currentTab.id },
                files: ['content/dark-mode.css']
            }).catch(() => { /* already injected, ignore */ });

            chrome.tabs.sendMessage(this.currentTab.id, message, (response) => {
                if (chrome.runtime.lastError) {
                    console.warn('Tab message error:', chrome.runtime.lastError.message);
                    this.updateStatus('Reload the page first', 'warning');
                    return;
                }
                if (callback) callback(response);
            });
        } catch (err) {
            console.warn('Cannot reach tab:', err.message);
            this.updateStatus('Reload the page first', 'warning');
        }
    }

    checkTabSupport() {
        if (!this.isTabSupported()) {
            this.updateStatus('Open a website to use features', 'warning');
        }
    }

    async loadState() {
        // Load dark mode state
        chrome.storage.sync.get(['darkModeEnabled'], (result) => {
            document.getElementById('darkModeToggle').checked = result.darkModeEnabled || false;
        });
    }

    setupEventListeners() {
        // Dark mode toggle
        document.getElementById('darkModeToggle').addEventListener('change', async (e) => {
            const enabled = e.target.checked;
            // Save to storage — content scripts on ALL tabs pick this up automatically
            chrome.storage.sync.set({ darkModeEnabled: enabled });

            // Also try to toggle on the current tab immediately
            this.sendToTab({ action: 'toggleDarkMode' });

            this.updateStatus(enabled ? 'Dark mode enabled' : 'Dark mode disabled');
        });

        // Read page button
        document.getElementById('readPageBtn').addEventListener('click', async () => {
            this.updateStatus('Reading page...');

            this.sendToTab({ action: 'extractContent' }, (response) => {
                if (response && response.content) {
                    this.sendToTab({
                        action: 'speakText',
                        text: response.content
                    });

                    // Show TTS controls
                    document.getElementById('ttsControls').style.display = 'flex';
                    this.updateStatus('Reading...');
                } else {
                    this.updateStatus('No content found', 'error');
                }
            });
        });

        // Summarize button
        document.getElementById('summarizeBtn').addEventListener('click', async () => {
            if (!this.isTabSupported()) {
                this.updateStatus('Open a website first', 'warning');
                return;
            }
            this.updateStatus('Generating summary...');

            chrome.runtime.sendMessage({
                action: 'summarizePage'
            });
        });

        // Focus mode button
        document.getElementById('focusModeBtn').addEventListener('click', async () => {
            this.sendToTab({ action: 'toggleFocusMode' });
            this.updateStatus('Focus mode toggled');
        });

        // TTS control buttons
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.sendToTab({ action: 'pauseSpeaking' });
            this.updateStatus('Paused');
        });

        document.getElementById('resumeBtn').addEventListener('click', () => {
            this.sendToTab({ action: 'resumeSpeaking' });
            this.updateStatus('Resumed');
        });

        document.getElementById('stopBtn').addEventListener('click', () => {
            this.sendToTab({ action: 'stopSpeaking' });
            document.getElementById('ttsControls').style.display = 'none';
            this.updateStatus('Stopped');
        });

        // Settings button
        document.getElementById('settingsBtn').addEventListener('click', () => {
            chrome.runtime.openOptionsPage();
        });
    }

    async checkApiKeyStatus() {
        chrome.storage.sync.get(['apiProvider', 'groqApiKey', 'geminiApiKey'], (result) => {
            const provider = result.apiProvider || 'groq';
            const apiKey = provider === 'groq' ? result.groqApiKey : result.geminiApiKey;

            if (!apiKey) {
                this.updateStatus('Configure API key', 'warning');
                const statusDot = document.querySelector('.status-dot');
                statusDot.classList.add('warning');
            }
        });
    }

    updateStatus(message, type = 'success') {
        const statusText = document.getElementById('statusText');
        const statusDot = document.querySelector('.status-dot');

        statusText.textContent = message;

        // Update dot color
        statusDot.classList.remove('error', 'warning');
        if (type === 'error') {
            statusDot.classList.add('error');
        } else if (type === 'warning') {
            statusDot.classList.add('warning');
        }

        // Reset to "Ready" after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                statusText.textContent = 'Ready';
            }, 3000);
        }
    }
}

// Initialize popup
new Popup();
