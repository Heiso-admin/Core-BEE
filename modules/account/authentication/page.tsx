"use client";

import { ActionButton } from "@heiso/core/components/primitives";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@heiso/core/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@heiso/core/components/ui/form";
import { Input } from "@heiso/core/components/ui/input";
import { Switch } from "@heiso/core/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { toggle2FA, updatePassword } from "./_server/auth.service";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Please enter current password"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function Authentication() {
  const t = useTranslations("account.auth");
  const { data: session } = useSession();
  const [isUpdatePasswordPending, startUpdatePasswordTransition] =
    useTransition();
  const [_isEnable2FaPending, startEnable2FaTransition] = useTransition();
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    startUpdatePasswordTransition(async () => {
      if (!session?.user?.id) return;
      try {
        await updatePassword(session.user.id, data);
        toast.success(t("password.toast.success"));
        passwordForm.reset();
      } catch (_error) {
        toast.error(t("password.toast.error"));
      }
    });
  };

  const handle2FAToggle = async (checked: boolean) => {
    startEnable2FaTransition(async () => {
      if (!session?.user?.id) return;
      try {
        await toggle2FA(session.user.id, checked);
        toast(t(checked ? "2fa.toast.enabled" : "2fa.toast.disabled"));
      } catch (_error) {
        toast.error(
          t(checked ? "2fa.toast.enableError" : "2fa.toast.disableError"),
        );
      }
    });
  };

  return (
    <div className="flex-1 space-y-4 p-6 w-full max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t("password.title")}</CardTitle>
          <CardDescription>{t("password.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
              className="space-y-4"
            >
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("password.currentPassword")}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("password.newPassword")}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("password.confirmPassword")}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <ActionButton
                type="submit"
                disabled={isUpdatePasswordPending}
                className="w-full"
              >
                {isUpdatePasswordPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("password.button")}
              </ActionButton>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("2fa.title")}</CardTitle>
          <CardDescription>{t("2fa.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                {t("2fa.label")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("2fa.subtext")}
              </p>
            </div>
            <Switch
              onCheckedChange={handle2FAToggle}
              aria-label={t("2fa.title")}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
