"use client";

// import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import { login, verifyPasswordOnly } from "@/server/services/auth";
import Header from "./header";
import AuthRedirectHint from "./authRedirectHint";
import { Button } from "@/components/ui/button";
import { LoginMethodEnum, type LoginStep, LoginStepEnum } from "./loginForm";

interface LoginPasswordProps {
  email?: string | null;
  loginMethod?: string | null;
  setStep: (step: LoginStep) => void;
  handleLoginSuccess: () => void;
  twoStep: boolean;
}

export default function LoginPassword({ email, loginMethod, setStep, handleLoginSuccess, twoStep }: LoginPasswordProps) {
  const t = useTranslations("auth.login");
  const [error, setError] = useState("");
  const { update } = useSession();
  const router = useRouter();

  const formSchema = z.object({
    email: z.string().email({ message: t("email.error") }),
    password: z.string().min(6, { message: t("password.error") }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: email ?? "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError("");
    const { email, password } = values;

    // 若屬於兩步驟登入，先只驗證密碼，成功後導向 2steps 並寄送 OTP
    if (twoStep) {
      const ok = await verifyPasswordOnly(email, password);
      if (!ok) {
        setError(t("error.errorPassword"));
        return;
      }
      router.push(`/login/2steps?email=${encodeURIComponent(email)}`);
      return;
    }

    // 一般密碼登入：建立 Session 並導向 Dashboard
    const result = await login(email, password);
    if (!result) {
      setError(t("error.errorPassword"));
      return;
    }
    await update();
    handleLoginSuccess();
  };

  return (
    <>
      <Header title={t("titlePassword")} />
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
            <div className="flex flex-col space-y-1">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        {t("password.label")}
                        <a
                          className="ml-auto inline-block text-sm text-sub-highlight hover:text-sub-highlight/60"
                          href={`/auth/forgot-password?email=${encodeURIComponent(email || form.watch("email") || "")}`}
                          tabIndex={-1}
                        >
                          {t("password.forgot")}
                        </a>
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          id="password"
                          autoComplete="current-password"
                          placeholder={t("password.placeholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      {error && <p className="w-full text-center text-destructive/80">{error}</p>}
                    </FormItem>
                  );
                }}
              />
            </div>
          </div>
          <ActionButton
            type="submit"
            className="w-full bg-primary hover:bg-primary/80"
            loading={form.formState.isSubmitting}
          >
            {t("submit")}
          </ActionButton>
          <AuthRedirectHint>
            {t.rich('backToLogin', {
              Link: (chunks) => (
                <Button
                  variant="link"
                  className="text-neutral font-normal p-0 underline"
                  onClick={() => setStep(LoginStepEnum.Email)}
                  type="button"
                >
                  {chunks}
                </Button>
              ),
            })}
          </AuthRedirectHint>
        </form>
      </Form>
    </>
  );
}
