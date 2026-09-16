const { getLeaderboard } = require('./leaderboard');
const { getWalletBalance, getShops } = require('./wallet');
const { getEvents } = require('./events');
const { suggestSpendCombo } = require('./spendAdvisor');

module.exports = {
  getLeaderboard,
  getWalletBalance,
  getShops,
  getEvents,
  suggestSpendCombo
};
