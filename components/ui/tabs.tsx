"use client";

import { cn } from "@heiso/core/lib/utils";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import type * as React from "react";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2 min-w-0", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex w-fit items-center justify-center rounded-lg p-[3px]",
        className,
      )}
      {...props}
    />
  );
}

type TabsTriggerProps = React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  variant?: "default" | "tabs" | "preview" | "tabs-column";
};

function TabsTrigger({
  className,
  variant = "default",
  ...props
}: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        variant === "tabs" &&
          "min-w-40 py-2.5 text-Neutral border-none rounded-t-lg rounded-b-none data-[state=active]:shadow-[0_2px_0_0_var(--color-amber-400)] data-[state=active]:text-foreground dark:data-[state=active]:bg-background",
        variant === "preview" && "w-40 rounded-full !shadow-none text-xs",
        variant === "tabs-column" &&
          "w-full rounded-none rounded-l-lg py-3 px-4 mr-4 justify-start bg-transparent text-Neutral dark:data-[state=active]:bg-background data-[state=active]:text-foreground dark:data-[state=active]:border-t-0",
        className,
      )}
      {...props}
    />
  );
}

type TabsContentProps = React.ComponentProps<typeof TabsPrimitive.Content> & {
  variant?: "default" | "tabs" | "preview";
};

function TabsContent({
  className,
  variant = "default",
  ...props
}: TabsContentProps) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "flex-1 outline-none min-w-0 min-h-0",
        variant === "tabs" &&
          "bg-background rounded-sm p-5 mb-3 h-auto min-h-[80dvh]",
        variant === "preview" &&
          "rounded-sm border border-input w-full p-3 overflow-auto",
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
