import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2Endpoint = process.env.R2_ENDPOINT;
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const r2Bucket = process.env.R2_BUCKET;

if (!r2Endpoint || !r2AccessKeyId || !r2SecretAccessKey || !r2Bucket) {
  // Keep runtime errors clear if env vars are missing.
  console.warn("R2 environment variables are not fully configured.");
}

const r2Client = new S3Client({
  region: "auto",
  endpoint: r2Endpoint,
  credentials: r2AccessKeyId && r2SecretAccessKey ? {
    accessKeyId: r2AccessKeyId,
    secretAccessKey: r2SecretAccessKey,
  } : undefined,
});

export async function getSignedDownloadUrl(objectKey: string, expiresInSeconds = 60 * 15) {
  if (!r2Bucket) {
    throw new Error("R2_BUCKET is not configured");
  }

  const command = new GetObjectCommand({
    Bucket: r2Bucket,
    Key: objectKey,
  });

  return getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
}
