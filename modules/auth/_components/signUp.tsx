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
import { calcStrength, Progress, ProgressLabel } from "@/components/ui/progress";
import AuthRedirectHint from "./authRedirectHint";
import { motion } from 'framer-motion';
import Header from './header';

export default function SignUp({ email }: { email?: string | null }) {
  const t = useTranslations('auth.signup');
  const p = useTranslations('auth.resetPassword.password.strength');
  const [error, setError] = useState("");

  const signupSchema = z
    .object({
      name: z.string().min(3, { message: t('name.error') }),
      password: z.string().min(8, t('password.error')).or(z.literal('')),
      confirmPassword: z.string(),
    })
    .refine(
      (v) => {
        // 只有在 password 不是空的時候，才檢查
        if (v.password) {
          return v.password === v.confirmPassword;
        }
        return true;
      },
      {
        message: t('mismatch'),
        path: ['confirmPassword'],
      }
    )
    .refine(
      (v) => {
        if (v.password) {
          return calcStrength(v.password) >= 50;
        }
        return true;
      },
      {
        message: p('error'),
        path: ['password'],
      }
    );

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: email ? email.split("@")[0] : "",
      password: "",
      confirmPassword: "",
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
    console.log(user);

    if (!user) {
      setError(t("error"));
      return;
    }

    redirect("/login");
  };

  return (
    <>
      <Header
        title={t('title')}
        description={t('description', { email: email || "email" })}
      />
      <p className="text-destructive text-sm w-full text-center">{error}</p>
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
                      {pwd !== "" &&
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-2"
                        >
                          <Progress value={strength} className="w-full" />
                          <ProgressLabel passwordStrength={strength} className="text-sm text-neutral" />

                        </motion.div>
                      }
                    </FormItem>
                  );
                }}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel className="text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {t("password.confirm")}
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          id="confirmPassword"
                          placeholder={t("password.placeholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
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
      </Form >
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
