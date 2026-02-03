import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2Endpoint = process.env.R2_ENDPOINT;
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const reportsBucket = process.env.R2_REPORTS_BUCKET ?? process.env.R2_BUCKET;
const mediaKitBucket = process.env.R2_MEDIA_KIT_BUCKET;

if (!r2Endpoint || !r2AccessKeyId || !r2SecretAccessKey || !reportsBucket) {
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

function normalizeKey(objectKey: string): string {
  return String(objectKey ?? "").replace(/^\/+/, "");
}

function stripBucketPrefix(objectKey: string, bucket: string): string {
  const key = normalizeKey(objectKey);
  const prefix = `${bucket.replace(/^\/+|\/+$/g, "")}/`;
  return key.startsWith(prefix) ? key.slice(prefix.length) : key;
}

export function getReportsBucket(): string {
  if (!reportsBucket) throw new Error("R2_REPORTS_BUCKET is not configured");
  return reportsBucket;
}

export function getMediaKitBucket(): string {
  if (!mediaKitBucket) throw new Error("R2_MEDIA_KIT_BUCKET is not configured");
  return mediaKitBucket;
}

export async function getSignedDownloadUrl(options: {
  bucket: string;
  objectKey: string;
  expiresInSeconds?: number;
  responseContentDisposition?: string;
  responseContentType?: string;
}) {
  const expiresInSeconds = options.expiresInSeconds ?? 60 * 15;
  const bucket = options.bucket;
  const objectKey = normalizeKey(options.objectKey);

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    ResponseContentDisposition: options.responseContentDisposition,
    ResponseContentType: options.responseContentType,
  });

  return getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
}

export async function getSignedReportDownloadUrl(objectKey: string, expiresInSeconds = 60 * 15) {
  const bucket = getReportsBucket();
  const key = stripBucketPrefix(objectKey, bucket);
  return getSignedDownloadUrl({ bucket, objectKey: key, expiresInSeconds });
}

export async function getSignedMediaKitDownloadUrl(objectKey: string, expiresInSeconds = 60 * 15) {
  const bucket = getMediaKitBucket();
  const key = stripBucketPrefix(objectKey, bucket);
  return getSignedDownloadUrl({ bucket, objectKey: key, expiresInSeconds });
}
