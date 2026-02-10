// Text-to-Speech service using Web Speech API
export class TTSService {
    constructor() {
        this.synth = window.speechSynthesis;
        this.utterance = null;
        this.isPaused = false;
        this.isPlaying = false;
    }

    // Check if TTS is supported
    static isSupported() {
        return 'speechSynthesis' in window;
    }

    // Get available voices
    getVoices() {
        return this.synth.getVoices();
    }

    // Speak text
    speak(text, options = {}) {
        if (!text) return;

        // Stop any ongoing speech
        this.stop();

        this.utterance = new SpeechSynthesisUtterance(text);

        // Apply options
        this.utterance.rate = options.rate || 1.0;
        this.utterance.pitch = options.pitch || 1.0;
        this.utterance.volume = options.volume || 1.0;

        if (options.voice) {
            this.utterance.voice = options.voice;
        }

        // Event listeners
        this.utterance.onstart = () => {
            this.isPlaying = true;
            this.isPaused = false;
            if (options.onStart) options.onStart();
        };

        this.utterance.onend = () => {
            this.isPlaying = false;
            this.isPaused = false;
            if (options.onEnd) options.onEnd();
        };

        this.utterance.onerror = (event) => {
            console.error('TTS error:', event);
            this.isPlaying = false;
            this.isPaused = false;
            if (options.onError) options.onError(event);
        };

        this.utterance.onpause = () => {
            this.isPaused = true;
            if (options.onPause) options.onPause();
        };

        this.utterance.onresume = () => {
            this.isPaused = false;
            if (options.onResume) options.onResume();
        };

        // Boundary event for word highlighting
        this.utterance.onboundary = (event) => {
            if (options.onBoundary) options.onBoundary(event);
        };

        this.synth.speak(this.utterance);
    }

    // Pause speech
    pause() {
        if (this.isPlaying && !this.isPaused) {
            this.synth.pause();
        }
    }

    // Resume speech
    resume() {
        if (this.isPlaying && this.isPaused) {
            this.synth.resume();
        }
    }

    // Stop speech
    stop() {
        this.synth.cancel();
        this.isPlaying = false;
        this.isPaused = false;
    }

    // Get current state
    getState() {
        return {
            isPlaying: this.isPlaying,
            isPaused: this.isPaused
        };
    }
}
