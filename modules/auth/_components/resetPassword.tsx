"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { calcStrength, Progress, ProgressLabel } from "@/components/ui/progress";
import { resetPassword } from "../_server/password.service";
import AuthRedirectHint from './authRedirectHint';
import Header from './header';
import { motion } from 'framer-motion';
import { PasswordInput } from '@/components/primitives';

export default function ResetPasswordPage() {
  const t = useTranslations("auth.resetPassword");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

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
      const data = await resetPassword(token, password);
      if (!data.ok) {
        throw new Error("Reset failed");
      }
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(t("error.generic"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <>
        <Header title={t("success.title")} description={t("success.description")} />
        <Button onClick={() => router.push("/login")} className="w-full mt-8">
          {t("success.action")}
        </Button>
      </>
    );
  }

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
        <Link href="/login" className='ml-2'>{t("cancel")}</Link>
      </AuthRedirectHint>
    </>
  );
}
