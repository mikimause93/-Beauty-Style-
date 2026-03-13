require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');

const bookingsRouter = require('./routes/bookings');
const walletRouter = require('./routes/wallet');
const webhookRouter = require('./routes/webhook');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));

// Stripe webhook needs raw body — mount before express.json()
app.use('/api/bookings/webhook', express.raw({ type: 'application/json' }), webhookRouter);

app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'booking-service' }));

app.use('/api/bookings', bookingsRouter);
app.use('/api/wallet', walletRouter);

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
  console.log(`booking-service listening on port ${PORT}`);
});

module.exports = app;
