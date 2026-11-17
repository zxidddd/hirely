import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from './models/User.js';
import Analysis from './models/Analysis.js';
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Authentication required.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token.',
    });
  }
}


import PDFDocument from 'pdfkit';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import { PDFParse } from 'pdf-parse';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const app = express();
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });


const PORT = 5001;
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required.',
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: 'User already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);

    res.status(500).json({
      message: 'Something went wrong while creating the account.',
    });
  }
});
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);

    res.status(500).json({
      message: 'Something went wrong while logging in.',
    });
  }
});

// =========================
// RESUME UPLOAD
// =========================

app.post('/api/upload', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No resume uploaded',
    });
  }

  try {
    const pdfBuffer = fs.readFileSync(req.file.path);

    const parser = new PDFParse({
      data: pdfBuffer,
    });

    const data = await parser.getText();

    console.log('Extracted resume text:');
    console.log(data.text);

    res.json({
      success: true,
      message: 'Resume uploaded and text extracted successfully',
      text: data.text,
    });

  } catch (error) {
    console.error('PDF extraction error:', error);

    res.status(500).json({
      success: false,
      message: 'Could not extract text from PDF',
    });
  }
});


// =========================
// AI RESUME ANALYSIS
// =========================

app.post(
  '/api/analyze',
  authenticateToken,
  async (req, res) => {
  const { resumeText, targetRole, jobDescription } = req.body;

  if (!resumeText) {
    return res.status(400).json({
      success: false,
      message: 'Resume text is required',
    });
  }

  console.log('Resume text received for AI analysis:');
  console.log(resumeText);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',

      contents: `
Analyze the following resume for the target role and job description.

Target Role:
${targetRole || 'Not specified'}

Job Description:
${jobDescription || 'Not provided'}

Resume:
${resumeText}

Return ONLY a valid JSON object.
Do not write any introduction.
Do not use Markdown.
Do not use code fences.
Do not explain the answer.

Use exactly this structure:

{
  "candidateName": "",
  "overallScore": 0,
  "atsCompatibility": 0,
  "experienceMatch": 0,
  "skillsMatch": 0,
  "strengths": [],
  "skillGaps": [],
  "recommendations": []
}

Rules:
- All score values must be integers from 0 to 100.
- Judge the resume specifically against the target role and job description.
- strengths must contain exactly 3 strings.
- skillGaps must contain exactly 3 strings.
- recommendations must contain exactly 3 strings.

Resume:
${resumeText}
`,

      config: {
        responseMimeType: 'application/json',

        responseSchema: {
          type: 'object',

          properties: {
            overallScore: {
              type: 'integer',
            },
            candidateName: {
  type: 'string',
},

            atsCompatibility: {
              type: 'integer',
            },

            experienceMatch: {
              type: 'integer',
            },

            skillsMatch: {
              type: 'integer',
            },

            strengths: {
              type: 'array',
              items: {
                type: 'string',
              },
            },

            skillGaps: {
              type: 'array',
              items: {
                type: 'string',
              },
            },

            recommendations: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },

          required: [
            'overallScore',
            'candidateName',
            'atsCompatibility',
            'experienceMatch',
            'skillsMatch',
            'strengths',
            'skillGaps',
            'recommendations',
          ],
        },
      },
    });

    const rawAnalysis = response.text.trim();

    console.log('RAW GEMINI RESPONSE:');
    console.log(rawAnalysis);

    const jsonStart = rawAnalysis.indexOf('{');
    const jsonEnd = rawAnalysis.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('Gemini did not return valid JSON');
    }

  

const cleanedAnalysis = rawAnalysis.slice(
  jsonStart,
  jsonEnd + 1
);

const analysis = JSON.parse(cleanedAnalysis);

console.log(
  'Saving analysis for user:',
  req.userId
);

const savedAnalysis = await Analysis.create({
  userId: req.userId,

  candidateName: analysis.candidateName || '',
  targetRole: targetRole || '',
  jobDescription: jobDescription || '',

  overallScore: analysis.overallScore || 0,
  atsCompatibility: analysis.atsCompatibility || 0,
  experienceMatch: analysis.experienceMatch || 0,
  skillsMatch: analysis.skillsMatch || 0,

  strengths: analysis.strengths || [],
  skillGaps: analysis.skillGaps || [],
  recommendations: analysis.recommendations || [],
});

console.log(
  'Analysis saved successfully:',
  savedAnalysis._id
);

res.json({
  success: true,
  analysis: savedAnalysis,
});


  } catch (error) {
    console.error('AI analysis error:', error);

    res.status(500).json({
      success: false,
      message: 'AI analysis failed',
    });
  }
});

app.get(
  '/api/analyses',
  authenticateToken,
  async (req, res) => {
    try {
      const analyses = await Analysis.find({
        userId: req.userId,
      }).sort({
        createdAt: -1,
      });

      res.json({
        success: true,
        analyses,
      });
    } catch (error) {
      console.error(
        'Fetch analyses error:',
        error
      );

      res.status(500).json({
        success: false,
        message: 'Failed to fetch analyses.',
      });
    }
  }
);


app.post('/api/download-report', (req, res) => {
  const { analysis, targetRole, candidateName } = req.body;

  if (!analysis) {
    return res.status(400).json({
      success: false,
      message: 'Analysis data is required',
    });
  }

  const doc = new PDFDocument({
    margin: 50,
  });

  res.setHeader('Content-Type', 'application/pdf');

  res.setHeader(
    'Content-Disposition',
    'attachment; filename="Hirely-Resume-Report.pdf"'
  );

  doc.pipe(res);

  doc
    .fontSize(24)
    .text('Hirely', { align: 'center' });

  doc
    .moveDown()
    .fontSize(18)
    .text('AI Resume Analysis Report', { align: 'center' });

  doc.moveDown(2);

  doc
    .fontSize(16)
    .text(candidateName || 'Candidate', {
      align: 'center',
    });

  doc
    .moveDown()
    .fontSize(12)
    .text(
      `Target Role: ${targetRole || 'Not specified'}`
    );

  doc.moveDown();

  doc
    .fontSize(16)
    .text(
      `Overall Score: ${analysis.overallScore}/100`
    );

  doc.moveDown();

  doc
    .fontSize(13)
    .text(
      `ATS Compatibility: ${analysis.atsCompatibility}/100`
    );

  doc.text(
    `Experience Match: ${analysis.experienceMatch}/100`
  );

  doc.text(
    `Skills Match: ${analysis.skillsMatch}/100`
  );

  doc.moveDown();

  doc.fontSize(16).text('Strengths');

  doc.moveDown(0.5);

  analysis.strengths?.forEach((item) => {
    doc.fontSize(11).text(`• ${item}`);
  });

  doc.moveDown();

  doc.fontSize(16).text('Skill Gaps');

  doc.moveDown(0.5);

  analysis.skillGaps?.forEach((item) => {
    doc.fontSize(11).text(`• ${item}`);
  });

  doc.moveDown();

  doc.fontSize(16).text('Recommendations');

  doc.moveDown(0.5);

  analysis.recommendations?.forEach((item) => {
    doc.fontSize(11).text(`• ${item}`);
  });

  doc.end();
});

// =========================
// START SERVER
// =========================

app.listen(PORT, () => {
  console.log(
    `Hirely backend running on http://localhost:${PORT}`
  );
});