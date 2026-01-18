// Simple password protection for manuscript
// Password: logan2017

const PASSWORD = 'logan2017';

function checkPassword() {
    const input = document.getElementById('password-input');
    const errorMsg = document.getElementById('error-message');
    const password = input.value;

    if (password === PASSWORD) {
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
