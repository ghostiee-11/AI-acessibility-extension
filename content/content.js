// Content Script — Premium Edition
// Smooth dark mode, animated loading, enhanced toolbar, focus mode

// ─── INJECT GLOBAL ANIMATIONS CSS ───
(function injectAnimations() {
    const style = document.createElement('style');
    style.id = 'ai-assistant-global-styles';
    style.textContent = `
        @keyframes aiSlideIn {
            from { opacity: 0; transform: translateX(20px); }
            to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes aiSlideOut {
            from { opacity: 1; transform: translateX(0); }
            to   { opacity: 0; transform: translateX(20px); }
        }
        @keyframes aiFadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to   { opacity: 1; transform: scale(1); }
        }
        @keyframes aiPulse {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.5; }
        }
        @keyframes aiSpin {
            to { transform: rotate(360deg); }
        }
        @keyframes aiProgress {
            from { background-position: 200% 0; }
            to   { background-position: -200% 0; }
        }
        @keyframes aiGlow {
            0%, 100% { box-shadow: 0 0 5px rgba(102,126,234,0.3); }
            50%      { box-shadow: 0 0 20px rgba(102,126,234,0.6); }
        }
        @keyframes aiFloat {
            0%, 100% { transform: translateY(0px); }
            50%      { transform: translateY(-5px); }
        }
        @keyframes aiDotBounce1 {
            0%, 80%, 100% { transform: scale(0); }
            40%           { transform: scale(1); }
        }
        @keyframes aiDotBounce2 {
            0%, 80%, 100% { transform: scale(0); }
            40%           { transform: scale(1); }
        }
        @keyframes aiDotBounce3 {
            0%, 80%, 100% { transform: scale(0); }
            40%           { transform: scale(1); }
        }
        /* Smooth dark mode transition for ALL elements */
        html.dark-mode-transition,
        html.dark-mode-transition *,
        html.dark-mode-transition *::before,
        html.dark-mode-transition *::after {
            transition: background-color 0.4s ease,
                        color 0.4s ease,
                        border-color 0.4s ease,
                        box-shadow 0.4s ease,
                        fill 0.4s ease,
                        stroke 0.4s ease !important;
        }
    `;
    document.head.appendChild(style);
})();

// ─── MAIN CLASS ───
class ContentScript {
    constructor() {
        this.ttsService = null;
        this.toolbar = null;
        this.isDarkMode = false;
        this.loadingOverlay = null;
        this.init();
    }

