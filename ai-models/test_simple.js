const Groq = require('../node_modules/groq-sdk');
const apiKey = process.env.GROQ_API_KEY || 'your_api_key_here';

async function test() {
  console.log('Testing Groq SDK with Llama 3 70B...');
  const groq = new Groq({ apiKey });

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: 'Identify this file format: STIL 1.0; PatternBurst { "P1"; }',
        },
      ],
      model: 'llama-3.3-70b-versatile',
    });

    console.log('✅ Response from Groq:');
    console.log(chatCompletion.choices[0].message.content);
    console.log('\nMigration verification: SUCCESS');
  } catch (error) {
    console.error('❌ Error calling Groq:');
    console.error(error);
  }
}

test();
