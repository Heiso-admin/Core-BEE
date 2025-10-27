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
import { saveKeys } from "../_server/key.service";

export default function Keys() {
  const t = useTranslations('devCenter.keys');

  const keysSchema = z.object({
    openai: z.object({
      api_key: z.string().min(1, t("openai.api_key.required")),
    }),
    github: z.object({
      access_token: z.string().min(1, t("github.access_token.required")),
    }),
    resend: z.object({
      api_key: z.string().min(1, t("resend.api_key.required")),
    }),
  });

  type KeysFormValues = z.infer<typeof keysSchema>;

  const defaultValues: KeysFormValues = {
    openai: {
      api_key: "",
    },
    github: {
      access_token: "",
    },
    resend: {
      api_key: "",
    },
  };

  const [isLoading, startTransition] = useTransition();

  const form = useForm<KeysFormValues>({
    resolver: zodResolver(keysSchema),
    defaultValues: defaultValues,
  });

  async function onSubmit(data: KeysFormValues) {
    startTransition(async () => {
      await saveKeys(data);
      toast(t("toast.success"));
    });
  }

  return (
    <div className="container mx-auto max-w-6xl justify-start py-10 space-y-6 mb-15">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* OpenAI */}
          <Card className="bg-card/50 p-6">
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-semibold">{t("openai.title")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("openai.description")}
                </p>
              </div>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="openai.api_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("openai.api_key.label")}</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormDescription>
                        {t("openai.api_key.description")}
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* GitHub */}
          <Card className="bg-card/50 p-6">
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-semibold">{t("github.title")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("github.description")}
                </p>
              </div>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="github.access_token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("github.access_token.label")}</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormDescription>
                        {t("github.access_token.description")}
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Resend */}
          <Card className="bg-card/50 p-6">
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-semibold">{t("resend.title")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("resend.description")}
                </p>
              </div>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="resend.api_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("resend.api_key.label")}</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormDescription>
                        {t("resend.api_key.description")}
                      </FormDescription>
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
              {t("actions.save")}
            </ActionButton>
          </div>
        </form>
      </Form>
    </div>
  );
}
