import { ourFileRouter } from "@heiso/core/lib/upload-router";
import { useUploadS3File } from "./use-upload-s3-file";

export const useUploadEditorFile = () => {
  return useUploadS3File({
    router: ourFileRouter,
    endpoint: "editor",
    tenant: "smartsight",
    hostEndpoint: "https://cdn.heisoo.com",
  });
};
