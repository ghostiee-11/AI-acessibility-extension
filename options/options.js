// Options/Settings page script - No imports, inline code

class OptionsPage {
    constructor() {
        this.init();
    }

    async init() {
        // Load current settings
        await this.loadSettings();

        // Setup event listeners
        this.setupEventListeners();

        // Load available voices
        this.loadVoices();
    }

    async loadSettings() {
        chrome.storage.sync.get([
            'apiProvider', 'groqApiKey', 'geminiApiKey',
            'ttsRate', 'ttsPitch', 'ttsVoice', 'autoDarkMode'
        ], (settings) => {
            // API Provider
            if (settings.apiProvider) {
                document.getElementById('apiProvider').value = settings.apiProvider;
                this.toggleApiKeySection(settings.apiProvider);
            }

            // API Keys
            if (settings.groqApiKey) {
                document.getElementById('groqApiKey').value = settings.groqApiKey;
            }
            if (settings.geminiApiKey) {
                document.getElementById('geminiApiKey').value = settings.geminiApiKey;
            }

            // TTS Settings
            if (settings.ttsRate) {
                document.getElementById('ttsRate').value = settings.ttsRate;
                document.getElementById('rateValue').textContent = settings.ttsRate;
            }
            if (settings.ttsPitch) {
                document.getElementById('ttsPitch').value = settings.ttsPitch;
                document.getElementById('pitchValue').textContent = settings.ttsPitch;
            }

            // Dark Mode
            if (settings.autoDarkMode) {
                document.getElementById('autoDarkMode').checked = settings.autoDarkMode;
            }
        });
    }

    setupEventListeners() {
        // API Provider change
        document.getElementById('apiProvider').addEventListener('change', (e) => {
            this.toggleApiKeySection(e.target.value);
        });

        // TTS Rate slider
        document.getElementById('ttsRate').addEventListener('input', (e) => {
            document.getElementById('rateValue').textContent = e.target.value;
        });

        // TTS Pitch slider
        document.getElementById('ttsPitch').addEventListener('input', (e) => {
            document.getElementById('pitchValue').textContent = e.target.value;
        });

        // Test API button
        document.getElementById('testApiBtn').addEventListener('click', () => {
            this.testApiConnection();
        });

        // Test TTS button
        document.getElementById('testTtsBtn').addEventListener('click', () => {
            this.testTTS();
        });

        // Save button
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveSettings();
        });

        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetSettings();
        });
    }

    toggleApiKeySection(provider) {
        const groqSection = document.getElementById('groqSection');
        const geminiSection = document.getElementById('geminiSection');

        if (provider === 'groq') {
            groqSection.style.display = 'block';
            geminiSection.style.display = 'none';
        } else {
            groqSection.style.display = 'none';
            geminiSection.style.display = 'block';
        }
    }

    async testApiConnection() {
        const provider = document.getElementById('apiProvider').value;
        const apiKey = provider === 'groq'
            ? document.getElementById('groqApiKey').value
            : document.getElementById('geminiApiKey').value;

        if (!apiKey) {
            this.showApiStatus('Please enter an API key', 'error');
            return;
        }

        const statusEl = document.getElementById('apiStatus');
        statusEl.textContent = 'Testing connection...';
        statusEl.className = 'api-status';
        statusEl.style.display = 'block';

        try {
            // Test with a simple prompt
            const testPrompt = 'Say "API connection successful" in one sentence.';

            if (provider === 'groq') {
                await this.testGroqAPI(testPrompt, apiKey);
            } else {
                await this.testGeminiAPI(testPrompt, apiKey);
            }

            this.showApiStatus('✅ API connection successful!', 'success');
        } catch (error) {
            this.showApiStatus(`❌ Error: ${error.message}`, 'error');
        }
    }

    async testGroqAPI(prompt, apiKey) {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 50
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Groq API request failed');
        }

        return await response.json();
    }

    async testGeminiAPI(prompt, apiKey) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 50
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Gemini API request failed');
        }

        return await response.json();
    }

    showApiStatus(message, type) {
        const statusEl = document.getElementById('apiStatus');
        statusEl.textContent = message;
        statusEl.className = `api-status ${type}`;
        statusEl.style.display = 'block';

        if (type === 'success') {
            setTimeout(() => {
                statusEl.style.display = 'none';
            }, 5000);
        }
    }

    loadVoices() {
        const voiceSelect = document.getElementById('ttsVoice');

        const loadVoiceList = () => {
            const voices = speechSynthesis.getVoices();

            voiceSelect.innerHTML = '<option value="">Default Voice</option>';

            voices.forEach((voice, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${voice.name} (${voice.lang})`;
                voiceSelect.appendChild(option);
            });
        };

        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoiceList;
        }
        loadVoiceList();
    }

    testTTS() {
        const rate = parseFloat(document.getElementById('ttsRate').value);
        const pitch = parseFloat(document.getElementById('ttsPitch').value);
        const voiceIndex = document.getElementById('ttsVoice').value;

        const utterance = new SpeechSynthesisUtterance('This is a test of the text to speech feature.');
        utterance.rate = rate;
        utterance.pitch = pitch;

        if (voiceIndex) {
            const voices = speechSynthesis.getVoices();
            utterance.voice = voices[voiceIndex];
        }

        speechSynthesis.speak(utterance);
        this.showToast('Playing test voice...', 'success');
    }

    async saveSettings() {
        const settings = {
            apiProvider: document.getElementById('apiProvider').value,
            groqApiKey: document.getElementById('groqApiKey').value,
            geminiApiKey: document.getElementById('geminiApiKey').value,
            ttsRate: parseFloat(document.getElementById('ttsRate').value),
            ttsPitch: parseFloat(document.getElementById('ttsPitch').value),
            ttsVoice: document.getElementById('ttsVoice').value,
            autoDarkMode: document.getElementById('autoDarkMode').checked
        };

        chrome.storage.sync.set(settings, () => {
            this.showToast('✅ Settings saved successfully!', 'success');
        });
    }

    async resetSettings() {
        if (!confirm('Are you sure you want to reset all settings to defaults?')) {
            return;
        }

        const defaults = {
            apiProvider: 'groq',
            ttsRate: 1.0,
            ttsPitch: 1.0,
            autoDarkMode: false
        };

        chrome.storage.sync.set(defaults, () => {
            this.loadSettings();
            this.showToast('🔄 Settings reset to defaults', 'success');
        });
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize options page
new OptionsPage();
