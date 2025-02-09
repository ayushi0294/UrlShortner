const BLOCKLIST_DOMAINS = [
    "example-spam.com",
    "bad-website.net",
    "phishing-site.org",
    "clickbait.xyz"
];

/**
 * Check if the URL domain is in the blocklist
 * @param {string} url
 * @returns {boolean} - Returns true if URL is spam
 */
export function isSpamUrl(url) {
    try {
        const domain = new URL(url).hostname;
        return BLOCKLIST_DOMAINS.includes(domain);
    } catch (err) {
        console.error("Error checking spam URL:", err.message);
        return false;
    }
}
