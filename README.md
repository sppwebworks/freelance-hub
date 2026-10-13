# 💼 FreelanceHub

> A full-stack freelance marketplace where clients post jobs and freelancers apply with resumes — built with the MERN stack.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2-764ABC?logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 What Is This?

FreelanceHub is a **two-sided marketplace** connecting clients with freelancers. Clients post jobs; freelancers browse, filter, save, and apply with resumes. Real-time updates keep everyone in sync — no page refreshes needed.

**Built to solve:** Small teams coordinating via WhatsApp and Excel spreadsheets lose track of who's hiring, who applied, and what the status is. FreelanceHub gives them a clean, fast, self-hostable alternative — no per-user fees.

---

## ✨ Features

### 🔐 Authentication & Roles
- JWT-based login/register with bcrypt hashing
- Two roles with distinct dashboards: **Client** and **Freelancer**
- Session persistence across page refreshes
- Password validation and email uniqueness checks

### 💼 Jobs
- Browse all open jobs (public)
- Filter by category, experience level, skills, budget range, remote-only
- Full-text search across title, company, and description
- Sort by recent, oldest, budget (high/low)
- Live filter counts computed via MongoDB aggregations
- Post, edit, close/reopen, and delete jobs (clients only)
- Live preview while creating a job

### 📨 Applications
- Apply to jobs with a **resume upload** (PDF/DOC/DOCX/JPG/PNG, max 5MB)
- Cover letter, proposed rate, estimated delivery, portfolio URL
- Clients see all applicants for their jobs with skills preview
- Clients can **download resumes**, update status (pending → reviewed → shortlisted → rejected → hired)
- Freelancers can **withdraw** pending applications
- Filters, search, and sort on application lists

### 👤 Profiles
- Edit name, location, bio
- Freelancers can set hourly rate and skills
- Dirty-state detection with unsaved-changes warning
- Account info panel (email, role, member since)

### ⚡ Real-Time
- Socket.IO for live application notifications
- Client sees applicants appear as freelancers apply
- Freelancer sees status changes instantly

### 🎨 Polish
- Dark/light theme toggle (persisted)
- Toast notifications for every action
- Loading skeletons (no blank screens)
- Error boundaries with friendly fallbacks
- Fully responsive — mobile-first, tested down to 360px
- Accessible — keyboard nav, aria labels, semantic HTML

### 🔒 Security
- Helmet.js — 12+ security headers
- Rate limiting — global, auth-specific, and upload-specific
- express-mongo-sanitize — NoSQL injection prevention
- CORS whitelist — only allowed client origins
- Environment validation — fail fast on missing vars
- JWT expiry (7 days)

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React 18, Redux Toolkit, React Router v6, Axios, Vite, CSS3 (custom properties) |
| **Backend** | Node.js, Express 4, Mongoose 8, JWT, bcryptjs, Multer, Socket.IO |
| **Database** | MongoDB (local or MongoDB Atlas) |
| **Deployment** | Render (backend), Netlify (frontend), MongoDB Atlas (database) |

---

## 📸 Screenshots

> **Add screenshots to `docs/screenshots/` and update paths below.**

### 🏠 Home — Job Browser
![Home](./docs/screenshots/01-home.png)

### 🔍 Job Detail
![Job Detail](./docs/screenshots/02-job-detail.png)

### 📝 Post a Job (with live preview)
![Post Job](./docs/screenshots/03-post-job.png)

### 📤 Apply Modal (with resume upload)
![Apply Modal](./docs/screenshots/04-apply-modal.png)

### 📥 Client View — Received Applications
![Received Applications](./docs/screenshots/05-received-applications.png)

### 📋 My Jobs Dashboard
![My Jobs](./docs/screenshots/06-my-jobs.png)

### 👤 Profile Page
![Profile](./docs/screenshots/07-profile.png)

### 🌙 Dark Mode
![Dark Mode](./docs/screenshots/08-dark-mode.png)

### 📱 Mobile Responsive
![Mobile](./docs/screenshots/09-mobile.png)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local) or MongoDB Atlas account
- Git

### 1. Clone the repo

```bash
git clone https://github.com/sppwebworks/freelance-hub.git
cd freelance-hub