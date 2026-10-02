/**
 * Student Management System - Student CRUD, Directory, Search & Filter Logic
 */

import { DataService } from './firebase-config.js';
import { 
  showToast, 
  openModal, 
  closeModal, 
  setupModalListeners, 
  formatDate, 
  calculateAge, 
  getInitials, 
  generateStudentId, 
  validateEmail, 
  validatePhone, 
  setFieldError, 
  clearFieldError, 
  clearAllFieldErrors,
  escapeHtml 
} from './utils.js';

let allStudentsCache = [];
let studentToDeleteId = null;

/**
 * Initialize Students Directory Page (`students.html`)
 */
export async function initStudentsPage() {
  setupModalListeners();
  setupFilterAndSearchListeners();
  setupDeleteModal();
  setupEditModalForm();
  await loadStudentsTable();
}

/**
 * Fetch and Render Students Table with Filters
 */
export async function loadStudentsTable() {
  const tbody = document.getElementById('students-table-body');
  const countIndicator = document.getElementById('student-count-indicator');
  
  if (!tbody) return;

  try {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center" style="padding: 2.5rem;">
          <div style="display:inline-block; animation: spin 1s linear infinite; font-size: 1.5rem;">⏳</div>
          <div style="margin-top: 0.5rem; color: var(--slate-500);">Loading students...</div>
        </td>
      </tr>
    `;

    allStudentsCache = await DataService.getAllStudents();
    renderFilteredStudents();
    populateDynamicDropdownOptions(allStudentsCache);

  } catch (error) {
    console.error('Error fetching students:', error);
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center" style="padding: 2.5rem; color: var(--danger-600);">
          Failed to load student records. Please check your network or Firestore settings.
        </td>
      </tr>
    `;
    showToast('Failed to load students.', 'error');
  }
}

/**
 * Filter students based on current search and select inputs
 */
export function getFilteredStudents() {
  const searchVal = (document.getElementById('search-input')?.value || '').trim().toLowerCase();
  const deptVal = document.getElementById('filter-department')?.value || 'ALL';
  const courseVal = document.getElementById('filter-course')?.value || 'ALL';
  const semVal = document.getElementById('filter-semester')?.value || 'ALL';
  const statusVal = document.getElementById('filter-status')?.value || 'ALL';

  return allStudentsCache.filter(student => {
    // Search by Name, Student ID, or Email
    const matchesSearch = !searchVal || 
      (student.name && student.name.toLowerCase().includes(searchVal)) ||
      (student.studentId && student.studentId.toLowerCase().includes(searchVal)) ||
      (student.email && student.email.toLowerCase().includes(searchVal));

    const matchesDept = (deptVal === 'ALL') || (student.department === deptVal);
    const matchesCourse = (courseVal === 'ALL') || (student.course === courseVal);
    const matchesSem = (semVal === 'ALL') || (student.semester === semVal);
    const matchesStatus = (statusVal === 'ALL') || (student.status === statusVal);

    return matchesSearch && matchesDept && matchesCourse && matchesSem && matchesStatus;
  });
}

/**
 * Render filtered students into the table
 */
export function renderFilteredStudents() {
  const tbody = document.getElementById('students-table-body');
  const countIndicator = document.getElementById('student-count-indicator');
  if (!tbody) return;

  const filtered = getFilteredStudents();

  if (countIndicator) {
    countIndicator.textContent = `Showing ${filtered.length} of ${allStudentsCache.length} student${allStudentsCache.length === 1 ? '' : 's'}`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <div class="empty-icon">👥</div>
            <div class="empty-title">No Students Found</div>
            <div class="empty-desc">No student records match your current search and filter criteria.</div>
            <button class="btn btn-secondary btn-sm" id="btn-reset-filters">Reset Filters</button>
          </div>
        </td>
      </tr>
    `;
    document.getElementById('btn-reset-filters')?.addEventListener('click', resetFilters);
    return;
  }

  tbody.innerHTML = filtered.map(student => {
    const statusBadge = student.status === 'Active' 
      ? `<span class="badge badge-active"><span class="badge-dot"></span> Active</span>`
      : `<span class="badge badge-inactive"><span class="badge-dot"></span> Inactive</span>`;

    const initials = getInitials(student.name);

    return `
      <tr data-student-id="${escapeHtml(student.id || student.studentId)}">
        <td>
          <span class="student-id-code">${escapeHtml(student.studentId)}</span>
        </td>
        <td>
          <div class="student-identity">
            <div class="student-avatar">${initials}</div>
            <div>
              <div class="student-name">${escapeHtml(student.name)}</div>
              <div class="text-muted" style="font-size: 0.775rem;">${escapeHtml(student.gender || '')}</div>
            </div>
          </div>
        </td>
        <td>${escapeHtml(student.email)}</td>
        <td><strong>${escapeHtml(student.course)}</strong></td>
        <td>${escapeHtml(student.department)}</td>
        <td><span class="badge badge-primary">${escapeHtml(student.semester)} Sem</span></td>
        <td>${statusBadge}</td>
        <td>
          <div class="table-actions">
            <button class="btn-action btn-action-view" data-action="view" data-id="${student.id}" title="View Student Details">
              <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </button>
            <button class="btn-action btn-action-edit" data-action="edit" data-id="${student.id}" title="Edit Student">
              <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button class="btn-action btn-action-delete" data-action="delete" data-id="${student.id}" data-name="${escapeHtml(student.name)}" title="Delete Student">
              <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  attachRowActionListeners();
}

/**
 * Attach listeners to table row action buttons
 */
function attachRowActionListeners() {
  // View Details
  document.querySelectorAll('[data-action="view"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openViewDetailsModal(id);
    });
  });

  // Edit Student
  document.querySelectorAll('[data-action="edit"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openEditStudentModal(id);
    });
  });

  // Delete Student
  document.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      openDeleteConfirmModal(id, name);
    });
  });
}

