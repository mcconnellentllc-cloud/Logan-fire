// Share functionality for The Logan Fire website
(function() {
    'use strict';

    const SITE_URL = 'https://www.flamesoffury.com';
    const SITE_TITLE = 'The Logan Fire — March 6, 2017';
    const SITE_DESCRIPTION = 'The story of the 2017 Logan Fire in Haxtun, Colorado. 32,546 acres burned. A community that fought back.';

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initQRCode();
        initShareButtons();
    });

    // Generate QR Code using QRCode.js library
    function initQRCode() {
        const qrContainer = document.getElementById('qrcode');
        if (!qrContainer) return;

        // Check if QRCode library is loaded
        if (typeof QRCode !== 'undefined') {
            new QRCode(qrContainer, {
                text: SITE_URL,
                width: 150,
                height: 150,
                colorDark: '#5d4e37',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        } else {
            // Fallback: use API-generated QR code image
            const img = document.createElement('img');
            img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(SITE_URL) + '&color=5d4e37';
            img.alt = 'QR Code for flamesoffury.com';
            img.style.width = '150px';
            img.style.height = '150px';
            qrContainer.appendChild(img);
        }
    }

    // Initialize share buttons
    function initShareButtons() {
        // Copy Link button
        const copyBtn = document.getElementById('share-copy');
        if (copyBtn) {
            copyBtn.addEventListener('click', handleCopyLink);
        }

        // Native Share button (for mobile)
        const nativeShareBtn = document.getElementById('share-native');
        if (nativeShareBtn) {
            if (navigator.share) {
                nativeShareBtn.style.display = 'inline-flex';
                nativeShareBtn.addEventListener('click', handleNativeShare);
            } else {
                nativeShareBtn.style.display = 'none';
            }
        }

        // Facebook share
        const fbBtn = document.getElementById('share-facebook');
        if (fbBtn) {
            fbBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const url = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(SITE_URL);
                openShareWindow(url, 'Share on Facebook');
            });
        }

        // Twitter/X share
        const twitterBtn = document.getElementById('share-twitter');
        if (twitterBtn) {
            twitterBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const text = encodeURIComponent(SITE_TITLE + ' - ' + SITE_DESCRIPTION);
                const url = 'https://twitter.com/intent/tweet?text=' + text + '&url=' + encodeURIComponent(SITE_URL);
                openShareWindow(url, 'Share on X');
            });
        }

        // Email share
        const emailBtn = document.getElementById('share-email');
        if (emailBtn) {
            emailBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const subject = encodeURIComponent(SITE_TITLE);
                const body = encodeURIComponent(SITE_DESCRIPTION + '\n\nLearn more: ' + SITE_URL);
                window.location.href = 'mailto:?subject=' + subject + '&body=' + body;
            });
        }

        // WhatsApp share
        const whatsappBtn = document.getElementById('share-whatsapp');
        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const text = encodeURIComponent(SITE_TITLE + '\n\n' + SITE_DESCRIPTION + '\n\n' + SITE_URL);
                window.open('https://wa.me/?text=' + text, '_blank');
            });
        }

        // Download QR button
        const downloadQRBtn = document.getElementById('download-qr');
        if (downloadQRBtn) {
            downloadQRBtn.addEventListener('click', handleDownloadQR);
        }
    }

    // Copy link to clipboard
    function handleCopyLink(e) {
        e.preventDefault();
        const btn = e.currentTarget;
        const originalText = btn.innerHTML;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(SITE_URL).then(function() {
                showCopySuccess(btn, originalText);
            }).catch(function() {
                fallbackCopy(btn, originalText);
            });
        } else {
            fallbackCopy(btn, originalText);
        }
    }

    // Fallback copy for older browsers
    function fallbackCopy(btn, originalText) {
        const textArea = document.createElement('textarea');
        textArea.value = SITE_URL;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
            showCopySuccess(btn, originalText);
        } catch (err) {
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Failed';
        }

        document.body.removeChild(textArea);
    }

    // Show copy success feedback
    function showCopySuccess(btn, originalText) {
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copied!';
        btn.classList.add('copied');

        setTimeout(function() {
            btn.innerHTML = originalText;
            btn.classList.remove('copied');
        }, 2000);
    }

    // Native share API (mobile)
    function handleNativeShare(e) {
        e.preventDefault();

        if (navigator.share) {
            navigator.share({
                title: SITE_TITLE,
                text: SITE_DESCRIPTION,
                url: SITE_URL
            }).catch(function(err) {
                // User cancelled or error - silently fail
                console.log('Share cancelled');
            });
        }
    }

    // Open share window popup
    function openShareWindow(url, title) {
        const width = 600;
        const height = 400;
        const left = (screen.width - width) / 2;
        const top = (screen.height - height) / 2;

        window.open(
            url,
            title,
            'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top + ',scrollbars=yes,resizable=yes'
        );
    }

    // Download QR code as image
    function handleDownloadQR(e) {
        e.preventDefault();
        const qrContainer = document.getElementById('qrcode');
        if (!qrContainer) return;

        const canvas = qrContainer.querySelector('canvas');
        const img = qrContainer.querySelector('img');

        if (canvas) {
            // Download from canvas
            const link = document.createElement('a');
            link.download = 'flamesoffury-qrcode.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        } else if (img) {
            // For API-generated image, open in new tab
            window.open(img.src, '_blank');
        }
    }
})();
