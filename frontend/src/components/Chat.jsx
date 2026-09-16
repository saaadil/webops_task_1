import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { logout, sendMessage } from '../api/client';
import './Chat.css';

export default function Chat({ user, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const QUICK_REPLIES = [
    { label: '📅 Events', message: 'What events are happening?' },
    { label: '🏆 Leaderboard', message: "What's my department's rank?" },
    { label: '💰 Wallet', message: "What's my wallet balance?" },
    { label: '❓ Help', message: "What are the fest rules and where's lost and found?" }
  ];

  const handleSend = async (messageOverrideOrEvent, maybeOverride) => {
    let messageOverride =
      typeof messageOverrideOrEvent === 'string'
        ? messageOverrideOrEvent
        : maybeOverride;

    if (messageOverrideOrEvent && typeof messageOverrideOrEvent.preventDefault === 'function') {
      messageOverrideOrEvent.preventDefault();
    }

    const isOverride = typeof messageOverride === 'string';
    const messageToSend = (isOverride ? messageOverride : input).trim();

    if (!messageToSend || loading) {
      return;
    }

    const userMessage = { role: 'user', text: messageToSend, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    if (!isOverride) {
      setInput('');
    }
    setLoading(true);

    try {
      const reply = await sendMessage(messageToSend);
      setMessages((prev) => [...prev, { role: 'assistant', text: reply, timestamp: Date.now() }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Something went wrong, please try again.', timestamp: Date.now() }
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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      // Proceed even if network error occurs
    }
    if (typeof onLogout === 'function') {
      onLogout();
    }
  };

  const isButtonDisabled = loading || !input.trim();
  const isQuickReplyDisabled = loading;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>NITTFest AI Assistant</h1>
          <div style={styles.subtitle}>
            Official Fest Companion {user?.name ? `• ${user.name} (${user.department || ''})` : ''}
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          style={styles.logoutButton}
        >
          Log out
        </button>
      </header>

      <div style={styles.messagesContainer} className="messages-scroll-area">
        {messages.length === 0 && (
          <div style={styles.emptyStateContainer}>
            <div style={styles.emptyStateIconBadge}>✨</div>
            <div style={styles.emptyStateTitle}>NITTFest Companion</div>
            <div style={styles.emptyState}>
              Welcome! Ask anything about NITTFest events, leaderboard, or your wallet.
            </div>
          </div>
        )}
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          const timeString = new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit'
          });

          return (
            <div
              key={index}
              className="message-entrance"
              style={{
                ...styles.messageRow,
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                alignItems: 'flex-end',
                gap: '10px'
              }}
            >
              {!isUser && (
                <div style={styles.assistantAvatar} aria-hidden="true">
                  ✨
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  maxWidth: '75%',
                  alignItems: isUser ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    ...styles.messageBubble,
                    maxWidth: '100%',
                    ...(isUser ? styles.userBubble : styles.assistantBubble)
                  }}
                >
                  <div
                    style={{
                      ...styles.roleLabel,
                      color: isUser ? '#FFE2DD' : '#8A8172'
                    }}
                  >
                    {isUser ? 'You' : 'Assistant'}
                  </div>
                  {isUser ? (
                    <div style={styles.messageText}>{msg.text}</div>
                  ) : (
                    <div className="markdown-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                    </div>
                  )}
                </div>
                <div style={styles.timestamp}>{timeString}</div>
              </div>
              {isUser && (
                <div style={styles.userAvatar} aria-hidden="true">
                  You
                </div>
              )}
            </div>
          );
        })}
        {loading && (
          <div
            className="message-entrance"
            style={{
              ...styles.messageRow,
              justifyContent: 'flex-start',
              alignItems: 'flex-end',
              gap: '10px'
            }}
          >
            <div style={styles.assistantAvatar} aria-hidden="true">
              ✨
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div
                style={{
                  ...styles.messageBubble,
                  ...styles.assistantBubble,
                  padding: '14px 20px'
                }}
              >
                <div className="typing-indicator" aria-label="Assistant is thinking">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.quickRepliesContainer}>
        {QUICK_REPLIES.map((qr) => (
          <button
            key={qr.label}
            type="button"
            className="quick-reply-btn"
            onClick={() => handleSend(qr.message)}
            disabled={isQuickReplyDisabled}
          >
            {qr.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSend} style={styles.inputForm}>
        <input
          type="text"
          className="chat-input-field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="Type your message..."
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={isButtonDisabled}
          aria-label="Send message"
          title="Send message"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
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
    maxWidth: '860px',
    margin: '0 auto',
    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: '#FDFBF7',
    borderLeft: '1.5px solid #EFE8DC',
    borderRight: '1.5px solid #EFE8DC',
    color: '#1A1A2E'
  },
  header: {
    padding: '24px 32px',
    borderBottom: '1.5px solid #EFE8DC',
    background: 'radial-gradient(circle at 15% 40%, rgba(255, 200, 87, 0.14) 0%, rgba(253, 251, 247, 0) 65%), linear-gradient(180deg, #FAF5EA 0%, #FDFBF7 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    margin: 0,
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '2rem',
    fontWeight: 800,
    color: '#1A1A2E',
    letterSpacing: '-0.02em',
    lineHeight: 1.15
  },
  subtitle: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#FF5C4D',
    letterSpacing: '0.6px',
    textTransform: 'uppercase',
    marginTop: '4px'
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#FF5C4D',
    border: '1.5px solid #FF5C4D',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  errorBanner: {
    backgroundColor: '#FDF2F0',
    color: '#C53030',
    padding: '12px 32px',
    fontSize: '0.9rem',
    borderBottom: '1px solid #FED7D2'
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '28px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    backgroundColor: '#FDFBF7'
  },
  emptyStateContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '40px 20px',
    margin: 'auto 0'
  },
  emptyStateIconBadge: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#F0EBE0',
    border: '1.5px solid #E4DCD0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.75rem',
    marginBottom: '16px'
  },
  emptyStateTitle: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '1.4rem',
    fontWeight: 700,
    color: '#1A1A2E',
    marginBottom: '8px'
  },
  emptyState: {
    color: '#7C7567',
    fontSize: '0.96rem',
    lineHeight: 1.6,
    maxWidth: '420px',
    margin: 0
  },
  messageRow: {
    display: 'flex',
    width: '100%'
  },
  userAvatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: '#FF5C4D',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.72rem',
    fontWeight: 700,
    flexShrink: 0,
    marginBottom: '16px'
  },
  assistantAvatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: '#F0EBE0',
    border: '1.5px solid #E4DCD0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    flexShrink: 0,
    marginBottom: '16px'
  },
  messageBubble: {
    maxWidth: '75%',
    padding: '14px 18px',
    lineHeight: '1.55',
    wordBreak: 'break-word',
    fontSize: '0.96rem'
  },
  userBubble: {
    backgroundColor: '#FF5C4D',
    color: '#FFFFFF',
    borderRadius: '20px 20px 4px 20px'
  },
  assistantBubble: {
    backgroundColor: '#F0EBE0',
    color: '#1A1A2E',
    borderRadius: '20px 20px 20px 4px'
  },
  roleLabel: {
    fontSize: '0.72rem',
    marginBottom: '6px',
    fontWeight: 700,
    letterSpacing: '0.5px',
    textTransform: 'uppercase'
  },
  messageText: {
    whiteSpace: 'pre-wrap'
  },
  timestamp: {
    fontSize: '0.72rem',
    color: '#9E9689',
    marginTop: '4px',
    padding: '0 4px'
  },
  quickRepliesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    padding: '14px 32px',
    borderTop: '1.5px solid #EFE8DC',
    backgroundColor: '#FDFBF7'
  },
  inputForm: {
    display: 'flex',
    padding: '16px 32px 24px 32px',
    borderTop: '1.5px solid #EFE8DC',
    backgroundColor: '#FDFBF7',
    gap: '12px'
  }
};
