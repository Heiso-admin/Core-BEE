"use client";

import { Button } from "@heiso/core/components/ui/button";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { join } from "../_server/member.service";
import type { JoinUser } from "../page";

export function AccountConfirmAlert({ user }: { user: JoinUser | null }) {
  const t = useTranslations("auth.join");
  const email = user?.email || "email";

  // Entering the page should submit for review and clear join-token
  useEffect(() => {
    const run = async () => {
      if (!user?.id) return;
      try {
        await join(user.id);
      } catch (err) {
        console.error("join on mount failed", err);
      }
    };
    run();
  }, [user?.id]);

  return (
    <>
      <p className="whitespace-pre-line text-center">
        {t("joinSuccess", { email: email })}
      </p>
      <Button
        onClick={async () => {
          if (!user?.id) {
            console.error(t("error.general"));
            return;
          }
          // Status has been updated on page load; button only re-login
          await signOut({ callbackUrl: "/login" });
        }}
      >
        {t("action.reLogin")}
      </Button>
    </>
  );
}
