"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';
import { signOut } from 'next-auth/react';

export function InvalidJoinToken() {
  const t = useTranslations('auth.join');
  return (
    <>
      <p>{t("error.expiredLink")}</p>
      <Button
        onClick={() => {
          signOut({ callbackUrl: "/login" })
        }}
      >
        {t("action.reLogin")}
      </Button>
    </>
  );
}
