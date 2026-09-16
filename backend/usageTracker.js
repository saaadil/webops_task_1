const usageHistory = [];

function recordUsage(usageObject) {
  const entry = {
    timestamp: Date.now(),
    ...(usageObject || {})
  };
  usageHistory.push(entry);
  return entry;
}

function getUsageSummary() {
  let totalTokens = 0;

  for (const entry of usageHistory) {
    if (typeof entry.prompt_tokens === 'number') {
      totalTokens += entry.prompt_tokens;
    }
    if (typeof entry.completion_tokens === 'number') {
      totalTokens += entry.completion_tokens;
    }
  }

  return {
    totalRequests: usageHistory.length,
    totalTokens,
    recentRequests: usageHistory.slice(-20)
  };
}

module.exports = {
  recordUsage,
  getUsageSummary
};
