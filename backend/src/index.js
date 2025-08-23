import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import eventsRouter from './routes/events.js';
import notificationsRouter from './routes/notifications.js';
import usersRouter from './routes/users.js';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'insyd-notifications-backend' });
});

app.use('/events', eventsRouter);
app.use('/notifications', notificationsRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/insyd_notifications_poc';

async function start() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: 'insyd_notifications_poc' });
    console.log('Connected to MongoDB');
    // Seed simple demo users if none exist
    const { default: User } = await import('./models/User.js');
    const existingUsers = await User.countDocuments();
    if (existingUsers === 0) {
      await User.create([
        { username: 'alice', displayName: 'Alice' },
        { username: 'bob', displayName: 'Bob' },
        { username: 'charlie', displayName: 'Charlie' },
      ]);
      const seeded = await User.find({}).lean();
      console.log('Seeded users:', seeded.map(u => ({ id: u._id.toString(), username: u.username })));
    }
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();

