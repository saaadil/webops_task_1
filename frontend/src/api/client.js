const BASE_URL = 'http://localhost:5000';

export async function signup(name, email, password, department) {
  const response = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ name, email, password, department })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data.error || data.message || `Signup failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}

export async function verifyOtp(email, otp) {
  const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ email, otp })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data.error || data.message || `OTP verification failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}

export async function login(email, password) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data.error || data.message || `Login failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data.user;
}

export async function logout() {
  const response = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data.error || data.message || `Logout failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}

export async function checkAuth() {
  try {
    const response = await fetch(`${BASE_URL}/me`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json().catch(() => ({}));
    return data.user || null;
  } catch (err) {
    return null;
  }
}

export async function sendMessage(message) {
  const response = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ message })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data.reply;
}

export async function getUsage(adminKey) {
  const response = await fetch(`${BASE_URL}/admin/usage`, {
    method: 'GET',
    headers: {
      'x-admin-key': adminKey
    },
    credentials: 'include'
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}

export async function getAnnouncements(adminKey) {
  const response = await fetch(`${BASE_URL}/admin/announcements`, {
    method: 'GET',
    headers: {
      'x-admin-key': adminKey
    },
    credentials: 'include'
  });

  const data = await response.json().catch(() => ([]));

  if (!response.ok) {
    const errorMessage = (typeof data === 'object' && data !== null && (data.error || data.message)) || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}

export async function postAnnouncement(adminKey, title, body) {
  const response = await fetch(`${BASE_URL}/admin/announcements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': adminKey
    },
    credentials: 'include',
    body: JSON.stringify({ title, body })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = (typeof data === 'object' && data !== null && (data.error || data.message)) || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}
