import { type VariantProps } from "class-variance-authority";
import React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import LoadingSpinner from "./spinner";



type ActionButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
    spinner?: React.ReactNode;
  };

// 直接沿用 components/ui/button.tsx 的 buttonVariants 型別
const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ children, loading, spinner, disabled, ...props }, ref) => {
    spinner ||= <LoadingSpinner />;
    if (disabled !== undefined) {
      disabled ||= loading;
    } else if (loading) {
      disabled = true;
    }
    return (
      <Button ref={ref} {...props} disabled={disabled}>
        {loading ? spinner : children}
      </Button>
    );
  },
);
ActionButton.displayName = "ActionButton";

const ActionButtonWithTooltip = React.forwardRef<
  HTMLButtonElement,
  ActionButtonProps & { tooltip: string; delayDuration?: number }
>(({ tooltip, delayDuration, ...props }, ref) => {
  return (
    <Tooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild>
        <ActionButton ref={ref} {...props} />
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
});
ActionButtonWithTooltip.displayName = "ActionButtonWithTooltip";

export { ActionButton, ActionButtonWithTooltip };
export type { ActionButtonProps };
