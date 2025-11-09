"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut, signIn, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { calcStrength, Progress, ProgressLabel } from "@/components/ui/progress";
import { changePassword } from "../_server/user.service";
import AuthRedirectHint from './authRedirectHint';
import Header from './header';
import { PasswordInput } from '@/components/primitives/password-input';
import { motion } from 'framer-motion';

export default function ChangePasswordPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const t = useTranslations("auth.changePassword");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!userId) return null;

  const passwordStrength = calcStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);


    if (password !== confirmPassword) {
      setError(t("error.mismatch"));
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError(t("error.short"));
      setIsLoading(false);
      return;
    }

    if (passwordStrength < 50) {
      setError(t("error.weak"));
      setIsLoading(false);
      return;
    }

    try {
      await changePassword(userId, password);
      // 保持 loading，執行重新登入並重定向至 /dashboard
      await signOut({ redirect: false });
      await signIn("credentials", {
        username: session?.user?.email ?? "",
        password,
        redirect: true,
        callbackUrl: "/dashboard",
      });
      // 以上為帶 redirect 的流程，頁面將被替換；不需要在此處結束 loading
    } catch {
      setError(t("error.generic"));
      setIsLoading(false);
    }
  };

  const handleCancelPasswordChange = () => {
    signOut({
      callbackUrl: '/',
    });
  };

  return (
    <>
      <Header title={t("title")} description={t("description")} />
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2 mb-8">
            <Label htmlFor="password">{t("password.label")}</Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {password !== "" &&
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2 mt-3"
              >
                <Progress value={passwordStrength} className="w-full" />
                <ProgressLabel passwordStrength={passwordStrength} />
              </motion.div>
            }
          </div>
          <div className="space-y-2 mb-8">
            <Label htmlFor="confirmPassword">{t("password.confirm")}</Label>
            <PasswordInput
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <p className="text-destructive text-sm">{error}</p>
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
      <AuthRedirectHint>
        <Button
          variant="link"
          className="text-neutral font-normal p-0"
          onClick={handleCancelPasswordChange}
        >
          {t("cancel")}
        </Button>
      </AuthRedirectHint>
    </>
  );
}
