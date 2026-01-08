import { generateId } from "@heiso/core/lib/id-generator";
import { getPreSignedUrl } from "@heiso/core/lib/s3";
import type { FileRouter, UploadedFile } from "@heiso/core/lib/upload-router";
import * as React from "react";

type ProgressVerboseEvent = {
  loaded: number;
  total: number;
};

export type UploadS3FileOptions<T extends FileRouter> = {
  router: T;
  endpoint: keyof T;
  tenant: string;
  hostEndpoint?: string;
  onProgress?: (progress: number, verbose?: ProgressVerboseEvent) => void;
  onError?: (error: Error) => void;
  onSuccess?: (file: UploadedFile) => void;
  onCancel?: () => void;
};

const handleUploadError = (error: Error) => {
  if (error.name === "AbortError") {
    return new Error("Upload cancelled");
  }
  if (error instanceof Error) {
    return new Error(`Upload failed: ${error.message}`);
  }
  return new Error("An unknown error occurred during upload");
};

export const useUploadS3File = <T extends FileRouter>(
  options: UploadS3FileOptions<T>,
) => {
  const { onProgress, onError, onSuccess, onCancel } = options;

  const [uploadedFile, setUploadedFile] = React.useState<UploadedFile>();
  const [uploadingFile, setUploadingFile] = React.useState<File>();
  const [progress, setProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState(false);

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    setUploadingFile(file);
    setIsUploading(true);

    const { router, endpoint } = options;
    const route = router[endpoint];

    // Validate file type
    if (
      route.accept &&
      !route.accept.some((type) => {
        if (type.includes("*")) {
          return file.type.startsWith(type.replace("*", ""));
        }
        return file.type === type;
      })
    ) {
      throw new Error(`File type ${file.type} not accepted`);
    }

    // Validate file size
    if (file.size > route.maxSize) {
      throw new Error(
        `File size ${file.size} exceeds maximum size of ${route.maxSize}`,
      );
    }

    // Execute middleware
    const metadata = (await route.middleware?.()) || {};

    const ext = file.name.split(".").pop();
    const key = `${generateId()}.${ext}`;
    const { url } = await getPreSignedUrl(options.tenant, key);

    abortController = new AbortController();

    try {
      const xhr = new XMLHttpRequest();
      const uploadPromise = new Promise<UploadedFile>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round(
              ((event.loaded || 0) / (event.total || 1)) * 100,
            );
            setProgress(Math.min(percentage, 100));
            onProgress?.(percentage, {
              loaded: event.loaded,
              total: event.total,
            });
          }
        });

        xhr.addEventListener("load", async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const uploadedFile = {
              url: `${options.hostEndpoint}/${options.tenant}/${key}`,
              key,
              name: file.name,
              size: file.size,
              type: file.type,
            };

            // Execute upload completion callback
            await route.onUploadComplete(uploadedFile, metadata);

            setUploadedFile(uploadedFile);

            onSuccess?.(uploadedFile);
            resolve(uploadedFile);
          } else {
            const error = new Error(`Upload failed with status ${xhr.status}`);
            onError?.(error);
            reject(error);
          }
        });

        xhr.addEventListener("error", () => {
          const error = new Error("Upload failed");
          onError?.(error);
          reject(error);
        });

        xhr.addEventListener("abort", () => {
          onCancel?.();
          reject(new Error("Upload cancelled"));
        });

        xhr.open("PUT", url);
        xhr.send(file);
      });

      abortController.signal.addEventListener("abort", () => {
        xhr.abort();
      });

      return await uploadPromise;
    } catch (error) {
      const handledError = handleUploadError(error as Error);
      onError?.(handledError);
      throw handledError;
    } finally {
      setProgress(0);
      setIsUploading(false);
      setUploadingFile(undefined);
    }
  };

  let abortController: AbortController | null = null;

  const cancel = () => {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  };

  return {
    isUploading,
    progress,
    uploadedFile,
    uploadFile,
    uploadingFile,
    cancel,
  };
};
