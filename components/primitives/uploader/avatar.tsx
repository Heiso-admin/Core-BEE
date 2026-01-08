"use client";

import { RandomAvatar } from "@heiso/core/components/primitives";
import { Avatar, AvatarImage } from "@heiso/core/components/ui/avatar";
import { Button } from "@heiso/core/components/ui/button";
import { Progress } from "@heiso/core/components/ui/progress";
import { useUploadFile } from "@heiso/core/hooks/use-upload-file";
import { cn } from "@heiso/core/lib/utils";
import { X } from "lucide-react";
import * as React from "react";
import { useFilePicker } from "use-file-picker";

type AvatarUploaderProps = {
  onUploadComplete?: (file: {
    url: string;
    key: string;
    name: string;
    size: number;
    type: string;
  }) => void;
  onRemove?: () => void;
  name?: string;
  value?: string;
  className?: string;
};

export const AvatarUploader = ({
  onUploadComplete,
  onRemove,
  name,
  value,
  className,
}: AvatarUploaderProps) => {
  const { uploadFile, progress, isUploading, cancel } = useUploadFile();
  const [uploadedImage, setUploadedImage] = React.useState<string | null>(
    value ?? null,
  );

  React.useEffect(() => {
    setUploadedImage(value ?? "");
  }, [value]);

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
        <div className="relative group">
          <Avatar className="border border-muted-foreground rounded-full shadow-sm h-20 w-20">
            <AvatarImage src={uploadedImage} alt={uploadedImage} />
          </Avatar>

          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full text-white hover:text-white hover:bg-white/20"
              onClick={handleClear}
            >
              <X className="h-2 w-2" />
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
      <button
        title="Upload avatar"
        type="button"
        onClick={openFilePicker}
        disabled={isUploading || loading}
        className={cn(
          "rounded-full shadow-sm h-20 w-20 p-0",
          isUploading && "pointer-events-none opacity-50",
        )}
      >
        <Avatar className="rounded-full shadow-sm h-20 w-20">
          <RandomAvatar name={name ?? ""} />
        </Avatar>
      </button>

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
