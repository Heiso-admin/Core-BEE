"use client";

import { Button } from "@heiso/core/components/ui/button";
import { Progress } from "@heiso/core/components/ui/progress";
import { useUploadFile } from "@heiso/core/hooks/use-upload-file";
import { cn } from "@heiso/core/lib/utils";
import { ImageIcon, X } from "lucide-react";
import * as React from "react";
import { useFilePicker } from "use-file-picker";

type ImageUploaderProps = {
  onUploadComplete?: (file: {
    url: string;
    key: string;
    name: string;
    size: number;
    type: string;
  }) => void;
  onRemove?: () => void;
  value?: string;
  className?: string;
  children?: React.ReactNode;
  editMode?: boolean;
  buttonClassName?: string;
  disabled?: boolean;
};

export const ImageUploader = ({
  onUploadComplete,
  onRemove,
  value,
  className,
  children,
  buttonClassName,
  disabled,
}: ImageUploaderProps) => {
  const { uploadFile, progress, isUploading, cancel } = useUploadFile();
  const [uploadedImage, setUploadedImage] = React.useState<string | null>(
    value ?? null,
  );

  const { openFilePicker, loading, clear } = useFilePicker({
    readAs: "DataURL",
    accept: "image/*",
    multiple: false,
    onFilesSelected: async ({ plainFiles }) => {
      if (plainFiles?.length) {
        try {
          const file = plainFiles[0];
          const uploadedFile = await uploadFile(file);
          setUploadedImage(uploadedFile.url);
          onUploadComplete?.(uploadedFile);
        } catch (error) {
          console.error("Upload failed:", error);
        } finally {
          clear();
        }
      }
    },
  });

  const handleClear = () => {
    setUploadedImage(null);
    onRemove?.();
  };

  if (uploadedImage) {
    return (
      <div className={cn("relative inline-block", className)}>
        <div className="relative group w-full h-full">
          {/* biome-ignore lint/performance/noImgElement: Local preview URL */}
          <img
            src={uploadedImage}
            alt={uploadedImage}
            className="max-w-[200px] max-h-[200px] rounded-lg object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-white hover:text-white hover:bg-white/20"
              onClick={openFilePicker}
              disabled={disabled}
            >
              Change
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-white hover:text-white hover:bg-white/20"
              onClick={handleClear}
            >
              Remove
            </Button>
          </div>
        </div>

        {isUploading && (
          <div className="absolute -bottom-8 left-0 right-0 flex items-center gap-2">
            <Progress value={progress} className="flex-1" />
            <Button
              type="button"
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
  }

  return (
    <div className={cn("relative inline-block", className)}>
      <Button
        variant="outline"
        type="button"
        onClick={openFilePicker}
        disabled={isUploading || loading || disabled}
        className={cn(
          "gap-2",
          isUploading && "pointer-events-none opacity-50",
          buttonClassName,
        )}
      >
        {children || (
          <>
            <ImageIcon className="h-4 w-4" />
            <span>Upload Image</span>
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
