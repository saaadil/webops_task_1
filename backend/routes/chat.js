const express = require('express');
const auth = require('../middleware/auth');
const authenticateToken = typeof auth === 'function' ? auth : auth.authenticateToken;
const { tools } = require('../llm/toolSchema');
const { buildSystemPrompt } = require('../llm/systemPrompt');
const llmClient = require('../llm/client');
const toolFunctions = require('../tools/index');

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  if (!req.body || typeof req.body.message !== 'string' || req.body.message.trim() === '') {
    return res.status(400).json({ error: 'message is required' });
  }

  try {
    const userId = req.user?.userId;
    const systemPrompt = buildSystemPrompt(userId);

    const initialMessages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: req.body.message }
    ];

    const response = await llmClient.sendChatMessage(initialMessages, tools);
    const choice = response?.choices?.[0];
    const assistantMessage = choice?.message;

    if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolMessages = [];

      for (const toolCall of assistantMessage.tool_calls) {
        const functionName = toolCall.function?.name;
        let args = {};

        try {
          args = typeof toolCall.function?.arguments === 'string'
            ? JSON.parse(toolCall.function.arguments)
            : (toolCall.function?.arguments || {});
        } catch (parseError) {
          console.error(`Failed to parse arguments for tool ${functionName}:`, parseError);
          toolMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: `Failed to parse arguments for tool ${functionName}` })
          });
          continue;
        }

        let result;
        try {
          if (functionName === 'getLeaderboard') {
            result = toolFunctions.getLeaderboard(args.type, args.department);
          } else if (functionName === 'getWalletBalance') {
            result = toolFunctions.getWalletBalance(args.userId);
          } else if (functionName === 'getShops') {
            result = toolFunctions.getShops(args.category);
          } else if (functionName === 'getEvents') {
            result = toolFunctions.getEvents(args.type, args.date);
          } else if (typeof toolFunctions[functionName] === 'function') {
            result = toolFunctions[functionName](args);
          } else {
            result = { error: `Tool ${functionName} not found` };
          }
        } catch (execError) {
          console.error(`Error executing tool ${functionName}:`, execError);
          result = { error: `Error executing tool ${functionName}` };
        }

        toolMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result)
        });
      }

      const followUpMessages = [
        ...initialMessages,
        assistantMessage,
        ...toolMessages
      ];

      const followUpResponse = await llmClient.sendChatMessage(followUpMessages, tools);
      const followUpChoice = followUpResponse?.choices?.[0];
      const replyText = followUpChoice?.message?.content || '';

      return res.json({ reply: replyText });
    }

    const replyText = assistantMessage?.content || '';
    return res.json({ reply: replyText });
  } catch (error) {
    console.error('Groq chat error:', error);
    return res.status(500).json({ error: 'Something went wrong, please try again.' });
  }
});

module.exports = router;
