"use client";

import { useTranslations } from "next-intl";
import { Header } from '../_components';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function Pending() {
  const t = useTranslations('auth.join');
  const router = useRouter();
  return (
    <>
      <Header title={t("title")} />
      <p className="whitespace-pre-line text-center">{t('joinSuccess')}</p>
      <Button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className='block mt-6 mx-auto'
      >
        {t("action.reLogin")}
      </Button>
    </>
  );
}
