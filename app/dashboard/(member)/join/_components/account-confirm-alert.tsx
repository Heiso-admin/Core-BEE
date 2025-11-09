"use client";

import { Button } from "@/components/ui/button";
import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';

export function AccountConfirmAlert({ email }: { email: string }) {
  const t = useTranslations('auth.join');
  return (
    <>
      <p className="whitespace-pre-line text-center">{t('joinSuccess', { email })}</p>
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
