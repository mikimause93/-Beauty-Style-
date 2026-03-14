require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const aiRoutes = require('./routes/ai.routes');
const { multerErrorHandler } = require('./routes/ai.routes');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/ai-look', aiRoutes);
app.use(multerErrorHandler);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'ai-style-service' }));

const PORT = process.env.AI_STYLE_PORT || 3011;
app.listen(PORT, () => console.log(`AI Style Service listening on ${PORT}`));
