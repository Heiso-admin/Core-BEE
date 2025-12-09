"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect, useCallback, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { ActionButton } from "@/components/primitives";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { useSite } from '@/providers/site';
import { LogoImage } from '../_components/logo-image';
import { saveSiteSetting } from '../_server/setting.service';

const urlField = z
  .string()
  .url('Please enter a valid URL')
  .or(z.literal(''))
  .optional();

const settingsSchema = z.object({
  basic: z.object({
    name: z.string().min(2, 'Site name must be at least 2 characters').max(32),
    title: z.string().min(2, 'Site title must be at least 2 characters'),
    base_url: z.string().min(1, 'Base URL must be at least 1 character'),
    domain: z.string().min(1, 'Domain must be at least 1 character'),
  }),
  branding: z.object({
    slogan: z.string().optional(),
    organization: z.string().optional(),
    description: z.string().optional(),
    copyright: z.string().optional(),
  }),
  assets: z.object({
    favicon: z.string().optional(),
    logo: z.string().optional(),
    ogImage: z.string().optional(),
  }),
  social: z.object({
    facebook: urlField,
    x_twitter: urlField,
    others: z
      .array(
        z.object({
          platform: z.string().min(1),
          url: z.string().url('Please enter a valid URL').optional(),
        })
      )
      .optional(),
  }),
  seo_advanced: z
    .object({
      google_verification: z.string().optional(),
      robots_content: z.string().optional(),
      google_analytics: z.string().optional(),
    })
    .optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;
export type SiteSetting = SettingsFormValues;

const defaultValues: SettingsFormValues = {
  basic: {
    name: '',
    title: '',
    base_url: '',
    domain: '',
  },
  branding: {
    slogan: '',
    organization: '',
    description: '',
    copyright: '',
  },
  assets: {
    favicon: '',
    logo: '',
    ogImage: '',
  },
  social: {
    facebook: '',
    x_twitter: '',
    others: [
      // { platform: 'linkedin', url: '' },
      // { platform: 'tiktok', url: '' },
    ],
  },
  seo_advanced: {
    google_verification: '',
    robots_content: '',
    google_analytics: '',
  },
};

export default function Setting() {
  const [isLoading, startTransition] = useTransition();
  const { site, refresh } = useSite();
  const t = useTranslations('dashboard.settings.site');

  // 將 DB 讀取到的 site 物件映射到表單預設值，容忍 snake/camel 命名差異
  const mapSiteToFormValues = useCallback((s: any | null | undefined): SettingsFormValues => {
    const basic = s?.basic ?? {};
    const branding = s?.branding ?? {};
    const assets = s?.assets ?? {};
    const social = s?.social ?? defaultValues.social;
    const advanced = s?.seo_advanced ?? s?.seoAdvanced ?? {};

    return {
      basic: {
        name: basic?.name ?? '',
        title: basic?.title ?? '',
        base_url: basic?.base_url ?? basic?.baseUrl ?? '',
        domain: basic?.domain ?? '',
      },
      branding: {
        slogan: branding?.slogan ?? '',
        organization: branding?.organization ?? '',
        description: branding?.description ?? '',
        copyright: branding?.copyright ?? '',
      },
      assets: {
        favicon: assets?.favicon ?? '',
        logo: assets?.logo ?? '',
        ogImage: assets?.ogImage ?? '',
      },
      social: Array.isArray(social)
        ? {
          facebook:
            social.find((it: any) => it?.platform === 'facebook')?.url ?? '',
          x_twitter:
            social.find((it: any) => it?.platform === 'x_twitter')?.url ?? '',
          others: social
            .filter(
              (it: any) =>
                it?.platform !== 'facebook' &&
                it?.platform !== 'x_twitter',
            )
            .map((it: any) => ({ platform: it?.platform ?? '', url: it?.url ?? '' })),
        }
        : {
          facebook: social?.facebook ?? '',
          x_twitter: social?.x_twitter ?? '',
          others: Array.isArray(social?.others)
            ? social.others.map((it: any) => ({ platform: it?.platform ?? '', url: it?.url ?? '' }))
            : defaultValues.social.others,
        },
      seo_advanced: {
        google_verification: advanced?.google_verification ?? advanced?.googleVerification ?? '',
        robots_content: advanced?.robots_content ?? advanced?.robotsContent ?? '',
        google_analytics: advanced?.google_analytics ?? advanced?.googleAnalytics ?? '',
      },
    };
  }, []);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: site ? mapSiteToFormValues(site) : defaultValues,
  });

  // 動態社群連結 field array
  const socialFieldArray = useFieldArray({ control: form.control, name: 'social.others' });

  // 當 site 資料載入後，重置表單以讀取 DB 值
  useEffect(() => {
    if (!site) return;
    form.reset(mapSiteToFormValues(site));
  }, [site, form, mapSiteToFormValues]);

  async function onSubmit(data: SettingsFormValues) {
    startTransition(async () => {
      await saveSiteSetting(data);
      refresh();
      toast.success(t('toast.success'));
    });
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-card/50 p-6">
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-semibold">{t('basic.title')}</h2>
                <p className="text-sm text-muted-foreground">
                  {t('basic.description')}
                </p>
              </div>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="basic.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('basic.form.name.label')}</FormLabel>
                      <FormControl>
                        <Input {...field} maxLength={32} />
                      </FormControl>
                      <FormDescription>
                        {t('basic.form.name.description')}
                      </FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="basic.title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('basic.form.title.label')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="basic.base_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('basic.form.base_url.label')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="basic.domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('basic.form.domain.label')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Branding */}
          <Card className="bg-card/50 p-6">
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-semibold">{t('branding.title')}</h2>
                <p className="text-sm text-muted-foreground">
                  {t('branding.description')}
                </p>
              </div>
              <div className="grid gap-4">
                {/* Logo 放置於品牌區塊 */}
                <FormField
                  control={form.control}
                  name="assets.logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('assets.form.logo.label')}</FormLabel>
                      <FormControl>
                        <LogoImage
                          value={field.value}
                          onChange={(url) => field.onChange(url ?? '')}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assets.favicon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('assets.form.favicon.label')}</FormLabel>
                      <FormControl>
                        <LogoImage
                          value={field.value}
                          onChange={(url) => field.onChange(url ?? '')}
                          className="h-12 w-auto"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="branding.organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('branding.form.organization.label')}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="branding.slogan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('branding.form.slogan.label')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="branding.description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('branding.form.description.label')}
                      </FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="branding.copyright"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('branding.form.copyright.label')}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

            </div>
          </Card>

          {/* SEO Advanced */}
          <Card className="bg-card/50 p-6">
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-semibold">{t('advanced.title')}</h2>
                <p className="text-sm text-muted-foreground">
                  {t('advanced.description')}
                </p>
              </div>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="assets.ogImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('assets.form.ogImage.label')}</FormLabel>
                      <FormControl>
                        <LogoImage
                          value={field.value}
                          onChange={(url) => field.onChange(url ?? '')}
                          className='h-18 w-auto'
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seo_advanced.google_verification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('advanced.form.google_verification.label')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={`<meta name=\"google-site-verification\" content=\"...\" />`}
                        />
                      </FormControl>
                      <FormDescription>
                        {t.rich('advanced.form.google_verification.description', {
                          Link: (chunks) => (
                            <a
                              href="https://search.google.com/search-console/welcome"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:no-underline"
                            >
                              {chunks}
                            </a>
                          ),
                        })}
                      </FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seo_advanced.google_analytics"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('advanced.form.google_analytics.label')}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={`<!-- Google tag (gtag.js) -->\n<script async src=\"https://www.googletagmanager.com/gtag/js?id=G-XXXX\"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n  gtag('config', 'G-XXXX');\n</script>`}
                        />
                      </FormControl>
                      <FormDescription>
                        {t.rich('advanced.form.google_analytics.description', {
                          Link: (chunks) => (
                            <a
                              href="https://analytics.google.com/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:no-underline"
                            >
                              {chunks}
                            </a>
                          ),
                        })}
                      </FormDescription>
                    </FormItem>
                  )}
                />
                {/* <FormField
                  control={form.control}
                  name="seo_advanced.robots_content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('advanced.form.robots_content.label')}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={t('advanced.form.robots_content.placeholder')}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                /> */}
              </div>
            </div>
          </Card>

          {/* Social */}
          <Card className="bg-card/50 p-6">
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-semibold">{t('social.title')}</h2>
                <p className="text-sm text-muted-foreground">
                  {t('social.description')}
                </p>
              </div>
              <div className="grid gap-4">

                <FormField
                  control={form.control}
                  name="social.facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('social.form.facebook.label')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="social.x_twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('social.form.x_twitter.label')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {socialFieldArray.fields.map((field, index) => (
                  <div key={field.id} className="grid gap-2 grid-cols-[3fr_8fr_auto] items-end w-full">
                    <FormField
                      control={form.control}
                      name={`social.others.${index}.platform` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('social.form.platform.label')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`social.others.${index}.url` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('social.form.url.label')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="flex items-end">
                      <ActionButton
                        variant="outline"
                        className="text-muted-foreground"
                        onClick={() => socialFieldArray.remove(index)}
                      >
                        {t('social.form.remove')}
                      </ActionButton>
                    </div>
                  </div>
                ))}
                <div>
                  <ActionButton
                    type="button"
                    variant="outline"
                    onClick={() => socialFieldArray.append({ platform: '', url: '' })}
                  >
                    {t('social.form.add')}
                  </ActionButton>
                </div>
              </div>
            </div>
          </Card>



          <div className="flex justify-end">
            <ActionButton
              type="submit"
              loading={isLoading}
              disabled={isLoading}
            >
              {t('actions.save.button')}
            </ActionButton>
          </div>
        </form>
      </Form>
    </div>
  );
}
