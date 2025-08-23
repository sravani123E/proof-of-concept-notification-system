import { Router } from 'express';
import Notification from '../models/Notification.js';
import { getCachedNotifications, setCachedNotifications } from '../services/cache.js';

const router = Router();

// GET /notifications/:userId -> list notifications for a user (newest first)
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const cached = getCachedNotifications(userId);
    if (cached) {
      return res.json({ notifications: cached, cached: true });
    }
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    setCachedNotifications(userId, notifications);
    res.json({ notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

