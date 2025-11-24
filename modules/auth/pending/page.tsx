"use client";

import { useTranslations } from 'next-intl';
// import { Header } from '../_components';
import { Button } from '@/components/ui/button';
import { useSession, signOut } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export default function Pending() {
  const t = useTranslations('auth.join');
  const { data: session } = useSession();
  const email = session?.user?.email ?? '';
  const searchParams = useSearchParams();
  // const error = searchParams?.get('error');

  return (
    <>
      <div className="space-y-2">
        <p className="whitespace-pre-line text-center">
          {t('notAllowed', { email })}
        </p>
      </div>
      <Button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="block mt-6 mx-auto"
      >
        {t('action.reLogin')}
      </Button>
    </>
  );
}
