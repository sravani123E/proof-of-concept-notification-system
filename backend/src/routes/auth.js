import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;
    if (!username || !password || !displayName) {
      return res.status(400).json({ error: 'username, password, displayName required' });
    }
    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ error: 'username already exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, displayName, passwordHash });
    res.status(201).json({ id: user._id, username: user.username, displayName: user.displayName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    const token = jwt.sign({ sub: user._id.toString(), username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, displayName: user.displayName } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


