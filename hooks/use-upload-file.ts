import {
  ourFileRouter,
  type UploadedFile,
} from "@heiso/core/lib/upload-router";
import { useUploadS3File } from "./use-upload-s3-file";

interface UploadFileOptions {
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: Error) => void;
  onCancel?: () => void;
}

const UPLOAD_CONFIG = {
  router: ourFileRouter,
  endpoint: "general",
  tenant: "smartsight",
  hostEndpoint: "https://cdn.heisoo.com",
} as const;

export const useUploadFile = (options?: UploadFileOptions) => {
  return useUploadS3File({
    ...UPLOAD_CONFIG,
    onSuccess: options?.onUploadComplete,
    onError: options?.onUploadError,
    onCancel: options?.onCancel,
  });
};
