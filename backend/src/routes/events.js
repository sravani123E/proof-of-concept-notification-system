import { Router } from 'express';
import Event from '../models/Event.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { invalidateNotifications } from '../services/cache.js';

const router = Router();

// POST /events -> create event and corresponding notification for target user
router.post('/', async (req, res) => {
  try {
    const { type, actorId, targetUserId, metadata } = req.body;
    if (!type || !actorId || !targetUserId) {
      return res.status(400).json({ error: 'type, actorId, targetUserId are required' });
    }

    // Ensure users exist (POC: upsert simple users if missing)
    const [actor, target] = await Promise.all([
      User.findById(actorId),
      User.findById(targetUserId),
    ]);

    if (!actor || !target) {
      return res.status(400).json({ error: 'actorId or targetUserId not found' });
    }

    const event = await Event.create({ type, actorId, targetUserId, metadata });

    // Simple message generation
    const actorName = actor.displayName || actor.username;
    let message = '';
    if (type === 'like') message = `${actorName} liked your post`;
    if (type === 'follow') message = `${actorName} started following you`;
    if (type === 'comment') message = `${actorName} commented on your post`;
    if (!message) message = `${actorName} did ${type}`;

    const notification = await Notification.create({
      userId: targetUserId,
      eventId: event._id,
      type,
      message,
    });
    invalidateNotifications(targetUserId);

    res.status(201).json({ event, notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

