import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { getApiKeysList } from './_server/api-keys.service';
import { ApiKeysList } from './_components/api-keys-list';
import { CreateApiKeyButton } from './_components/create-api-key-button';

function ApiKeysLoadingSkeleton() {
  const skeletonItems = [
    { id: 'skeleton-1' },
    { id: 'skeleton-2' },
    { id: 'skeleton-3' },
    { id: 'skeleton-4' },
    { id: 'skeleton-5' },
  ];

  return (
    <div className="space-y-4">
      {skeletonItems.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div className="space-y-2">
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex space-x-2">
            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function ApiKeysPage() {
  const t = await getTranslations('apiKeys');

  return (
    <div className="mx-auto max-w-6xl py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t('title')}</h1>
          <p className="text-sm text-gray-600">{t('description')}</p>
        </div>
        <CreateApiKeyButton />
      </div>

      <Suspense fallback={<ApiKeysLoadingSkeleton />}>
        <ApiKeysManagement />
      </Suspense>
    </div>
  );
}

async function ApiKeysManagement() {
  const { apiKeys, total } = await getApiKeysList();
  return <ApiKeysList initialApiKeys={apiKeys} initialTotal={total} />;
}
