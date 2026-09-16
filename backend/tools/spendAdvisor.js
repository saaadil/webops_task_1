const { getWalletBalance, getShops } = require('./wallet');

function suggestSpendCombo(userId) {
  const actualUserId = typeof userId === 'object' && userId !== null ? userId.userId : userId;
  const wallet = getWalletBalance(actualUserId);

  if (!wallet) {
    return { error: 'User wallet not found' };
  }

  const balance = wallet.balance;
  const currency = wallet.currency;
  const shops = getShops();

  const affordableShops = [];

  for (const shop of shops) {
    if (!shop || typeof shop.price_range !== 'string') {
      continue;
    }

    const matches = shop.price_range.match(/\d+(?:\.\d+)?/g);
    if (!matches || matches.length < 2) {
      continue;
    }

    const low = parseFloat(matches[0]);
    const high = parseFloat(matches[1]);

    if (isNaN(low) || isNaN(high)) {
      continue;
    }

    const midpointPrice = (low + high) / 2;

    if (midpointPrice <= balance) {
      affordableShops.push({
        name: shop.name,
        category: shop.category,
        midpointPrice
      });
    }
  }

  const suggestedCombos = [];

  for (let i = 0; i < affordableShops.length; i++) {
    for (let j = i + 1; j < affordableShops.length; j++) {
      const totalCost = affordableShops[i].midpointPrice + affordableShops[j].midpointPrice;
      if (totalCost <= balance) {
        suggestedCombos.push({
          shops: [affordableShops[i].name, affordableShops[j].name],
          totalCost
        });
        if (suggestedCombos.length === 2) {
          break;
        }
      }
    }
    if (suggestedCombos.length === 2) {
      break;
    }
  }

  return {
    balance,
    currency,
    affordableShops,
    suggestedCombos
  };
}

module.exports = { suggestSpendCombo };
