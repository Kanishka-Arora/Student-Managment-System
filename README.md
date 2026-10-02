# 🎓 Student Management System

A modern, responsive, web-based Student Management System built with **Vanilla HTML5, CSS3, and ES6+ JavaScript**, fully integrated with **Firebase Authentication** and **Firebase Firestore Database**.

Designed specifically for educational institutions, academies, and administrators to streamline student admissions, track enrollments, analyze demographic metrics, and manage academic records through an intuitive dashboard.

---

## 🌟 Key Features

1. **🔐 Admin Authentication**
   - Firebase Authentication with Email & Password.
   - Protected route guards redirecting unauthenticated visitors to the login portal.
   - Persistent session state and clean logout workflow.
   - Quick one-click demo credentials for immediate evaluator preview.

2. **📊 Comprehensive Dashboard**
   - **Total Students** registered counter.
   - **Active vs. Inactive Students** tracking with percentage calculation.
   - **Average Age** dynamically computed from student birth dates.
   - **Department & Course Distribution** breakdown.
   - **Recent Admissions Table** showing latest enrollments with quick links.

3. **📝 Student Registration (Add Student)**
   - Structured registration form with live field validation.
   - Auto-generated unique Student IDs (e.g. `STU-2026-XXXX`).
   - Fields captured:
     - `studentId`, `name`, `email`, `phone`, `dateOfBirth`, `gender`
     - `course`, `department`, `semester`, `address`, `enrollmentDate`, `status`, `createdAt`

4. **👥 Student Directory & Management**
   - Clean data table with student avatar initials, badges, and academic details.
   - **Dynamic Live Search**: Instant filtering by Name, Student ID, or Email.
   - **Multi-Parameter Dropdown Filters**: Filter by Department, Course, Semester, or Status simultaneously without page reload.
   - **View Profile Modal**: Clean profile-card layout detailing personal, contact, and academic history.
   - **Edit Student Modal**: In-place edits pre-filled with existing data and validation.
   - **Delete Confirmation Dialog**: Modal prompt preventing accidental deletions.

5. **🎨 Professional Modern UI/UX**
   - Custom CSS design system using the Plus Jakarta Sans typography.
   - Vibrant yet accessible color palette (Indigo `#4F46E5`, Teal/Emerald `#10B981`, Slate neutrals).
   - Fully responsive sidebar navigation with mobile drawer backdrop and responsive tables.
   - Interactive Toast notification system (Success, Error, Warning, Info).

---

## 🛠️ Technologies Used

- **Frontend**: HTML5, Vanilla CSS3 (Custom Design System, CSS Variables, Flexbox/Grid), ES6+ JavaScript Modules.
- **Backend / Database**: Google Firebase Firestore (Modular SDK v10).
- **Authentication**: Firebase Authentication (Email/Password Provider).
- **Icons & Typography**: Clean SVG icons, Google Fonts (Plus Jakarta Sans).

---

## 📁 Project Structure

```text
student-management-system/
│
├── index.html              # Admin Login Portal
├── dashboard.html          # Overview dashboard with analytics & recent admissions
├── students.html           # Full student table with search, filters & modals
├── add-student.html        # Comprehensive student registration form
├── settings.html           # Firebase inspector, data tools & backup export
├── firestore.rules         # Production Firestore security rules
├── README.md               # Detailed setup and deployment guide
│
├── css/
│   ├── style.css           # Design tokens, buttons, form controls, toasts, modals
│   ├── dashboard.css       # Sidebar, topbar, metric cards, data tables, profile card
│   └── responsive.css      # Breakpoints for tablet and mobile devices
│
└── js/
    ├── firebase-config.js  # Firebase v10 Modular SDK initialization & unified service layer
    ├── auth.js             # Route protection, login/logout logic, profile display
    ├── dashboard.js        # Analytics calculation, counters & recent students loader
    ├── students.js         # Firestore CRUD, live multi-filtering & modal controllers
    └── utils.js            # Toast notifications, modal helpers, formatters, validation
```

---

## 🚀 Setting Up Firebase

Follow these steps to connect your own Firebase project:

### 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or **Create a project**).
3. Name your project (e.g. `student-management-system`) and click **Continue**.
4. Disable or enable Google Analytics (optional) and click **Create Project**.

### 2. Enable Firebase Authentication
1. In your Firebase Console side menu, navigate to **Build** > **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, select **Email/Password**.
4. Enable the **Email/Password** toggle and click **Save**.
5. Under the **Users** tab, click **Add user** to create your admin account:
   - Email: `admin@school.edu` (or your preferred admin email)
   - Password: Choose a secure password (min. 6 characters)

### 3. Create Cloud Firestore Database
1. In the side menu, navigate to **Build** > **Firestore Database**.
2. Click **Create database**.
3. Choose a location close to your users and click **Next**.
4. Select **Start in test mode** for local development (or start in production mode).
5. Go to the **Rules** tab and paste the contents of `firestore.rules`:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /students/{studentId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
6. Click **Publish**.

### 4. Insert Your Firebase Configuration
1. In the Firebase Console, click the **Project Settings** (gear icon next to Project Overview).
2. Under the **General** tab, scroll down to **Your apps** and click the **Web icon (`</>`)**.
3. Register your app with a nickname (e.g., `SMS Web App`).
4. Copy the `firebaseConfig` object and paste it into [`js/firebase-config.js`](js/firebase-config.js):

```javascript
export const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};
```

> **Note:** Until you paste real Firebase keys, the application automatically operates in **Interactive Demo/LocalStorage Mode**, allowing full out-of-the-box testing and evaluation of all features without throwing missing credential errors!

---

## 💻 Running the Project Locally

Because the project uses ES6 JavaScript Modules (`import`/`export`), it should be served via a local HTTP server (rather than opened directly via `file://`).

### Option 1: Using Python (Pre-installed on most systems)
```bash
# In the project directory:
python -m http.server 8000
```
Open your browser at `http://localhost:8000`.

### Option 2: Using Node.js `npx http-server`
```bash
npx http-server -p 8000 -c-1
```
Open your browser at `http://localhost:8000`.

### Option 3: VS Code Live Server
Right-click `index.html` in VS Code and select **"Open with Live Server"**.

---

## 🌐 Deployment Guide

### Deploying to Firebase Hosting
1. Install the Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. Log in and initialize:
   ```bash
   firebase login
   firebase init hosting
   ```
3. When prompted:
   - What do you want to use as your public directory? Enter: `.` (current directory)
   - Configure as a single-page app? Enter: `No`
   - Set up automatic builds with GitHub? Enter: `No`
4. Deploy:
   ```bash
   firebase deploy --only hosting
   ```

### Deploying to GitHub Pages or Vercel
- **GitHub Pages**: Push this repository to GitHub, go to **Settings** > **Pages**, and set the branch to `main` (root folder `/`).
- **Vercel**: Import the GitHub repository into [Vercel](https://vercel.com) as a static site and click **Deploy**.

---

## 🔒 Security Best Practices

- **Zero Hardcoded Secrets**: Only public Firebase Web SDK configuration is included in client files; sensitive admin operations are guarded by Firebase Auth tokens.
- **Firestore Security Rules**: The provided `firestore.rules` enforces that only authenticated users (`request.auth != null`) can read, create, modify, or delete documents in the `students` collection.
- **Route Protection**: Client-side auth guards monitor Firebase session state on every page load and redirect unauthorized requests to the login screen.
