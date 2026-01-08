"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@heiso/core/components/ui/alert";
import { Button } from "@heiso/core/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@heiso/core/components/ui/card";
import { Input } from "@heiso/core/components/ui/input";
import { AlertCircle, ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function SignupEmailVerification() {
  const t = useTranslations("auth.emailVerification");
  const [email] = useState("user@example.com"); // This would typically come from your signup flow
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError("");
    // Simulating API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (verificationCode === "123456") {
      // In a real app, this would be validated on the server
      setSuccess(true);
    } else {
      setError(t("error.invalid"));
    }
    setIsVerifying(false);
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError("");
    // Simulating API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsResending(false);
    // In a real app, you'd want to show a success message here
  };

  if (success) {
    return (
      <Card className="w-[350px] mx-auto">
        <CardHeader>
          <CardTitle className="text-center">{t("success.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-primary" />
            <p className="text-center">{t("success.description")}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">
            {t("success.action")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-[350px] mx-auto">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description", { email })}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Input
                id="verificationCode"
                placeholder={t("input.placeholder")}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            </div>
          </div>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t("error.title")}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button className="w-full mt-4" type="submit" disabled={isVerifying}>
            {isVerifying ? t("submit.verifying") : t("submit.verify")}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="flex items-center justify-between w-full">
          <Button
            variant="link"
            onClick={handleResendCode}
            disabled={isResending}
          >
            {isResending ? t("actions.resending") : t("actions.resend")}
          </Button>
          <Button variant="link">{t("actions.change")}</Button>
        </div>
        <div className="text-sm text-muted-foreground text-center">
          <Mail className="inline-block mr-2 h-4 w-4" />
          {t("spamNotice")}
        </div>
      </CardFooter>
    </Card>
  );
}
