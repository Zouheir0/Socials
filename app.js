'use strict';

const gradeNineLinks = document.querySelectorAll('a[data-social-link]');
const copyShareUrl = document.getElementById('copyShareUrl');
const copyStatus = document.getElementById('copyStatus');

// Guard the fixed destinations at runtime as well as keeping them explicit in the HTML.
gradeNineLinks.forEach((socialLink) => {
  const destination = socialLink.getAttribute('href') || '';

  if (!destination.startsWith('https://')) {
    socialLink.removeAttribute('href');
    socialLink.setAttribute('aria-disabled', 'true');
    socialLink.removeAttribute('target');
  }
});

function showCopyResult(message, state) {
  if (!copyStatus) return;

  copyStatus.textContent = message;
  if (state) {
    copyStatus.dataset.state = state;
  } else {
    delete copyStatus.dataset.state;
  }
}

function copyWithLegacySelection(pageUrl) {
  // Some older in-app browsers expose no Clipboard API; this fallback avoids a dependency.
  const temporaryField = document.createElement('textarea');
  temporaryField.className = 'clipboard-fallback';
  temporaryField.setAttribute('readonly', '');
  temporaryField.setAttribute('aria-hidden', 'true');
  temporaryField.value = pageUrl;
  document.body.appendChild(temporaryField);
  temporaryField.focus();
  temporaryField.select();

  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch (error) {
    copied = false;
  }

  temporaryField.remove();
  return copied;
}

async function copyCurrentPageUrl() {
  const pageUrl = window.location.href;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(pageUrl);
      showCopyResult('Link copied', 'success');
      return;
    }
  } catch (error) {
    // Fall through to the selection-based fallback for browsers with blocked clipboard access.
  }

  if (copyWithLegacySelection(pageUrl)) {
    showCopyResult('Link copied', 'success');
  } else {
    showCopyResult('Copy was blocked. You can copy the page address from your browser.', 'error');
  }
}

if (copyShareUrl) {
  copyShareUrl.addEventListener('click', copyCurrentPageUrl);
}
