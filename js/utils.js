/**
 * Student Management System - Utility Functions
 * Toast notifications, Modal controls, formatting, and validation helpers
 */

// Toast notification manager
export function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const titleMap = {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Notice'
  };

  toast.innerHTML = `
    <div class="toast-icon">${iconMap[type] || 'ℹ'}</div>
    <div class="toast-content">
      <div class="toast-title">${titleMap[type] || 'Notification'}</div>
      <div class="toast-message">${escapeHtml(message)}</div>
    </div>
    <button class="toast-close" aria-label="Close">&times;</button>
  `;

  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => removeToast(toast));

  container.appendChild(toast);

  // Auto remove
  const autoCloseTimer = setTimeout(() => {
    removeToast(toast);
  }, duration);

  function removeToast(el) {
    clearTimeout(autoCloseTimer);
    el.classList.add('toast-exit');
    el.addEventListener('animationend', () => {
      el.remove();
    });
  }
}

// Modal Controllers
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

export function setupModalListeners() {
  // Close buttons with [data-close-modal]
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-overlay');
      if (modal) closeModal(modal.id);
    });
  });

  // Close on clicking backdrop
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay.id);
      }
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(modal => {
        closeModal(modal.id);
      });
    }
  });
}

// HTML escape helper
export function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Format Date (YYYY-MM-DD to readable Mon DD, YYYY)
export function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

// Calculate Age from Date of Birth
export function calculateAge(dobStr) {
  if (!dobStr) return null;
  const dob = new Date(dobStr);
  if (isNaN(dob.getTime())) return null;
  const diffMs = Date.now() - dob.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

// Get user initials (e.g. "John Doe" -> "JD")
export function getInitials(name) {
  if (!name) return 'ST';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Generate unique Student ID (e.g. STU-2026-8941)
export function generateStudentId() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `STU-${year}-${randomNum}`;
}

// Form validation helpers
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export function validatePhone(phone) {
  const re = /^[+]?[\d\s\-()]{7,20}$/;
  return re.test(String(phone).trim());
}

export function setFieldError(inputElement, errorMessage) {
  if (!inputElement) return;
  inputElement.classList.add('is-invalid');
  const parent = inputElement.closest('.form-group');
  if (parent) {
    parent.classList.add('has-error');
    let errorEl = parent.querySelector('.form-error');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'form-error';
      parent.appendChild(errorEl);
    }
    errorEl.textContent = errorMessage;
  }
}

export function clearFieldError(inputElement) {
  if (!inputElement) return;
  inputElement.classList.remove('is-invalid');
  const parent = inputElement.closest('.form-group');
  if (parent) {
    parent.classList.remove('has-error');
    const errorEl = parent.querySelector('.form-error');
    if (errorEl) errorEl.textContent = '';
  }
}

export function clearAllFieldErrors(formElement) {
  if (!formElement) return;
  formElement.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  formElement.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
  formElement.querySelectorAll('.form-error').forEach(el => el.textContent = '');
}
