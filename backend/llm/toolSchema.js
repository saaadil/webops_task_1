const tools = [
  {
    type: 'function',
    function: {
      name: 'getLeaderboard',
      description: 'Get leaderboard standings for overall or events, optionally filtered by department.',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['overall', 'events'],
            description: 'The type of leaderboard to retrieve (overall or events).'
          },
          department: {
            type: 'string',
            description: 'Optional department name to filter by.'
          }
        },
        required: ['type']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getWalletBalance',
      description: 'Get wallet balance, currency, card details, and recent transactions for a given user ID.',
      parameters: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: 'The user ID whose wallet balance to retrieve.'
          }
        },
        required: ['userId']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getShops',
      description: 'Get list of available shops and food stalls, optionally filtered by category.',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'Optional category (e.g. Veg, Non-Veg, Beverages) to filter shops.'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getEvents',
      description: 'Get festival events (proshows or upcoming), optionally filtered by date.',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['proshows', 'upcoming'],
            description: 'The type of events to retrieve (proshows or upcoming).'
          },
          date: {
            type: 'string',
            description: 'Optional date string (YYYY-MM-DD) to filter events.'
          }
        },
        required: ['type']
      }
    }
  }
];

module.exports = { tools };