    async init() {
        this.ttsService = new TTSService();

        // Persist dark mode globally
        chrome.storage.sync.get(['darkModeEnabled'], (result) => {
            this.isDarkMode = result.darkModeEnabled || false;
            if (this.isDarkMode) {
                // Apply immediately without transition on first load
                this.enableDarkMode(false);
            }
            this.createToolbar();
        });

        // Sync dark mode across ALL tabs in real-time
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === 'sync' && changes.darkModeEnabled) {
                const enabled = changes.darkModeEnabled.newValue;
                if (enabled && !this.isDarkMode) {
                    this.enableDarkMode(true);
                } else if (!enabled && this.isDarkMode) {
                    this.disableDarkMode(true);
                }
                this.updateToolbar();
            }
        });

        // Message listener
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sendResponse);
            return true;
        });

        // Text selection quick actions
        document.addEventListener('mouseup', () => this.handleTextSelection());
    }

    // ─── MESSAGE HANDLER ───
    async handleMessage(message, sendResponse) {
        switch (message.action) {
            case 'toggleDarkMode':
                this.toggleDarkMode();
                sendResponse({ success: true, enabled: this.isDarkMode });
                break;
            case 'extractContent':
                sendResponse({ content: this.extractContent(), metadata: this.extractMetadata() });
                break;
            case 'speakText':
                this.speakText(message.text, message.options);
                sendResponse({ success: true });
                break;
            case 'stopSpeaking':
                this.ttsService.stop();
                sendResponse({ success: true });
                break;
            case 'pauseSpeaking':
                this.ttsService.pause();
                sendResponse({ success: true });
                break;
            case 'resumeSpeaking':
                this.ttsService.resume();
                sendResponse({ success: true });
                break;
            case 'showSummary':
                this.showSummary(message.summary);
                sendResponse({ success: true });
                break;
            case 'showLoading':
                this.showLoadingOverlay(message.message);
                sendResponse({ success: true });
                break;
            case 'updateLoading':
                this.updateLoadingOverlay(message.message, message.progress);
                sendResponse({ success: true });
                break;
            case 'hideLoading':
                this.hideLoadingOverlay();
                sendResponse({ success: true });
                break;
            case 'keyboardCommand':
                this.handleKeyboardCommand(message.command);
                sendResponse({ success: true });
                break;
            case 'toggleFocusMode':
                this.toggleFocusMode();
                sendResponse({ success: true });
                break;
            default:
                sendResponse({ success: false, error: 'Unknown action' });
        }
    }

    // ─── KEYBOARD COMMANDS ───
    handleKeyboardCommand(command) {
        switch (command) {
            case 'toggle-dark-mode':
                chrome.storage.sync.set({ darkModeEnabled: !this.isDarkMode });
                this.toggleDarkMode();
                this.showToast(this.isDarkMode ? '🌙 Dark mode on' : '☀️ Dark mode off');
                break;
            case 'read-page':
                this.speakText(this.extractContent());
                this.showToast('🔊 Reading page...');
                break;
            case 'summarize-page':
                chrome.runtime.sendMessage({ action: 'summarizePage' });
                this.showToast('🤖 Multi-agent summary starting...');
                break;
            case 'focus-mode':
                this.toggleFocusMode();
                break;
        }
    }

    // ─── DARK MODE (SMOOTH TRANSITIONS + MUTATION OBSERVER) ───
    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        if (this.isDarkMode) {
            this.enableDarkMode(true);
        } else {
            this.disableDarkMode(true);
        }
        this.updateToolbar();
    }

    enableDarkMode(animate = true) {
        if (animate) {
            document.documentElement.classList.add('dark-mode-transition');
            setTimeout(() => document.documentElement.classList.remove('dark-mode-transition'), 500);
        }
        document.documentElement.classList.add('dark-mode-active');
        this.isDarkMode = true;

        // Force-fix backgrounds on dynamic sites like Google
        this._forceDarkOnDynamicElements();
        this._startDarkModeObserver();
    }

    disableDarkMode(animate = true) {
        if (animate) {
            document.documentElement.classList.add('dark-mode-transition');
            setTimeout(() => document.documentElement.classList.remove('dark-mode-transition'), 500);
        }
        document.documentElement.classList.remove('dark-mode-active');
        this.isDarkMode = false;

        // Remove observer and injected dark styles
        this._stopDarkModeObserver();
        const injected = document.getElementById('ai-dark-inject');
        if (injected) injected.remove();
    }

    // Force dark backgrounds on elements with inline white styles
    _forceDarkOnDynamicElements() {
        const prev = document.getElementById('ai-dark-inject');
        if (prev) prev.remove();

        const style = document.createElement('style');
        style.id = 'ai-dark-inject';
        style.textContent = `
            /* Catch elements with inline white/light backgrounds */
            html.dark-mode-active [style*="background-color: rgb(255"],
            html.dark-mode-active [style*="background-color: white"],
            html.dark-mode-active [style*="background-color:#fff"],
            html.dark-mode-active [style*="background: rgb(255"],
            html.dark-mode-active [style*="background: white"],
            html.dark-mode-active [style*="background:#fff"],
            html.dark-mode-active [style*="background-color: rgb(245"],
            html.dark-mode-active [style*="background-color: rgb(248"],
            html.dark-mode-active [style*="background-color: rgb(240"],
            html.dark-mode-active [style*="background-color: rgb(242"],
            html.dark-mode-active [style*="background-color: rgb(250"],
            html.dark-mode-active [style*="background-color: rgb(230"],
            html.dark-mode-active [style*="background-color: rgb(232"],
            html.dark-mode-active [style*="background-color: rgb(233"],
            html.dark-mode-active [style*="background-color: rgb(235"],
            html.dark-mode-active [style*="background-color: rgb(247"],
            html.dark-mode-active [style*="background-color: rgb(249"],
            html.dark-mode-active [style*="background-color: rgb(252"],
            html.dark-mode-active [style*="background-color: rgb(253"],
            html.dark-mode-active [style*="background-color: rgb(254"] {
                background-color: transparent !important;
            }
            /* Catch inline white text on dark-to-dark (shouldn't happen but safety) */
            html.dark-mode-active [style*="color: rgb(0, 0, 0"],
            html.dark-mode-active [style*="color: rgb(32"],
            html.dark-mode-active [style*="color: rgb(33"],
            html.dark-mode-active [style*="color: rgb(34"],
            html.dark-mode-active [style*="color: rgb(51"],
            html.dark-mode-active [style*="color: rgb(68"],
            html.dark-mode-active [style*="color: rgb(85"],
            html.dark-mode-active [style*="color: rgb(102"],
            html.dark-mode-active [style*="color: black"],
            html.dark-mode-active [style*="color:#000"],
            html.dark-mode-active [style*="color: #222"],
            html.dark-mode-active [style*="color: #333"] {
                color: #e0e0e0 !important;
            }
            /* Don't affect our extension UI */
            html.dark-mode-active #ai-assistant-toolbar *,
            html.dark-mode-active #ai-assistant-toast,
            html.dark-mode-active #ai-assistant-quick-actions *,
            html.dark-mode-active #ai-assistant-summary-modal *,
            html.dark-mode-active #ai-assistant-loading * {
                color: unset;
                background-color: unset;
            }
        `;
        document.head.appendChild(style);
    }

    // Watch for dynamically added elements (Google search results, SPA navigation, etc.)
    _startDarkModeObserver() {
        if (this._darkObserver) return;
        this._darkObserver = new MutationObserver(() => {
            // Re-ensure our dark-mode-active class is still on (some sites remove classes from <html>)
            if (this.isDarkMode && !document.documentElement.classList.contains('dark-mode-active')) {
                document.documentElement.classList.add('dark-mode-active');
            }
        });
        this._darkObserver.observe(document.documentElement, { attributes: true, childList: true, subtree: true });
    }

    _stopDarkModeObserver() {
        if (this._darkObserver) {
            this._darkObserver.disconnect();
            this._darkObserver = null;
        }
    }

    // ─── LOADING OVERLAY (Animated Progress) ───
    showLoadingOverlay(message = 'Processing...') {
        this.hideLoadingOverlay();

        this.loadingOverlay = document.createElement('div');
        this.loadingOverlay.id = 'ai-assistant-loading';
        this.loadingOverlay.innerHTML = `
            <div style="
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
                z-index: 99999998; display: flex; align-items: center;
                justify-content: center; animation: aiFadeIn 0.3s ease;
            ">
                <div style="
                    background: rgba(18,18,28,0.95); border-radius: 20px;
                    padding: 32px 40px; min-width: 340px; max-width: 420px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(102,126,234,0.15);
                    border: 1px solid rgba(102,126,234,0.2);
                    animation: aiFadeIn 0.4s ease;
                ">
                    <!-- Animated Brain Icon -->
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="font-size: 48px; animation: aiFloat 2s ease-in-out infinite;">🧠</div>
                    </div>

                    <!-- Agent status text -->
                    <div id="ai-loading-status" style="
                        color: #e0e0e0; text-align: center; font-size: 15px;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        margin-bottom: 20px; min-height: 24px;
                    ">${message}</div>

                    <!-- Progress bar -->
                    <div style="
                        width: 100%; height: 6px; background: rgba(255,255,255,0.1);
                        border-radius: 3px; overflow: hidden; margin-bottom: 12px;
                    ">
                        <div id="ai-loading-bar" style="
                            width: 5%; height: 100%;
                            background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #667eea);
                            background-size: 200% 100%;
                            border-radius: 3px;
                            transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                            animation: aiProgress 2s linear infinite;
                        "></div>
                    </div>

                    <!-- Bouncing dots -->
                    <div style="display: flex; justify-content: center; gap: 6px; margin-top: 16px;">
                        <div style="width:8px;height:8px;border-radius:50%;background:#667eea;animation:aiDotBounce1 1.4s infinite ease-in-out both;"></div>
                        <div style="width:8px;height:8px;border-radius:50%;background:#764ba2;animation:aiDotBounce2 1.4s infinite ease-in-out both;animation-delay:0.16s;"></div>
                        <div style="width:8px;height:8px;border-radius:50%;background:#f093fb;animation:aiDotBounce3 1.4s infinite ease-in-out both;animation-delay:0.32s;"></div>
                    </div>

                    <!-- Multi-agent label -->
                    <div style="
                        text-align: center; margin-top: 16px; font-size: 11px;
                        color: rgba(255,255,255,0.35); letter-spacing: 1px;
                        text-transform: uppercase;
                    ">Multi-Agent AI Pipeline</div>
                </div>
            </div>
        `;
        document.body.appendChild(this.loadingOverlay);
    }

    updateLoadingOverlay(message, progress) {
        const statusEl = document.getElementById('ai-loading-status');
        const barEl = document.getElementById('ai-loading-bar');
        if (statusEl) statusEl.textContent = message;
        if (barEl && progress !== undefined) barEl.style.width = progress + '%';
    }

    hideLoadingOverlay() {
        const el = document.getElementById('ai-assistant-loading');
        if (el) {
            el.style.animation = 'aiFadeIn 0.3s ease reverse';
            setTimeout(() => el.remove(), 280);
        }
        this.loadingOverlay = null;
    }

    // ─── CONTENT EXTRACTION ───
    extractContent() {
        const selectors = [
            'article', 'main', '[role="main"]', '.post-content',
            '.article-content', '.entry-content', '.content',
            '#content', '.main-content'
        ];

        for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el) {
                const text = this.cleanText(el.innerText);
                if (text.length > 100) return this.truncate(text, 15000);
            }
        }

        const body = document.body.cloneNode(true);
        ['script', 'style', 'nav', 'header', 'footer', 'aside', '.advertisement', '.ads', '.sidebar', '.menu', '.navigation']
            .forEach(s => body.querySelectorAll(s).forEach(e => e.remove()));
        return this.truncate(this.cleanText(body.innerText), 15000);
    }

    cleanText(t) { return t.replace(/\s+/g, ' ').replace(/\n+/g, '\n').trim(); }

    truncate(t, max) {
        if (t.length <= max) return t;
        const cut = t.substring(0, max);
        const end = Math.max(cut.lastIndexOf('.'), cut.lastIndexOf('?'), cut.lastIndexOf('!'));
        return end > max * 0.8 ? cut.substring(0, end + 1) : cut + '...';
    }

    extractMetadata() {
        return {
            title: document.title,
            description: document.querySelector('meta[name="description"]')?.content || '',
            url: window.location.href
        };
    }

    // ─── TTS ───
    async speakText(text, options = {}) {
        chrome.storage.sync.get(['ttsRate', 'ttsPitch'], (s) => {
            this.ttsService.speak(text, {
                rate: options.rate || s.ttsRate || 1.0,
                pitch: options.pitch || s.ttsPitch || 1.0,
                onStart: () => this.updateToolbar(),
                onEnd: () => this.updateToolbar()
            });
        });
    }

    // ─── TEXT SELECTION QUICK ACTIONS ───
    handleTextSelection() {
        const sel = window.getSelection().toString().trim();
        if (sel && sel.length > 2) this.showQuickActions(sel);
    }

    showQuickActions(text) {
        const prev = document.getElementById('ai-assistant-quick-actions');
        if (prev) prev.remove();

        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const rect = selection.getRangeAt(0).getBoundingClientRect();

        const qa = document.createElement('div');
        qa.id = 'ai-assistant-quick-actions';
        qa.style.cssText = `
            position: fixed; top: ${Math.max(rect.top - 48, 8)}px; left: ${rect.left}px;
            background: rgba(18,18,28,0.95); backdrop-filter: blur(12px);
            padding: 6px 8px; border-radius: 10px; display: flex; gap: 4px;
            z-index: 999999; box-shadow: 0 8px 24px rgba(0,0,0,0.4);
            border: 1px solid rgba(102,126,234,0.3);
            animation: aiFadeIn 0.2s ease;
        `;

        const mkBtn = (icon, label, fn) => {
            const b = document.createElement('button');
            b.innerHTML = `${icon} <span style="font-size:11px">${label}</span>`;
            b.style.cssText = `
                background: rgba(255,255,255,0.06); border: none; color: #e0e0e0;
                padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 14px;
                transition: all 0.2s; display: flex; align-items: center; gap: 4px;
            `;
            b.onmouseover = () => { b.style.background = 'rgba(102,126,234,0.3)'; };
            b.onmouseout = () => { b.style.background = 'rgba(255,255,255,0.06)'; };
            b.onclick = () => { fn(); qa.remove(); };
            return b;
        };

        qa.appendChild(mkBtn('🔊', 'Speak', () => this.speakText(text)));
        qa.appendChild(mkBtn('📝', 'Summarize', () => {
            chrome.runtime.sendMessage({ action: 'summarizeText', text });
        }));

        document.body.appendChild(qa);
        setTimeout(() => {
            document.addEventListener('mousedown', function handler(e) {
                if (!qa.contains(e.target)) { qa.remove(); document.removeEventListener('mousedown', handler); }
            });
        }, 150);
    }

    // ─── FOCUS MODE ───
    toggleFocusMode() {
        const cls = 'ai-assistant-focus-mode';
        if (document.documentElement.classList.contains(cls)) {
            document.documentElement.classList.remove(cls);
            this.removeFocusStyles();
            this.showToast('✨ Focus mode off');
        } else {
            document.documentElement.classList.add(cls);
            this.applyFocusStyles();
            this.showToast('🎯 Focus mode on — distractions removed');
        }
    }

    applyFocusStyles() {
        if (document.getElementById('ai-focus-css')) return;
        const s = document.createElement('style');
        s.id = 'ai-focus-css';
        s.textContent = `
            html.ai-assistant-focus-mode nav, html.ai-assistant-focus-mode header:not(article header),
            html.ai-assistant-focus-mode footer, html.ai-assistant-focus-mode aside,
            html.ai-assistant-focus-mode .sidebar, html.ai-assistant-focus-mode .advertisement,
            html.ai-assistant-focus-mode .ads, html.ai-assistant-focus-mode [class*="banner"],
            html.ai-assistant-focus-mode [id*="banner"], html.ai-assistant-focus-mode [class*="popup"],
            html.ai-assistant-focus-mode [class*="modal"]:not(#ai-assistant-summary-modal):not(#ai-assistant-loading) {
                display: none !important;
            }
            html.ai-assistant-focus-mode body { max-width: 800px; margin: 0 auto; padding: 20px; }
        `;
        document.head.appendChild(s);
    }

    removeFocusStyles() {
        const s = document.getElementById('ai-focus-css');
        if (s) s.remove();
    }

    // ─── TOAST NOTIFICATION ───
    showToast(message, duration = 2500) {
        const prev = document.getElementById('ai-assistant-toast');
        if (prev) prev.remove();

        const t = document.createElement('div');
        t.id = 'ai-assistant-toast';
        t.textContent = message;
        t.style.cssText = `
            position: fixed; bottom: 80px; right: 20px;
            background: rgba(18,18,28,0.95); backdrop-filter: blur(12px);
            color: #e0e0e0; padding: 12px 22px; border-radius: 10px;
            z-index: 9999999; font-size: 14px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3); border: 1px solid rgba(102,126,234,0.2);
            animation: aiSlideIn 0.3s ease;
        `;
        document.body.appendChild(t);
        setTimeout(() => {
            t.style.animation = 'aiSlideOut 0.3s ease forwards';
            setTimeout(() => t.remove(), 300);
        }, duration);
    }

    // ─── TOOLBAR ───
    createToolbar() {
        this.toolbar = document.createElement('div');
        this.toolbar.id = 'ai-assistant-toolbar';
        this.toolbar.style.cssText = `
            position: fixed; bottom: 20px; right: 20px;
            background: rgba(18,18,28,0.92); backdrop-filter: blur(16px);
            padding: 10px; border-radius: 14px; display: flex;
            flex-direction: column; gap: 6px; z-index: 999999;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(102,126,234,0.15);
            animation: aiSlideIn 0.5s ease; transition: all 0.3s ease;
        `;

        const buttons = [
            { icon: this.isDarkMode ? '☀️' : '🌙', tip: 'Dark Mode (Alt+D)', fn: () => { chrome.storage.sync.set({ darkModeEnabled: !this.isDarkMode }); this.toggleDarkMode(); } },
            { icon: '🔊', tip: 'Read Page (Alt+R)', fn: () => this.speakText(this.extractContent()) },
            { icon: '📝', tip: 'Summarize (Alt+S)', fn: () => chrome.runtime.sendMessage({ action: 'summarizePage' }) },
            { icon: '🎯', tip: 'Focus (Alt+F)', fn: () => this.toggleFocusMode() },
        ];

        buttons.forEach(b => this.toolbar.appendChild(this.createToolbarButton(b.icon, b.tip, b.fn)));
        document.body.appendChild(this.toolbar);
    }

    createToolbarButton(icon, title, onClick) {
        const b = document.createElement('button');
        b.textContent = icon;
        b.title = title;
        b.style.cssText = `
            background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
            color: white; width: 42px; height: 42px; border-radius: 10px;
            cursor: pointer; font-size: 18px; transition: all 0.25s ease;
            display: flex; align-items: center; justify-content: center;
        `;
        b.onmouseover = () => {
            b.style.background = 'rgba(102,126,234,0.3)';
            b.style.transform = 'scale(1.15)';
            b.style.boxShadow = '0 0 12px rgba(102,126,234,0.4)';
        };
        b.onmouseout = () => {
            b.style.background = 'rgba(255,255,255,0.06)';
            b.style.transform = 'scale(1)';
            b.style.boxShadow = 'none';
        };
        b.onclick = onClick;
        return b;
    }

    updateToolbar() {
        if (!this.toolbar) return;
        const dm = this.toolbar.children[0];
        if (dm) dm.textContent = this.isDarkMode ? '☀️' : '🌙';
    }

    // ─── ENHANCED SUMMARY MODAL ───
    showSummary(summary) {
        const prev = document.getElementById('ai-assistant-summary-modal');
        if (prev) prev.remove();
        const prevBd = document.getElementById('ai-assistant-summary-backdrop');
        if (prevBd) prevBd.remove();

        // Render markdown-ish formatting
        const rendered = this.renderMarkdown(summary);
        const analytics = this.getPageAnalytics();

        const backdrop = document.createElement('div');
        backdrop.id = 'ai-assistant-summary-backdrop';
        backdrop.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.6); backdrop-filter: blur(6px);
            z-index: 9999998; animation: aiFadeIn 0.3s ease;
        `;

        const modal = document.createElement('div');
        modal.id = 'ai-assistant-summary-modal';
        modal.style.cssText = `
            position: fixed; top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(18,18,28,0.97); backdrop-filter: blur(20px);
            padding: 0; border-radius: 20px;
            max-width: 640px; width: 92%; max-height: 85vh;
            z-index: 9999999;
            box-shadow: 0 24px 80px rgba(0,0,0,0.5), 0 0 40px rgba(102,126,234,0.1);
            border: 1px solid rgba(102,126,234,0.2);
            color: #e0e0e0; animation: aiFadeIn 0.4s ease;
            display: flex; flex-direction: column;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 20px 24px 16px; border-bottom: 1px solid rgba(255,255,255,0.06);
            display: flex; align-items: center; justify-content: space-between;
        `;
        header.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;">
                <span style="font-size:28px;">🧠</span>
                <div>
                    <div style="font-size:16px;font-weight:600;color:#fff;">AI Summary</div>
                    <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px;">Multi-Agent Pipeline • 3 AI passes</div>
                </div>
            </div>
            <div style="display:flex;gap:12px;font-size:11px;color:rgba(255,255,255,0.4);">
                <span>📊 ${analytics.wordCount} words</span>
                <span>⏱️ ${analytics.readingTime} min</span>
            </div>
        `;

        // Content area
        const content = document.createElement('div');
        content.style.cssText = `
            padding: 20px 24px; overflow-y: auto; flex: 1;
            line-height: 1.7; font-size: 14px;
        `;
        content.innerHTML = rendered;

        // Style headings / bullets inside
        const innerStyle = document.createElement('style');
        innerStyle.textContent = `
            #ai-assistant-summary-modal h2 { font-size: 15px; color: #a78bfa; margin: 18px 0 8px; font-weight: 600; }
            #ai-assistant-summary-modal h3 { font-size: 14px; color: #667eea; margin: 14px 0 6px; font-weight: 600; }
            #ai-assistant-summary-modal ul { padding-left: 18px; margin: 6px 0; }
            #ai-assistant-summary-modal li { margin: 4px 0; color: #d0d0d0; }
            #ai-assistant-summary-modal strong { color: #fff; }
            #ai-assistant-summary-modal em { color: #c4b5fd; }
            #ai-assistant-summary-modal p { margin: 8px 0; }
            #ai-assistant-summary-modal code { background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px; font-size: 13px; }
        `;

        // Footer with actions
        const footer = document.createElement('div');
        footer.style.cssText = `
            padding: 14px 24px; border-top: 1px solid rgba(255,255,255,0.06);
            display: flex; gap: 8px;
        `;

        const mkBtn = (label, bg, hoverBg, fn) => {
            const b = document.createElement('button');
            b.textContent = label;
            b.style.cssText = `
                flex: 1; padding: 10px 0; border-radius: 10px; border: none;
                cursor: pointer; font-size: 13px; font-weight: 500;
                transition: all 0.25s ease; background: ${bg}; color: #e0e0e0;
            `;
            b.onmouseover = () => { b.style.background = hoverBg; b.style.transform = 'translateY(-1px)'; };
            b.onmouseout = () => { b.style.background = bg; b.style.transform = 'translateY(0)'; };
            b.onclick = fn;
            return b;
        };

        footer.appendChild(mkBtn('📋 Copy', 'rgba(102,126,234,0.15)', 'rgba(102,126,234,0.3)', () => {
            navigator.clipboard.writeText(summary);
            footer.children[0].textContent = '✅ Copied!';
            setTimeout(() => footer.children[0].textContent = '📋 Copy', 2000);
        }));

        footer.appendChild(mkBtn('💾 Export', 'rgba(56,239,125,0.12)', 'rgba(56,239,125,0.25)', () => {
            const blob = new Blob([`${document.title}\n${'─'.repeat(40)}\n\n${summary}\n\n─── Generated by AI Accessibility Assistant ───`], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `summary-${Date.now()}.txt`; a.click();
            URL.revokeObjectURL(url);
        }));

        footer.appendChild(mkBtn('🔊 Read', 'rgba(249,168,37,0.12)', 'rgba(249,168,37,0.25)', () => {
            this.speakText(summary);
        }));

        footer.appendChild(mkBtn('✕ Close', 'rgba(255,255,255,0.06)', 'rgba(255,80,80,0.2)', () => {
            modal.remove(); backdrop.remove();
        }));

        const close = () => { modal.remove(); backdrop.remove(); };
        backdrop.onclick = close;

        modal.appendChild(innerStyle);
        modal.appendChild(header);
        modal.appendChild(content);
        modal.appendChild(footer);
        document.body.appendChild(backdrop);
        document.body.appendChild(modal);
    }

    // Simple markdown renderer
    renderMarkdown(text) {
        return text
            // Headers
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^# (.+)$/gm, '<h2>$1</h2>')
            // Bold & italic
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            // Inline code
            .replace(/`(.+?)`/g, '<code>$1</code>')
            // Bullet points
            .replace(/^[•\-\*] (.+)$/gm, '<li>$1</li>')
            // Wrap consecutive <li> in <ul>
            .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')
            // Line breaks
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            // Wrap in paragraph
            .replace(/^(.+)/, '<p>$1</p>');
    }

    getPageAnalytics() {
        const text = this.extractContent();
        const words = text.split(/\s+/).filter(w => w.length > 0);
        return {
            wordCount: words.length,
            readingTime: Math.ceil(words.length / 200),
            paragraphs: text.split(/\n+/).filter(p => p.trim().length > 0).length
        };
    }
}

