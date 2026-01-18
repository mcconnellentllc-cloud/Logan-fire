// Simple password protection for manuscript
// Password: logan2017 (change this by updating the hash below)

const PASSWORD_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'; // SHA-256 of 'logan2017'

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
        showManuscript();
    } else {
        errorMsg.style.display = 'block';
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
