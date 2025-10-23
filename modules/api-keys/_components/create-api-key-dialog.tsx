'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Copy, Check } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { createApiKey } from '../_server/api-keys.service';
import type { TPublicApiKey } from '../_schema';

const createApiKeySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  expiresAt: z.date().optional(),
  isActive: z.boolean(),
  rateLimit: z
    .object({
      requests: z.number().int().min(1, 'Requests must be at least 1'),
      window: z.number().int().min(1, 'Window must be at least 1'),
    })
    .optional(),
});

type CreateApiKeyFormData = z.infer<typeof createApiKeySchema>;

interface CreateApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (apiKey: TPublicApiKey) => void;
}

export function CreateApiKeyDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateApiKeyDialogProps) {
  const t = useTranslations('dashboard.apiKeys');
  const [isPending, startTransition] = useTransition();
  const [createdApiKey, setCreatedApiKey] = useState<{
    key: string;
    // keyPrefix: string;
    apiKey: TPublicApiKey;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<CreateApiKeyFormData>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
      rateLimit: {
        requests: 100,
        window: 60,
      },
    },
  });

  const handleSubmit = (data: CreateApiKeyFormData) => {
    startTransition(async () => {
      try {
        const result = await createApiKey({
          name: data.name,
          description: data.description || null,
          expiresAt: data.expiresAt || null,
          isActive: data.isActive,
          rateLimit: data.rateLimit,
        });

        if (result.success && result.apiKey) {
          setCreatedApiKey({
            key: result.apiKey.key,
            apiKey: {
              id: result.apiKey.id,
              userId: result.apiKey.userId,
              name: result.apiKey.name,
              description: result.apiKey.description,
              rateLimit: result.apiKey.rateLimit,
              // keyPrefix: result.apiKey.keyPrefix,
              isActive: result.apiKey.isActive,
              expiresAt: result.apiKey.expiresAt,
              createdAt: result.apiKey.createdAt,
              updatedAt: result.apiKey.updatedAt,
              lastUsedAt: result.apiKey.lastUsedAt,
            },
          });
          toast.success(t('create_success'));
        } else {
          toast.error(result.error || t('create_error'));
        }
      } catch (error) {
        console.error('Error creating API key:', error);
        toast.error(t('create_error'));
      }
    });
  };

  const handleCopyKey = async () => {
    if (!createdApiKey) return;

    try {
      await navigator.clipboard.writeText(createdApiKey.key);
      setCopied(true);
      toast.success(t('key_copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying key:', error);
      toast.error(t('copy_error'));
    }
  };

  const handleClose = () => {
    if (createdApiKey) {
      onSuccess(createdApiKey.apiKey);
      setCreatedApiKey(null);
    }
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {!createdApiKey ? (
          <>
            <DialogHeader>
              <DialogTitle>{t('create_api_key')}</DialogTitle>
              <DialogDescription>
                {t('create_api_key_description')}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('name')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('name_placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('description')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('description_placeholder')}
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>{t('description_help')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiresAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t('expires_at')}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>{t('pick_date')}</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>{t('expires_at_help')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {t('active_status')}
                        </FormLabel>
                        <FormDescription>
                          {t('active_status_help')}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Rate limit fields */}
                <FormField
                  control={form.control}
                  name="rateLimit.requests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('rate_limit_requests')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder={t('rate_limit_placeholder_example')}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        {t('rate_limit_requests_description')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rateLimit.window"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('rate_limit_window_seconds')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder={t('rate_limit_placeholder_example')}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        {t('rate_limit_window_description')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleClose}>
                    {t('cancel')}
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? t('creating') : t('create')}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t('api_key_created')}</DialogTitle>
              <DialogDescription>
                {t('api_key_created_description')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium mb-2">
                  {t('important_notice')}
                </p>
                <p className="text-sm text-yellow-700">
                  {t('copy_key_warning')}
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="api-key-display"
                  className="text-sm font-medium"
                >
                  {t('api_key')}
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 p-3 bg-gray-100 rounded border text-sm font-mono break-all">
                    {createdApiKey.key}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyKey}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">{t('name')}:</span>
                  <p className="text-gray-600">{createdApiKey.apiKey.name}</p>
                </div>
                <div>
                  <span className="font-medium">{t('status')}:</span>
                  <p className="text-gray-600">
                    {createdApiKey.apiKey.isActive
                      ? t('active')
                      : t('inactive')}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>{t('done')}</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
