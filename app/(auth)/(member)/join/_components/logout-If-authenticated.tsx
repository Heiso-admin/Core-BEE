'use client';

import Header from '@/modules/auth/_components/header';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';

export function LogoutIfAuthenticated() {
  const t = useTranslations('auth.signup');
  return (
    <>
      <Header title={t('title')} className="mb-0" />
      <p className="whitespace-pre-line text-center">{t('logout')}</p>

      <Button onClick={() => signOut()}>Logout</Button>
    </>
  );
}
