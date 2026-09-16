function requireAdminKey(req, res, next) {
  console.log('DEBUG - received header:', JSON.stringify(req.headers['x-admin-key']), '| env value:', JSON.stringify(process.env.ADMIN_KEY));
  const adminKey = req.headers['x-admin-key'];
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Invalid admin key' });
  }
  next();
}

requireAdminKey.requireAdminKey = requireAdminKey;
module.exports = requireAdminKey;
module.exports.requireAdminKey = requireAdminKey;
