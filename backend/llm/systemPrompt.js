const { getWalletBalance } = require('../tools/index');

let faqData = [];
try {
  faqData = require('../mocks/faq.json');
} catch (error) {
  faqData = [];
}

function buildSystemPrompt(userId) {
  const wallet = getWalletBalance(userId);

  let prompt = `You are the friendly official fest-mascot and AI assistant for NITTFest, the annual cultural festival of NIT Trichy! Maintain an enthusiastic, warm, and helpful persona.
Always use the provided tools to query leaderboard, events, and shops data rather than inventing numbers or facts.`;

  if (wallet !== null && wallet !== undefined) {
    prompt += `\n\nUser Wallet Details:
- User ID: ${wallet.user_id}
- Name: ${wallet.name}
- Real-time Balance: ${wallet.balance} ${wallet.currency}
- Status: ${wallet.status}
Note: This is the user's real-time balance. You do not need to call getWalletBalance yourself for simple balance questions.`;
  }

  if (Array.isArray(faqData) && faqData.length > 0) {
    const formattedFaqs = faqData
      .filter((item) => item && item.question && item.answer)
      .map((item) => `Q: ${item.question}\nA: ${item.answer}`)
      .join('\n\n');

    if (formattedFaqs) {
      prompt += `\n\nUse this FAQ content when relevant to the user's question, rather than guessing or inventing fest-specific facts:

Frequently Asked Questions you can answer directly:
${formattedFaqs}`;
    }
  }

  return prompt;
}

module.exports = { buildSystemPrompt };
