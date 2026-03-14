// Site Analytics for Logan Fire
// Tracks visitors and interactions using CountAPI (free service)

const NAMESPACE = 'loganfire';
const VISITOR_KEY = 'visitors';
const INTERACTION_KEY = 'interactions';

// CountAPI endpoints
const API_BASE = 'https://api.countapi.xyz';

// Track a page visit (call once per session)
async function trackVisit() {
    // Only count once per session
    if (sessionStorage.getItem('visit_counted')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/hit/${NAMESPACE}/${VISITOR_KEY}`);
        if (response.ok) {
            sessionStorage.setItem('visit_counted', 'true');
        }
    } catch (e) {
        // Silently fail - analytics shouldn't break the site
        console.log('Analytics: Could not track visit');
    }
}

// Track an interaction (button click, form submit, etc.)
async function trackInteraction() {
    try {
        await fetch(`${API_BASE}/hit/${NAMESPACE}/${INTERACTION_KEY}`);
    } catch (e) {
        console.log('Analytics: Could not track interaction');
    }
}

// Get current counts (for admin dashboard)
async function getAnalytics() {
    const results = { visitors: 0, interactions: 0 };

    try {
        const [visitorsRes, interactionsRes] = await Promise.all([
            fetch(`${API_BASE}/get/${NAMESPACE}/${VISITOR_KEY}`),
            fetch(`${API_BASE}/get/${NAMESPACE}/${INTERACTION_KEY}`)
        ]);

        if (visitorsRes.ok) {
            const data = await visitorsRes.json();
            results.visitors = data.value || 0;
        }

        if (interactionsRes.ok) {
            const data = await interactionsRes.json();
            results.interactions = data.value || 0;
        }
    } catch (e) {
        console.log('Analytics: Could not fetch counts');
    }

    return results;
}

// Initialize counters (call once to set up - creates keys if they don't exist)
async function initAnalytics() {
    try {
        // Create keys starting at 0 if they don't exist
        await fetch(`${API_BASE}/create?namespace=${NAMESPACE}&key=${VISITOR_KEY}&value=0`);
        await fetch(`${API_BASE}/create?namespace=${NAMESPACE}&key=${INTERACTION_KEY}&value=0`);
    } catch (e) {
        // Keys may already exist, that's fine
    }
}

// Auto-track visit when script loads on public pages
if (!window.location.pathname.includes('admin')) {
    trackVisit();
}

// Track interactions on common elements
document.addEventListener('DOMContentLoaded', function() {
    // Track button clicks
    document.querySelectorAll('a.btn, button.btn, .share-btn').forEach(el => {
        el.addEventListener('click', () => trackInteraction());
    });

    // Track form submissions
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', () => trackInteraction());
    });

    // Track share button clicks
    document.querySelectorAll('[id^="share-"]').forEach(el => {
        el.addEventListener('click', () => trackInteraction());
    });

    // Track preorder/submit page visits as interactions
    if (window.location.pathname.includes('preorder') ||
        window.location.pathname.includes('submit')) {
        trackInteraction();
    }
});
