require('dotenv').config();
const http = require('http');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const chatRouter = require('./routes/chat');
const translationRouter = require('./routes/translation');
const socketHandler = require('./utils/socketHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling'],
});

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'chat-service' }));

app.use('/api/chat', chatRouter);
app.use('/api/translation', translationRouter);

// Attach Socket.IO
socketHandler(io);

// Connect to MongoDB
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/beauty-chat';
mongoose
  .connect(MONGO_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4004;
server.listen(PORT, () => {
  console.log(`chat-service listening on port ${PORT}`);
});

module.exports = { app, io };
