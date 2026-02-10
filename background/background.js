// Background service worker — Manifest V3
// Multi-Agent AI Summarization Pipeline

// ─── INSTALL ───
chrome.runtime.onInstalled.addListener(() => {
    console.log('AI Accessibility Assistant installed');
    chrome.contextMenus.create({ id: 'summarize-selection', title: '📝 Summarize selected text', contexts: ['selection'] });
    chrome.contextMenus.create({ id: 'speak-selection', title: '🔊 Speak selected text', contexts: ['selection'] });
});

// ─── CONTEXT MENU ───
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'summarize-selection') {
        handleSummarize(tab.id, info.selectionText);
    } else if (info.menuItemId === 'speak-selection') {
        safeSend(tab.id, { action: 'speakText', text: info.selectionText });
    }
});

// ─── KEYBOARD SHORTCUTS ───
chrome.commands.onCommand.addListener(async (command) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) safeSend(tab.id, { action: 'keyboardCommand', command });
});

// ─── MESSAGE ROUTER ───
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    (async () => {
        try {
            // Find the right tab — if from content script use sender.tab, otherwise query
            let tabId;
            if (sender.tab) {
                tabId = sender.tab.id;
            } else {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                tabId = tab?.id;
            }

            if (!tabId) {
                sendResponse({ error: 'No active tab found' });
                return;
            }

            if (message.action === 'summarizePage') {
                handleSummarizePage(tabId);
                sendResponse({ success: true });
            } else if (message.action === 'summarizeText') {
                handleSummarize(tabId, message.text);
                sendResponse({ success: true });
            } else {
                sendResponse({ success: false });
            }
        } catch (err) {
            console.error('Message handler error:', err);
            sendResponse({ error: err.message });
        }
    })();
    return true; // keep channel open
});

// ─── SAFE SEND (won't crash if content script not loaded) ───
async function safeSend(tabId, message) {
    try {
        return await chrome.tabs.sendMessage(tabId, message);
    } catch (e) {
        // Content script not loaded — try injecting it first
        try {
            await chrome.scripting.executeScript({ target: { tabId }, files: ['content/content.js'] });
            await chrome.scripting.insertCSS({ target: { tabId }, files: ['content/dark-mode.css'] });
            // Wait a bit for script to initialize
            await new Promise(r => setTimeout(r, 200));
            return await chrome.tabs.sendMessage(tabId, message);
        } catch (e2) {
            console.warn('Cannot reach tab:', e2.message);
            return null;
        }
    }
}

// ─── SUMMARIZE PAGE ───
async function handleSummarizePage(tabId) {
    try {
        // Show loading
        await safeSend(tabId, { action: 'showLoading', message: '🔍 Extracting page content...' });

        // Extract content
        const response = await safeSend(tabId, { action: 'extractContent' });

        if (!response || !response.content) {
            await safeSend(tabId, { action: 'hideLoading' });
            showNotification('No content found', 'Could not extract content from this page.');
            return;
        }

        await handleSummarize(tabId, response.content);
    } catch (error) {
        console.error('Error summarizing page:', error);
        await safeSend(tabId, { action: 'hideLoading' });
        showNotification('Error', error.message);
    }
}

// ─── MULTI-AGENT SUMMARIZER ───
async function handleSummarize(tabId, text) {
    try {
        const settings = await chrome.storage.sync.get(['apiProvider', 'groqApiKey', 'geminiApiKey']);
        const provider = settings.apiProvider || 'groq';
        const apiKey = provider === 'groq' ? settings.groqApiKey : settings.geminiApiKey;

        if (!apiKey) {
            await safeSend(tabId, { action: 'hideLoading' });
            showNotification('API Key Required', 'Configure your API key in extension settings.');
            chrome.runtime.openOptionsPage();
            return;
        }

        // Show loading if not already shown
        await safeSend(tabId, { action: 'showLoading', message: '🤖 Starting multi-agent pipeline...' });

        // ── AGENT 1: EXTRACTION ──
        await safeSend(tabId, { action: 'updateLoading', message: '🔍 Agent 1/3 — Analyzing content...', progress: 10 });

        const extractionPrompt = `Analyze this text and extract:
1. MAIN TOPIC (one sentence)
2. KEY FACTS (3-5 bullet points)
3. KEY ENTITIES (people, companies, tech mentioned)
4. CONTENT TYPE (news/tutorial/opinion/research/docs)
5. SENTIMENT (positive/negative/neutral)

Be precise. Output in structured format.

Text:
${text.substring(0, 10000)}`;

        const extraction = await callAI(extractionPrompt, provider, apiKey);

        // ── AGENT 2: SUMMARY ──
        await safeSend(tabId, { action: 'updateLoading', message: '📝 Agent 2/3 — Writing summary...', progress: 45 });

        const summaryPrompt = `You're a world-class summarizer. Using this analysis AND the source text, create an excellent summary.

ANALYSIS:
${extraction}

SOURCE TEXT:
${text.substring(0, 8000)}

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

## 📌 TL;DR
One clear sentence summarizing everything.

## 🔑 Key Points
• First important point
• Second important point
• Third important point
• Fourth important point (if needed)
• Fifth important point (if needed)

## 💡 Key Insight
One unique takeaway or insight the reader should remember.

Rules: Be concise, clear, and insightful. Use plain language.`;

        const rawSummary = await callAI(summaryPrompt, provider, apiKey);

        // ── AGENT 3: POLISH ──
        await safeSend(tabId, { action: 'updateLoading', message: '✨ Agent 3/3 — Polishing & insights...', progress: 80 });

        const polishPrompt = `You are an expert editor. Polish this summary:

${rawSummary}

Your tasks:
1. Fix any formatting or grammar issues
2. Make bullet points punchy and scannable
3. Add this section at the end:

## 🤔 Think About
• One thought-provoking question about this content
• Another angle to consider

## 📊 Stats
• Reading time: estimate based on original content length
• Complexity: Easy / Medium / Hard

Output the COMPLETE polished summary. Keep markdown formatting.`;

        const finalSummary = await callAI(polishPrompt, provider, apiKey);

        // ── DONE ──
        await safeSend(tabId, { action: 'updateLoading', message: '✅ Done!', progress: 100 });
        await new Promise(r => setTimeout(r, 600));

        await safeSend(tabId, { action: 'hideLoading' });
        await safeSend(tabId, { action: 'showSummary', summary: finalSummary });

    } catch (error) {
        console.error('Summarization error:', error);
        await safeSend(tabId, { action: 'hideLoading' });
        showNotification('Error', error.message);
    }
}

// ─── AI CALLER ───
async function callAI(prompt, provider, apiKey) {
    if (provider === 'groq') return await callGroq(prompt, apiKey);
    return await callGemini(prompt, apiKey);
}

// ─── GROQ API ───
async function callGroq(prompt, apiKey) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.6,
            max_tokens: 1000
        })
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || 'Groq API failed'); }
    const data = await res.json();
    return data.choices[0].message.content;
}

// ─── GEMINI 2.5 FLASH ───
async function callGemini(prompt, apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.6, maxOutputTokens: 1000 }
        })
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || 'Gemini API failed'); }
    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
}

// ─── NOTIFICATION ───
function showNotification(title, message) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: title,
        message: message
    });
}
