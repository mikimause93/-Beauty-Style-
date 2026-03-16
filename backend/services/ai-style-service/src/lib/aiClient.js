const axios = require('axios');
const { Buffer } = require('buffer');

/**
 * Generates styled images using the configured AI provider.
 * Primary provider: Replicate. Falls back to returning the original image on failure.
 *
 * @param {{ imageUrl: string, preset: string, params?: object, provider?: string }} options
 * @returns {Promise<Buffer[]>}
 */
async function generateImage({ imageUrl, preset, params = {}, provider = 'replicate' }) {
  if (provider === 'replicate') {
    try {
      const token = process.env.REPLICATE_API_TOKEN;
      const body = {
        version: params.version || 'replicate/stable-diffusion-image-to-image:latest',
        input: {
          image: imageUrl,
          prompt: params.prompt || `A photorealistic ${preset}`,
          strength: params.strength || 0.7,
          guidance_scale: params.guidance_scale || 7.5
        }
      };
      const res = await axios.post('https://api.replicate.com/v1/predictions', body, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 120000
      });
      const output = res.data.output || [];
      const buffers = [];
      for (const u of output) {
        const r = await axios.get(u, { responseType: 'arraybuffer' });
        buffers.push(Buffer.from(r.data));
      }
      return buffers;
    } catch (err) {
      console.warn('Replicate failed, falling back to passthrough:', err.message);
    }
  }

  // Fallback: return original image as-is
  const r = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  return [Buffer.from(r.data)];
}

module.exports = { generateImage };
