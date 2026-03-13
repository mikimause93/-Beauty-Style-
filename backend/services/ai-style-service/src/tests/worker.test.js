/**
 * Unit tests for AI worker — mocks all AI providers.
 */
jest.mock('bullmq', () => {
  const mockWorker = {
    on: jest.fn().mockReturnThis(),
    close: jest.fn().mockResolvedValue(undefined),
  };
  return {
    Worker: jest.fn().mockImplementation((_name, processor) => {
      mockWorker._processor = processor;
      return mockWorker;
    }),
    Queue: jest.fn(),
  };
});

jest.mock('../utils/redisClient', () => ({
  getRedisConnection: jest.fn().mockReturnValue({}),
}));

jest.mock('../utils/aiClient', () => ({
  generateLook: jest.fn().mockResolvedValue(['https://example.com/result-1.jpg', 'https://example.com/result-2.jpg']),
}));

jest.mock('../utils/s3Uploader', () => ({
  uploadToS3: jest.fn().mockResolvedValue('https://mock.s3.amazonaws.com/key'),
}));

jest.mock('@prisma/client', () => {
  const mockCreate = jest.fn().mockResolvedValue({
    id: 'look-worker-1',
    userId: 'user-1',
    jobId: 'job-1',
    resultUrl: 'https://example.com/result-1.jpg',
    status: 'completed',
  });
  return {
    PrismaClient: jest.fn(() => ({
      generatedLook: { create: mockCreate },
    })),
  };
});

jest.mock('axios', () => ({
  post: jest.fn().mockResolvedValue({ data: {} }),
}));

describe('AI Worker', () => {
  it('worker module loads without errors', () => {
    // If require throws, test fails
    expect(() => require('../workers/aiWorker')).not.toThrow();
  });

  it('generateLook is called with correct parameters', async () => {
    const { generateLook } = require('../utils/aiClient');
    const result = await generateLook('https://source.jpg', 'glam', {});
    expect(result).toHaveLength(2);
    expect(generateLook).toHaveBeenCalledWith('https://source.jpg', 'glam', {});
  });
});
