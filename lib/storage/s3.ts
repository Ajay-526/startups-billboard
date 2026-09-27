import { S3Client } from "@aws-sdk/client-s3";

function getStorageConfig() {
  const bucket = process.env.S3_BUCKET;
  const region = process.env.S3_REGION ?? "ap-south-1";
  if (!bucket) throw new Error("S3_BUCKET is required.");
  return { bucket, region };
}

export function getS3Client() {
  const { region } = getStorageConfig();
  return new S3Client({
    region,
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials:
      process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
          }
        : undefined,
  });
}

export function getS3Bucket() {
  return getStorageConfig().bucket;
}
