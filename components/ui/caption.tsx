"use client";

import {
  Caption as CaptionPrimitive,
  CaptionTextarea as CaptionTextareaPrimitive,
  useCaptionButton,
  useCaptionButtonState,
} from "@platejs/caption/react";
import { createPrimitiveComponent } from "@udecode/cn";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const captionVariants = cva("max-w-full", {
  defaultVariants: {
    align: "center",
  },
  variants: {
    align: {
      center: "mx-auto",
      left: "mr-auto",
      right: "ml-auto",
    },
  },
});

export function Caption({
  align,
  className,
  ...props
}: React.ComponentProps<typeof CaptionPrimitive> &
  VariantProps<typeof captionVariants>) {
  return (
    <CaptionPrimitive
      {...props}
      className={cn(captionVariants({ align }), className)}
    />
  );
}

export function CaptionTextarea(
  props: React.ComponentProps<typeof CaptionTextareaPrimitive>,
) {
  return (
    <CaptionTextareaPrimitive
      {...props}
      className={cn(
        "mt-2 w-full resize-none border-none bg-inherit p-0 font-[inherit] text-inherit",
        "focus:outline-none focus:[&::placeholder]:opacity-0",
        "text-center print:placeholder:text-transparent",
        props.className,
      )}
    />
  );
}

export const CaptionButton = createPrimitiveComponent(Button)({
  propsHook: useCaptionButton,
  stateHook: useCaptionButtonState,
});

export function CaptionTotal({
  className,
  title,
  total,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>&{
  title:string,
  total:number
}) {
  return (
    <div className={cn("flex justify-between items-end relative", className)} {...props}>
      <h1 className="text-2xl leading-none">{title}</h1>
      <span className={cn("text-muted-foreground text-sm leading-none ml-6 mb-0.5",
        "relative after:absolute after:bottom-0 after:-left-1 after:h-3 after:w-px after:bg-muted-foreground after:rotate-15 after:origin-top-right after:content-['']"
      )}> 
      Total {total}</span>
    </div>
  );
}

