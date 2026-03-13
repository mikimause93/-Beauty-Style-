require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const aiRoutes = require('./routes/ai.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ai-style-service', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/ai-look', aiRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'not_found' });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'internal_server_error', message: err.message });
});

const PORT = process.env.AI_STYLE_PORT || 3011;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`AI Style Service listening on port ${PORT}`);
  });
}

module.exports = app;
