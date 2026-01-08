import { saveFile } from "@heiso/core/server/file.service";
import { literalToByte } from "./format";

export type UploadedFile = {
  url: string;
  key: string;
  name: string;
  size: number;
  type: string;
};

export type FileRouter = {
  [K: string]: {
    accept?: string[];
    maxSize: number;
    middleware?: () => Promise<Record<string, unknown>>;
    onUploadComplete: (
      file: UploadedFile,
      metadata: Record<string, unknown>,
    ) => Promise<void>;
  };
};

export const ourFileRouter: FileRouter = {
  general: {
    maxSize: literalToByte("200MB"), // 200MB
    onUploadComplete: async (file) => {
      const result = await saveFile(file);
      console.log("result: ", result);
    },
  },
  editor: {
    accept: ["image/*", "video/*", "text/*", "application/pdf"],
    maxSize: literalToByte("500MB"), // 500MB
    onUploadComplete: async (file) => {
      const result = await saveFile(file);
      console.log("result: ", result);
    },
  },
  logo: {
    accept: ["image/*"],
    maxSize: literalToByte("3MB"), // 3MB
    onUploadComplete: async (file) => {
      const result = await saveFile(file);
      console.log("result: ", result);
    },
  },
};
