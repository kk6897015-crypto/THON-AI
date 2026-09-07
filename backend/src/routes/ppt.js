import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import { parseAndCheckPptx } from '../services/pptCheckerService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

// Analyze uploaded PPTX file
router.post('/analyze-file', authenticateToken, upload.single('pptx'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'PPTX file upload is required' });
    }

    const { event_type = 'mlh_hackathon', eligibility_raw_text = '' } = req.body;
    const report = await parseAndCheckPptx(req.file.buffer, { event_type, eligibility_raw_text });

    res.json({
      filename: req.file.originalname,
      size_bytes: req.file.size,
      report
    });
  } catch (err) {
    console.error('PPT analyze error:', err);
    res.status(500).json({ error: 'Failed to analyze PPTX file structure' });
  }
});

export default router;
