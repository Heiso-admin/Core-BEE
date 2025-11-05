"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import AuthLogin from "./authLogin";
import EmailVerification from "./emailVerification";
import LoginPassword from "./loginPassword";


export enum LoginStepEnum {
  Email = 'email',
  Password = 'password',
  Otp = 'otp',
  Invite = 'invite',
}

export enum LoginMethodEnum{
  Both= 'both',
  Otp= 'otp',
  Email= 'email',
}

export type LoginStep = `${LoginStepEnum}`;

function LoginForm({ email, anyUser, orgName }: { email?: string | null; anyUser: boolean; orgName?: string }) {
  
  const router = useRouter();
  const { data: session } = useSession();

  const [loginMethod, setLoginMethod] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [step, setStep] = useState<LoginStep>(LoginStepEnum.Email);
  const [error, setError] = useState<string>("");

  // 如果已登录，重定向到仪表板
  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  useEffect(() => {
    console.log("step--",step);
    
  }, [step]);


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
          />
        );

      case LoginStepEnum.Invite:
        return <EmailVerification email={userEmail || email} />;

      case LoginStepEnum.Password:
        return <LoginPassword email={userEmail || email} loginMethod={loginMethod} setStep={setStep} />;
       
      default:
        return null;
    }
  };

  return (
    <>{renderStep()}</>
  );
}

export default LoginForm;