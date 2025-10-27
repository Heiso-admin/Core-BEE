'use client';

import { useState, useTransition, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreHorizontal, Eye, EyeOff, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { deleteApiKey, toggleApiKeyStatus } from '../_server/api-keys.service';
import { EditApiKeyDialog } from './edit-api-key-dialog';
import type { TPublicApiKey } from '@/lib/db/schema';

export interface TApiKeyWithKeyPrefix extends TPublicApiKey {
  keyPrefix: string;
}

interface ApiKeysListProps {
  initialApiKeys?: TApiKeyWithKeyPrefix[];
  initialTotal?: number;
}

export function ApiKeysList({
  initialApiKeys = [],
  initialTotal = 0,
}: ApiKeysListProps) {
  const t = useTranslations('apiKeys');
  const [apiKeys, setApiKeys] =
    useState<TApiKeyWithKeyPrefix[]>(initialApiKeys);
  const [total, setTotal] = useState(initialTotal);
  const [isPending, startTransition] = useTransition();
  const [editingApiKey, setEditingApiKey] =
    useState<TApiKeyWithKeyPrefix | null>(null);

  useEffect(() => {
    setApiKeys(initialApiKeys);
    setTotal(initialTotal);
  }, [initialApiKeys, initialTotal]);

  const handleToggleStatus = (apiKey: TApiKeyWithKeyPrefix) => {
    startTransition(async () => {
      try {
        const result = await toggleApiKeyStatus(apiKey.id);
        if (result.success) {
          setApiKeys((prev) =>
            prev.map((key) =>
              key.id === apiKey.id ? { ...key, isActive: !key.isActive } : key
            )
          );
          toast.success(t('toggle_success'));
        } else {
          toast.error(result.error || t('toggle_error'));
        }
      } catch (error) {
        toast.error(t('toggle_error'));
      }
    });
  };

  const handleDelete = (apiKey: TApiKeyWithKeyPrefix) => {
    if (!confirm(t('delete_confirm'))) return;

    startTransition(async () => {
      try {
        const result = await deleteApiKey(apiKey.id);
        if (result.success) {
          setApiKeys((prev) => prev.filter((key) => key.id !== apiKey.id));
          setTotal((prev) => prev - 1);
          toast.success(t('delete_success'));
        } else {
          toast.error(result.error || t('delete_error'));
        }
      } catch (error) {
        toast.error(t('delete_error'));
      }
    });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const isExpired = (expiresAt: Date | null) => {
    if (!expiresAt) return false;
    return new Date() > new Date(expiresAt);
  };

  if (apiKeys.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium text-gray-900">
              {t('no_api_keys')}
            </h3>
            <p className="text-sm text-gray-500">
              {t('no_api_keys_description')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t('api_keys_list')}</span>
            <Badge variant="secondary">
              {total} {t('total')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('name')}</TableHead>
                <TableHead>{t('key')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('last_used')}</TableHead>
                <TableHead>{t('expires_at')}</TableHead>
                <TableHead>{t('created_at')}</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{apiKey.name}</div>
                      {apiKey.description && (
                        <div className="text-sm text-gray-500">
                          {apiKey.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {apiKey.keyPrefix}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={apiKey.isActive ? 'default' : 'secondary'}
                        className={
                          apiKey.isActive ? 'bg-green-100 text-green-800' : ''
                        }
                      >
                        {apiKey.isActive ? t('active') : t('inactive')}
                      </Badge>
                      {isExpired(apiKey.expiresAt) && (
                        <Badge variant="destructive">{t('expired')}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(apiKey.lastUsedAt)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(apiKey.expiresAt)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(apiKey.createdAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={isPending}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setEditingApiKey(apiKey)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {t('edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(apiKey)}
                        >
                          {apiKey.isActive ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              {t('deactivate')}
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              {t('activate')}
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(apiKey)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingApiKey && (
        <EditApiKeyDialog
          apiKey={editingApiKey}
          open={!!editingApiKey}
          onOpenChange={(open) => !open && setEditingApiKey(null)}
          onSuccess={(updatedApiKey) => {
            setApiKeys((prev) =>
              prev.map((key) =>
                key.id === updatedApiKey.id ? updatedApiKey : key
              )
            );
            setEditingApiKey(null);
          }}
        />
      )}
    </>
  );
}
