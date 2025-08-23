import { Router } from 'express';
import User from '../models/User.js';

const router = Router();

// GET /users -> list demo users
router.get('/', async (_req, res) => {
  try {
    const users = await User.find({}).select('_id username displayName').sort({ createdAt: 1 }).lean();
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

