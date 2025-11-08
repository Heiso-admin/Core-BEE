"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import AuthLogin from "./authLogin";
import EmailVerification from "./emailVerification";
import LoginPassword from "./loginPassword";
import OTPLoginForm from './otpLoginForm';
import { generateOTP } from '../_server/otp.service';
import { useTranslations } from 'next-intl';


export enum LoginStepEnum {
  Email = 'email',       // 邮箱登录步骤
  Password = 'password', // 密码登录步骤
  Otp = 'otp',           // OTP登录步骤
  Invite = 'invite',     // 邀请登录步骤
}

// 資料庫登入狀態
export enum LoginMethodEnum {
  Both = 'both',   // 同时支持OTP和邮箱登录
  Otp = 'otp',     // 仅支持OTP登录
  Email = 'email', // 仅支持邮箱登录
}

export type LoginStep = `${LoginStepEnum}`;

function LoginForm({ email, anyUser, orgName }: { email?: string | null; anyUser: boolean; orgName?: string }) {

  const router = useRouter();
  const { data: session } = useSession();
  const t = useTranslations('auth.login');
  const optT = useTranslations('auth.otp');

  const [loginMethod, setLoginMethod] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [step, setStep] = useState<LoginStep>(LoginStepEnum.Email);
  const [error, setError] = useState<string>("");

  const handleLoginSuccess = () => {
    // 使用客戶端路由前往儀表板
    router.push('/dashboard');
  };

  useEffect(() => {
    console.log("step--", step);

  }, [step]);

  const handleVerifyOTP = async (authEmail: string) => {
    if (authEmail === "") {
      setError(t('error.general'));
      return;
    }

    const result = await generateOTP(authEmail);

    if (result.success) {
      setError('');
      console.log("result--", result, "成功寄出");
      setStep(LoginStepEnum.Otp);
    } else {
      setError(t(`error.${result.message}`));
    }
  };

  // 根据登录方法决定下一步
  const handleAuthMethod = (method: string, authEmail: string) => {
    switch (method) {
      case LoginMethodEnum.Otp:
      case LoginMethodEnum.Both:
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
          />
        );

      case LoginStepEnum.Invite:
        return <EmailVerification email={userEmail || email} />;

      case LoginStepEnum.Password:
        return <LoginPassword
          email={userEmail || email}
          loginMethod={loginMethod}
          setStep={setStep}
          handleLoginSuccess={handleLoginSuccess}
        />;

      case LoginStepEnum.Otp:
        return <OTPLoginForm
          email={userEmail || email}
          setStep={setStep}
          loginMethod={loginMethod}
          error={error}
          setError={setError}
          handleLoginSuccess={handleLoginSuccess}
        />;

      default:
        return null;
    }
  };

  return renderStep()
}

export default LoginForm;