# 🤖 AI Accessibility Assistant - Premium Edition



[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue)](https://chrome.google.com/webstore)
[![Version](https://img.shields.io/badge/version-1.0.0-green)]()
[![License](https://img.shields.io/badge/license-MIT-orange)]()

---

## ✨ Premium Features

### 🌙 **Smart Dark Mode**
- One-click dark mode for any website
- Intelligent color inversion preserving images & videos
- Smooth transitions with glassmorphism effects
- Auto dark mode option for all sites

### 🔊 **Advanced Text-to-Speech**
- Read entire pages or selected text
- Customizable voice, speed (0.5x-2.0x), and pitch
- Play, pause, resume, stop controls
- Quick action popup for selected text
- Supports 50+ languages and voices

### 📝 **AI-Powered Summarization**
- Instant summaries using **Groq Llama 3.3 70B** or **Gemini 2.0 Flash**
- Context-aware bullet-point summaries
- **📊 Page Analytics**: Word count, reading time, paragraphs
- **📋 Copy to Clipboard**: One-click copy
- **💾 Export**: Download summaries as .txt files

### 🎯 **Focus Mode** ⭐ NEW
- Remove all distractions (ads, sidebars, navigation)
- Center content for better readability
- Perfect for reading articles and documentation
- Toggle with **Alt+F** or toolbar button

### ⌨️ **Keyboard Shortcuts** ⭐ NEW
- **Alt+D**: Toggle dark mode
- **Alt+R**: Read page aloud
- **Alt+S**: Summarize page
- **Alt+F**: Toggle focus mode

### 🎨 **Premium UI/UX**
- Modern glassmorphism design
- Vibrant purple-blue gradients
- Smooth animations and micro-interactions
- Floating accessibility toolbar
- Toast notifications for actions
- Non-intrusive, minimal interface

### 🔒 **Privacy & Security**
- All data stored locally in Chrome
- Encrypted API key storage
- No tracking or analytics
- No data sent to third parties (except AI APIs)
- Open source - audit the code yourself

---

## 🚀 Quick Start

### Installation (2 minutes)

1. **Load Extension**
   ```
   1. Open Chrome → chrome://extensions/
   2. Enable "Developer Mode"
   3. Click "Load unpacked"
   4. Select: /Users/amankumar/Desktop/dark-extension
   ```

2. **Get API Key** (Choose one)
   
   **Option A: Groq** (Faster, Recommended)
   - Visit: https://console.groq.com/keys
   - Sign up (free)
   - Create API key
   - Copy key (starts with `gsk_...`)
   
   **Option B: Gemini** (Free tier)
   - Visit: https://aistudio.google.com/app/apikey
   - Sign in with Google
   - Create API key
   - Copy key (starts with `AIza...`)

3. **Configure Extension**
   ```
   1. Click extension icon
   2. Click ⚙️ Settings
   3. Select AI provider
   4. Paste API key
   5. Click "Test API Connection" ✅
   6. Click "💾 Save Settings"
   ```

---

## 🎯 Usage Guide

### Quick Access Methods

#### 1. **Extension Popup**
Click the extension icon to access:
- Dark mode toggle
- Read page button
- Summarize button
- Focus mode button
- TTS controls
- Settings

#### 2. **Floating Toolbar**
Always visible on every page:
- 🌙 Dark mode
- 🔊 Text-to-speech
- 📝 Summarize
- 🎯 Focus mode

#### 3. **Keyboard Shortcuts**
- `Alt+D` - Toggle dark mode
- `Alt+R` - Read page
- `Alt+S` - Summarize
- `Alt+F` - Focus mode

#### 4. **Context Menu (Right-Click)**
Select text → Right-click:
- Summarize selected text
- Speak selected text

#### 5. **Text Selection**
Select any text → Quick action popup appears:
- 🔊 Speak

---

## 🎨 Feature Showcase

### Dark Mode
```
✅ Works on any website
✅ Preserves images and videos
✅ Smooth color transitions
✅ Auto-enable option
✅ Keyboard shortcut (Alt+D)
```

### Text-to-Speech
```
✅ Natural voice synthesis
✅ Adjustable speed & pitch
✅ Multiple voice options
✅ Pause/Resume/Stop controls
✅ Quick actions for selected text
```

### AI Summarization
```
✅ Groq & Gemini support
✅ 3-5 bullet point summaries
✅ Page analytics (words, time, paragraphs)
✅ Copy to clipboard
✅ Export as .txt file
✅ Works on articles, docs, blogs
```

### Focus Mode ⭐
```
✅ Removes ads & distractions
✅ Centers content
✅ Hides navigation & sidebars
✅ Perfect for reading
✅ Toggle with Alt+F
```

---

## 🛠️ Advanced Settings

### API Configuration
- Switch between Groq and Gemini
- Test API connection before saving
- Secure encrypted storage

### Text-to-Speech
- **Voice**: Choose from 50+ system voices
- **Speed**: 0.5x to 2.0x (default: 1.0x)
- **Pitch**: 0.5 to 2.0 (default: 1.0)
- **Test Voice**: Preview before saving

### Dark Mode
- **Auto Dark Mode**: Enable on all websites automatically

---

## 📊 Technical Details

### Built With
- **Manifest V3** (Latest Chrome standard)
- **Vanilla JavaScript** (No frameworks, lightweight)
- **Web Speech API** (Text-to-speech)
- **Groq API** (Llama 3.3 70B Versatile)
- **Gemini API** (Gemini 2.0 Flash)

### Performance
- ⚡ **Lightweight**: < 100KB total size
- 🚀 **Fast**: No impact on page load times
- 💾 **Efficient**: Minimal memory usage
- 🔋 **Optimized**: Battery-friendly

### Browser Compatibility
- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Brave
- ✅ Opera

---

## 🐛 Troubleshooting

### Extension Won't Load
```
1. Check Chrome version (88+)
2. Enable Developer Mode
3. Reload extension
4. Check console for errors
```

### API Key Issues
```
1. Verify correct provider selected
2. Check API key format:
   - Groq: starts with gsk_
   - Gemini: starts with AIza
3. Test API connection
4. Check API quota/limits
```

### Dark Mode Not Working
```
1. Refresh page after enabling
2. Try keyboard shortcut (Alt+D)
3. Check if site has conflicting dark mode
```

### TTS Not Working
```
1. Check browser supports Web Speech API
2. Verify system volume
3. Try different voice in settings
4. Check browser permissions
```

### Summarization Fails
```
1. Verify internet connection
2. Check API key validity
3. Ensure API has remaining quota
4. Try with shorter content
```

---

## 🎯 Use Cases

### Students
- 📚 Read textbooks aloud while studying
- 📝 Summarize research articles quickly
- 🎯 Focus mode for distraction-free reading
- 🌙 Dark mode for late-night studying

### Professionals
- 📊 Summarize long reports and documentation
- 🔊 Listen to articles during commute
- 🎯 Focus mode for important documents
- ⌨️ Keyboard shortcuts for productivity

### Accessibility
- 👁️ Visual impairments: TTS for any content
- 🌙 Light sensitivity: Dark mode everywhere
- 🎯 ADHD/Focus issues: Focus mode removes distractions
- 🔊 Dyslexia: Audio reading support

### Content Creators
- 📝 Quick summaries of competitor content
- 🔊 Proofread by listening
- 🎯 Focus mode for writing
- 💾 Export summaries for notes

---

## 🔐 Privacy Policy

### Data Collection
- ❌ **NO** user tracking
- ❌ **NO** analytics
- ❌ **NO** data sent to our servers
- ✅ **YES** - All data stored locally

### API Usage
- API keys stored encrypted in Chrome storage
- Only sent to respective AI providers (Groq/Gemini)
- No logging or storage of API requests
- You control your own API keys

### Permissions Explained
- **storage**: Save settings and API keys locally
- **activeTab**: Access current page for features
- **scripting**: Inject dark mode and toolbar
- **contextMenus**: Right-click menu options
- **notifications**: Show status notifications

---

## 🚀 What Makes This Extension Stand Out

### vs. Other Dark Mode Extensions
✅ AI-powered features included  
✅ Text-to-speech integration  
✅ Focus mode for productivity  
✅ Keyboard shortcuts  
✅ Premium UI design  

### vs. Other TTS Extensions
✅ Dark mode included  
✅ AI summarization  
✅ Quick actions for selected text  
✅ Page analytics  
✅ Export capabilities  

### vs. Other AI Extensions
✅ Multiple AI providers (Groq + Gemini)  
✅ Dark mode + TTS included  
✅ Focus mode  
✅ Copy & export summaries  
✅ Page analytics  

### **This is the ONLY extension that combines all these features!**

---


## 📄 License

MIT License - Free to use and modify

---

## 🎉 Thank You!

Thank you for using AI Accessibility Assistant! We hope this extension makes your browsing experience more accessible, productive, and enjoyable.

**Happy browsing! 🚀**
