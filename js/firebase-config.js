/**
 * Student Management System - Firebase Configuration & Unified Service Layer
 * 
 * ============================================================================
 * INSTRUCTIONS FOR CONFIGURING YOUR FIREBASE PROJECT:
 * ============================================================================
 * 1. Go to the Firebase Console: https://console.firebase.google.com/
 * 2. Create a new project (e.g. "Student-Management-System").
 * 3. Under "Build", click "Authentication" -> "Get Started" -> Enable "Email/Password".
 * 4. Under "Build", click "Firestore Database" -> "Create Database" -> Start in "Test mode"
 *    (or configure security rules as provided in firestore.rules).
 * 5. Go to Project Settings (Gear icon) -> General -> "Your apps" -> Click the Web icon (</>).
 * 6. Register your app and copy your `firebaseConfig` object values into the template below.
 * ============================================================================
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ============================================================================
// PASTE YOUR FIREBASE CONFIGURATION HERE:
// ============================================================================
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

/**
 * Check if the user has replaced the default placeholders with real Firebase credentials
 */
export function isFirebaseConfigured() {
  return (
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "YOUR_API_KEY" &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== "YOUR_PROJECT_ID"
  );
}

// Initialized instances
let app = null;
let auth = null;
let db = null;

const isConfigured = isFirebaseConfigured();

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Firebase initialized successfully with live project:", firebaseConfig.projectId);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  console.info(
    "%c[Student Management System] Firebase credentials are not yet set in js/firebase-config.js. Running in Demo/LocalStorage mode for full out-of-the-box evaluation.",
    "color: #4F46E5; font-weight: bold; font-size: 12px;"
  );
}

export { app, auth, db };

// ============================================================================
// UNIFIED DATA ACCESS LAYER (Firestore with graceful Demo/LocalStorage fallback)
// ============================================================================

const LOCAL_STORAGE_KEY = "sms_students_data_v1";
const LOCAL_AUTH_KEY = "sms_demo_auth_user";

// Seed data for initial demo evaluation if Firebase is not yet linked
const INITIAL_DEMO_STUDENTS = [
  {
    id: "demo-doc-1",
    studentId: "STU-2026-1001",
    name: "Aarav Sharma",
    email: "aarav.sharma@example.edu",
    phone: "+91 98765 43210",
    dateOfBirth: "2003-04-15",
    gender: "Male",
    course: "B.Tech Computer Science",
    department: "Engineering",
    semester: "6th",
    address: "124 Tech Park Avenue, Bengaluru, Karnataka",
    enrollmentDate: "2023-08-01",
    status: "Active",
    createdAt: new Date("2023-08-01T10:00:00Z").toISOString()
  },
  {
    id: "demo-doc-2",
    studentId: "STU-2026-1002",
    name: "Sophia Martinez",
    email: "sophia.m@example.edu",
    phone: "+1 (555) 234-5678",
    dateOfBirth: "2004-11-20",
    gender: "Female",
    course: "B.Sc Data Science",
    department: "Science",
    semester: "4th",
    address: "742 Evergreen Terrace, Seattle, WA",
    enrollmentDate: "2024-01-15",
    status: "Active",
    createdAt: new Date("2024-01-15T11:30:00Z").toISOString()
  },
  {
    id: "demo-doc-3",
    studentId: "STU-2026-1003",
    name: "Marcus Chen",
    email: "marcus.chen@example.edu",
    phone: "+1 (555) 345-6789",
    dateOfBirth: "2002-07-08",
    gender: "Male",
    course: "BBA Marketing",
    department: "Business",
    semester: "8th",
    address: "88 Financial Blvd, San Francisco, CA",
    enrollmentDate: "2022-09-01",
    status: "Active",
    createdAt: new Date("2022-09-01T09:15:00Z").toISOString()
  },
  {
    id: "demo-doc-4",
    studentId: "STU-2026-1004",
    name: "Elena Rostova",
    email: "elena.r@example.edu",
    phone: "+44 20 7946 0912",
    dateOfBirth: "2005-01-25",
    gender: "Female",
    course: "B.Des Digital Arts",
    department: "Arts",
    semester: "2nd",
    address: "14 Kensington High St, London, UK",
    enrollmentDate: "2025-08-20",
    status: "Active",
    createdAt: new Date("2025-08-20T14:20:00Z").toISOString()
  },
  {
    id: "demo-doc-5",
    studentId: "STU-2026-1005",
    name: "David Kim",
    email: "david.kim@example.edu",
    phone: "+1 (555) 456-7890",
    dateOfBirth: "2003-09-12",
    gender: "Male",
    course: "B.Tech Mechanical",
    department: "Engineering",
    semester: "5th",
    address: "512 Industry Road, Chicago, IL",
    enrollmentDate: "2023-08-01",
    status: "Inactive",
    createdAt: new Date("2023-08-01T15:00:00Z").toISOString()
  }
];

