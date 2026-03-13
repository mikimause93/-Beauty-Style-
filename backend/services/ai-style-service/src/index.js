require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');

const aiLookRouter = require('./routes/aiLook');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'ai-style-service' }));

// Routes
app.use('/api/ai-look', aiLookRouter);

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4005;
app.listen(PORT, () => {
  console.log(`ai-style-service listening on port ${PORT}`);
});

module.exports = app;