/**
 * Filter & Search Event Listeners
 */
function setupFilterAndSearchListeners() {
  const searchInput = document.getElementById('search-input');
  const deptFilter = document.getElementById('filter-department');
  const courseFilter = document.getElementById('filter-course');
  const semFilter = document.getElementById('filter-semester');
  const statusFilter = document.getElementById('filter-status');
  const clearBtn = document.getElementById('btn-clear-filters');

  if (searchInput) {
    searchInput.addEventListener('input', () => renderFilteredStudents());
  }

  [deptFilter, courseFilter, semFilter, statusFilter].forEach(elem => {
    elem?.addEventListener('change', () => renderFilteredStudents());
  });

  clearBtn?.addEventListener('click', resetFilters);
}

function resetFilters() {
  const searchInput = document.getElementById('search-input');
  const deptFilter = document.getElementById('filter-department');
  const courseFilter = document.getElementById('filter-course');
  const semFilter = document.getElementById('filter-semester');
  const statusFilter = document.getElementById('filter-status');

  if (searchInput) searchInput.value = '';
  if (deptFilter) deptFilter.value = 'ALL';
  if (courseFilter) courseFilter.value = 'ALL';
  if (semFilter) semFilter.value = 'ALL';
  if (statusFilter) statusFilter.value = 'ALL';

  renderFilteredStudents();
}

/**
 * Dynamically extract unique departments and courses from records to populate filter dropdowns
 */
function populateDynamicDropdownOptions(students) {
  const deptSelect = document.getElementById('filter-department');
  const courseSelect = document.getElementById('filter-course');

  if (deptSelect && deptSelect.options.length <= 1) {
    const departments = [...new Set(students.map(s => s.department).filter(Boolean))].sort();
    departments.forEach(dept => {
      const opt = document.createElement('option');
      opt.value = dept;
      opt.textContent = dept;
      deptSelect.appendChild(opt);
    });
  }

  if (courseSelect && courseSelect.options.length <= 1) {
    const courses = [...new Set(students.map(s => s.course).filter(Boolean))].sort();
    courses.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      courseSelect.appendChild(opt);
    });
  }
}

/**
 * ============================================================================
 * VIEW STUDENT DETAILS MODAL
 * ============================================================================
 */
