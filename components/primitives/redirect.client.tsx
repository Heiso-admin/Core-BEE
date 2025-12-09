'use client';

import { useRouter } from 'next/navigation';

export function ClientRedirect({ url }: { url: string }) {
  const router = useRouter();
  router.push(url);
  return null;
}
