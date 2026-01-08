"use client";

import { Button } from "@heiso/core/components/ui/button";
import { Progress } from "@heiso/core/components/ui/progress";
import { useUploadFile } from "@heiso/core/hooks/use-upload-file";
import { cn } from "@heiso/core/lib/utils";
import { X } from "lucide-react";
import * as React from "react";
import { useDropzone } from "react-dropzone";

type DropzoneProps = {
  onUploadComplete?: (file: {
    url: string;
    key: string;
    name: string;
    size: number;
    type: string;
  }) => void;
  onUploadError?: (error: Error) => void;
  className?: string;
};

export const DropzoneUploader = ({
  onUploadComplete,
  onUploadError,
  className,
}: DropzoneProps) => {
  const { uploadFile, progress, isUploading, cancel } = useUploadFile();

  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        try {
          const file = acceptedFiles[0];
          const uploadedFile = await uploadFile(file);
          onUploadComplete?.(uploadedFile);
        } catch (error) {
          onUploadError?.(error as Error);
          console.error("Upload failed:", error);
        }
      }
    },
    [uploadFile, onUploadComplete, onUploadError],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
  });

  return (
    <div className={cn("relative", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-accent",
          isUploading && "pointer-events-none opacity-50",
        )}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          {isDragActive ? (
            <p className="text-sm">Drop the file here</p>
          ) : (
            <>
              <p className="text-sm">
                Drag & drop a file here, or click to select
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Only one file can be uploaded at a time
              </p>
            </>
          )}
        </div>
      </div>

      {isUploading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
          <Progress value={progress} className="w-1/2" />
          <p className="mt-2 text-sm">{progress}% uploaded</p>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={cancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
