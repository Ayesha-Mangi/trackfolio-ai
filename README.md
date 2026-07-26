# TrackFolio AI 🎓🤖
> **AI-Powered Opportunity Tracker & Resume Tailoring Platform for University Students**

TrackFolio AI is a comprehensive full-stack application designed specifically for university students, researchers, and job seekers. It centralizes application tracking across internships, full-time jobs, scholarships, research positions, and hackathons while offering AI-driven ATS fit analysis, resume parsing, cover letter generation, and interview preparation powered by Google Gemini.

---

## 📌 Problem Statement

University students apply to dozens of internships, scholarships, and graduate programs each semester. Managing these opportunities across spreadsheets and scattered files leads to missed deadlines, generic application submissions, and low ATS (Applicant Tracking System) response rates.

**TrackFolio AI solves this by:**
1. **Centralizing Applications:** A unified Kanban-style and table dashboard with deadline alerts and status tracking.
2. **AI Resume Parsing & Matching:** Instant PDF/Word document parser that extracts structured experience and compares it against job descriptions using Google Gemini.
3. **Automated Tailoring:** Generating personalized cover letters, missing keyword analysis, resume bullet recommendations, and interview prep questions.

---

## ✨ Key Features

### 🎯 Opportunity Management
- **Multi-Category Tracking:** Organize Internships, Full-Time Jobs, Scholarships, Research, and Hackathons.
- **Visual Analytics:** Interactive status breakdown (Wishlist, Applied, Interviewing, Offer, Rejected).
- **Deadline Monitoring:** Color-coded urgency indicators for upcoming deadlines.
- **Search & Filter:** Instant search by company/title, location type (Remote, Hybrid, Onsite), and status filters.

### 📄 Resume Library & AI Auto-Parsing
- **Document Upload:** Upload existing PDF (`.pdf`) or Word (`.docx`) resumes up to 5 MB.
- **Instant AI Extraction:** Automatically parses contact info, professional summary, skills, education, experience, projects, and certifications.
- **Multi-Resume Support:** Store multiple tailored versions for different roles (e.g., Software Engineer, Data Analyst, Research Assistant).
- **Export Capabilities:** Download generated or updated resumes as raw content, PDF, or Word documents.

### 🧠 Gemini AI Intelligence Hub
- **ATS Fit Score:** Multi-factor match scoring algorithm evaluating skills, experience depth, and keyword overlap.
- **Missing Skills & Keywords:** Identifies exact technical and soft skills absent from your resume relative to the target position.
- **Resume Bullet Suggestions:** Generates high-impact action bullets tailored specifically to the opportunity description.
- **Cover Letter Builder:** Custom-tailored, professional cover letter drafting in seconds.
- **Interview Preparation:** Generates realistic behavioral and technical interview questions with recommended sample answers.
- **Historical Analysis Storage:** Save and revisit AI analysis reports per application.

---

## 🛠️ Tech Stack

### Frontend & Styling
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (v4)
- **Icons:** Lucide React
- **Routing:** React Router v6
- **Animations:** Motion / Tailwind Transitions

### Backend & AI APIs
- **Runtime Environment:** Node.js Express server (`server.ts`)
- **AI Engine:** `@google/genai` (Gemini 3.6 Flash)
- **File Parsing:** `pdf-parse` (PDF extraction) & `mammoth` (Word document parsing)

### Database & Authentication
- **Database:** Firebase Cloud Firestore
- **Authentication:** Firebase Auth (Email/Password & Session Management)

---

## ⚙️ Environment Variables Setup

Before running the application, create a `.env` file in the root directory (refer to `.env.example`):

```env
# Google Gemini API Key (Server-Side)
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration (Client-Side)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/trackfolio-ai.git
   cd trackfolio-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

---

##  🔥 Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Firebase Authentication** with Email/Password sign-in.
3. Provision a **Cloud Firestore Database** in test/production mode.
4. Add the generated Firebase web configuration keys to your `.env` file (`VITE_FIREBASE_*`).

---

## 🌐 Deployment

The application is structured for seamless full-stack deployment on platforms like Cloud Run, Vercel, or Render.

```bash
# Production Build
npm run build

# Start Production Server
npm run start
```

---

## 📸 Application Screenshots

| Dashboard Overview | AI Analysis Hub |
| :---: | :---: |
| Application status breakdown, deadline alerts & opportunity pipeline | ATS match score, missing keywords & tailored cover letters |

| Resume Library | AI Upload Parser |
| :---: | :---: |
| Version control for tailored resumes & quick actions | PDF/Word document drag-and-drop auto-extraction |

---

## 🔮 Future Improvements

- [ ] **Email Notification Alerts:** Automated email notifications for deadlines in 3, 2, and 1 day.
- [ ] **Chrome Extension:** One-click opportunity saving directly from LinkedIn, Indeed, and Handshake.
- [ ] **Interactive Kanban View:** Drag-and-drop card columns for opportunity status progression.
- [ ] **Exportable Analytics Reports:** Export monthly career metrics as PDF summaries.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
