import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// In-memory storage
let users = [
  { id: '1', username: 'alice', displayName: 'Alice', password: 'password123' },
  { id: '2', username: 'bob', displayName: 'Bob', password: 'password123' },
  { id: '3', username: 'charlie', displayName: 'Charlie', password: 'password123' }
];

let events = [];
let notifications = [];

// Simple authentication middleware
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  // For simplicity, accept any token
  next();
};

// Routes
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'insyd-notifications-backend-simple' });
});

// Auth routes
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    res.json({ 
      success: true, 
      user: { id: user.id, username: user.username, displayName: user.displayName },
      token: 'dummy-token-' + user.id 
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/auth/register', (req, res) => {
  const { username, password, displayName } = req.body;
  
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  
  const newUser = {
    id: (users.length + 1).toString(),
    username,
    password,
    displayName
  };
  
  users.push(newUser);
  res.json({ 
    success: true, 
    user: { id: newUser.id, username: newUser.username, displayName: newUser.displayName },
    token: 'dummy-token-' + newUser.id 
  });
});

// Users route
app.get('/users', (req, res) => {
  res.json(users.map(u => ({ id: u.id, username: u.username, displayName: u.displayName })));
});

// Events route
app.post('/events', authenticateUser, (req, res) => {
  const { type, actorId, targetUserId, metadata } = req.body;
  
  const event = {
    id: (events.length + 1).toString(),
    type,
    actorId,
    targetUserId,
    metadata,
    timestamp: new Date().toISOString()
  };
  
  events.push(event);
  
  // Create notification
  const notification = {
    id: (notifications.length + 1).toString(),
    userId: targetUserId,
    eventId: event.id,
    type,
    actorId,
    metadata,
    timestamp: event.timestamp,
    read: false
  };
  
  notifications.push(notification);
  
  res.json({ success: true, event, notification });
});

// Notifications route
app.get('/notifications/:userId', authenticateUser, (req, res) => {
  const { userId } = req.params;
  const userNotifications = notifications.filter(n => n.userId === userId);
  res.json(userNotifications);
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Simple server listening on ${PORT}`);
  console.log('Seeded users:', users.map(u => ({ id: u.id, username: u.username })));
});
