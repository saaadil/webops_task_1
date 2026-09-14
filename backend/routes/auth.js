const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/login', (req, res) => {
  const { userId, name } = req.body || {};

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const secret = process.env.JWT_SECRET || 'secret';
  const token = jwt.sign({ userId, name }, secret, { expiresIn: '24h' });

  return res.json({ token });
});

module.exports = router;
