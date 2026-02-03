// Manuscript access control
// NOTE: Client-side password protection provides limited security.
// For true security, use server-side authentication.

// Password hash (SHA-256 of the password)
// This is more secure than storing plain text, but determined users can still bypass
const PASSWORD_HASH = 'cdf22fb0f3672e931197584d3335c3b87b4bf103a0b8b6d58d31a7174aab6d71';

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function checkPassword() {
    const input = document.getElementById('password-input');
    const errorMsg = document.getElementById('error-message');
    const password = input.value;

    const hash = await hashPassword(password);

    if (hash === PASSWORD_HASH) {
        // Store session
        sessionStorage.setItem('manuscript_access', 'granted');
        errorMsg.style.display = 'none';
        showManuscript();
    } else {
        errorMsg.textContent = 'Incorrect password. Please try again.';
        errorMsg.style.display = 'block';
        errorMsg.style.color = '#e74c3c';
        input.value = '';
        input.focus();
    }
}

function showManuscript() {
    document.getElementById('password-gate').style.display = 'none';
    document.getElementById('manuscript-content').classList.add('visible');
}

function logout() {
    sessionStorage.removeItem('manuscript_access');
    location.reload();
}

// Check on page load if already authenticated
document.addEventListener('DOMContentLoaded', function() {
    if (sessionStorage.getItem('manuscript_access') === 'granted') {
        showManuscript();
    }

    // Enter key support
    const input = document.getElementById('password-input');
    if (input) {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });
    }
});
