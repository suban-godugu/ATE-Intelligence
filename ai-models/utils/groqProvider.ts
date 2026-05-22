import Groq from 'groq-sdk';

const clients: Record<string, Groq> = {};

export type ModelScope = 'VALIDATOR' | 'STIL' | 'LOG' | 'MBIST' | 'LBIST' | 'ATPG' | 'OPTIMIZE' | 'ANALYSIS';

export const getGroqClient = (scope: ModelScope): Groq => {
  if (clients[scope]) return clients[scope];

  const keyMap: Record<ModelScope, string | undefined> = {
    VALIDATOR: process.env.GROQ_API_KEY_VALIDATOR,
    STIL:      process.env.GROQ_API_KEY_STIL,
    LOG:       process.env.GROQ_API_KEY_LOG,
    MBIST:     process.env.GROQ_API_KEY_MBIST,
    LBIST:     process.env.GROQ_API_KEY_LBIST,
    ATPG:      process.env.GROQ_API_KEY_ATPG,
    OPTIMIZE:  process.env.GROQ_API_KEY_OPTIMIZE,
    ANALYSIS:  process.env.GROQ_API_KEY_ANALYSIS,
  };

  const apiKey = keyMap[scope] || process.env.GROQ_API_KEY;
  
  if (!apiKey || apiKey === 'your_key_here') {
     console.warn(`[GroqProvider] No specific key for ${scope}, falling back to default.`);
  }

  clients[scope] = new Groq({ apiKey });
  return clients[scope];
};
