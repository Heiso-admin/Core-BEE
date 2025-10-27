import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { DeveloperList } from './_components/developer-list';
import { getDevelopers } from './_server/developer.service';

export default async function DeveloperPage() {
  const developers = await getDevelopers();
  const t = await getTranslations('devCenter.developers');

  return (
    <div className="container m-auto max-w-6xl justify-start py-10 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
      </div>

      <Suspense fallback={<div>{t('loading')}</div>}>
        <DeveloperList data={developers} />
      </Suspense>
    </div>
  );
}
