// In-memory store for OTPs and pending signups keyed by lowercase email
const otpStore = {};
const pendingSignups = {};

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function storeOtp(email, code) {
  const normalized = normalizeEmail(email);
  if (!normalized) return;

  otpStore[normalized] = {
    code: String(code).trim(),
    expiresAt: Date.now() + OTP_TTL_MS
  };
}

function verifyOtp(email, code) {
  const normalized = normalizeEmail(email);
  if (!normalized || !code) return false;

  const entry = otpStore[normalized];
  if (!entry) return false;

  if (Date.now() > entry.expiresAt) {
    delete otpStore[normalized];
    return false;
  }

  const isMatch = entry.code === String(code).trim();
  if (isMatch) {
    delete otpStore[normalized];
    return true;
  }

  return false;
}

function storePendingSignup(email, signupData) {
  const normalized = normalizeEmail(email);
  if (!normalized) return;
  pendingSignups[normalized] = signupData;
}

function getPendingSignup(email) {
  const normalized = normalizeEmail(email);
  return pendingSignups[normalized] || null;
}

function clearPendingSignup(email) {
  const normalized = normalizeEmail(email);
  if (normalized) {
    delete pendingSignups[normalized];
  }
}

module.exports = {
  storeOtp,
  verifyOtp,
  storePendingSignup,
  getPendingSignup,
  clearPendingSignup
};
