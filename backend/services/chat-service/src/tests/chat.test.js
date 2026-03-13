const request = require('supertest');

// Mock mongoose before app import
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue({}),
  Schema: jest.fn().mockImplementation(() => ({})),
  model: jest.fn().mockReturnValue({
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue([
      { _id: 'msg-1', conversationId: 'conv-1', senderId: 'u-1', content: 'Hello', messageType: 'TEXT', createdAt: new Date() },
    ]),
    create: jest.fn().mockResolvedValue({ _id: 'msg-new', conversationId: 'conv-1', content: 'Hi' }),
    updateMany: jest.fn().mockResolvedValue({}),
  }),
}));

jest.mock('socket.io', () => {
  const mockIO = {
    on: jest.fn(),
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  };
  return { Server: jest.fn().mockImplementation(() => mockIO) };
});

jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    audio: {
      transcriptions: {
        create: jest.fn().mockResolvedValue({ text: 'Hello world', language: 'en' }),
      },
    },
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Ciao mondo' } }],
        }),
      },
    },
  })),
}));

const { app } = require('../index');

describe('Chat Service', () => {
  describe('GET /health', () => {
    it('returns 200', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.service).toBe('chat-service');
    });
  });

  describe('GET /api/chat/:conversationId/messages', () => {
    it('returns message history', async () => {
      const res = await request(app).get('/api/chat/conv-1/messages');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('messages');
    });
  });

  describe('POST /api/translation/translate', () => {
    it('returns 400 when fields missing', async () => {
      const res = await request(app)
        .post('/api/translation/translate')
        .send({ text: 'Hello' }); // missing targetLanguage
      expect(res.status).toBe(400);
    });

    it('translates text', async () => {
      const res = await request(app)
        .post('/api/translation/translate')
        .send({ text: 'Hello world', targetLanguage: 'Italian' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('translated');
      expect(res.body.original).toBe('Hello world');
    });
  });
});
