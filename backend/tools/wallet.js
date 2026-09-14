const walletData = require('../mocks/wallet.json');
const shopsData = require('../mocks/shops.json');

function getWalletBalance(userId) {
  if (userId != null && String(walletData.user_id) === String(userId)) {
    return walletData;
  }
  return null;
}

function getShops(category) {
  const shops = shopsData.shops || [];
  if (category && typeof category === 'string' && category.trim() !== '') {
    const target = category.trim().toLowerCase();
    return shops.filter(shop => shop.category && shop.category.toLowerCase() === target);
  }
  return shops;
}

module.exports = {
  getWalletBalance,
  getShops
};
