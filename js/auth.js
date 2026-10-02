/**
 * Student Management System - Authentication Logic & Route Protection
 */

import { AuthService, isFirebaseConfigured } from './firebase-config.js';
import { showToast } from './utils.js';

// Determine current page path
const currentPath = window.location.pathname.toLowerCase();
const isLoginPage = currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath.endsWith('\\');

/**
 * Route protection guard
 */
export function initAuthGuard() {
  const isConfigured = isFirebaseConfigured();

  AuthService.onAuthChanged(user => {
    if (isLoginPage) {
      // If user is already logged in and on the login page, redirect to dashboard
      if (user) {
        window.location.replace('dashboard.html');
      }
    } else {
      // Protected page: If no user, redirect to index.html
      if (!user) {
        console.warn('Access denied: Unauthenticated user. Redirecting to login...');
        window.location.replace('index.html');
      } else {
        // Update user badge in topbar if present
        updateUserProfileUI(user);
      }
    }
  });

  // Display notice banner if Firebase credentials are still placeholder
  renderFirebaseNoticeBanner(isConfigured);
}

/**
 * Render a non-intrusive alert banner showing Firebase status
 */
function renderFirebaseNoticeBanner(isConfigured) {
  // Only show inside dashboard/admin pages
  if (isLoginPage) return;

  const existing = document.getElementById('firebase-status-banner');
  if (existing) return;

  if (!isConfigured) {
    const banner = document.createElement('div');
    banner.id = 'firebase-status-banner';
    banner.className = 'alert-banner';
    banner.innerHTML = `
      <div>
        <span class="alert-banner-badge">Demo / Preview Mode</span>
        <span>Firebase keys are not yet configured in <code>js/firebase-config.js</code>. Running in full local interactive mode.</span>
      </div>
      <div>
        <a href="settings.html">Configure Firebase &rarr;</a>
      </div>
    `;
    const mainWrapper = document.querySelector('.main-wrapper');
    if (mainWrapper) {
      mainWrapper.prepend(banner);
    }
  }
}

/**
 * Update topbar admin info
 */
function updateUserProfileUI(user) {
  const nameEl = document.querySelector('.user-name');
  const avatarEl = document.querySelector('.user-avatar');
  
  if (nameEl && user) {
    const displayEmail = user.email || 'admin@school.edu';
    nameEl.textContent = displayEmail.split('@')[0];
    nameEl.title = displayEmail;
  }

  if (avatarEl && user) {
    const email = user.email || 'AD';
    avatarEl.textContent = email.substring(0, 2).toUpperCase();
  }
}

/**
 * Handle Login Form Submission
 */
export function setupLoginForm() {
  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const submitBtn = document.getElementById('login-submit-btn');
  const togglePasswordBtn = document.getElementById('toggle-password-btn');
  const demoFillBtn = document.getElementById('demo-fill-btn');

  // Password visibility toggle
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      togglePasswordBtn.textContent = type === 'password' ? '👁' : '🔒';
    });
  }

  // Quick demo credentials autofill
  if (demoFillBtn && emailInput && passwordInput) {
    demoFillBtn.addEventListener('click', () => {
      emailInput.value = 'admin@school.edu';
      passwordInput.value = 'admin123';
      showToast('Demo credentials filled in.', 'info');
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        showToast('Please enter both email and password.', 'warning');
        return;
      }

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = 'Signing in...';
        }

        await AuthService.login(email, password);
        showToast('Login successful! Redirecting...', 'success');
        
        setTimeout(() => {
          window.location.replace('dashboard.html');
        }, 500);

      } catch (error) {
        console.error('Login error:', error);
        let errorMsg = 'Failed to sign in. Please verify your credentials.';
        
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
          errorMsg = 'Incorrect email or password.';
        } else if (error.code === 'auth/user-not-found') {
          errorMsg = 'No account found with this email.';
        } else if (error.code === 'auth/too-many-requests') {
          errorMsg = 'Access temporarily disabled due to many failed login attempts. Try again later.';
        } else if (error.message) {
          errorMsg = error.message;
        }

        showToast(errorMsg, 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Sign In to Dashboard &rarr;';
        }
      }
    });
  }
}

/**
 * Handle Logout Button
 */
export function setupLogoutButton() {
  const logoutButtons = document.querySelectorAll('[data-action="logout"]');
  logoutButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const confirmLogout = confirm('Are you sure you want to sign out?');
      if (!confirmLogout) return;

      try {
        await AuthService.logout();
        showToast('Logged out successfully.', 'info');
        setTimeout(() => {
          window.location.replace('index.html');
        }, 400);
      } catch (err) {
        console.error('Logout error:', err);
        showToast('Error signing out. Please try again.', 'error');
      }
    });
  });
}

// Auto-run auth guard when imported
initAuthGuard();
