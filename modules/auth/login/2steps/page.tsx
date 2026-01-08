"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import OTPLoginForm from "../../_components/otpLoginForm";
import { generateOTP } from "../../_server/otp.service";

export default function TwoStepLogin() {
  const t = useTranslations("auth.otp");
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";
  const [error, setError] = useState<string>("");

  // 進入 2steps 頁時，寄送 OTP Email
  useEffect(() => {
    const send = async () => {
      if (!email) return;
      const result = await generateOTP(email);
      if (!result.success) {
        setError(t(`error.${result.message}`));
      }
    };
    send();
  }, [email, t]);

  const handleLoginSuccess = () => {
    router.push("/dashboard");
  };

  const backToLogin = () => {
    router.push(`/login`);
  };

  return (
    <OTPLoginForm
      email={email}
      setStep={backToLogin as any}
      loginMethod={null}
      error={error}
      setError={setError}
      handleLoginSuccess={handleLoginSuccess}
    />
  );
}
