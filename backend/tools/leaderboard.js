const leaderboardData = require('../mocks/leaderboard.json');

function getLeaderboard(type, department) {
  const list = leaderboardData[type] || [];
  if (department && typeof department === 'string' && department.trim() !== '') {
    const target = department.trim().toLowerCase();
    return list.filter(item => item.department && item.department.toLowerCase() === target);
  }
  return list;
}

module.exports = { getLeaderboard };
