const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { sendOtpEmail } = require('../services/emailService');
const {
  storeOtp,
  verifyOtp,
  storePendingSignup,
  getPendingSignup,
  clearPendingSignup
} = require('../otpStore');

const router = express.Router();
const usersFilePath = path.join(__dirname, '../data/users.json');

function getUsers() {
  try {
    if (!fs.existsSync(usersFilePath)) {
      fs.writeFileSync(usersFilePath, '[]');
      return [];
    }
    const data = fs.readFileSync(usersFilePath, 'utf8');
    const parsed = JSON.parse(data || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

const ALLOWED_DEPARTMENTS = [
  'CSE',
  'ECE',
  'EEE',
  'ICE',
  'MECH',
  'CHEM',
  'PROD',
  'MME',
  'CIV',
  'MCA',
  'BSC',
  'MBA'
];

router.post('/signup', async (req, res) => {
  const { name, email, password, department } = req.body || {};
  const missing = [];

  if (!name || typeof name !== 'string' || name.trim() === '') missing.push('name');
  if (!email || typeof email !== 'string' || email.trim() === '') missing.push('email');
  if (!password || typeof password !== 'string' || password.trim() === '') missing.push('password');
  if (!department || typeof department !== 'string' || department.trim() === '') missing.push('department');

  if (missing.length > 0) {
    return res.status(400).json({
      field: missing[0],
      error: `Missing required fields: ${missing.join(', ')}`
    });
  }

  const nameTrimmed = name.trim();
  if (!/^[a-zA-Z\s'-]+$/.test(nameTrimmed)) {
    return res.status(400).json({
      field: 'name',
      error: 'Name must contain only letters, spaces, apostrophes, and hyphens'
    });
  }

  const emailTrimmed = email.trim();
  if (!/^[a-zA-Z0-9._%+-]+@nitt\.edu$/i.test(emailTrimmed)) {
    return res.status(400).json({
      field: 'email',
      error: 'Email must be a valid email address ending in @nitt.edu'
    });
  }

  const departmentTrimmed = department.trim();
  if (!ALLOWED_DEPARTMENTS.includes(departmentTrimmed)) {
    return res.status(400).json({
      field: 'department',
      error: `Department must be one of: ${ALLOWED_DEPARTMENTS.join(', ')}`
    });
  }

  const passwordMissing = [];
  if (password.length < 8) passwordMissing.push('at least 8 characters');
  if (!/[A-Z]/.test(password)) passwordMissing.push('one uppercase letter');
  if (!/[a-z]/.test(password)) passwordMissing.push('one lowercase letter');
  if (!/\d/.test(password)) passwordMissing.push('one digit');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) passwordMissing.push('one special character');

  if (passwordMissing.length > 0) {
    return res.status(400).json({
      field: 'password',
      error: `Password requirements not met: ${passwordMissing.join(', ')}`
    });
  }

  try {
    const users = getUsers();
    const emailNormalized = emailTrimmed.toLowerCase();
    const existingUser = users.find(u => u.email && u.email.toLowerCase() === emailNormalized);

    if (existingUser) {
      return res.status(409).json({ field: 'email', error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    storeOtp(emailNormalized, otp);
    storePendingSignup(emailNormalized, {
      userId,
      name: nameTrimmed,
      email: emailTrimmed,
      passwordHash,
      department: departmentTrimmed
    });

    console.log(`[OTP Generated] For ${emailNormalized}: ${otp}`);

    // Send OTP email (returns true/false, never throws)
    await sendOtpEmail(emailTrimmed, otp);

    return res.status(200).json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Internal server error during signup' });
  }
});

router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body || {};

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  const emailNormalized = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const isValid = verifyOtp(emailNormalized, otp);
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }

  const pendingUser = getPendingSignup(emailNormalized);
  if (!pendingUser) {
    return res.status(400).json({ error: 'No pending signup found for this email' });
  }

  try {
    const users = getUsers();
    users.push(pendingUser);
    saveUsers(users);
    clearPendingSignup(emailNormalized);

    return res.status(201).json({ message: 'Account created successfully' });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({ error: 'Internal server error during account creation' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  try {
    const users = getUsers();
    const emailNormalized = email.trim().toLowerCase();
    const user = users.find(u => u.email && u.email.toLowerCase() === emailNormalized);

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const secret = process.env.JWT_SECRET || 'secret';
    const signedToken = jwt.sign(
      {
        userId: user.userId,
        name: user.name,
        department: user.department
      },
      secret,
      { expiresIn: '2h' }
    );

    res.cookie('token', signedToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 2 * 60 * 60 * 1000
    });

    return res.json({
      message: 'Login successful',
      user: {
        name: user.name,
        department: user.department
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'Logged out' });
});

module.exports = router;