// Initialize demo storage if needed
function getLocalStorageStudents() {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_STUDENTS));
    return [...INITIAL_DEMO_STUDENTS];
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [...INITIAL_DEMO_STUDENTS];
  }
}

function saveLocalStorageStudents(list) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
}

export const DataService = {
  /**
   * Fetch all student records
   */
  async getAllStudents() {
    if (isConfigured && db) {
      const colRef = collection(db, "students");
      const q = query(colRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const results = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        results.push({
          id: docSnap.id,
          ...data,
          // Format Firestore timestamp if needed
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
        });
      });
      return results;
    } else {
      // Demo / LocalStorage fallback
      return getLocalStorageStudents();
    }
  },

  /**
   * Get single student by ID
   */
  async getStudentById(id) {
    if (isConfigured && db) {
      const docRef = doc(db, "students", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        return {
          id: snap.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
        };
      }
      return null;
    } else {
      const list = getLocalStorageStudents();
      return list.find(s => s.id === id || s.studentId === id) || null;
    }
  },

  /**
   * Add a new student
   */
  async addStudent(studentData) {
    if (isConfigured && db) {
      const colRef = collection(db, "students");
      const docPayload = {
        ...studentData,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(colRef, docPayload);
      return { id: docRef.id, ...studentData };
    } else {
      const list = getLocalStorageStudents();
      const newDoc = {
        id: "local-" + Date.now(),
        ...studentData,
        createdAt: new Date().toISOString()
      };
      list.unshift(newDoc);
      saveLocalStorageStudents(list);
      return newDoc;
    }
  },

  /**
   * Update an existing student
   */
  async updateStudent(id, updatedFields) {
    if (isConfigured && db) {
      const docRef = doc(db, "students", id);
      await updateDoc(docRef, updatedFields);
      return { id, ...updatedFields };
    } else {
      const list = getLocalStorageStudents();
      const index = list.findIndex(s => s.id === id || s.studentId === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...updatedFields };
        saveLocalStorageStudents(list);
        return list[index];
      }
      throw new Error("Student record not found in storage");
    }
  },

  /**
   * Delete a student
   */
  async deleteStudent(id) {
    if (isConfigured && db) {
      const docRef = doc(db, "students", id);
      await deleteDoc(docRef);
      return true;
    } else {
      let list = getLocalStorageStudents();
      list = list.filter(s => s.id !== id && s.studentId !== id);
      saveLocalStorageStudents(list);
      return true;
    }
  },

  /**
   * Reset local storage data back to demo seeds (useful for settings page)
   */
  resetDemoData() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_STUDENTS));
  }
};

// ============================================================================
// AUTHENTICATION SERVICE LAYER
// ============================================================================
export const AuthService = {
  /**
   * Log in user using email and password
   */
  async login(email, password) {
    if (isConfigured && auth) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } else {
      // Demo authentication: Accept demo login credentials or any valid email
      if (email.trim() && password.length >= 6) {
        const demoUser = {
          uid: "demo-admin-uid-999",
          email: email.trim(),
          displayName: "Administrator",
          emailVerified: true
        };
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(demoUser));
        return demoUser;
      } else {
        throw new Error("Invalid email or password (minimum 6 characters).");
      }
    }
  },

  /**
   * Log out currently authenticated user
   */
  async logout() {
    if (isConfigured && auth) {
      await signOut(auth);
    } else {
      localStorage.removeItem(LOCAL_AUTH_KEY);
    }
  },

  /**
   * Subscribe to auth changes or check current user
   */
  getCurrentUser() {
    if (isConfigured && auth) {
      return auth.currentUser;
    } else {
      const raw = localStorage.getItem(LOCAL_AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    }
  },

  onAuthChanged(callback) {
    if (isConfigured && auth) {
      return onAuthStateChanged(auth, callback);
    } else {
      const user = this.getCurrentUser();
      callback(user);
      return () => {};
    }
  }
};
