require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimiter = require('./middleware/rateLimiter');
const { authenticateToken } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const chatRouter = require('./routes/chat');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(rateLimiter);

app.use('/auth', authRoutes);
app.use('/chat', chatRouter);

app.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});