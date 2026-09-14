const Groq = require('groq-sdk');

let groq;
try {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });
} catch (error) {
  // If GROQ_API_KEY is not yet set in .env, initialize on demand
}

async function sendChatMessage(messages, tools) {
  const client = groq || new Groq({
    apiKey: process.env.GROQ_API_KEY
  });

  const params = {
    model: 'openai/gpt-oss-120b',
    messages
  };

  if (tools && tools.length > 0) {
    params.tools = tools;
  }

  return await client.chat.completions.create(params);
}

module.exports = { sendChatMessage };
