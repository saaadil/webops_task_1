const { getWalletBalance } = require('../tools/index');

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

  return prompt;
}

module.exports = { buildSystemPrompt };
