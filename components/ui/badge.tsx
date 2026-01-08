import { cn } from "@heiso/core/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        tag: "border-secondary bg-sub-background text-muted-foreground",
      },
      status: {
        yellow:
          "rounded-sm bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
        green:
          "rounded-sm bg-green-100 text-green-800 dark:border-green-700 dark:bg-green-900/40 dark:text-green-300",
        blue: "rounded-sm bg-sky-100 text-sky-800 dark:border-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
        red: "rounded-sm bg-red-100 text-red-800 dark:border-red-700 dark:bg-red-900/40 dark:text-red-300",
        draft:
          "rounded-sm bg-gray-100 text-gray-700 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300",
        hidden:
          "rounded-sm bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  status,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  const dotColorMap = {
    yellow: "bg-amber-800",
    green: "bg-green-800",
    blue: "bg-sky-800",
    red: "bg-red-800",
    draft: "bg-gray-700",
    hidden: "bg-slate-500",
  };

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, status }), className)}
      {...props}
    >
      {status && (
        <span
          className={cn(
            "size-1.5 rounded-full mr-0.5",
            dotColorMap[status as keyof typeof dotColorMap],
          )}
        />
      )}
      {props.children}
    </Comp>
  );
}

export { Badge, badgeVariants };
