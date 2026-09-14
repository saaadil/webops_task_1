const { getLeaderboard } = require('./leaderboard');
const { getWalletBalance, getShops } = require('./wallet');
const { getEvents } = require('./events');

module.exports = {
  getLeaderboard,
  getWalletBalance,
  getShops,
  getEvents
};
