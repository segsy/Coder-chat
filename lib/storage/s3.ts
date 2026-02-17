import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const bucket = process.env.AWS_S3_BUCKET;
const region = process.env.AWS_REGION;

const s3 = new S3Client({
  region,
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      : undefined
});

export async function uploadMp3ToS3(key: string, body: Buffer) {
  if (!bucket || !region) {
    throw new Error('S3 is not configured.');
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: 'audio/mpeg'
    })
  );

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
