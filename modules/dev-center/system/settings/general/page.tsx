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
});

type SettingsFormValues = z.infer<typeof settingsSchema>;
export type SiteSetting = SettingsFormValues;

const defaultValues: SettingsFormValues = {
  basic: {
    name: "",
    title: "",
    base_url: "",
    domain: "",
  },
  branding: {
    slogan: "",
    organization: "",
    description: "",
    copyright: "",
  },
  assets: {
    favicon: "",
    logo: "",
    ogImage: "",
  },
};

export default function Setting() {
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
    defaultValues: site || defaultValues,
  });

  async function onSubmit(data: SettingsFormValues) {
    startTransition(async () => {
      await saveSiteSetting(data);
      refresh();
      toast("Site settings updated");
    });
  }

  return (
    <div className="container mx-auto max-w-5xl justify-start py-10 space-y-6 mb-15">
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
                <h2 className="text-lg font-semibold">Basic Information</h2>
                <p className="text-sm text-muted-foreground">
                  Configure your site's basic information.
                </p>
              </div>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="basic.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Name</FormLabel>
                      <FormControl>
                        <Input {...field} maxLength={32} />
                      </FormControl>
                      <FormDescription>
                        Please use 32 characters at maximum.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="basic.title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
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
                      <FormLabel>Base URL</FormLabel>
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
                      <FormLabel>Domain</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
              Save Changes
            </ActionButton>
          </div>
        </form>
      </Form>

      {/* 多国语言设置 */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Language Settings</h3>
            <p className="text-sm text-muted-foreground">
              Select the default language for your website interface.
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Default Language</span>
              <p className="text-xs text-muted-foreground">
                This will be the default language for new visitors.
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
