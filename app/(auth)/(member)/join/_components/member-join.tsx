"use client";

import { useState } from "react";
import { ActionButton, PasswordInput, RandomAvatar } from "@/components/primitives";
import { removeJoinToken } from "../_server/member.service";
import { signup } from "@/server/services/auth";
import { AccountConfirmAlert } from "./account-confirm-alert";
import { useTranslations } from 'next-intl';
import Header from '@/modules/auth/_components/header';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { calcStrength, Progress, ProgressLabel } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { type JoinUser } from '../page';


export function MemberJoin({ user }: { user: JoinUser | null }) {
  const t = useTranslations('auth.signup');
  const p = useTranslations('auth.resetPassword.password.strength');

  const email = user?.email || "";
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // 加入流程等同註冊：改由表單送出時執行 `signup` 與移除 join-token

  const signupSchema = z
    .object({
      name: z.string().min(3, { message: t('name.error') }),
      email: z.email().min(3, { message: t('email.error') }),
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
      name: (user?.name ?? "") || email.split("@")[0],
      email: email,
      password: "",
      confirmPassword: "",
    },
  });
  const pwd = form.watch('password');
  const strength = calcStrength(pwd ?? '');

  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    const signupEmail = data.email;
    if (!signupEmail) {
      setError(t("email.missing"));
      return;
    }
    console.log("signupEmail", data);

    try {
      // 使用通用 signup 服務：建立/更新使用者（姓名、密碼）並將成員狀態設為 review（非首位使用者）
      await signup({ name: data.name, email: data.email, password: data.password ?? "" });
      setSubmitted(true);
      setError("");
    } catch (e) {
      console.error("member-join signup error", e);
      setError(t("error.general"));
    }
  };

  if (submitted) {
    return <AccountConfirmAlert user={user} />;
  }

  return (
    <>
      <Header
        title={t('title')}
        className="mb-0"
      />
      <p className="text-destructive text-sm w-full text-center -mt-1 mb-1">{error}</p>
      <Form {...form}>
        <form className="mb-4 space-y-4 w-full" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4 mb-8">

            <div className="flex flex-row items-center justify-center gap-4">
              <span className="text-md"> {email}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel required className="text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
                      <FormLabel required className="text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
                      {pwd && pwd !== "" &&
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
                      <FormLabel required className="text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
                  )
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
    </>
  );
}


