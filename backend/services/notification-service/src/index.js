require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');

const notificationRouter = require('./routes/notifications');
const internalRouter = require('./routes/internal');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'notification-service' }));

app.use('/api/notifications', notificationRouter);
app.use('/internal', internalRouter);

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
  console.log(`notification-service listening on port ${PORT}`);
});

module.exports = app;
