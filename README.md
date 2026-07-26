# TrackFolio AI 🎓🤖

> **AI-Powered Opportunity Tracker & Resume Tailoring Platform for University Students**

![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange)
![Gemini](https://img.shields.io/badge/Google-Gemini-green)
![Railway](https://img.shields.io/badge/Hosted%20on-Railway-purple)

---

## 🌍 Live Demo

🚀 **Live Application:**  
https://trackfolio-ai-production.up.railway.app/

💻 **GitHub Repository:**  
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

## 💭 Why I Built This Project

As a Computer Science student, I observed that many university students struggle to manage multiple internships, scholarships, research opportunities, and hackathons. They often rely on spreadsheets and manually tailor resumes for every application, making the process time-consuming and inefficient.

I built TrackFolio AI to solve this real-world problem by combining opportunity management with AI-powered resume analysis and tailoring in a single platform.

## 👥 Target Users

TrackFolio AI is designed for:

- University Students
- Fresh Graduates
- Internship Applicants
- Scholarship Applicants
- Research Students
- Job Seekers

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

## 🤖 AI Feature & System Instructions

TrackFolio AI uses **Google Gemini Flash** to provide intelligent career assistance.

The AI performs:

- Resume Parsing
- ATS Resume Analysis
- Resume Tailoring
- Cover Letter Generation
- Interview Preparation
- Missing Skills Detection

### Custom System Instructions

The prompts and system instructions used in this project were written specifically for TrackFolio AI.

Key rules include:

- Never invent work experience.
- Never generate fake skills or certifications.
- Never exaggerate qualifications.
- Compare resumes honestly with job descriptions.
- Suggest ATS-friendly improvements.
- Generate personalized cover letters.
- Produce interview questions and application tips.
- Return structured JSON responses for reliable application processing.

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

## 🌐 Deployment

This application is deployed on **Railway**.

The deployment includes:

- React + Vite Frontend
- Express Backend
- Firebase Authentication
- Cloud Firestore Database
- Google Gemini AI Integration

Every push to the `main` branch automatically triggers a new deployment.

### Live URL

https://trackfolio-ai-production.up.railway.app/

---

## 🏗️ Project Architecture

```text
                +----------------------+
                |   React + Vite UI    |
                +----------+-----------+
                           |
                           |
                    HTTP Requests
                           |
                           ▼
                +----------------------+
                |   Express Backend    |
                +----------+-----------+
                           |
              +------------+------------+
              |                         |
              ▼                         ▼
     +----------------+        +------------------+
     | Firebase       |        | Google Gemini AI |
     | Auth &         |        | Resume Analysis  |
     | Firestore      |        | ATS Suggestions  |
     +----------------+        +------------------+
```

# 📸 Application Screenshots


### 🏠 Landing Page
<img width="1920" height="1021" alt="image" src="https://github.com/user-attachments/assets/11932821-f75b-414e-ba99-eb1f51b472b7" />

---

### 📊 Dashboard

<img width="1916" height="908" alt="image" src="https://github.com/user-attachments/assets/79356e2c-fa75-488c-8a35-fa064cc1400a" />


---

### 🎯 Opportunity Management

<img width="1919" height="904" alt="image" src="https://github.com/user-attachments/assets/fca486c5-7538-4e35-b9f1-4c747d4ade5e" />


---

### 📄 Resume Upload & Parsing

<img width="1919" height="897" alt="image" src="https://github.com/user-attachments/assets/42b5973e-ca3d-457f-ba4d-41e1273c9470" />


---

### 🤖 AI Resume Analysis

<img width="1919" height="880" alt="image" src="https://github.com/user-attachments/assets/8de7c283-0f66-4b7b-b255-f4be53a8f326" />


---

### 🚀 AI Resume Tailoring

<img width="1920" height="892" alt="image" src="https://github.com/user-attachments/assets/1f521e86-4a49-4c20-bddb-00e764d17215" />


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

# Acknowledgements

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