export async function openViewDetailsModal(studentId) {
  const modalBody = document.getElementById('view-modal-body');
  if (!modalBody) return;

  const student = allStudentsCache.find(s => s.id === studentId || s.studentId === studentId);
  if (!student) {
    showToast('Student record could not be found.', 'error');
    return;
  }

  const initials = getInitials(student.name);
  const age = calculateAge(student.dateOfBirth);
  const statusBadge = student.status === 'Active'
    ? `<span class="badge badge-active"><span class="badge-dot"></span> Active</span>`
    : `<span class="badge badge-inactive"><span class="badge-dot"></span> Inactive</span>`;

  modalBody.innerHTML = `
    <div class="profile-card-header">
      <div class="profile-avatar-lg">${initials}</div>
      <div class="profile-title-wrap">
        <h3>${escapeHtml(student.name)}</h3>
        <span class="student-id-code">${escapeHtml(student.studentId)}</span>
        <div class="profile-meta-tags">
          ${statusBadge}
          <span class="badge badge-primary">${escapeHtml(student.department)}</span>
          <span class="badge">${escapeHtml(student.gender || 'Not specified')}</span>
        </div>
      </div>
    </div>

    <div class="form-section-title">Academic Details</div>
    <div class="profile-details-grid" style="margin-bottom: 1.5rem;">
      <div class="profile-field">
        <span class="profile-field-label">Course</span>
        <span class="profile-field-value">${escapeHtml(student.course)}</span>
      </div>
      <div class="profile-field">
        <span class="profile-field-label">Department</span>
        <span class="profile-field-value">${escapeHtml(student.department)}</span>
      </div>
      <div class="profile-field">
        <span class="profile-field-label">Semester</span>
        <span class="profile-field-value">${escapeHtml(student.semester)} Semester</span>
      </div>
      <div class="profile-field">
        <span class="profile-field-label">Enrollment Date</span>
        <span class="profile-field-value">${formatDate(student.enrollmentDate)}</span>
      </div>
    </div>

    <div class="form-section-title">Personal & Contact Details</div>
    <div class="profile-details-grid">
      <div class="profile-field">
        <span class="profile-field-label">Email Address</span>
        <span class="profile-field-value"><a href="mailto:${escapeHtml(student.email)}" style="color:var(--primary-600); text-decoration:underline;">${escapeHtml(student.email)}</a></span>
      </div>
      <div class="profile-field">
        <span class="profile-field-label">Phone Number</span>
        <span class="profile-field-value">${escapeHtml(student.phone || 'N/A')}</span>
      </div>
      <div class="profile-field">
        <span class="profile-field-label">Date of Birth</span>
        <span class="profile-field-value">${formatDate(student.dateOfBirth)} ${age ? `(${age} years old)` : ''}</span>
      </div>
      <div class="profile-field">
        <span class="profile-field-label">Record Created</span>
        <span class="profile-field-value">${formatDate(student.createdAt)}</span>
      </div>
      <div class="profile-field profile-field-full">
        <span class="profile-field-label">Residential Address</span>
        <span class="profile-field-value">${escapeHtml(student.address || 'No address provided.')}</span>
      </div>
    </div>
  `;

  openModal('modal-view-student');
}

/**
 * ============================================================================
 * EDIT STUDENT MODAL
 * ============================================================================
 */
export function openEditStudentModal(studentId) {
  const student = allStudentsCache.find(s => s.id === studentId || s.studentId === studentId);
  if (!student) {
    showToast('Student record not found.', 'error');
    return;
  }

  const form = document.getElementById('edit-student-form');
  if (!form) return;

  clearAllFieldErrors(form);

  form.querySelector('#edit-doc-id').value = student.id;
  form.querySelector('#edit-studentId').value = student.studentId;
  form.querySelector('#edit-name').value = student.name || '';
  form.querySelector('#edit-email').value = student.email || '';
  form.querySelector('#edit-phone').value = student.phone || '';
  form.querySelector('#edit-dob').value = student.dateOfBirth || '';
  form.querySelector('#edit-gender').value = student.gender || 'Male';
  form.querySelector('#edit-course').value = student.course || '';
  form.querySelector('#edit-department').value = student.department || '';
  form.querySelector('#edit-semester').value = student.semester || '1st';
  form.querySelector('#edit-enrollmentDate').value = student.enrollmentDate || '';
  form.querySelector('#edit-status').value = student.status || 'Active';
  form.querySelector('#edit-address').value = student.address || '';

  openModal('modal-edit-student');
}

function setupEditModalForm() {
  const form = document.getElementById('edit-student-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const docId = form.querySelector('#edit-doc-id').value;
    const studentId = form.querySelector('#edit-studentId').value.trim();
    const name = form.querySelector('#edit-name').value.trim();
    const email = form.querySelector('#edit-email').value.trim();
    const phone = form.querySelector('#edit-phone').value.trim();
    const dateOfBirth = form.querySelector('#edit-dob').value;
    const gender = form.querySelector('#edit-gender').value;
    const course = form.querySelector('#edit-course').value.trim();
    const department = form.querySelector('#edit-department').value.trim();
    const semester = form.querySelector('#edit-semester').value;
    const enrollmentDate = form.querySelector('#edit-enrollmentDate').value;
    const status = form.querySelector('#edit-status').value;
    const address = form.querySelector('#edit-address').value.trim();

    // Validation
    let isValid = true;
    clearAllFieldErrors(form);

    if (!name) {
      setFieldError(form.querySelector('#edit-name'), 'Full Name is required.');
      isValid = false;
    }
    if (!email || !validateEmail(email)) {
      setFieldError(form.querySelector('#edit-email'), 'Valid email address is required.');
      isValid = false;
    }
    if (phone && !validatePhone(phone)) {
      setFieldError(form.querySelector('#edit-phone'), 'Please enter a valid phone number.');
      isValid = false;
    }
    if (!course) {
      setFieldError(form.querySelector('#edit-course'), 'Course is required.');
      isValid = false;
    }
    if (!department) {
      setFieldError(form.querySelector('#edit-department'), 'Department is required.');
      isValid = false;
    }

    if (!isValid) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving Changes...';
      }

      const updatedPayload = {
        name,
        email,
        phone,
        dateOfBirth,
        gender,
        course,
        department,
        semester,
        enrollmentDate,
        status,
        address
      };

      await DataService.updateStudent(docId, updatedPayload);
      showToast(`Student record for "${name}" updated successfully!`, 'success');
      closeModal('modal-edit-student');
      await loadStudentsTable();

    } catch (error) {
      console.error('Update failed:', error);
      showToast('Failed to update student record.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Changes';
      }
    }
  });
}

