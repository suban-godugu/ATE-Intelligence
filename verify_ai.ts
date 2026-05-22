import Groq from 'groq-sdk';
import { validateFile } from './ai-models/validators/fileValidator.model';
import dotenv from 'dotenv';
import path from 'path';

// Load env from backend
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

async function verify() {
  console.log('--- Verifying Groq AI Model Integration ---');
  console.log('Model: llama3-70b-8192');
  
  if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY not found in backend/.env');
    return;
  }

  const testInput = {
    fileName: 'test_lot.log',
    fileSizeBytes: 1500,
    fileExtension: '.log',
    firstBytes: `LOT_ID: L123456
DATE: 2024-05-08
OPERATOR: AI_VERIFIER
DEVICE: ATE_TEST_CHIP
WAFER_ID: W01
DIE_X  DIE_Y  RESULT  FAIL_ID  TIME_MS  BIN
0      0      PASS    -        145.2    1
0      1      FAIL    P102     152.4    5
1      0      PASS    -        144.8    1
`
  };

  try {
    console.log('Calling Groq API for validation...');
    const result = await validateFile(testInput);
    console.log('✅ Groq Response Received:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.status === 'VALID' || result.status === 'SUSPICIOUS') {
      console.log('🎉 SUCCESS: AI correctly identified the ATE log file.');
    } else {
      console.warn('⚠️ WARNING: AI returned unexpected status:', result.status);
    }
  } catch (error: any) {
    console.error('❌ ERROR: Groq call failed!');
    console.error(error.message);
  }
}

verify();
