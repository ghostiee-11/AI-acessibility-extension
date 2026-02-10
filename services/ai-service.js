// AI service for Groq and Gemini API integration
import { API_ENDPOINTS, MODELS, SUMMARIZATION_PROMPT } from '../utils/constants.js';

export class AIService {
    // Summarize content using the configured API
    static async summarize(content, provider, apiKey) {
        if (!apiKey) {
            throw new Error('API key is required');
        }

        if (!content || content.trim().length === 0) {
            throw new Error('No content to summarize');
        }

        const prompt = SUMMARIZATION_PROMPT.replace('{content}', content);

        if (provider === 'groq') {
            return await this.summarizeWithGroq(prompt, apiKey);
        } else {
            return await this.summarizeWithGemini(prompt, apiKey);
        }
    }

    // Summarize using Groq API
    static async summarizeWithGroq(prompt, apiKey) {
        try {
            const response = await fetch(API_ENDPOINTS.GROQ, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: MODELS.GROQ,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Groq API request failed');
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Groq API error:', error);
            throw new Error(`Groq API error: ${error.message}`);
        }
    }

    // Summarize using Gemini API
    static async summarizeWithGemini(prompt, apiKey) {
        try {
            const url = `${API_ENDPOINTS.GEMINI}?key=${apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 500
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Gemini API request failed');
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Gemini API error:', error);
            throw new Error(`Gemini API error: ${error.message}`);
        }
    }
}
