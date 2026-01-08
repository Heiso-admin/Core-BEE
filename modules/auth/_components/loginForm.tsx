"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { generateOTP } from "../_server/otp.service";
import type { OAuthDataType } from "../login/page";
import AuthLogin from "./authLogin";
import EmailVerification from "./emailVerification";
import LoginPassword from "./loginPassword";
import OTPLoginForm from "./otpLoginForm";

export enum LoginStepEnum {
  Email = "email", // 邮箱登录步骤
  Password = "password", // 密码登录步骤
  Otp = "otp", // OTP登录步骤
  Invite = "invite", // 邀请登录步骤
  SSO = "sso", // SSO登录步骤
}

// 資料庫登入狀態
export enum LoginMethodEnum {
  Both = "both", // 同时支持OTP和邮箱登录
  Otp = "otp", // 仅支持OTP登录
  Email = "email", // 仅支持邮箱登录
  SSO = "sso", // 仅支持SSO登录
}

export type LoginStep = `${LoginStepEnum}`;

function LoginForm({
  email,
  anyUser,
  orgName,
  oAuthData,
  systemOauth,
}: {
  email?: string | null;
  anyUser: boolean;
  orgName?: string;
  oAuthData?: OAuthDataType;
  systemOauth?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("auth.login");

  const [loginMethod, setLoginMethod] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [step, setStep] = useState<LoginStep>(LoginStepEnum.Email);
  const [error, setError] = useState<string>("");
  const [twoStep, setTwoStep] = useState<boolean>(false);

  // 若 NextAuth 阻擋了 OAuth 登入（例如 AccessDenied），提示『請使用 email 登入』
  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "under_review") {
      setError(t("error.oAuthReview"));
      return;
    } else if (err === "AccessDenied") {
      setError(t("error.useEmailLogin"));
    }
  }, [searchParams, t]);

  const handleLoginSuccess = () => {
    router.push("/dashboard");
  };

  const handleVerifyOTP = async (authEmail: string) => {
    if (authEmail === "") {
      setError(t("error.general"));
      return;
    }

    const result = await generateOTP(authEmail);

    if (result.success) {
      setError("");
      setStep(LoginStepEnum.Otp);
    } else {
      setError(t(`error.${result.message}`));
    }
  };

  // 根据登录方法决定下一步
  const handleAuthMethod = (method: string, authEmail: string) => {
    switch (method) {
      case LoginMethodEnum.Both:
        // 兩步驟：先密碼，再導向 /login/2steps
        setTwoStep(true);
        setStep(LoginStepEnum.Password);
        return;

      case LoginMethodEnum.Otp:
        handleVerifyOTP(authEmail);
        return;

      case LoginMethodEnum.Email:
        setStep(LoginStepEnum.Password);
        return;

      default:
        // 默认使用密码登录
        setStep(LoginStepEnum.Password);
        return;
    }
  };

  const renderStep = () => {
    switch (step) {
      case LoginStepEnum.Email:
        return (
          <AuthLogin
            error={error}
            setError={setError}
            setLoginMethod={setLoginMethod}
            setStep={setStep}
            setUserEmail={setUserEmail}
            anyUser={anyUser}
            orgName={orgName}
            handleAuthMethod={handleAuthMethod}
            systemOauth={systemOauth}
          />
        );

      case LoginStepEnum.Invite:
        return (
          <EmailVerification email={userEmail || email} setStep={setStep} />
        );

      case LoginStepEnum.Password:
        return (
          <LoginPassword
            email={userEmail || email}
            loginMethod={loginMethod}
            setStep={setStep}
            handleLoginSuccess={handleLoginSuccess}
            twoStep={twoStep}
          />
        );

      case LoginStepEnum.Otp:
        return (
          <OTPLoginForm
            email={userEmail || email}
            setStep={setStep}
            loginMethod={loginMethod}
            error={error}
            setError={setError}
            handleLoginSuccess={handleLoginSuccess}
          />
        );

      default:
        return null;
    }
  };

  return renderStep();
}

export default LoginForm;
