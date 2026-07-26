# TrackFolio AI 🎓🤖

> **AI-Powered Opportunity Tracker & Resume Tailoring Platform for University Students**

![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange)
![Gemini](https://img.shields.io/badge/Google-Gemini-green)
![Railway](https://img.shields.io/badge/Hosted%20on-Railway-purple)

---

# 🌍 Live Demo

### 🚀 Live Application

https://trackfolio-ai-production.up.railway.app/

### 💻 Public GitHub Repository

https://github.com/Ayesha-Mangi/trackfolio-ai

---

# 📖 About the Project

TrackFolio AI is a comprehensive full-stack web application designed specifically for university students, researchers, and job seekers. It centralizes application tracking across internships, full-time jobs, scholarships, research positions, and hackathons while offering AI-driven ATS fit analysis, resume parsing, cover letter generation, and interview preparation powered by Google Gemini.

This project was developed as an original solution to a real problem faced by students who manage multiple opportunities and struggle to tailor resumes for different applications.

---

# 📌 Problem Statement

University students apply to dozens of internships, scholarships, graduate programs, hackathons, and research opportunities each semester. Managing these applications across spreadsheets and scattered documents often leads to:

- Missed deadlines
- Poor organization
- Generic resumes
- Low ATS (Applicant Tracking System) compatibility
- Difficulty preparing customized applications

## 💡 Solution

TrackFolio AI solves these problems by:

- Centralizing application tracking
- Organizing multiple resumes
- Using AI to analyze resumes against job descriptions
- Generating ATS-friendly resume improvements
- Creating personalized cover letters
- Preparing interview questions and application tips

---

# ✨ Features

## 🎯 Opportunity Management

- Track Internships, Jobs, Scholarships, Research Opportunities, and Hackathons
- Add, Edit and Delete Opportunities
- Status Tracking (Wishlist, Applied, Interviewing, Offer, Rejected)
- Deadline Monitoring
- Search & Filter Opportunities
- Organized Dashboard

---

## 📄 Resume Library

- Upload PDF resumes
- Upload DOCX resumes
- Store Multiple Resume Versions
- Resume Management
- Resume Editing

---

## 🤖 AI Resume Parser

Upload a PDF or DOCX resume and automatically extract:

- Contact Information
- Professional Summary
- Skills
- Education
- Experience
- Projects
- Certifications

---

## 🧠 AI Resume Analysis

Compare a resume against a job description and generate:

- ATS Fit Score
- Match Summary
- Missing Skills
- Missing Keywords
- Resume Suggestions
- Tailored Cover Letter
- Interview Questions
- Application Tips

---

## 🚀 AI Resume Tailoring

Generate an ATS-friendly optimized resume specifically for the selected opportunity while ensuring:

- No fake experience
- No fake skills
- No fake projects
- No fake certifications

---

# 🤖 AI Feature & System Instructions

TrackFolio AI uses **Google Gemini Flash** as its AI engine.

The AI follows carefully designed system instructions, including:

- Never invent work experience.
- Never generate fake projects.
- Never create fake certifications.
- Never add fake skills.
- Never exaggerate qualifications.
- Analyze resumes honestly.
- Compare resumes against job descriptions.
- Suggest ATS-friendly improvements.
- Generate personalized cover letters.
- Generate interview questions.
- Return structured JSON responses for reliable processing.

These instructions ensure the AI provides truthful, practical, and useful recommendations.

---

# 🛠 Tech Stack

## Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS v4
- React Router v6
- Lucide React
- Motion

## Backend

- Node.js
- Express.js

## Database

- Firebase Cloud Firestore

## Authentication

- Firebase Authentication

## Artificial Intelligence

- Google Gemini Flash
- @google/genai SDK

## File Processing

- pdf-parse
- mammoth

---

# ⚙️ Environment Variables

Create a `.env` file using the provided `.env.example`.

```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> ⚠️ Never commit API keys or secrets to GitHub. Keep them in environment variables.

---

# 🚀 Running Locally

## Prerequisites

- Node.js (v18 or later)
- npm

## Installation

Clone the repository

```bash
git clone https://github.com/Ayesha-Mangi/trackfolio-ai.git
```

Move into the project

```bash
cd trackfolio-ai
```

Install dependencies

```bash
npm install
```

Run the development server

```bash
npm run dev
```

Open your browser

```
http://localhost:3000
```

---

# 🔥 Firebase Setup

1. Create a Firebase Project.
2. Enable Firebase Authentication.
3. Enable Email/Password Authentication.
4. (Optional) Enable Google Sign-In.
5. Create a Firestore Database.
6. Add Firebase configuration values to the `.env` file.
7. Add your deployed Railway domain to Firebase Authorized Domains.

---

# 🌐 Deployment

This project is deployed publicly using **Railway**.

Deployment includes:

- React + Vite Frontend
- Express Backend
- Firebase Authentication
- Firestore Database
- Google Gemini API

### Live URL

https://trackfolio-ai-production.up.railway.app/

---

# 📸 Application Screenshots

> Replace the placeholders below with actual screenshots before submission.

### 🏠 Landing Page

(Add Screenshot)

---

### 📊 Dashboard

(Add Screenshot)

---

### 🎯 Opportunity Management

(Add Screenshot)

---

### 📄 Resume Upload & Parsing

(Add Screenshot)

---

### 🤖 AI Resume Analysis

(Add Screenshot)

---

### 🚀 AI Resume Tailoring

(Add Screenshot)

---

# 🔮 Future Improvements

- Email reminder notifications
- Calendar integration
- Chrome Extension
- Drag-and-drop Kanban Board
- Resume Version Comparison
- Export analytics reports
- Multi-language support

---

# 🙏 Acknowledgements

This project uses the following technologies:

- React
- Vite
- Firebase
- Google Gemini
- Railway
- Tailwind CSS
- Express.js

Special thanks to the open-source community for providing the tools and libraries that made this project possible.

---

# 👩‍💻 Author

**Ayesha Mangi**

BS Computer Science Student

---

# 📄 License

This project is licensed under the MIT License.
