const AWS = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

const s3Client = new AWS.S3Client({
  credentials: {
    accessKeyId: process.env.S3_KEY || '',
    secretAccessKey: process.env.S3_SECRET || ''
  },
  endpoint: process.env.S3_ENDPOINT || undefined,
  region: process.env.S3_REGION || 'us-east-1',
  forcePathStyle: !!process.env.S3_ENDPOINT
});

const BUCKET = process.env.S3_BUCKET;

/**
 * Upload a Buffer to S3-compatible storage.
 * @param {Buffer} buffer - File contents
 * @param {string} key    - S3 object key (path)
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} - Public URL of the uploaded object
 */
async function uploadBuffer(buffer, key, contentType = 'image/jpeg') {
  if (!BUCKET) {
    throw new Error('S3_BUCKET environment variable is not configured');
  }

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      // NOTE: 'public-read' makes objects publicly accessible via URL.
      // For production deployments, remove ACL and use pre-signed URLs for
      // temporary, authenticated access to user-uploaded content.
      ACL: 'public-read'
    }
  });

  const result = await upload.done();
  // Build public URL: prefer endpoint override for DigitalOcean Spaces etc.
  if (process.env.S3_ENDPOINT) {
    return `${process.env.S3_ENDPOINT}/${BUCKET}/${key}`;
  }
  return result.Location || `https://${BUCKET}.s3.${process.env.S3_REGION || 'us-east-1'}.amazonaws.com/${key}`;
}

module.exports = { uploadBuffer };
