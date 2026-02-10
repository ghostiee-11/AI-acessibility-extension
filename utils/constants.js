// API Configuration
export const API_PROVIDERS = {
  GROQ: 'groq',
  GEMINI: 'gemini'
};

export const API_ENDPOINTS = {
  GROQ: 'https://api.groq.com/openai/v1/chat/completions',
  GEMINI: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'
};

export const MODELS = {
  GROQ: 'llama-3.3-70b-versatile',
  GEMINI: 'gemini-2.0-flash-exp'
};

// Storage Keys
export const STORAGE_KEYS = {
  API_PROVIDER: 'apiProvider',
  GROQ_API_KEY: 'groqApiKey',
  GEMINI_API_KEY: 'geminiApiKey',
  DARK_MODE_ENABLED: 'darkModeEnabled',
  TTS_VOICE: 'ttsVoice',
  TTS_RATE: 'ttsRate',
  TTS_PITCH: 'ttsPitch',
  AUTO_DARK_MODE: 'autoDarkMode'
};

// Default Settings
export const DEFAULT_SETTINGS = {
  apiProvider: API_PROVIDERS.GROQ,
  ttsRate: 1.0,
  ttsPitch: 1.0,
  autoDarkMode: false
};

// TTS Configuration
export const TTS_CONFIG = {
  MIN_RATE: 0.5,
  MAX_RATE: 2.0,
  MIN_PITCH: 0.5,
  MAX_PITCH: 2.0,
  DEFAULT_RATE: 1.0,
  DEFAULT_PITCH: 1.0
};

// Summarization Prompts
export const SUMMARIZATION_PROMPT = `You are a helpful assistant that summarizes web content. 
Provide a concise, well-structured summary of the following content in 3-5 bullet points. 
Focus on the main ideas and key takeaways. Keep it clear and easy to understand.

Content:
{content}`;

// UI Messages
export const MESSAGES = {
  API_KEY_REQUIRED: 'Please configure your API key in the extension settings.',
  SUMMARIZING: 'Generating summary...',
  SUMMARY_ERROR: 'Failed to generate summary. Please check your API key and try again.',
  NO_CONTENT: 'No content found on this page to summarize.',
  TTS_NOT_SUPPORTED: 'Text-to-speech is not supported in your browser.',
  DARK_MODE_ENABLED: 'Dark mode enabled',
  DARK_MODE_DISABLED: 'Dark mode disabled'
};
