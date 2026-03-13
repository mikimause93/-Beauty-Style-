const axios = require('axios');
const { Buffer } = require('buffer');

// ---------------------------------------------------------------------------
// Default Replicate model version. Override via REPLICATE_MODEL_VERSION env var.
// ---------------------------------------------------------------------------
const DEFAULT_REPLICATE_VERSION =
  process.env.REPLICATE_MODEL_VERSION ||
  'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';

// ---------------------------------------------------------------------------
// Stability AI base URL. Override via STABILITY_API_BASE env var.
// ---------------------------------------------------------------------------
const STABILITY_API_BASE =
  process.env.STABILITY_API_BASE ||
  'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0';

/**
 * AI provider wrapper.
 * Primary: Replicate
 * Fallback: Stability AI → OpenAI Images
 *
 * @param {object} opts
 * @param {string} opts.imageUrl - Public URL of the original photo
 * @param {string} opts.preset   - Style preset name
 * @param {object} opts.params   - Optional provider parameters
 * @param {string} opts.provider - 'replicate' | 'stability' | 'openai'
 * @returns {Promise<Buffer[]>} - Array of image buffers
 */
async function generateImage({ imageUrl, preset, params = {}, provider = 'replicate' }) {
  const providers = buildProviderChain(provider);

  let lastError;
  for (const p of providers) {
    try {
      const result = await callProvider(p, { imageUrl, preset, params });
      return result;
    } catch (err) {
      console.warn(`[aiClient] Provider ${p} failed: ${err.message}. Trying next fallback...`);
      lastError = err;
    }
  }

  // All providers failed – return original image as fallback
  console.error('[aiClient] All providers failed. Returning original image as placeholder.');
  const r = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 30000 });
  return [Buffer.from(r.data)];
}

function buildProviderChain(primary) {
  const all = ['replicate', 'stability', 'openai'];
  return [primary, ...all.filter((p) => p !== primary)];
}

async function callProvider(provider, { imageUrl, preset, params }) {
  switch (provider) {
    case 'replicate':
      return callReplicate({ imageUrl, preset, params });
    case 'stability':
      return callStability({ imageUrl, preset, params });
    case 'openai':
      return callOpenAI({ imageUrl, preset, params });
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

async function callReplicate({ imageUrl, preset, params }) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error('REPLICATE_API_TOKEN not configured');

  const version = params.version || DEFAULT_REPLICATE_VERSION;

  const body = {
    version,
    input: {
      image: imageUrl,
      prompt: params.prompt || buildPrompt(preset),
      strength: params.strength ?? 0.7,
      guidance_scale: params.guidance_scale ?? 7.5,
      num_outputs: params.num_outputs ?? 1
    }
  };

  // Create prediction
  const createRes = await axios.post('https://api.replicate.com/v1/predictions', body, {
    headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
    timeout: 30000
  });

  const predictionId = createRes.data.id;

  // Poll for completion
  const output = await pollReplicate(predictionId, token);

  // Download output images as buffers
  const buffers = [];
  for (const url of output) {
    const r = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000 });
    buffers.push(Buffer.from(r.data));
  }
  return buffers;
}

async function pollReplicate(predictionId, token, maxAttempts = 40, intervalMs = 3000) {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await axios.get(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { Authorization: `Token ${token}` },
      timeout: 15000
    });

    const { status, output, error } = res.data;

    if (status === 'succeeded') {
      return Array.isArray(output) ? output : [output];
    }
    if (status === 'failed' || status === 'canceled') {
      throw new Error(`Replicate prediction ${status}: ${error || 'unknown error'}`);
    }

    await sleep(intervalMs);
  }
  throw new Error('Replicate prediction timed out');
}

async function callStability({ imageUrl, preset, params }) {
  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) throw new Error('STABILITY_API_KEY not configured');

  // Download original image first
  const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 30000 });
  const imgBuffer = Buffer.from(imgRes.data);

  // Call Stability image-to-image (REST v1)
  const FormData = require('form-data');
  const form = new FormData();
  form.append('init_image', imgBuffer, { filename: 'image.jpg', contentType: 'image/jpeg' });
  form.append('text_prompts[0][text]', params.prompt || buildPrompt(preset));
  form.append('text_prompts[0][weight]', '1');
  form.append('cfg_scale', String(params.guidance_scale ?? 7));
  form.append('samples', String(params.num_outputs ?? 1));
  form.append('steps', '30');
  form.append('image_strength', String(params.strength ?? 0.35));

  const res = await axios.post(
    `${STABILITY_API_BASE}/image-to-image`,
    form,
    {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json'
      },
      timeout: 120000
    }
  );

  const artifacts = res.data.artifacts || [];
  return artifacts.map((a) => Buffer.from(a.base64, 'base64'));
}

async function callOpenAI({ preset, params }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const res = await axios.post(
    'https://api.openai.com/v1/images/generations',
    {
      prompt: params.prompt || buildPrompt(preset),
      n: params.num_outputs ?? 1,
      size: params.size || '1024x1024',
      response_format: 'b64_json'
    },
    {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: 120000
    }
  );

  return (res.data.data || []).map((item) => Buffer.from(item.b64_json, 'base64'));
}

function buildPrompt(preset) {
  const prompts = {
    'bob-short': 'A person with a short bob hairstyle, photorealistic, professional photo',
    'long-waves': 'A person with long wavy hair, photorealistic, professional photo',
    pixie: 'A person with a modern pixie cut, photorealistic, professional photo',
    'fade-beard': 'A person with a fade haircut and groomed beard, photorealistic, professional photo',
    'blonde-balayage': 'A person with warm blonde balayage hair color, photorealistic, professional photo'
  };
  return prompts[preset] || `A photorealistic portrait with ${preset} hairstyle, professional photo`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { generateImage };
