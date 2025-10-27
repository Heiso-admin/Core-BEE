"use client";

import { Upload, X } from "lucide-react";
import type * as React from "react";
import { useFilePicker } from "use-file-picker";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUploadFile } from "@/hooks/use-upload-file";
import { cn } from "@/lib/utils";

type UploaderButtonProps = {
  onUploadComplete?: (file: {
    url: string;
    key: string;
    name: string;
    size: number;
    type: string;
  }) => void;
  className?: string;
  children?: React.ReactNode;
};

export const ButtonUploader = ({
  onUploadComplete,
  className,
  children,
}: UploaderButtonProps) => {
  const { uploadFile, progress, isUploading, cancel } = useUploadFile();

  const { openFilePicker, filesContent, loading, clear } = useFilePicker({
    readAs: "DataURL",
    accept: "*",
    multiple: false,
    onFilesSelected: async ({ plainFiles }) => {
      if (plainFiles?.length) {
        try {
          const file = plainFiles[0];
          const uploadedFile = await uploadFile(file);
          onUploadComplete?.(uploadedFile);
        } catch (error) {
          console.error("Upload failed:", error);
        } finally {
          clear();
        }
      }
    },
  });

  return (
    <div className={cn("relative inline-block", className)}>
      <Button
        variant="outline"
        onClick={openFilePicker}
        disabled={isUploading || loading}
        className={cn("gap-2", isUploading && "pointer-events-none opacity-50")}
      >
        {children || (
          <>
            <Upload className="h-4 w-4" />
            <span>Upload File</span>
          </>
        )}
      </Button>

      {isUploading && (
        <div className="absolute -bottom-8 left-0 right-0 flex items-center gap-2">
          <Progress value={progress} className="flex-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0"
            onClick={cancel}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};
