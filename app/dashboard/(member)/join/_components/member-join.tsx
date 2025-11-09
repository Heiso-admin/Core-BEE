"use client";

import { useState, useTransition } from "react";
import { ActionButton, PasswordInput, RandomAvatar } from "@/components/primitives";
import { join, removeJoinToken, updateBasicProfile } from "../_server/member.service";
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

type JoinUser = { id: string; name?: string | null; email?: string | null; avatar?: string | null } | null;

export function MemberJoin({ user }: { user: JoinUser | null }) {
  const t = useTranslations('auth.signup');
  const j = useTranslations('auth.join');
  const p = useTranslations('auth.resetPassword.password.strength');

  const email = user?.email || "";
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isJoining, startJoiningTransition] = useTransition();
  const [isDeclining, startDecliningTransition] = useTransition();

  const handleJoin = async () => {
    startJoiningTransition(async () => {
      const userId = user?.id;

      if (!userId) {
        setError(t("error.general"));
        return;
      }

      await join(userId);
      // 清掉 join-token，避免持續被導回 token 流程
      await removeJoinToken();
      // 停留在 Join 頁等待審核（status=review），不導向 Dashboard 以免進入重定向迴圈
    });
  };

  const signupSchema = z
    .object({
      name: z.string().min(3, { message: t('name.error') }),
      email: z.string().email({ message: t('email.error') }),
      password: z.string().min(8, t('password.error')).or(z.literal('')).optional(),
      confirmPassword: z.string().optional(),
    }).refine(
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

  console.log("user", user);

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

    if (!user?.id) {
      setError(t("error.general"));
      return;
    }

    try {
      await updateBasicProfile({
        userId: user.id,
        name: data.name,
        email: data.email,
        avatar: user?.avatar ?? null,
        password: data.password && data.password.trim() !== "" ? data.password : undefined,
      });
      await join(user.id);
      await removeJoinToken();
      setSubmitted(true);
      setError("");
    } catch (e) {
      console.error("updateBasicProfile error", e);
      setError(t("error.general"));
    }
  };

  if (submitted) {
    return <AccountConfirmAlert email={email} />;
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
              <Avatar className="rounded-full shadow-sm h-8 w-8">
                <AvatarImage src={user?.avatar ?? ""} alt={user?.name ?? ""} />
                <AvatarFallback asChild>
                  <RandomAvatar name={user?.email ?? ""} />
                </AvatarFallback>
              </Avatar>
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
                      <p className="text-sm text-neutral">{j("passwordDesc")}</p>
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


