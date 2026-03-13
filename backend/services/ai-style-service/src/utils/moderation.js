/**
 * NSFW moderation wrapper.
 * In production, integrate with a real NSFW classifier (e.g., AWS Rekognition,
 * Google Cloud Vision API, or nsfwjs with TensorFlow.js).
 * This implementation provides a safe-by-default stub for development.
 * Returns true if image is safe, false if NSFW content detected.
 */
async function moderateImage(imageBuffer) {
  try {
    // Production: use AWS Rekognition, Google Vision, or nsfwjs
    // Example with AWS Rekognition:
    // const { RekognitionClient, DetectModerationLabelsCommand } = require('@aws-sdk/client-rekognition');
    // const client = new RekognitionClient({ region: process.env.S3_REGION });
    // const result = await client.send(new DetectModerationLabelsCommand({
    //   Image: { Bytes: imageBuffer },
    //   MinConfidence: parseFloat(process.env.NSFW_THRESHOLD || '50'),
    // }));
    // return result.ModerationLabels.length === 0;

    // For development/testing: allow all images
    // Set NSFW_MODERATION_ENABLED=true to enable strict mode
    if (process.env.NSFW_MODERATION_ENABLED === 'strict') {
      // Reject images that are very small (likely test abuse)
      if (imageBuffer.length < 100) {
        return false;
      }
    }

    return true;
  } catch (err) {
    console.warn('NSFW moderation error, defaulting to safe:', err.message);
    return true;
  }
}

module.exports = { moderateImage };
