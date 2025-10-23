'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateApiKeyDialog } from './create-api-key-dialog';
import type { TPublicApiKey } from '../_schema';

interface CreateApiKeyButtonProps {
  onSuccess?: (apiKey: TPublicApiKey) => void;
}

export function CreateApiKeyButton({ onSuccess }: CreateApiKeyButtonProps) {
  const t = useTranslations('dashboard.apiKeys');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSuccess = (apiKey: TPublicApiKey) => {
    setIsDialogOpen(false);
    onSuccess?.(apiKey);
  };

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        {t('create_api_key')}
      </Button>

      <CreateApiKeyDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleSuccess}
      />
    </>
  );
}
