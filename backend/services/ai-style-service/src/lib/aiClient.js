const axios = require('axios');
const { Buffer } = require('buffer');

// Default Replicate model version — override via REPLICATE_MODEL_VERSION env var
const DEFAULT_REPLICATE_VERSION =
  process.env.REPLICATE_MODEL_VERSION ||
  'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';

/**
 * Generate AI look images from a source URL.
 * Primary provider: Replicate. Fallback: return original image buffer.
 *
 * @param {object} opts
 * @param {string} opts.imageUrl   - URL of the original uploaded image
 * @param {string} opts.preset     - Style preset name
 * @param {object} [opts.params]   - Optional override params
 * @param {string} [opts.provider] - 'replicate' | 'stability' | 'openai'
 * @returns {Promise<Buffer[]>}
 */
async function generateImage({
  imageUrl,
  preset,
  params = {},
  provider = 'replicate'
}) {
  if (provider === 'replicate') {
    try {
      const token = process.env.REPLICATE_API_TOKEN;
      if (!token) throw new Error('REPLICATE_API_TOKEN not set');

      const body = {
        version: params.version || DEFAULT_REPLICATE_VERSION,
        input: {
          image: imageUrl,
          prompt: params.prompt || `Photorealistic ${preset} hairstyle`,
          strength: params.strength || 0.7,
          guidance_scale: params.guidance_scale || 7.5
        }
      };

      const createRes = await axios.post(
        'https://api.replicate.com/v1/predictions',
        body,
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const predictionId = createRes.data.id;

      // Poll until done (max ~120s)
      for (let pollAttempt = 0; pollAttempt < 40; pollAttempt++) {
        await new Promise((r) => setTimeout(r, 3000));
        const pollRes = await axios.get(
          `https://api.replicate.com/v1/predictions/${predictionId}`,
          {
            headers: { Authorization: `Token ${token}` },
            timeout: 15000
          }
        );
        const { status, output } = pollRes.data;
        if (status === 'succeeded' && output && output.length) {
          const buffers = [];
          for (const url of output) {
            const imgRes = await axios.get(url, {
              responseType: 'arraybuffer',
              timeout: 30000
            });
            buffers.push(Buffer.from(imgRes.data));
          }
          return buffers;
        }
        if (status === 'failed' || status === 'canceled') {
          throw new Error(`Replicate prediction ${status}`);
        }
      }
      throw new Error('Replicate prediction timed out');
    } catch (err) {
      console.warn('Replicate failed, using fallback:', err.message);
    }
  }

  // Fallback: return the original image buffer unchanged
  const fallback = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
    timeout: 30000
  });
  return [Buffer.from(fallback.data)];
}

module.exports = { generateImage };
