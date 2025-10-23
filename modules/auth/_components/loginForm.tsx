"use client";

// import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
import { login } from "@/server/services/auth";

export default function LoginForm({ email }: { email?: string | null }) {
  const t = useTranslations("auth.login");
  const [error, setError] = useState("");
  const router = useRouter();
  const { update } = useSession();

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

    const result = await login(email, password);
    console.log("result: ", result);
    if (!result) {
      setError(t("error"));
      return;
    }

    await update();
    router.push("/dashboard");
  };

  return (
    <>
      {error && <p className="w-full text-center text-destructive">{error}</p>}
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
                          // required
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
                          className="ml-auto inline-block text-sm text-primary hover:text-primary/80"
                          href="/auth/forgot-password"
                          tabIndex={-1}
                        >
                          {t("password.forgot")}
                        </a>
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          id="password"
                          autoComplete="current-password"
                          // required
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

          <div>
            <ActionButton
              type="submit"
              className="w-full bg-primary hover:bg-primary/80"
              loading={form.formState.isSubmitting}
            >
              {t("submit")}
            </ActionButton>
          </div>
        </form>
      </Form>
    </>
  );
}
