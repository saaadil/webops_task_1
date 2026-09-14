import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { login, sendMessage } from '../api/client';
import './Chat.css';

export default function Chat() {
  const [token, setToken] = useState(null);
  const [loginError, setLoginError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function performLogin() {
      try {
        const userToken = await login('1031230012', 'Aadil');
        if (isMounted) {
          setToken(userToken);
          setLoginError(null);
        }
      } catch (err) {
        if (isMounted) {
          setLoginError(err.message || 'Login failed');
        }
      }
    }

    performLogin();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    if (e) {
      e.preventDefault();
    }

    const trimmedInput = input.trim();
    if (!trimmedInput || loading || !token) {
      return;
    }

    const userMessage = { role: 'user', text: trimmedInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const reply = await sendMessage(token, trimmedInput);
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Something went wrong, please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isButtonDisabled = loading || !input.trim() || !token;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2 style={styles.title}>NITTFest AI Assistant</h2>
      </header>

      {loginError && (
        <div style={styles.errorBanner}>
          <strong>Login Error:</strong> {loginError}
        </div>
      )}

      <div style={styles.messagesContainer}>
        {messages.length === 0 && (
          <div style={styles.emptyState}>
            Welcome! Ask anything about NITTFest events, leaderboard, or your wallet.
          </div>
        )}
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              style={{
                ...styles.messageRow,
                justifyContent: isUser ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  ...styles.messageBubble,
                  ...(isUser ? styles.userBubble : styles.assistantBubble)
                }}
              >
                <div style={styles.roleLabel}>{isUser ? 'You' : 'Assistant'}</div>
                {isUser ? (
                  <div style={styles.messageText}>{msg.text}</div>
                ) : (
                  <div className="markdown-content">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {loading && (
          <div style={{ ...styles.messageRow, justifyContent: 'flex-start' }}>
            <div style={{ ...styles.messageBubble, ...styles.assistantBubble, fontStyle: 'italic' }}>
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} style={styles.inputForm}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading || !token}
          placeholder={token ? 'Type your message...' : 'Logging in...'}
          style={styles.inputField}
        />
        <button
          type="submit"
          disabled={isButtonDisabled}
          style={{
            ...styles.sendButton,
            opacity: isButtonDisabled ? 0.6 : 1,
            cursor: isButtonDisabled ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: 'sans-serif',
    backgroundColor: '#fff',
    borderLeft: '1px solid #e2e8f0',
    borderRight: '1px solid #e2e8f0'
  },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc'
  },
  title: {
    margin: 0,
    fontSize: '1.25rem',
    color: '#0f172a'
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '12px 16px',
    fontSize: '0.9rem',
    borderBottom: '1px solid #fecaca'
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  emptyState: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: '40px',
    fontSize: '0.95rem'
  },
  messageRow: {
    display: 'flex',
    width: '100%'
  },
  messageBubble: {
    maxWidth: '75%',
    padding: '10px 14px',
    borderRadius: '12px',
    lineHeight: '1.4',
    wordBreak: 'break-word',
    fontSize: '0.95rem'
  },
  userBubble: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    borderBottomRightRadius: '4px'
  },
  assistantBubble: {
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    borderBottomLeftRadius: '4px'
  },
  roleLabel: {
    fontSize: '0.75rem',
    marginBottom: '4px',
    opacity: 0.85,
    fontWeight: 600
  },
  messageText: {
    whiteSpace: 'pre-wrap'
  },
  inputForm: {
    display: 'flex',
    padding: '16px',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    gap: '8px'
  },
  inputField: {
    flex: 1,
    padding: '12px 14px',
    fontSize: '0.95rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    outline: 'none'
  },
  sendButton: {
    padding: '12px 20px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '0.95rem',
    fontWeight: 600,
    border: 'none',
    borderRadius: '8px'
  }
};
