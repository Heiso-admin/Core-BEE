"use client";

import { cn } from "@heiso/core/lib/utils";
export function CaptionTotal({
  className,
  title,
  total,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  title: string;
  total: number;
}) {
  return (
    <div
      className={cn("flex justify-between items-end relative", className)}
      {...props}
    >
      <h1 className="text-2xl leading-none">{title}</h1>
      <span
        className={cn(
          "text-muted-foreground text-sm leading-none ml-6 mb-0.5",
          "relative after:absolute after:bottom-0 after:-left-1 after:h-3 after:w-px after:bg-muted-foreground after:rotate-15 after:origin-top-right after:content-['']",
        )}
      >
        Total {total}
      </span>
    </div>
  );
}
