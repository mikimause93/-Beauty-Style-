const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.S3_KEY,
  secretAccessKey: process.env.S3_SECRET,
  endpoint: process.env.S3_ENDPOINT || undefined,
  region: process.env.S3_REGION || 'us-east-1',
  s3ForcePathStyle: !!process.env.S3_ENDPOINT
});

const BUCKET = process.env.S3_BUCKET;

/**
 * Uploads a Buffer to S3 and returns the public URL.
 * @param {Buffer} buffer
 * @param {string} key
 * @returns {Promise<string>}
 */
async function uploadBuffer(buffer, key) {
  if (!BUCKET) throw new Error('S3_BUCKET env var is not set');
  const params = {
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',
    ACL: 'public-read'
  };
  const result = await s3.upload(params).promise();
  return result.Location;
}

module.exports = { uploadBuffer };
