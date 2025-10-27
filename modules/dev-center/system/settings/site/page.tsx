"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
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
import { useSite } from "@/providers/site";
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
  const t = useTranslations('devCenter.settings');

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: site || defaultValues,
  });

  async function onSubmit(data: SettingsFormValues) {
    startTransition(async () => {
      await saveSiteSetting(data);
      refresh();
      toast(t("toast.success"));
    });
  }

  return (
    <div className="container mx-auto max-w-5xl justify-start py-10 space-y-6 mb-15">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>

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
                      <FormLabel>{t("basic.name.label")}</FormLabel>
                      <FormControl>
                        <Input {...field} maxLength={32} />
                      </FormControl>
                      <FormDescription>
                        {t("basic.name.description")}
                      </FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="basic.title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("basic.title.label")}</FormLabel>
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
                      <FormLabel>{t("basic.base_url.label")}</FormLabel>
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
                      <FormLabel>{t("basic.domain.label")}</FormLabel>
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
                <h2 className="text-lg font-semibold">{t("branding.title")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("branding.description")}
                </p>
              </div>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="branding.organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("branding.organization.label")}</FormLabel>
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
                      <FormLabel>{t("branding.slogan.label")}</FormLabel>
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
                      <FormLabel>{t("branding.description.label")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="branding.copyright"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("branding.copyright.label")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Assets */}
          <Card className="bg-card/50 p-6">
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-semibold">{t("assets.title")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("assets.description")}
                </p>
              </div>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="assets.logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("assets.logo.label")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assets.favicon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("assets.favicon.label")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assets.ogImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("assets.ogImage.label")}</FormLabel>
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
              {t("actions.save.button")}
            </ActionButton>
          </div>
        </form>
      </Form>
    </div>
  );
}
