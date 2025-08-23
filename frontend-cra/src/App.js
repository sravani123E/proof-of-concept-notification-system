import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';

export default function App() {
  // Mock users: we will assume seeded users 'alice', 'bob', 'charlie'.
  // For simplicity, store IDs locally after first fetch.
  const [users, setUsers] = useState([]);
  const [token, setToken] = useState('');
  const [auth, setAuth] = useState({ username: '', password: '', displayName: '' });
  const [currentUserId, setCurrentUserId] = useState('');
  const [actorUserId, setActorUserId] = useState('');
  const [eventType, setEventType] = useState('like');
  const [notifications, setNotifications] = useState([]);
  const timerRef = useRef(null);

  const api = useMemo(() => {
    const instance = axios.create({ baseURL: BACKEND_URL });
    instance.interceptors.request.use(config => {
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return instance;
  }, [token]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/users');
        const list = res.data.users || [];
        setUsers(list);
        if (list.length >= 2) {
          setCurrentUserId(list[0]._id);
          setActorUserId(list[1]._id);
          fetchNotifications(list[0]._id);
          startPolling(list[0]._id);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  async function fetchNotifications(userId) {
    if (!userId) return;
    try {
      const res = await api.get(`/notifications/${userId}`);
      setNotifications(res.data.notifications || []);
    } catch (e) {
      console.error(e);
    }
  }

  function startPolling(userId) {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => fetchNotifications(userId), 5000);
  }

  useEffect(() => {
    return () => timerRef.current && clearInterval(timerRef.current);
  }, []);

  async function handleRegister(e) {
    e.preventDefault();
    try {
      await api.post('/auth/register', {
        username: auth.username,
        password: auth.password,
        displayName: auth.displayName || auth.username,
      });
      alert('Registered! Now login.');
    } catch (err) {
      alert('Register failed');
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { username: auth.username, password: auth.password });
      setToken(res.data.token);
    } catch (err) {
      alert('Login failed');
    }
  }

  async function handleCreateEvent(e) {
    e.preventDefault();
    if (!actorUserId || !currentUserId || actorUserId === currentUserId) return;
    try {
      await api.post('/events', {
        type: eventType,
        actorId: actorUserId,
        targetUserId: currentUserId,
        metadata: {},
      });
      await fetchNotifications(currentUserId);
    } catch (err) {
      console.error(err);
      alert('Failed to create event');
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h2 className="title">Insyd Notifications POC</h2>
        <span className="badge">Backend: {BACKEND_URL}</span>
      </div>

      <section className="card" style={{ marginBottom: 16 }}>
        <h3 className="title">0) Auth</h3>
        <form className="grid-2" onSubmit={handleLogin}>
          <label>
            Username
            <input value={auth.username} onChange={e => setAuth({ ...auth, username: e.target.value })} />
          </label>
          <label>
            Password
            <input type="password" value={auth.password} onChange={e => setAuth({ ...auth, password: e.target.value })} />
          </label>
          <label>
            Display name (for register)
            <input value={auth.displayName} onChange={e => setAuth({ ...auth, displayName: e.target.value })} />
          </label>
          <div className="row">
            <button type="submit">Login</button>
            <button type="button" onClick={handleRegister}>Register</button>
          </div>
        </form>
        {token && <p className="muted">Logged in. Token attached to requests.</p>}
      </section>
      <section className="card" style={{ marginBottom: 16 }}>
        <h3 className="title">1) Select Users</h3>
        <div className="grid-2">
          <label>
            Receiver
            <select
              value={currentUserId}
              onChange={e => { setCurrentUserId(e.target.value); fetchNotifications(e.target.value); startPolling(e.target.value); }}
            >
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.displayName} ({u.username})</option>
              ))}
            </select>
          </label>
          <label>
            Actor
            <select
              value={actorUserId}
              onChange={e => setActorUserId(e.target.value)}
            >
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.displayName} ({u.username})</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <h3 className="title">2) Create an Event</h3>
        <form onSubmit={handleCreateEvent} className="row">
          <select value={eventType} onChange={e => setEventType(e.target.value)}>
            <option value="like">like</option>
            <option value="follow">follow</option>
            <option value="comment">comment</option>
          </select>
          <button type="submit" disabled={!currentUserId || !actorUserId || currentUserId === actorUserId}>Trigger Event</button>
        </form>
      </section>

      <section className="card">
        <h3 className="title">3) Notifications <span className="muted">(polling every 5s)</span></h3>
        {!currentUserId && <p className="muted">Select a receiver to start polling.</p>}
        <ul className="notif-list">
          {notifications.map(n => (
            <li key={n._id} className="notif">
              <div className="msg">{n.message}</div>
              <div className="meta">{new Date(n.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
