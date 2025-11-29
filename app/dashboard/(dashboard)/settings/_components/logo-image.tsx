"use client";

import { Plus } from "lucide-react";
// import { useState } from 'react';
import { ImageUploader } from "@/components/primitives";

export function LogoImage({
  value,
  onChange,
  className,
}: {
  value?: string;
  onChange?: (url: string | null) => void;
  className?: string;
}) {
  return (
    <div className={`border-dashed rounded-md space-y-2 `}>
      <ImageUploader
        className={className}
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
