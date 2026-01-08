"use client";

import { Button } from "@heiso/core/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@heiso/core/components/ui/form";
import { Input } from "@heiso/core/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { requestPasswordReset } from "../_server/password.service";
import AuthRedirectHint from "./authRedirectHint";
import Header from "./header";

export default function ForgotPasswordPage({
  email,
}: {
  email?: string | null;
}) {
  const t = useTranslations("auth.forgotPassword");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const forgotSchema = z.object({
    email: z.string().email({ message: t("error.invalidEmail") }),
  });

  const form = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: email || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof forgotSchema>) => {
    setIsLoading(true);
    const { email } = values;
    form.clearErrors("email");

    // Basic email validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      form.setError("email", { message: t("error.invalidEmail") });
      setIsLoading(false);
      return;
    }

    try {
      const data = await requestPasswordReset(email);

      if (!data?.ok) {
        throw new Error("Request failed");
      }
      setIsSubmitted(true);
    } catch (err: any) {
      form.setError("email", { message: err?.message || t("error.generic") });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header
        title={t("title")}
        description={
          isSubmitted
            ? t("success.description", { email: email || "email" })
            : t("description")
        }
      />
      <Form {...form}>
        <form className="mt-8 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="flex flex-col space-y-1">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>{t("email.label")}</FormLabel>
                      <FormControl>
                        <Input
                          id="email-address"
                          type="email"
                          autoComplete="email"
                          placeholder={t("email.placeholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("submit.loading")}
                </>
              ) : (
                t("submit.default")
              )}
            </Button>
          </div>
        </form>
      </Form>
      <AuthRedirectHint>
        <Link
          href={`/login?email=${encodeURIComponent(email || form.watch("email") || "")}`}
          className="underline ml-2"
        >
          {t("backToLogin")}
        </Link>
      </AuthRedirectHint>
    </>
  );
}
