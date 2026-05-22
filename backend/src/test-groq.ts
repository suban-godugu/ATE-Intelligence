import dotenv from 'dotenv';
import path from 'path';
import { getGroqClient } from '@ate/ai-models/utils/groqProvider';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testKeys() {
  console.log('--- Testing Groq Key Distribution ---');
  
  const scopes: any[] = ['VALIDATOR', 'STIL', 'LOG', 'MBIST', 'LBIST', 'ATPG', 'OPTIMIZE', 'ANALYSIS'];
  
  for (const scope of scopes) {
    try {
      const client = getGroqClient(scope);
      // We check if the key is actually set in the client's config
      // Note: This is internal but good for verification
      const key = (client as any).apiKey;
      console.log(`[${scope}] Key: ${key.substring(0, 10)}...${key.substring(key.length - 4)}`);
      
      // Optional: Real API call test (uncomment to test actual connectivity)
      /*
      const chatCompletion = await client.chat.completions.create({
        messages: [{ role: 'user', content: 'Say hello' }],
        model: 'llama-3.3-70b-versatile',
        max_tokens: 5
      });
      console.log(`[${scope}] Response: ${chatCompletion.choices[0].message.content}`);
      */
    } catch (error: any) {
      console.error(`[${scope}] FAILED: ${error.message}`);
    }
  }
}

testKeys();
