import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { processFile } from '../services/modelSelector.service';
import { mergeAndImport } from '../services/importService';
import { progressStore } from '../utils/progressStore';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const router = Router();
const upload = multer({ dest: 'storage/uploads/' });

router.post('/', upload.fields([
  { name: 'STIL', maxCount: 1 },
  { name: 'ATE_LOG', maxCount: 1 },
  { name: 'ATPG_REPORT', maxCount: 1 },
  { name: 'MBIST_REPORT', maxCount: 1 },
  { name: 'LBIST_REPORT', maxCount: 1 }
]), async (req: any, res) => {
  const uploadId = uuidv4();
  const files = (req.files || {}) as { [fieldname: string]: Express.Multer.File[] };

  // Send uploadId back immediately
  res.json({ success: true, uploadId });

  const addEvent = (stage: string, file: string, message: string, data?: any) => {
    progressStore.add(uploadId, {
      file,
      stage,
      message,
      timestamp: new Date().toISOString(),
      data
    });
  };

  try {
    const results: Record<string, any> = {};
    
    if (!files || Object.keys(files).length === 0) {
      throw new Error('No files were received by the server. Please check your upload.');
    }

    // 1. Calculate File Bundle Hash for Duplicate Detection
    const hash = crypto.createHash('md5');
    for (const [fieldname, fileArray] of Object.entries(files)) {
      const file = fileArray[0];
      // Hash includes name, size, and first 1MB of content (for speed)
      const head = fs.openSync(file.path, 'r');
      const buffer = Buffer.alloc(1024 * 1024);
      const bytesRead = fs.readSync(head, buffer, 0, 1024 * 1024, 0);
      fs.closeSync(head);
      
      hash.update(`${fieldname}:${file.originalname}:${file.size}:${buffer.slice(0, bytesRead).toString('hex')}`);
    }
    const fileHash = hash.digest('hex');

    for (const [fieldname, fileArray] of Object.entries(files)) {
      const file = fileArray[0];
      addEvent('Processing', fieldname, `Parsing ${file.originalname}...`);
      
      const content = fs.readFileSync(file.path, 'utf-8');
      const result = await processFile(file.originalname, content);
      results[fieldname] = result.parsed;
      
      addEvent('Validated', fieldname, `Successfully parsed ${fieldname}.`);
    }

    addEvent('Merging', 'DATABASE', 'Importing data to database...');
    
    const summary = await mergeAndImport(
      results['STIL'],
      results['ATE_LOG'],
      results['MBIST_REPORT'],
      results['LBIST_REPORT'],
      results['ATPG_REPORT'],
      fileHash
    );

    addEvent('Complete', 'MERGE', `Success: ${summary.patternsCount} patterns imported.`, summary);
  } catch (error: any) {
    console.error('Upload Error:', error);
    addEvent('Error', 'PROCESS', error.message);
  }
});

router.get('/progress/:uploadId', (req, res) => {
  const { uploadId } = req.params;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const interval = setInterval(() => {
    const events = progressStore.get(uploadId);
    if (events.length > 0) {
      res.write(`data: ${JSON.stringify(events)}\n\n`);
      progressStore.delete(uploadId);
      
      if (events.some(e => e.stage === 'Complete' || e.stage === 'Error')) {
        clearInterval(interval);
        res.end();
      }
    }
  }, 1000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

export default router;
