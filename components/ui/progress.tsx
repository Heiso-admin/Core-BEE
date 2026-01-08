"use client";

import { cn } from "@heiso/core/lib/utils";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { useTranslations } from "next-intl";
import type * as React from "react";

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

function ProgressLabel({
  className,
  passwordStrength,
  ...props
}: React.ComponentProps<"p"> & { passwordStrength: number }) {
  const t = useTranslations("auth.resetPassword");
  return (
    <p
      className="text-xs text-foreground flex items-center justify-between"
      {...props}
    >
      <span>{t("password.strength.label")}</span>
      <span>
        {passwordStrength === 100
          ? t("password.strength.strong")
          : passwordStrength >= 75
            ? t("password.strength.good")
            : passwordStrength >= 50
              ? t("password.strength.fair")
              : t("password.strength.weak")}
      </span>
    </p>
  );
}
export const calcStrength = (pwd: string) => {
  let s = 0;
  if (pwd.length >= 8) s += 25;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) s += 25;
  if (/\d/.test(pwd)) s += 25;
  if (/[^a-zA-Z\d]/.test(pwd)) s += 25;
  return s;
};

export { Progress, ProgressLabel };