// ─── TTS SERVICE ───
class TTSService {
    constructor() { this.synth = window.speechSynthesis; this.utterance = null; this.isPaused = false; this.isPlaying = false; }

    speak(text, options = {}) {
        if (!text) return;
        this.stop();
        this.utterance = new SpeechSynthesisUtterance(text);
        this.utterance.rate = options.rate || 1.0;
        this.utterance.pitch = options.pitch || 1.0;
        this.utterance.volume = options.volume || 1.0;
        if (options.voice) this.utterance.voice = options.voice;
        this.utterance.onstart = () => { this.isPlaying = true; this.isPaused = false; if (options.onStart) options.onStart(); };
        this.utterance.onend = () => { this.isPlaying = false; this.isPaused = false; if (options.onEnd) options.onEnd(); };
        this.utterance.onerror = (e) => { this.isPlaying = false; this.isPaused = false; if (options.onError) options.onError(e); };
        this.synth.speak(this.utterance);
    }

    pause() { if (this.isPlaying && !this.isPaused) { this.synth.pause(); this.isPaused = true; } }
    resume() { if (this.isPlaying && this.isPaused) { this.synth.resume(); this.isPaused = false; } }
    stop() { this.synth.cancel(); this.isPlaying = false; this.isPaused = false; }
}

// ─── INIT ───
new ContentScript();
