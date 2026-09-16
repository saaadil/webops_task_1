const Groq = require('groq-sdk');

let groq;
try {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
    timeout: 10000
  });
} catch (error) {
  // If GROQ_API_KEY is not yet set in .env, initialize on demand
}

async function sendChatMessage(messages, tools) {
  const client = groq || new Groq({
    apiKey: process.env.GROQ_API_KEY,
    timeout: 10000
  });

  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

  const params = {
    model,
    max_tokens: 400,
    messages
  };

  if (tools && tools.length > 0) {
    params.tools = tools;
  }

  try {
    return await client.chat.completions.create(params, { timeout: 10000 });
  } catch (error) {
    if (error instanceof Groq.APIConnectionTimeoutError || error.name === 'APIConnectionTimeoutError') {
      console.error('Groq request timed out:', error);
    }
    throw error;
  }
}

module.exports = { sendChatMessage };
