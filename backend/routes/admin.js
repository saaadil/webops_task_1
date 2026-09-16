const express = require('express');
const fs = require('fs');
const path = require('path');
const adminAuth = require('../middleware/adminAuth');
const requireAdminKey = typeof adminAuth === 'function' ? adminAuth : adminAuth.requireAdminKey;
const { getUsageSummary } = require('../usageTracker');

const router = express.Router();
const announcementsPath = path.join(__dirname, '../mocks/announcements.json');

router.use(requireAdminKey);

router.get('/usage', (req, res) => {
  res.json(getUsageSummary());
});

router.get('/announcements', (req, res) => {
  try {
    if (!fs.existsSync(announcementsPath)) {
      fs.writeFileSync(announcementsPath, JSON.stringify([], null, 2));
    }
    const data = fs.readFileSync(announcementsPath, 'utf8');
    const announcements = JSON.parse(data || '[]');
    res.json(announcements);
  } catch (err) {
    console.error('Error reading announcements:', err);
    res.status(500).json({ error: 'Failed to read announcements' });
  }
});

router.post('/announcements', (req, res) => {
  const { title, body } = req.body || {};

  if (typeof title !== 'string' || title.trim() === '' || typeof body !== 'string' || body.trim() === '') {
    return res.status(400).json({ error: 'title and body must be non-empty strings' });
  }

  try {
    let announcements = [];
    if (fs.existsSync(announcementsPath)) {
      try {
        const fileContent = fs.readFileSync(announcementsPath, 'utf8');
        announcements = JSON.parse(fileContent || '[]');
        if (!Array.isArray(announcements)) {
          announcements = [];
        }
      } catch (parseError) {
        announcements = [];
      }
    }

    const newAnnouncement = {
      title: title.trim(),
      body: body.trim(),
      timestamp: Date.now()
    };

    announcements.push(newAnnouncement);
    fs.writeFileSync(announcementsPath, JSON.stringify(announcements, null, 2));

    return res.json(announcements);
  } catch (err) {
    console.error('Error saving announcement:', err);
    return res.status(500).json({ error: 'Failed to save announcement' });
  }
});

module.exports = router;
