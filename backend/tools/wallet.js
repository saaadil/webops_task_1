const walletData = require('../mocks/wallet.json');
const shopsData = require('../mocks/shops.json');

function getWalletBalance(userId) {
  if (userId != null && Array.isArray(walletData)) {
    const wallet = walletData.find(w => String(w.user_id) === String(userId));
    return wallet || null;
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
