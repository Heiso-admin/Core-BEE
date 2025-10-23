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

export default function SignUp({ email }: { email?: string | null }) {
  const t = useTranslations("auth.signup");
  const [error, setError] = useState("");

  const signupSchema = z.object({
    name: z.string().min(3, { message: t("name.error") }),
    email: z.string().email(t("email.error")),
    password: z.string().min(6, t("password.error")),
    // agreedToTerms: z.boolean().refine((val) => val === true, {
    //   message: 'You must agree to the terms of service and privacy policy',
    // }),
  });

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: email ? email.split("@")[0] : "",
      email: email ?? "",
      password: "",
    },
  });

  type SignupFormValues = z.infer<typeof signupSchema>;

  const onSubmit = async (data: SignupFormValues) => {
    const user = await signup(data);
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
        <form className="mt-8 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4">
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
                name="email"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel className="text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {t("email.label")}
                      </FormLabel>
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
                      <FormLabel className="text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {t("password.label")}
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
              className="w-full bg-primary hover:-400"
              loading={form.formState.isSubmitting}
            >
              {t("submit")}
            </ActionButton>
          </div>
        </form>
      </Form>

      {/* <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-foreground/40">
              or with
            </span>
          </div>
        </div>

        <div className="mt-6">
          <Button variant="outline" className="w-full">
            <GitHubLogoIcon className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        </div>
      </div> */}
    </>
  );
}
