import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import fs from 'fs';
import { readSTILFile } from '@ate/ai-models';

async function testStilParse() {
  const filePath = path.resolve(__dirname, '../storage/uploads/1000 pattern -1 .stil');
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  console.log(`--- Testing STIL Parser with ${path.basename(filePath)} ---`);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  try {
    const result = await readSTILFile({ content, fileName: path.basename(filePath) });
    
    console.log('--- Results ---');
    console.log(`Confidence: ${result.confidence}%`);
    console.log(`Scan Chains found: ${result.scanChains.length}`);
    console.log(`Patterns found: ${result.patterns.length}`);
    console.log(`MBIST Instances: ${result.mbistInstances?.length || 0}`);
    console.log(`LBIST Instances: ${result.lbistInstances?.length || 0}`);
    
    if (result.patterns.length > 0) {
      console.log('\nFirst 3 Patterns:');
      console.log(JSON.stringify(result.patterns.slice(0, 3), null, 2));
    }
    
    if (result.scanChains.length > 0) {
      console.log('\nFirst 3 Scan Chains:');
      console.log(JSON.stringify(result.scanChains.slice(0, 3), null, 2));
    }

    if (result.warnings.length > 0) {
      console.log('\nWarnings:');
      result.warnings.forEach(w => console.warn(`- ${w}`));
    }

  } catch (error: any) {
    console.error(`PARSING FAILED: ${error.message}`);
  }
}

testStilParse();
