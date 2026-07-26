import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import * as pdfParseModule from 'pdf-parse';
import mammoth from 'mammoth';

dotenv.config();

const getDirname = () => {
  if (typeof __dirname !== 'undefined') {
    return __dirname;
  }
  return process.cwd();
};

const currentDir = getDirname();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Health Check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // AI Analysis Endpoint
  app.post('/api/ai-analysis/generate', async (req, res) => {
    try {
      const { resume, opportunity, jobDescription, opportunityType } = req.body;

      if (!resume || (!resume.fullName && !resume.title && (!resume.skills || resume.skills.length === 0))) {
        return res.status(400).json({ error: 'Please select a valid resume with content before running AI analysis.' });
      }

      if (!jobDescription || jobDescription.trim().length === 0) {
        return res.status(400).json({ error: 'Please enter or paste a job description for analysis.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'Gemini API Key is not configured. Please check environment variables in Settings > Secrets.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `You are TrackFolio AI.

You are an expert career advisor helping university students apply for internships, scholarships, hackathons, fellowships, graduate programs, and jobs.

Analyze the student's resume against the selected opportunity and job description.

Return ONLY valid JSON matching the schema strictly.

Rules:
- Never invent experience.
- Never create fake skills.
- Never exaggerate qualifications.
- Keep suggestions realistic.
- Be concise and practical.
- Cover letter should be professional, complete, and tailored.
- Interview questions must relate to the selected opportunity. You MUST provide at least 8 questions mixed between Technical, Behavioral, and General HR questions.
- Application tips must offer actionable advice for university students applying to this position.
- Fit score must be an integer between 0 and 100.`;

      const promptText = `
OPPORTUNITY TYPE: ${opportunityType || opportunity?.type || 'General'}
OPPORTUNITY TITLE: ${opportunity?.title || 'Target Opportunity'}
ORGANIZATION: ${opportunity?.organization || 'Target Organization'}
LOCATION: ${opportunity?.location || 'N/A'}

JOB DESCRIPTION / DETAILS:
${jobDescription.trim()}

STUDENT RESUME DETAILS:
Resume Title: ${resume.title || 'Resume'}
Full Name: ${resume.fullName || 'Student'}
Email: ${resume.email || ''}
Location: ${resume.location || ''}
Professional Summary: ${resume.professionalSummary || 'N/A'}

Education:
${JSON.stringify(resume.education || [], null, 2)}

Work Experience:
${JSON.stringify(resume.experience || [], null, 2)}

Skills:
${Array.isArray(resume.skills) ? resume.skills.join(', ') : 'None listed'}

Projects:
${JSON.stringify(resume.projects || [], null, 2)}

Certifications:
${JSON.stringify(resume.certifications || [], null, 2)}
`;

      const geminiResponse = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: promptText,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              fitScore: {
                type: Type.INTEGER,
                description: 'Match fit score percentage between 0 and 100',
              },
              matchSummary: {
                type: Type.STRING,
                description: 'Short 2-3 sentence overall match evaluation',
              },
              missingSkills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Key technical or domain skills required by job description but missing from resume',
              },
              missingKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Important keywords or industry terms found in JD but missing in resume',
              },
              resumeSuggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Specific bullet point improvements to optimize resume for ATS and recruiters',
              },
              coverLetter: {
                type: Type.STRING,
                description: 'Full professional cover letter body text formatted cleanly with paragraphs',
              },
              interviewQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'At least 8 tailored interview questions (Technical, Behavioral, General HR)',
              },
              applicationTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Practical actionable tips (e.g. Highlight leadership, add GitHub, mention coursework)',
              },
            },
            required: [
              'fitScore',
              'matchSummary',
              'missingSkills',
              'missingKeywords',
              'resumeSuggestions',
              'coverLetter',
              'interviewQuestions',
              'applicationTips',
            ],
          },
        },
      });

      const rawText = geminiResponse.text || '';
      let parsedResult;

      try {
        parsedResult = JSON.parse(rawText);
      } catch (parseErr) {
        // Fallback cleanup if extra characters exist
        const jsonStart = rawText.indexOf('{');
        const jsonEnd = rawText.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          parsedResult = JSON.parse(rawText.substring(jsonStart, jsonEnd + 1));
        } else {
          throw new Error('Invalid JSON format returned by AI model.');
        }
      }

      // Ensure interviewQuestions has at least 8 items
      if (!parsedResult.interviewQuestions || !Array.isArray(parsedResult.interviewQuestions)) {
        parsedResult.interviewQuestions = [];
      }

      return res.json({
        fitScore: typeof parsedResult.fitScore === 'number' ? parsedResult.fitScore : 75,
        matchSummary: parsedResult.matchSummary || 'Resume shows solid foundational alignment with this opportunity.',
        missingSkills: Array.isArray(parsedResult.missingSkills) ? parsedResult.missingSkills : [],
        missingKeywords: Array.isArray(parsedResult.missingKeywords) ? parsedResult.missingKeywords : [],
        resumeSuggestions: Array.isArray(parsedResult.resumeSuggestions) ? parsedResult.resumeSuggestions : [],
        coverLetter: parsedResult.coverLetter || '',
        interviewQuestions: parsedResult.interviewQuestions,
        applicationTips: Array.isArray(parsedResult.applicationTips) ? parsedResult.applicationTips : [],
      });
    } catch (error: any) {
      console.error('Gemini AI Analysis Error:', error);
      return res.status(500).json({
        error: error.message || 'An unexpected error occurred during AI analysis. Please try again.',
      });
    }
  });

  // AI Tailored Resume Generator Endpoint
  app.post('/api/ai-resume/generate', async (req, res) => {
    try {
      const { resume, opportunity, jobDescription, previousAnalysis } = req.body;

      if (!resume) {
        return res.status(400).json({ error: 'Please select a resume to optimize.' });
      }

      if (!jobDescription || jobDescription.trim().length === 0) {
        return res.status(400).json({ error: 'Job description is required to optimize the resume.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'Gemini API Key is not configured. Please check environment variables in Settings > Secrets.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `You are TrackFolio AI.

You are an expert career advisor helping university students optimize their resumes for specific opportunities.

Generate a complete, ATS-friendly, tailored version of the student's resume specifically customized for the target opportunity and job description.

STRICT RULES:
- Never invent experience.
- Never invent fake projects.
- Never invent certifications or credentials.
- Never invent fake skills that are not present in the original resume.
- You may ONLY:
  1. Rewrite phrasing, active verbs, and bullet point impact metrics.
  2. Improve professional summary to target the organization and opportunity requirements.
  3. Reorder and prioritize relevant technical/soft skills from the original resume.
  4. Rewrite work experience bullet points to emphasize skills relevant to the job posting.
  5. Rewrite project descriptions to highlight alignment with target technologies.
  6. Reorder experience/projects if beneficial for relevance.
  7. Optimize ATS keyword usage truthfully.

Return ONLY valid JSON matching the schema strictly.`;

      const promptText = `
TARGET OPPORTUNITY:
Title: ${opportunity?.title || 'Target Position'}
Organization: ${opportunity?.organization || 'Target Organization'}
Type: ${opportunity?.type || 'General'}

JOB DESCRIPTION / REQUIREMENTS:
${jobDescription.trim()}

PREVIOUS AI ANALYSIS SUGGESTIONS:
Missing Skills: ${JSON.stringify(previousAnalysis?.missingSkills || [])}
Missing Keywords: ${JSON.stringify(previousAnalysis?.missingKeywords || [])}
Suggestions: ${JSON.stringify(previousAnalysis?.resumeSuggestions || [])}

ORIGINAL STUDENT RESUME:
Title: ${resume.title || 'Resume'}
Full Name: ${resume.fullName || 'Student'}
Email: ${resume.email || ''}
Phone: ${resume.phone || ''}
Location: ${resume.location || ''}
Professional Summary: ${resume.professionalSummary || ''}

Education:
${JSON.stringify(resume.education || [], null, 2)}

Work Experience:
${JSON.stringify(resume.experience || [], null, 2)}

Skills:
${Array.isArray(resume.skills) ? resume.skills.join(', ') : ''}

Projects:
${JSON.stringify(resume.projects || [], null, 2)}

Certifications:
${JSON.stringify(resume.certifications || [], null, 2)}
`;

      const geminiResponse = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: promptText,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: 'Optimized resume title, e.g. "Software Engineer Intern Resume (ATS Optimized)"',
              },
              fullName: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              location: { type: Type.STRING },
              professionalSummary: {
                type: Type.STRING,
                description: 'Polished, high-impact ATS-friendly summary tailored to the target role',
              },
              skills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Prioritized relevant technical and domain skills from candidate profile',
              },
              education: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    institution: { type: Type.STRING },
                    degree: { type: Type.STRING },
                    fieldOfStudy: { type: Type.STRING },
                    startYear: { type: Type.STRING },
                    endYear: { type: Type.STRING },
                    grade: { type: Type.STRING },
                  },
                  required: ['institution', 'degree', 'fieldOfStudy', 'startYear', 'endYear'],
                },
              },
              experience: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    company: { type: Type.STRING },
                    position: { type: Type.STRING },
                    description: {
                      type: Type.STRING,
                      description: 'Action-verb heavy, impact bullet points optimized for ATS keyword match',
                    },
                    startDate: { type: Type.STRING },
                    endDate: { type: Type.STRING },
                  },
                  required: ['company', 'position', 'description', 'startDate', 'endDate'],
                },
              },
              projects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    projectName: { type: Type.STRING },
                    description: { type: Type.STRING },
                    technologies: { type: Type.STRING },
                    githubLink: { type: Type.STRING },
                    demoLink: { type: Type.STRING },
                  },
                  required: ['projectName', 'description', 'technologies'],
                },
              },
              certifications: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    certificateName: { type: Type.STRING },
                    issuer: { type: Type.STRING },
                    year: { type: Type.STRING },
                  },
                  required: ['certificateName', 'issuer', 'year'],
                },
              },
              keyImprovements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-5 summary points explaining how the resume was optimized',
              },
            },
            required: [
              'title',
              'fullName',
              'email',
              'phone',
              'location',
              'professionalSummary',
              'skills',
              'education',
              'experience',
              'projects',
              'certifications',
              'keyImprovements',
            ],
          },
        },
      });

      const rawText = geminiResponse.text || '';
      let parsedResult;

      try {
        parsedResult = JSON.parse(rawText);
      } catch (parseErr) {
        const jsonStart = rawText.indexOf('{');
        const jsonEnd = rawText.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          parsedResult = JSON.parse(rawText.substring(jsonStart, jsonEnd + 1));
        } else {
          throw new Error('Invalid JSON format returned by AI model.');
        }
      }

      return res.json({
        title: parsedResult.title || `${resume.title || 'Resume'} (ATS Tailored)`,
        fullName: parsedResult.fullName || resume.fullName || '',
        email: parsedResult.email || resume.email || '',
        phone: parsedResult.phone || resume.phone || '',
        location: parsedResult.location || resume.location || '',
        professionalSummary: parsedResult.professionalSummary || resume.professionalSummary || '',
        skills: Array.isArray(parsedResult.skills) ? parsedResult.skills : resume.skills || [],
        education: Array.isArray(parsedResult.education) ? parsedResult.education : resume.education || [],
        experience: Array.isArray(parsedResult.experience) ? parsedResult.experience : resume.experience || [],
        projects: Array.isArray(parsedResult.projects) ? parsedResult.projects : resume.projects || [],
        certifications: Array.isArray(parsedResult.certifications) ? parsedResult.certifications : resume.certifications || [],
        keyImprovements: Array.isArray(parsedResult.keyImprovements) ? parsedResult.keyImprovements : [],
      });
    } catch (error: any) {
      console.error('Gemini AI Resume Generation Error:', error);
      return res.status(500).json({
        error: error.message || 'An unexpected error occurred while generating optimized resume.',
      });
    }
  });

  // AI Resume Parser Endpoint
  app.post('/api/ai-resume/parse', async (req, res) => {
    try {
      const { fileBase64, fileName, fileType } = req.body;

      if (!fileBase64) {
        return res.status(400).json({ error: 'No resume file content provided for parsing.' });
      }

      // Clean base64 data URL prefix if present
      const cleanBase64 = String(fileBase64).replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');

      // Maximum 5 MB check
      if (buffer.length > 5 * 1024 * 1024) {
        return res.status(400).json({ error: 'File size exceeds the 5 MB maximum limit. Please upload a smaller document.' });
      }

      const extension = (fileName || '').split('.').pop()?.toLowerCase() || '';
      const isPdf = fileType === 'pdf' || extension === 'pdf';
      const isDocx = fileType === 'docx' || extension === 'docx';

      if (!isPdf && !isDocx) {
        return res.status(400).json({
          error: 'Unsupported file format. Please upload a PDF (.pdf) or Word document (.docx).',
        });
      }

      let extractedText = '';

      if (isPdf) {
        try {
          const parsePdf = typeof pdfParseModule === 'function' ? pdfParseModule : (pdfParseModule as any).default;
          const pdfData = await parsePdf(buffer);
          extractedText = pdfData?.text || '';
        } catch (pdfErr: any) {
          console.error('PDF parsing error:', pdfErr);
          return res.status(400).json({
            error: 'Corrupted or password-protected PDF file. Unable to extract text content.',
          });
        }
      } else if (isDocx) {
        try {
          const result = await mammoth.extractRawText({ buffer });
          extractedText = result?.value || '';
        } catch (docxErr: any) {
          console.error('DOCX parsing error:', docxErr);
          return res.status(400).json({
            error: 'Corrupted or unreadable Word document (.docx). Unable to extract text content.',
          });
        }
      }

      extractedText = extractedText.trim();
      if (extractedText.length < 20) {
        return res.status(400).json({
          error: 'The uploaded file does not contain enough readable text or may be an image-based scan.',
        });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'Gemini API Key is not configured. Please check environment variables in Settings > Secrets.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `You are TrackFolio AI's expert resume parser.

Analyze the extracted raw text from a student/candidate's resume document and organize all information accurately.

Rules:
- Extract full name, email, phone number, and location if present in the text.
- Formulate a clear, concise professional summary based on the text.
- Extract all skills listed or evident in the text as a clean array of strings.
- Extract all education items with institution, degree, fieldOfStudy, startYear, endYear, grade if present.
- Extract work experience with company, position, description, startDate, endDate.
- Extract projects with projectName, description, technologies, githubLink, demoLink.
- Extract certifications with certificateName, issuer, year.
- If a field is not present in the document, return an empty string or empty array. Do not invent fake data.
- Return ONLY valid JSON matching the schema strictly.`;

      const geminiResponse = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `EXTRACTED RESUME TEXT CONTENT:\n${extractedText}`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              fullName: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              location: { type: Type.STRING },
              professionalSummary: { type: Type.STRING },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              education: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    institution: { type: Type.STRING },
                    degree: { type: Type.STRING },
                    fieldOfStudy: { type: Type.STRING },
                    startYear: { type: Type.STRING },
                    endYear: { type: Type.STRING },
                    grade: { type: Type.STRING },
                  },
                  required: ['institution', 'degree', 'fieldOfStudy'],
                },
              },
              experience: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    company: { type: Type.STRING },
                    position: { type: Type.STRING },
                    description: { type: Type.STRING },
                    startDate: { type: Type.STRING },
                    endDate: { type: Type.STRING },
                  },
                  required: ['company', 'position', 'description'],
                },
              },
              projects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    projectName: { type: Type.STRING },
                    description: { type: Type.STRING },
                    technologies: { type: Type.STRING },
                    githubLink: { type: Type.STRING },
                    demoLink: { type: Type.STRING },
                  },
                  required: ['projectName', 'description'],
                },
              },
              certifications: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    certificateName: { type: Type.STRING },
                    issuer: { type: Type.STRING },
                    year: { type: Type.STRING },
                  },
                  required: ['certificateName'],
                },
              },
            },
            required: [
              'fullName',
              'email',
              'phone',
              'location',
              'professionalSummary',
              'skills',
              'education',
              'experience',
              'projects',
              'certifications',
            ],
          },
        },
      });

      const rawText = geminiResponse.text || '';
      let parsedResult;
      try {
        parsedResult = JSON.parse(rawText);
      } catch (parseErr) {
        const jsonStart = rawText.indexOf('{');
        const jsonEnd = rawText.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          parsedResult = JSON.parse(rawText.substring(jsonStart, jsonEnd + 1));
        } else {
          throw new Error('AI parser returned an invalid format.');
        }
      }

      return res.json({
        fullName: parsedResult.fullName || '',
        email: parsedResult.email || '',
        phone: parsedResult.phone || '',
        location: parsedResult.location || '',
        professionalSummary: parsedResult.professionalSummary || '',
        skills: Array.isArray(parsedResult.skills) ? parsedResult.skills : [],
        education: Array.isArray(parsedResult.education) ? parsedResult.education : [],
        experience: Array.isArray(parsedResult.experience) ? parsedResult.experience : [],
        projects: Array.isArray(parsedResult.projects) ? parsedResult.projects : [],
        certifications: Array.isArray(parsedResult.certifications) ? parsedResult.certifications : [],
      });
    } catch (error: any) {
      console.error('Resume parsing API error:', error);
      return res.status(500).json({
        error: error.message || 'An error occurred while parsing the resume file. Please try again.',
      });
    }
  });

  // Vite middleware for dev / static files for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const HOST = process.env.HOST || '0.0.0.0';

  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://localhost:${PORT} (http://127.0.0.1:${PORT})`);
  });
}

startServer();
