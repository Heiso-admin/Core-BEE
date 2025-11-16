"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { ActionButton } from "@/components/primitives";
import { LanguageSwitcher } from "@/components/primitives/language-switcher";
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
import type { Locale } from "@/i18n/config";
import { getLanguageInfo } from "@/i18n/config";
import { useSite } from "@/providers/site";
import { getUserLocale } from "@/server/locale";
import { saveSiteSetting } from "../../_server/setting.service";
import { useTranslations } from 'next-intl';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { capitalize } from 'lodash';

export const SystemOauth = {
  "none": "none",
  "google": "google",
  "github": "github",
  "microsoft": "microsoft"
}

const settingsSchema = z.object({
  basic: z.object({
    name: z.string().min(2, "Site name must be at least 2 characters").max(32),
    title: z.string().min(2, "Site title must be at least 2 characters"),
    base_url: z.string().min(1, "Base URL must be at least 1 character"),
    domain: z.string().min(1, "Domain must be at least 1 character"),
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
  system_oauth: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;
export type SiteSetting = SettingsFormValues;

export default function Setting() {
  const t = useTranslations("dashboard.settings.site");
  const [isLoading, startTransition] = useTransition();
  const { site, refresh } = useSite();
  const [currentLocale, setCurrentLocale] = useState<Locale | undefined>();

  // Get current locale
  useEffect(() => {
    const fetchLocale = async () => {
      const locale = await getUserLocale();
      setCurrentLocale(locale);
    };
    fetchLocale();
  }, []);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      basic: {
        name: site?.basic?.name || "",
        title: site?.basic?.title || "",
        base_url: site?.basic?.base_url || "",
        domain: site?.basic?.domain || "",
      },
      branding: {
        slogan: site?.branding?.slogan || "",
        organization: site?.branding?.organization || "",
        description: site?.branding?.description || "",
        copyright: site?.branding?.copyright || "",
      },
      assets: {
        favicon: site?.assets?.favicon || "",
        logo: site?.assets?.logo || "",
        ogImage: site?.assets?.ogImage || "",
      },
      system_oauth: (site as any)?.system_oauth as string || "none",
    }
  });

  async function onSubmit(data: SettingsFormValues) {
    startTransition(async () => {
      await saveSiteSetting(data);
      refresh();
      toast("Site settings updated");
    });
  }

  return (
    <div className="container mx-auto max-w-5xl justify-start py-10 space-y-6 mb-15 px-10">
      {/* Header with title and language switcher */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-card/50 p-6">
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-semibold">{t("basic.title")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("basic.description")}
                </p>
              </div>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="basic.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("basic.form.name.label")}</FormLabel>
                      <FormControl>
                        <Input {...field} maxLength={32} />
                      </FormControl>
                      <FormDescription>
                        {t("basic.form.name.description")}
                      </FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="basic.title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("basic.form.title.label")}</FormLabel>
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
                      <FormLabel>{t("basic.form.base_url.label")}</FormLabel>
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
                      <FormLabel>{t("basic.form.domain.label")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="system_oauth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("basic.form.system_oauth.label")}</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {Object.values(SystemOauth).map((item) => (
                                <SelectItem key={item} value={item}>
                                  {capitalize(item)}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <ActionButton
              type="submit"
              loading={isLoading}
              disabled={isLoading}
            >
              {t("actions.save.button")}
            </ActionButton>
          </div>
        </form>
      </Form>

      {/* 多国语言设置 */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">{t("language.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("language.description")}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">{t("language.default")}</span>
              <p className="text-xs text-muted-foreground">
                {t("language.default_description")}
              </p>
            </div>
            <div className="">
              <LanguageSwitcher
                className="border rounded-md w-48 h-12"
                lang={currentLocale}
                onChange={setCurrentLocale}
              >
                {getLanguageInfo(currentLocale ?? "en")?.nativeName}
              </LanguageSwitcher>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
