# BolteK Enterprise - Admin Portal Setup Guide

## Overview
The `/job` page provides a private admin portal for managing quotations and internal tasks. It's protected with Firebase authentication and restricted to authorized administrators only.

---

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a new project"
3. Enter project name: `BolteK Enterprise`
4. Disable Google Analytics (optional)
5. Click "Create project"
6. Wait for project creation to complete

---

## Step 2: Enable Email/Password Authentication

1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Click **Email/Password** provider
5. Toggle on "Enable"
6. Leave "Email link (passwordless sign-in)" disabled
7. Click **Save**

---

## Step 3: Enable Firestore Database

1. In Firebase Console, go to **Firestore Database** (left sidebar)
2. Click **Create database**
3. Start in **Production mode** (we will configure security rules later) or **Test mode** for development
4. Choose a location closest to Nepal (e.g., `asia-south1` or `asia-southeast1`)
5. Click **Enable**

---

## Step 3.5: Configure Firestore Security Rules

To prevent permission errors during admin authorization checks, you must configure the Firestore Security Rules:

1. In the Firebase Console, navigate to **Firestore Database** (left sidebar).
2. Go to the **Rules** tab at the top.
3. Replace the default rules with the rules defined in the [firestore.rules](file:///d:/SAAS/BolteK/firestore.rules) file in the root of the project.
4. Click **Publish** to save and apply the rules.

---

## Step 4: Get Firebase Configuration

1. In Firebase Console, click the **Settings** icon (⚙️) → **Project settings**
2. Scroll down to find **SDK setup and configuration**
3. Copy your Firebase config values and paste them into your `.env` file:

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## Step 5: Test the Admin Portal

1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:5173/job`
3. You'll see a login form
4. Click "Request Access" to register an admin account
5. The account will automatically be created in the `admin_users` Firestore collection with a 'pending' role.
6. (Optional) To manually grant full admin rights, go to Firebase Firestore, find your document in `admin_users`, and change `role` to `admin`.

---

## Features

### Quotations Manager
- ✅ Create, edit, delete quotations
- ✅ Select services and auto-calculate pricing
- ✅ Set quotation status (Draft, Sent, Accepted, Rejected)
- ✅ Store client details, location, building type
- ✅ View all quotations with filtering

**Services & Pricing:**
- Fire Hydrant System: ₨50,000
- Fire Sprinkler System: ₨45,000
- Fire Alarm System: ₨35,000
- Fire Suppression System: ₨60,000
- Annual Maintenance Contract: ₨20,000
- Fire Safety Training: ₨15,000
- Fire Risk Assessment: ₨25,000

### Internal Tasks Manager
- ✅ Create, edit, delete tasks
- ✅ Categorize: Maintenance, Installation, Training, Site Visit, Follow-up
- ✅ Set priority: Low, Medium, High, Urgent
- ✅ Assign to team members
- ✅ Track status: Pending, In Progress, Completed, On Hold
- ✅ Set due dates
- ✅ Filter tasks by status

---

## Database Schema (Firestore)

### Collections

**quotations**
- `client_name`, `client_email`, `client_phone`
- `building_type`, `location`
- `services` (array)
- `total_amount` (number)
- `description`
- `status` (draft, sent, accepted, rejected)
- `created_at`

**internal_tasks**
- `title`, `description`
- `category` (maintenance, installation, training, site_visit, follow_up)
- `priority` (low, medium, high, urgent)
- `assigned_to`, `status`
- `due_date`
- `created_at`

**admin_users**
- Document ID matches Firebase UID
- `email`
- `role` (admin, manager, pending)
- `created_at`

---

## Security Notes

- ✅ Firebase handles authentication completely
- ✅ Firestore Security Rules should restrict access to authorized admins only
- ✅ All data is encrypted in transit (HTTPS/TLS)
- ✅ `/job` route is protected and only accessible when logged in

---

## Troubleshooting

**"Firebase is not configured"**
- Ensure all Firebase config values are in `.env` file
- Restart dev server after updating `.env`

**Quotations/tasks not saving**
- Verify your Firestore database has been created and security rules allow writes.

---

## Accessing Admin Portal

**In Production:**
```
https://boltekenterprise.com/job
```

**In Development:**
```
http://localhost:5173/job
```
