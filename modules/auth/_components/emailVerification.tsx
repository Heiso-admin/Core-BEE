"use client";

import { ActionButton } from "@heiso/core/components/primitives/action-button";
import { Button } from "@heiso/core/components/ui/button";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { resendInviteByEmail } from "../_server/user.service";
import AuthRedirectHint from "./authRedirectHint";
import Header from "./header";
import { type LoginStep, LoginStepEnum } from "./loginForm";

const EmailVerification = ({
  email,
  setStep,
}: {
  email?: string | null;
  setStep: (step: LoginStep) => void;
}) => {
  const t = useTranslations("auth.emailVerification");
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleResend = async () => {
    setMessage(null);
    setIsResending(true);

    try {
      await resendInviteByEmail(email || "");
      setMessage(t("actions.emailResendSuccess"));
    } catch (e) {
      console.error("Resend error", e);
      setMessage(t("actions.emailResendError"));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <Header title={t("title")} />
      <div className="mx-auto text-center whitespace-pre-line">
        <div className="text-center mt-6 mb-8 text-md text-muted-foreground">
          {t("emailDescription", { email: email || "email" })}
        </div>
        <ActionButton
          className="w-full"
          onClick={handleResend}
          loading={isResending}
        >
          {t("actions.emailResend")}
        </ActionButton>
        <p className="mt-4 text-sm text-sub-highlight">{message}</p>
      </div>
      <AuthRedirectHint>
        <Button
          onClick={() => setStep(LoginStepEnum.Email)}
          variant="link"
          className="underline ml-2"
        >
          {t("backToLogin")}
        </Button>
      </AuthRedirectHint>
    </>
  );
};

export default EmailVerification;
