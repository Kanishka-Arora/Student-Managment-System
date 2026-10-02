/**
 * Student Management System - Dashboard Analytics & Overview Logic
 */

import { DataService } from './firebase-config.js';
import { calculateAge, formatDate, getInitials, showToast, escapeHtml } from './utils.js';

export async function initDashboard() {
  setupSidebarToggle();
  await loadDashboardMetrics();
}

/**
 * Responsive Sidebar toggle for mobile/tablet screens
 */
export function setupSidebarToggle() {
  const toggleBtn = document.querySelector('.topbar-toggle');
  const sidebar = document.querySelector('.sidebar');
  let backdrop = document.querySelector('.sidebar-backdrop');

  if (!backdrop && sidebar) {
    backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);
  }

  if (toggleBtn && sidebar && backdrop) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('show');
      backdrop.classList.toggle('show');
    });

    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('show');
      backdrop.classList.remove('show');
    });
  }
}

/**
 * Load and compute all dashboard statistics & recent students
 */
export async function loadDashboardMetrics() {
  try {
    const students = await DataService.getAllStudents();

    // 1. Total Students
    const totalStudents = students.length;

    // 2. Active Students
    const activeStudents = students.filter(s => s.status === 'Active').length;

    // 3. Average Age
    let totalAge = 0;
    let ageCount = 0;
    students.forEach(s => {
      const age = calculateAge(s.dateOfBirth);
      if (age && !isNaN(age)) {
        totalAge += age;
        ageCount++;
      }
    });
    const avgAge = ageCount > 0 ? (totalAge / ageCount).toFixed(1) : '--';

    // 4. Distinct Departments & Courses
    const departments = new Set(students.map(s => s.department).filter(Boolean));
    const courses = new Set(students.map(s => s.course).filter(Boolean));

    // Update Counter DOM Elements
    updateCounter('stat-total-students', totalStudents);
    updateCounter('stat-active-students', activeStudents);
    updateCounter('stat-avg-age', avgAge === '--' ? '--' : `${avgAge} yrs`);
    updateCounter('stat-departments', departments.size);
    updateCounter('stat-courses', courses.size);

    // Update active percentage subtext
    const activeSubtext = document.getElementById('stat-active-subtext');
    if (activeSubtext && totalStudents > 0) {
      const pct = Math.round((activeStudents / totalStudents) * 100);
      activeSubtext.innerHTML = `<strong>${pct}%</strong> of total enrollment`;
    }

    // Render Recent Students (Latest 5)
    renderRecentStudents(students.slice(0, 5));

    // Render Department Breakdown Cards
    renderDepartmentDistribution(students);

  } catch (error) {
    console.error('Error loading dashboard stats:', error);
    showToast('Failed to load dashboard metrics.', 'error');
  }
}

function updateCounter(elementId, value) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = value;
  }
}

/**
 * Render Recent Students list in the Dashboard table
 */
function renderRecentStudents(recentList) {
  const tbody = document.getElementById('recent-students-body');
  if (!tbody) return;

  if (recentList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center" style="padding: 2rem;">
          <div class="empty-state">
            <div class="empty-title">No Students Registered Yet</div>
            <div class="empty-desc">Click the "Add Student" button to add your first student record.</div>
            <a href="add-student.html" class="btn btn-primary btn-sm">+ Add First Student</a>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = recentList.map(student => {
    const statusBadge = student.status === 'Active'
      ? `<span class="badge badge-active"><span class="badge-dot"></span> Active</span>`
      : `<span class="badge badge-inactive"><span class="badge-dot"></span> Inactive</span>`;

    const initials = getInitials(student.name);

    return `
      <tr>
        <td>
          <span class="student-id-code">${escapeHtml(student.studentId)}</span>
        </td>
        <td>
          <div class="student-identity">
            <div class="student-avatar">${initials}</div>
            <div>
              <div class="student-name">${escapeHtml(student.name)}</div>
              <div class="text-muted" style="font-size: 0.775rem;">${escapeHtml(student.email)}</div>
            </div>
          </div>
        </td>
        <td><strong>${escapeHtml(student.course)}</strong></td>
        <td>${escapeHtml(student.department)}</td>
        <td>${statusBadge}</td>
        <td>
          <a href="students.html?view=${encodeURIComponent(student.id || student.studentId)}" class="btn btn-secondary btn-sm">
            View &rarr;
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Render Department Distribution summary pills
 */
function renderDepartmentDistribution(students) {
  const container = document.getElementById('dept-distribution-container');
  if (!container) return;

  const deptCounts = {};
  students.forEach(s => {
    const d = s.department || 'Unassigned';
    deptCounts[d] = (deptCounts[d] || 0) + 1;
  });

  const keys = Object.keys(deptCounts);
  if (keys.length === 0) {
    container.innerHTML = `<span class="text-muted">No department data available.</span>`;
    return;
  }

  container.innerHTML = keys.map(dept => {
    const count = deptCounts[dept];
    return `
      <div style="background: var(--slate-50); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.85rem 1.15rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
        <div>
          <div style="font-weight: 700; color: var(--slate-800); font-size: 0.9rem;">${escapeHtml(dept)}</div>
          <div style="font-size: 0.75rem; color: var(--slate-500);">Department</div>
        </div>
        <div style="font-size: 1.25rem; font-weight: 800; color: var(--primary-600);">${count}</div>
      </div>
    `;
  }).join('');
}
