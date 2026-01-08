"use server";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { settings } from "@heiso/core/config";

const kExpiresIn = 500;

let s3Client: S3Client | null = null;

export async function initS3Client() {
  if (s3Client) return s3Client;

  const { AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_S3_REGION } = await settings();
  if (!AWS_ACCESS_KEY || !AWS_SECRET_KEY || !AWS_S3_REGION) {
    throw new Error(
      "AWS_ACCESS_KEY or AWS_SECRET_KEY or AWS_S3_REGION is not set",
    );
  }

  s3Client = new S3Client({
    region: AWS_S3_REGION as string,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY as string,
      secretAccessKey: AWS_SECRET_KEY as string,
    },
  });

  return s3Client;
}

export async function getPreSignedUrl(tenant: string, filename: string) {
  const s3Client = await initS3Client();

  const { AWS_S3_BUCKET } = await settings();
  if (!AWS_S3_BUCKET) {
    throw new Error("AWS_S3_BUCKET is not set");
  }

  const path = `${tenant}/${filename}`;
  const s3Params = {
    Bucket: AWS_S3_BUCKET as string,
    Key: path,
  };

  const command = new PutObjectCommand(s3Params);
  const url = await getSignedUrl(s3Client, command, { expiresIn: kExpiresIn });

  return {
    path,
    url,
  };
}
