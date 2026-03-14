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
 * Uploads a buffer to S3 and returns the public URL.
 * @param {Buffer} buffer
 * @param {string} key
 * @returns {Promise<string>}
 */
async function uploadBuffer(buffer, key) {
  const params = {
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',
    ACL: 'public-read'
  };
  const res = await s3.upload(params).promise();
  return res.Location;
}

module.exports = { uploadBuffer };
