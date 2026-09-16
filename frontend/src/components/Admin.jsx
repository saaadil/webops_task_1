import React, { useState } from 'react';
import { getUsage, getAnnouncements, postAnnouncement } from '../api/client';

export default function Admin() {
  const [adminKey, setAdminKey] = useState('');
  const [keyEntered, setKeyEntered] = useState(false);
  const [usage, setUsage] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleKeySubmit = async (e) => {
    e.preventDefault();
    if (!adminKey.trim()) {
      setError('Please enter an admin key');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const usageData = await getUsage(adminKey.trim());
      setUsage(usageData);
      setKeyEntered(true);

      try {
        const announcementsData = await getAnnouncements(adminKey.trim());
        setAnnouncements(Array.isArray(announcementsData) ? announcementsData : []);
      } catch (annErr) {
        setError(annErr.message || 'Failed to load announcements');
      }
    } catch (err) {
      setError(err.message || 'Invalid admin key');
      setKeyEntered(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const updated = await postAnnouncement(adminKey.trim(), newTitle.trim(), newBody.trim());
      setAnnouncements(Array.isArray(updated) ? updated : []);
      setNewTitle('');
      setNewBody('');
    } catch (err) {
      setError(err.message || 'Failed to post announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormDisabled = !newTitle.trim() || !newBody.trim() || submitting;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>NITTFest Admin Console</h1>
          <span style={styles.badge}>Admin</span>
        </div>
        <a href="/" style={styles.backLink}>← Back to Chat</a>
      </header>

      {error && (
        <div style={styles.errorBanner}>
          <span>⚠️ {error}</span>
          <button style={styles.dismissBtn} onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div style={styles.content}>
        {!keyEntered ? (
          <div style={styles.authCard}>
            <h2 style={styles.cardTitle}>Admin Authentication</h2>
            <p style={styles.cardDesc}>Enter your admin key to access system usage metrics and manage announcements.</p>
            <form onSubmit={handleKeySubmit} style={styles.authForm}>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="admin-key-input">Admin Key</label>
                <input
                  id="admin-key-input"
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter admin key..."
                  style={styles.input}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !adminKey.trim()}
                style={submitting || !adminKey.trim() ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
              >
                {submitting ? 'Authenticating...' : 'Access Dashboard'}
              </button>
            </form>
          </div>
        ) : (
          <div style={styles.dashboard}>
            {/* Usage Summary Section */}
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Usage Summary</h2>
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statNumber}>{usage?.totalRequests ?? 0}</div>
                  <div style={styles.statLabel}>Total LLM Requests</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statNumber}>{usage?.totalTokens ?? 0}</div>
                  <div style={styles.statLabel}>Total Tokens Consumed</div>
                </div>
              </div>
            </section>

            {/* Post Announcement Form Section */}
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Post New Announcement</h2>
              <form onSubmit={handlePostAnnouncement} style={styles.announcementForm}>
                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="announcement-title">Title</label>
                  <input
                    id="announcement-title"
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Venue Change for Rock Night"
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="announcement-body">Body</label>
                  <textarea
                    id="announcement-body"
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    placeholder="Announcement details..."
                    rows={3}
                    style={styles.textarea}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isFormDisabled}
                  style={isFormDisabled ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
                >
                  {submitting ? 'Posting...' : 'Post Announcement'}
                </button>
              </form>
            </section>

            {/* Announcements List Section */}
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>
                Current Announcements ({announcements.length})
              </h2>
              {announcements.length === 0 ? (
                <div style={styles.emptyState}>No announcements posted yet.</div>
              ) : (
                <div style={styles.announcementsList}>
                  {announcements.map((item, index) => (
                    <div key={index} style={styles.announcementCard}>
                      <div style={styles.announcementHeader}>
                        <h3 style={styles.announcementTitle}>{item.title}</h3>
                        <span style={styles.announcementDate}>
                          {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <p style={styles.announcementBody}>{item.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    maxWidth: '850px',
    margin: '0 auto',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#ffffff',
    borderLeft: '1px solid #e2e8f0',
    borderRight: '1px solid #e2e8f0',
    color: '#0f172a'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  title: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#0f172a'
  },
  badge: {
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: '#e0e7ff',
    color: '#4338ca',
    padding: '2px 8px',
    borderRadius: '12px'
  },
  backLink: {
    fontSize: '0.9rem',
    color: '#6366f1',
    textDecoration: 'none',
    fontWeight: '500'
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '12px 20px',
    fontSize: '0.9rem',
    borderBottom: '1px solid #fecaca',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dismissBtn: {
    background: 'none',
    border: 'none',
    color: '#b91c1c',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  content: {
    flex: 1,
    padding: '24px'
  },
  authCard: {
    maxWidth: '420px',
    margin: '60px auto',
    padding: '28px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e2e8f0'
  },
  cardTitle: {
    margin: '0 0 8px 0',
    fontSize: '1.2rem',
    fontWeight: '600'
  },
  cardDesc: {
    margin: '0 0 20px 0',
    fontSize: '0.9rem',
    color: '#64748b',
    lineHeight: '1.4'
  },
  authForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#475569'
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  textarea: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  button: {
    padding: '10px 18px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
    cursor: 'not-allowed'
  },
  dashboard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px'
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e2e8f0'
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#0f172a'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  statCard: {
    backgroundColor: '#f8fafc',
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    textAlign: 'center'
  },
  statNumber: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#4f46e5'
  },
  statLabel: {
    fontSize: '0.85rem',
    color: '#64748b',
    marginTop: '4px'
  },
  announcementForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '30px',
    color: '#94a3b8',
    fontSize: '0.95rem',
    fontStyle: 'italic'
  },
  announcementsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  announcementCard: {
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  announcementHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '8px',
    gap: '12px'
  },
  announcementTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: '600',
    color: '#0f172a'
  },
  announcementDate: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    whiteSpace: 'nowrap'
  },
  announcementBody: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#334155',
    lineHeight: '1.5'
  }
};
