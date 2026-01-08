"use client";

// import { useState } from 'react';
import { ImageUploader } from "@heiso/core/components/primitives";
import { Plus } from "lucide-react";

export function LogoImage({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (url: string | null) => void;
}) {
  return (
    <div className="border-dashed rounded-md space-y-2">
      <ImageUploader
        value={value}
        onUploadComplete={(file) => {
          console.log(file);
          onChange?.(file.url);
        }}
        onRemove={() => {
          onChange?.(null);
        }}
      >
        <div className="h-12 flex items-center justify-center">
          <Plus />
        </div>
      </ImageUploader>
    </div>
  );
}
