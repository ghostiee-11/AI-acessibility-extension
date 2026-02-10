// Storage utility for Chrome extension
import { STORAGE_KEYS, DEFAULT_SETTINGS } from './constants.js';

export class StorageManager {
    // Get a single value from storage
    static async get(key) {
        return new Promise((resolve) => {
            chrome.storage.sync.get([key], (result) => {
                resolve(result[key]);
            });
        });
    }

    // Get multiple values from storage
    static async getMultiple(keys) {
        return new Promise((resolve) => {
            chrome.storage.sync.get(keys, (result) => {
                resolve(result);
            });
        });
    }

    // Set a single value in storage
    static async set(key, value) {
        return new Promise((resolve) => {
            chrome.storage.sync.set({ [key]: value }, () => {
                resolve();
            });
        });
    }

    // Set multiple values in storage
    static async setMultiple(items) {
        return new Promise((resolve) => {
            chrome.storage.sync.set(items, () => {
                resolve();
            });
        });
    }

    // Remove a value from storage
    static async remove(key) {
        return new Promise((resolve) => {
            chrome.storage.sync.remove(key, () => {
                resolve();
            });
        });
    }

    // Get API key for the current provider
    static async getApiKey() {
        const provider = await this.get(STORAGE_KEYS.API_PROVIDER) || DEFAULT_SETTINGS.apiProvider;
        const key = provider === 'groq'
            ? STORAGE_KEYS.GROQ_API_KEY
            : STORAGE_KEYS.GEMINI_API_KEY;
        return await this.get(key);
    }

    // Get current API provider
    static async getProvider() {
        return await this.get(STORAGE_KEYS.API_PROVIDER) || DEFAULT_SETTINGS.apiProvider;
    }

    // Get all settings
    static async getAllSettings() {
        const keys = Object.values(STORAGE_KEYS);
        const settings = await this.getMultiple(keys);
        return { ...DEFAULT_SETTINGS, ...settings };
    }

    // Check if dark mode is enabled
    static async isDarkModeEnabled() {
        return await this.get(STORAGE_KEYS.DARK_MODE_ENABLED) || false;
    }

    // Toggle dark mode
    static async toggleDarkMode() {
        const current = await this.isDarkModeEnabled();
        await this.set(STORAGE_KEYS.DARK_MODE_ENABLED, !current);
        return !current;
    }
}
