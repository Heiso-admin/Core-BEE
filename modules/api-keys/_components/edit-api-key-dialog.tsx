'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, type SubmitHandler } from 'react-hook-form';
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
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { updateApiKey } from '../_server/api-keys.service';
import type { TApiKeyWithKeyPrefix } from './api-keys-list';

const editApiKeySchema = z.object({
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
    .partial()
    .optional(),
});

type EditApiKeyFormData = z.infer<typeof editApiKeySchema>;

interface EditApiKeyDialogProps {
  apiKey: TApiKeyWithKeyPrefix;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (apiKey: TApiKeyWithKeyPrefix) => void;
}

export function EditApiKeyDialog({
  apiKey,
  open,
  onOpenChange,
  onSuccess,
}: EditApiKeyDialogProps) {
  const t = useTranslations('dashboard.apiKeys');
  const [isPending, startTransition] = useTransition();

  console.log('apiKey.rateLimit: ', apiKey.rateLimit);
  const form = useForm<EditApiKeyFormData>({
    resolver: zodResolver(editApiKeySchema),
    defaultValues: {
      name: apiKey.name,
      description: apiKey.description || '',
      expiresAt: apiKey.expiresAt ? new Date(apiKey.expiresAt) : undefined,
      rateLimit: apiKey.rateLimit || undefined,
      isActive: apiKey.isActive,
    },
  });

  const onSubmit: SubmitHandler<EditApiKeyFormData> = (data) => {
    startTransition(async () => {
      try {
        const result = await updateApiKey(apiKey.id, {
          name: data.name,
          description: data.description || null,
          expiresAt: data.expiresAt || null,
          isActive: data.isActive,
          rateLimit:
            data.rateLimit?.requests && data.rateLimit?.window
              ? {
                  requests: data.rateLimit.requests,
                  window: data.rateLimit.window,
                }
              : undefined,
        });

        if (result.success && result.data) {
          onSuccess({ ...result.data, keyPrefix: apiKey.keyPrefix });
          toast.success(t('update_success'));
        } else {
          toast.error(result.error || t('update_error'));
        }
      } catch (error) {
        console.error('Error updating API key:', error);
        toast.error(t('update_error'));
      }
    });
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('edit_api_key')}</DialogTitle>
          <DialogDescription>{t('edit_api_key_description')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <FormDescription>{t('active_status_help')}</FormDescription>
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
                      defaultValue={field.value || 100}
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                      defaultValue={field.value || 60}
                      placeholder={t('rate_limit_placeholder_example')}
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                {isPending ? t('updating') : t('update')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
