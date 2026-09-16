const BASE_URL = 'http://localhost:5000';

export async function login(userId, name) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, name })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data.error || data.message || `Login failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data.token;
}

export async function sendMessage(token, message) {
  const response = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
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
    }
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
    }
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
    body: JSON.stringify({ title, body })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = (typeof data === 'object' && data !== null && (data.error || data.message)) || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}
