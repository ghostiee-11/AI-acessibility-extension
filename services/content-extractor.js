// Content extraction service for web pages
export class ContentExtractor {
    // Extract main content from the current page
    static extractContent() {
        // Try to find main content using common selectors
        const contentSelectors = [
            'article',
            'main',
            '[role="main"]',
            '.post-content',
            '.article-content',
            '.entry-content',
            '.content',
            '#content',
            '.main-content'
        ];

        let content = '';

        // Try each selector until we find content
        for (const selector of contentSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                content = this.cleanText(element.innerText);
                if (content.length > 100) {
                    return content;
                }
            }
        }

        // Fallback: get body text but remove scripts, styles, etc.
        const body = document.body.cloneNode(true);

        // Remove unwanted elements
        const unwantedSelectors = [
            'script',
            'style',
            'nav',
            'header',
            'footer',
            'aside',
            '.advertisement',
            '.ads',
            '.sidebar',
            '.menu',
            '.navigation'
        ];

        unwantedSelectors.forEach(selector => {
            body.querySelectorAll(selector).forEach(el => el.remove());
        });

        content = this.cleanText(body.innerText);

        // Limit content length for API (approximately 4000 words)
        return this.truncateContent(content, 15000);
    }

    // Clean and normalize text
    static cleanText(text) {
        return text
            .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
            .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
            .trim();
    }

    // Truncate content to a maximum length
    static truncateContent(content, maxLength) {
        if (content.length <= maxLength) {
            return content;
        }

        // Try to truncate at a sentence boundary
        const truncated = content.substring(0, maxLength);
        const lastPeriod = truncated.lastIndexOf('.');
        const lastQuestion = truncated.lastIndexOf('?');
        const lastExclamation = truncated.lastIndexOf('!');

        const lastSentenceEnd = Math.max(lastPeriod, lastQuestion, lastExclamation);

        if (lastSentenceEnd > maxLength * 0.8) {
            return truncated.substring(0, lastSentenceEnd + 1);
        }

        return truncated + '...';
    }

    // Extract page metadata
    static extractMetadata() {
        const title = document.title;
        const description = document.querySelector('meta[name="description"]')?.content || '';
        const url = window.location.href;

        return {
            title,
            description,
            url
        };
    }

    // Get selected text or full content
    static getSelectedOrFullContent() {
        const selection = window.getSelection().toString().trim();
        if (selection) {
            return selection;
        }
        return this.extractContent();
    }
}
