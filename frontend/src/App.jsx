import React, { useState, useEffect } from 'react';
import Chat from './components/Chat';
import Admin from './components/Admin';
import Login from './components/Login';
import { checkAuth } from './api/client';

function App() {
  const isAdmin = typeof window !== 'undefined' && window.location.pathname === '/admin';
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    checkAuth()
      .then((authenticatedUser) => {
        if (isMounted) {
          setUser(authenticatedUser);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isAdmin]);

  if (isAdmin) {
    return (
      <main>
        <Admin />
      </main>
    );
  }

  if (loading) {
    return (
      <main style={styles.loadingContainer}>
        <div style={styles.loadingSpinner} />
        <p style={styles.loadingText}>Loading NITTFest Companion...</p>
      </main>
    );
  }

  return (
    <main>
      {user ? (
        <Chat user={user} onLogout={() => setUser(null)} />
      ) : (
        <Login onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />
      )}
    </main>
  );
}

const styles = {
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDFBF7',
    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: '#1A1A2E'
  },
  loadingSpinner: {
    width: '36px',
    height: '36px',
    border: '3px solid #F0EBE0',
    borderTop: '3px solid #FF5C4D',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  },
  loadingText: {
    fontSize: '0.95rem',
    color: '#7C7567',
    fontWeight: 500
  }
};

export default App;
