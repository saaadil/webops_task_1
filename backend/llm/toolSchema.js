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
            type: ['string', 'null'],
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
            type: ['string', 'null'],
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
      description: 'Get festival events. Use "all" when the user is asking for a general overview of events rather than one specific category (e.g. "what events are happening" should trigger type: "all" in a single call, rather than calling this tool twice with "proshows" then "upcoming"). Use "proshows" or "upcoming" for specific categories, optionally filtered by date.',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['all', 'proshows', 'upcoming'],
            description: 'The type of events to retrieve ("all" for general overview of all events, "proshows", or "upcoming").'
          },
          date: {
            type: ['string', 'null'],
            description: 'Optional date string (YYYY-MM-DD) to filter events.'
          }
        },
        required: ['type']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'suggestSpendCombo',
      description: "Get real computed affordable shop options and combos within the user's actual wallet balance.",
      parameters: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: 'The user ID whose wallet balance to check for affordable options and combos.'
          }
        },
        required: ['userId']
      }
    }
  }
];

module.exports = { tools };
