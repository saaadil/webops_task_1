const eventsData = require('../mocks/events.json');

function getEvents(type, date) {
  if (type === 'all') {
    return {
      proshows: eventsData.proshows || [],
      upcoming: eventsData.upcoming || []
    };
  }

  const list = eventsData[type] || [];
  if (date && typeof date === 'string' && date.trim() !== '') {
    const targetDate = date.trim();
    return list.filter(event => event.date === targetDate);
  }
  return list;
}

module.exports = { getEvents };