/**
 * ============================================================================
 * DELETE CONFIRMATION MODAL
 * ============================================================================
 */
export function openDeleteConfirmModal(studentId, studentName) {
  studentToDeleteId = studentId;
  const nameEl = document.getElementById('delete-student-name');
  if (nameEl) {
    nameEl.textContent = studentName || 'this student';
  }
  openModal('modal-delete-student');
}

function setupDeleteModal() {
  const confirmBtn = document.getElementById('btn-confirm-delete');
  if (!confirmBtn) return;

  confirmBtn.addEventListener('click', async () => {
    if (!studentToDeleteId) return;

    try {
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Deleting...';

      await DataService.deleteStudent(studentToDeleteId);
      showToast('Student deleted successfully.', 'success');
      closeModal('modal-delete-student');
      studentToDeleteId = null;

      await loadStudentsTable();

    } catch (err) {
      console.error('Failed to delete student:', err);
      showToast('Failed to delete student record.', 'error');
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Delete Student';
    }
  });
}

/**
 * ============================================================================
 * ADD STUDENT PAGE / FORM HANDLER (`add-student.html`)
 * ============================================================================
 */
export function initAddStudentPage() {
  setupModalListeners();
  const form = document.getElementById('add-student-form');
  const generateIdBtn = document.getElementById('btn-generate-id');
  const studentIdInput = document.getElementById('studentId');

  // Pre-generate a Student ID on page load
  if (studentIdInput && !studentIdInput.value) {
    studentIdInput.value = generateStudentId();
  }

  generateIdBtn?.addEventListener('click', () => {
    if (studentIdInput) {
      studentIdInput.value = generateStudentId();
      showToast('Generated new Student ID', 'info');
    }
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const studentId = document.getElementById('studentId').value.trim();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const dateOfBirth = document.getElementById('dateOfBirth').value;
      const gender = document.getElementById('gender').value;
      const course = document.getElementById('course').value.trim();
      const department = document.getElementById('department').value.trim();
      const semester = document.getElementById('semester').value;
      const enrollmentDate = document.getElementById('enrollmentDate').value;
      const status = document.getElementById('status').value;
      const address = document.getElementById('address').value.trim();

      // Clear previous validation
      clearAllFieldErrors(form);

      let isValid = true;

      if (!studentId) {
        setFieldError(document.getElementById('studentId'), 'Student ID is required.');
        isValid = false;
      }
      if (!name) {
        setFieldError(document.getElementById('name'), 'Full Name is required.');
        isValid = false;
      }
      if (!email || !validateEmail(email)) {
        setFieldError(document.getElementById('email'), 'Valid email is required.');
        isValid = false;
      }
      if (phone && !validatePhone(phone)) {
        setFieldError(document.getElementById('phone'), 'Enter a valid phone number (min 7 digits).');
        isValid = false;
      }
      if (!dateOfBirth) {
        setFieldError(document.getElementById('dateOfBirth'), 'Date of Birth is required.');
        isValid = false;
      }
      if (!course) {
        setFieldError(document.getElementById('course'), 'Course is required.');
        isValid = false;
      }
      if (!department) {
        setFieldError(document.getElementById('department'), 'Department is required.');
        isValid = false;
      }
      if (!semester) {
        setFieldError(document.getElementById('semester'), 'Semester is required.');
        isValid = false;
      }
      if (!enrollmentDate) {
        setFieldError(document.getElementById('enrollmentDate'), 'Enrollment Date is required.');
        isValid = false;
      }

      if (!isValid) {
        showToast('Please fix the highlighted errors before submitting.', 'warning');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = 'Adding Student...';
        }

        const newStudent = {
          studentId,
          name,
          email,
          phone,
          dateOfBirth,
          gender,
          course,
          department,
          semester,
          address,
          enrollmentDate,
          status
        };

        await DataService.addStudent(newStudent);
        showToast(`Student "${name}" added successfully!`, 'success');

        // Redirect to students directory after short delay
        setTimeout(() => {
          window.location.href = 'students.html';
        }, 800);

      } catch (error) {
        console.error('Error adding student:', error);
        showToast('Failed to add student. Please try again.', 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Add Student Record';
        }
      }
    });
  }
}
