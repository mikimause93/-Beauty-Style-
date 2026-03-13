const axios = require('axios');

/**
 * Generate a styled look image using Replicate as primary provider,
 * with Stability AI and OpenAI as fallbacks.
 *
 * @param {string} imageUrl  - Source image URL (uploaded to S3)
 * @param {string} preset    - Style preset (e.g., "glam", "natural", "editorial")
 * @param {object} options   - Additional style options
 * @returns {Promise<string[]>} Array of result image URLs
 */
async function generateLook(imageUrl, preset = 'natural', options = {}) {
  try {
    return await generateWithReplicate(imageUrl, preset, options);
  } catch (replicateErr) {
    console.warn('Replicate failed, trying Stability AI:', replicateErr.message);
    try {
      return await generateWithStability(imageUrl, preset, options);
    } catch (stabilityErr) {
      console.warn('Stability AI failed, trying OpenAI:', stabilityErr.message);
      return await generateWithOpenAI(imageUrl, preset, options);
    }
  }
}

async function generateWithReplicate(imageUrl, preset, _options) {
  const { data } = await axios.post(
    'https://api.replicate.com/v1/predictions',
    {
      version: process.env.REPLICATE_MODEL_VERSION || 'stability-ai/sdxl:latest',
      input: {
        image: imageUrl,
        prompt: buildPrompt(preset),
        negative_prompt: 'nsfw, blurry, low quality',
        num_inference_steps: 30,
        guidance_scale: 7.5,
      },
    },
    {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );

  // Poll for completion
  return pollReplicate(data.id);
}

async function pollReplicate(predictionId, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    await sleep(2000);
    const { data } = await axios.get(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      { headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` } }
    );
    if (data.status === 'succeeded') return data.output || [];
    if (data.status === 'failed') throw new Error(`Replicate failed: ${data.error}`);
  }
  throw new Error('Replicate polling timeout');
}

async function generateWithStability(imageUrl, preset, _options) {
  const { data } = await axios.post(
    'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image',
    {
      init_image: imageUrl,
      text_prompts: [{ text: buildPrompt(preset), weight: 1 }],
      cfg_scale: 7,
      samples: 2,
      steps: 30,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return (data.artifacts || []).map((a) => `data:image/png;base64,${a.base64}`);
}

async function generateWithOpenAI(imageUrl, preset, _options) {
  const { data } = await axios.post(
    'https://api.openai.com/v1/images/variations',
    {
      image: imageUrl,
      n: 2,
      size: '1024x1024',
      response_format: 'url',
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return (data.data || []).map((d) => d.url);
}

function buildPrompt(preset) {
  const presets = {
    glam: 'glamorous makeup look, dramatic eyes, bold lips, high fashion photography, studio lighting',
    natural: 'natural everyday makeup look, dewy skin, soft colors, professional beauty photography',
    editorial: 'editorial avant-garde makeup, artistic expression, high fashion, magazine cover quality',
    bridal: 'elegant bridal makeup, soft romantic look, flawless skin, natural beauty enhanced',
    smoky: 'smoky eye makeup look, sultry and dramatic, professional makeup artist quality',
  };
  return presets[preset] || presets.natural;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { generateLook };
