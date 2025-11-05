"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { redirect } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ActionButton, PasswordInput } from "@/components/primitives";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signup } from "@/server/services/auth";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import AuthRedirectHint from "./authRedirectHint";

export default function SignUp({ email }: { email?: string | null }) {
  const t = useTranslations('auth.signup');
  const p = useTranslations('auth.resetPassword.password.strength');
  const [error, setError] = useState("");

  const calcStrength = (pwd: string) => {
    let s = 0;
    if (pwd.length >= 8) s += 25;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) s += 25;
    if (/\d/.test(pwd)) s += 25;
    if (/[^a-zA-Z\d]/.test(pwd)) s += 25;
    return s;
  };

  const signupSchema = z
        .object({
            name: z.string().min(3, { message: t('name.error') }),
            password: z.string().min(8, t('password.error')),
        })
        .refine((v) => calcStrength(v.password) >= 50, {
            message: p('error'),
            path: ['password'],
        });

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: email ? email.split("@")[0] : "",
      password: "",
    },
  });

  const pwd = form.watch('password');
  const strength = calcStrength(pwd ?? '');

  type SignupFormValues = z.infer<typeof signupSchema>;

  const onSubmit = async (data: SignupFormValues) => {
    const signupEmail = email ?? "";
    if (!signupEmail) {
      setError(t("email.missing"));
      return;
    }
    const user = await signup({ name: data.name, email: signupEmail, password: data.password });
    if (!user) {
      setError(t("error"));
      return;
    }

    redirect("/login");
  };

  return (
    <>
      {error && <p className="w-full text-center text-destructive">{error}</p>}
      <Form {...form}>
        <form className="mt-6 mb-4 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4 mb-8">
            <div className="flex flex-col space-y-1">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel className="text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {t("name.label")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="name"
                          type="text"
                          placeholder={t("name.placeholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel className="text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {t("password.label")}
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          id="password"
                          autoComplete="new-password"
                          placeholder={t("password.placeholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                       <div className="mt-2">
                        <Progress value={strength} className="w-full" />
                        <div className="mt-1 text-sm text-muted-foreground">
                            {p('label')}
                            <span className="font-medium">
                                {strength === 100
                                    ? p('strong')
                                    : strength >= 75
                                        ? p('good')
                                        : strength >= 50
                                            ? p('fair')
                                            : p('weak')}
                            </span>
                        </div>
                    </div>
                    </FormItem>
                  );
                }}
              />
            </div>
          </div>
          <ActionButton
              type="submit"
              className="w-full bg-primary hover:-400"
              loading={form.formState.isSubmitting}
            >
              {t("submit")}
            </ActionButton>
        </form>
      </Form>
      <AuthRedirectHint>
          {t.rich('haveAccount', {
            link: (chunks) => (
              <Link 
                href="/login" 
                className="underline ml-2"
              >
                {chunks}
              </Link>
            ),
          })}
      </AuthRedirectHint>
    </>
  );
}
