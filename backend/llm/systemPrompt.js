const { getWalletBalance } = require('../tools/index');

let faqData = [];
try {
  faqData = require('../mocks/faq.json');
} catch (error) {
  faqData = [];
}

function buildSystemPrompt(userId) {
  const wallet = getWalletBalance(userId);

  let prompt = `You are the enthusiastic official mascot and AI assistant for NITTFest, NIT Trichy's cultural fest. Always use the provided tools to query leaderboard, events, and shops data instead of inventing facts.

IMPORTANT: When asked about events in general (e.g. 'what events are happening', 'what's going on'), you MUST call getEvents with type set to 'all' in a single call. Do NOT call getEvents twice with 'proshows' and 'upcoming' separately — this wastes time. Only use 'proshows' or 'upcoming' individually when the user explicitly asks for just proshows or just upcoming events.`;

  if (wallet !== null && wallet !== undefined) {
    prompt += `\n\nUser Wallet Details:
- User ID: ${wallet.user_id}
- Name: ${wallet.name}
- Real-time Balance: ${wallet.balance} ${wallet.currency}
- Status: ${wallet.status}
Note: This is the user's real-time balance. You do not need to call getWalletBalance yourself for simple balance questions.`;

    if (wallet.department) {
      prompt += `\nThe user's department is ${wallet.department}.`;
    }
  }

  if (Array.isArray(faqData) && faqData.length > 0) {
    const formattedFaqs = faqData
      .filter((item) => item && item.question && item.answer)
      .map((item) => `- ${item.question}: ${item.answer}`)
      .join('\n');

    if (formattedFaqs) {
      prompt += `\n\nFrequently Asked Questions you can answer directly:\n${formattedFaqs}`;
    }
  }

  return prompt;
}

module.exports = { buildSystemPrompt };
