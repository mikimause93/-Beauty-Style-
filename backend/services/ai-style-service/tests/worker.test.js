'use strict';

/**
 * Unit tests for the AI worker (with mocked providers and S3).
 */
const { generateImage } = require('../src/lib/aiClient');

jest.mock('axios');
const axios = require('axios');

describe('aiClient.generateImage', () => {
  afterEach(() => {
    jest.resetAllMocks();
    delete process.env.REPLICATE_API_TOKEN;
    delete process.env.STABILITY_API_KEY;
    delete process.env.OPENAI_API_KEY;
  });

  it('falls back to returning original image when no providers are configured', async () => {
    const fakeImageData = Buffer.from('fake-image-data');
    axios.get.mockResolvedValueOnce({ data: fakeImageData });

    const result = await generateImage({ imageUrl: 'https://example.com/photo.jpg', preset: 'bob-short', provider: 'replicate' });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toBeInstanceOf(Buffer);
  });

  it('uses replicate when token is configured', async () => {
    process.env.REPLICATE_API_TOKEN = 'test-token';

    // Mock prediction creation
    axios.post.mockResolvedValueOnce({
      data: { id: 'pred-123', status: 'starting' }
    });

    // Mock polling - first call returns processing, second returns succeeded
    axios.get
      .mockResolvedValueOnce({ data: { id: 'pred-123', status: 'processing', output: null } })
      .mockResolvedValueOnce({ data: { id: 'pred-123', status: 'succeeded', output: ['https://result.example.com/output.jpg'] } })
      // Mock download of output image
      .mockResolvedValueOnce({ data: Buffer.from('result-image') });

    const result = await generateImage({
      imageUrl: 'https://example.com/photo.jpg',
      preset: 'bob-short',
      provider: 'replicate'
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0]).toBeInstanceOf(Buffer);
  });

  it('falls back to openai when replicate and stability fail', async () => {
    process.env.REPLICATE_API_TOKEN = 'test-token';
    process.env.STABILITY_API_KEY = 'test-stability-key';
    process.env.OPENAI_API_KEY = 'test-openai-key';

    const fakeBase64 = Buffer.from('fake-openai-image').toString('base64');

    // Replicate create fails
    // Stability: first downloads original image, then posts to API – both fail via post mock
    // Stability downloads original: axios.get mock
    axios.get.mockResolvedValueOnce({ data: Buffer.from('original-img') });

    axios.post
      .mockRejectedValueOnce(new Error('Replicate API error'))
      // Stability post fails
      .mockRejectedValueOnce(new Error('Stability API error'))
      // OpenAI succeeds
      .mockResolvedValueOnce({
        data: {
          data: [{ b64_json: fakeBase64 }]
        }
      });

    const result = await generateImage({
      imageUrl: 'https://example.com/photo.jpg',
      preset: 'pixie',
      provider: 'replicate'
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
  });
});
