"use client";

import { ActionButton } from "@heiso/core/components/primitives";
import { LanguageSwitcher } from "@heiso/core/components/primitives/language-switcher";
import { Card } from "@heiso/core/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@heiso/core/components/ui/form";
import { Input } from "@heiso/core/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@heiso/core/components/ui/select";
import type { Locale } from "@heiso/core/i18n/config";
import { defaultLocale, getLanguageInfo } from "@heiso/core/i18n/config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import {
  getGeneralSettings,
  saveDefaultLanguage,
  saveGeneralSetting,
} from "../../_server/general.service";

export const SystemOauth = {
  none: {
    name: "None",
    value: "none",
  },
  google: {
    name: "Google SSO",
    value: "google",
  },
  microsoft: {
    name: "Azure SSO",
    value: "microsoft",
  },
  // github: {
  //   name: "Github SSO",
  //   value: "github",
  // },
};

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
  const [generalSettings, setGeneralSettings] = useState<any>(null);
  const [currentLocale, setCurrentLocale] = useState<Locale | undefined>();

  const fetchSettings = useCallback(async () => {
    try {
      const data = await getGeneralSettings();
      setGeneralSettings(data);
    } catch (error) {
      console.error("Failed to fetch general settings", error);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // 將 DB 讀取到的 site 物件映射到表單預設值，容忍 snake/camel 命名差異
  const mapSiteToFormValues = useCallback(
    (s: any | null | undefined): SettingsFormValues => {
      const basic = s?.basic ?? {};
      const branding = s?.branding ?? {};
      const assets = s?.assets ?? {};
      const system_oauth = s?.system_oauth ?? "none";

      return {
        basic: {
          name: basic?.name ?? "",
          title: basic?.title ?? "",
          base_url: basic?.base_url ?? basic?.baseUrl ?? "",
          domain: basic?.domain ?? "",
        },
        branding: {
          slogan: branding?.slogan ?? "",
          organization: branding?.organization ?? "",
          description: branding?.description ?? "",
          copyright: branding?.copyright ?? "",
        },
        assets: {
          favicon: assets?.favicon ?? "",
          logo: assets?.logo ?? "",
          ogImage: assets?.ogImage ?? "",
        },
        system_oauth,
      };
    },
    [],
  );

  // 以 DB 的 general_settings 為主，顯示系統預設語言
  useEffect(() => {
    const locale = (generalSettings as any)?.language?.default as
      | Locale
      | undefined;
    setCurrentLocale(locale ?? defaultLocale);
  }, [generalSettings]);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: mapSiteToFormValues(generalSettings),
  });

  // 當 generalSettings 資料載入後，重置表單以讀取 DB 值
  useEffect(() => {
    if (!generalSettings) return;
    form.reset(mapSiteToFormValues(generalSettings));
  }, [generalSettings, form, mapSiteToFormValues]);

  async function onSubmit(data: SettingsFormValues) {
    startTransition(async () => {
      await saveGeneralSetting(data);
      await fetchSettings();
      toast.success("General settings updated");
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
              {/* <div>
                <h2 className="text-lg font-semibold">{t('basic.title')}</h2>
                <p className="text-sm text-muted-foreground">
                  {t('basic.description')}
                </p>
              </div> */}
              <div className="grid gap-4">
                {/* <FormField
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
                /> */}
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
                      <FormLabel>
                        {t("basic.form.system_oauth.label")}
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {Object.values(SystemOauth).map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                  {item.name}
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
              <span className="text-sm font-medium">
                {t("language.default")}
              </span>
              <p className="text-xs text-muted-foreground">
                {t("language.default_description")}
              </p>
            </div>
            <div className="">
              <LanguageSwitcher
                className="border rounded-md w-48 h-12"
                lang={currentLocale}
                onChange={(value) => {
                  setCurrentLocale(value);
                  startTransition(async () => {
                    await saveDefaultLanguage(value);
                    await fetchSettings();
                    toast("Language settings saved");
                  });
                }}
              >
                {getLanguageInfo(currentLocale ?? defaultLocale)?.nativeName}
              </LanguageSwitcher>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
