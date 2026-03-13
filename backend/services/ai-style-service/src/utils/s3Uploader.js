const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3 = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_KEY || '',
    secretAccessKey: process.env.S3_SECRET || '',
  },
});

const BUCKET = process.env.S3_BUCKET || 'beauty-style-uploads';

/**
 * Upload a buffer to S3 and return the public URL.
 */
async function uploadToS3(buffer, key, contentType = 'image/jpeg') {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return `https://${BUCKET}.s3.${process.env.S3_REGION || 'us-east-1'}.amazonaws.com/${key}`;
}

/**
 * Generate a presigned URL for temporary access.
 */
async function getPresignedUrl(key, expiresIn = 3600) {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, command, { expiresIn });
}

module.exports = { uploadToS3, getPresignedUrl };
