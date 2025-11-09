"use client";

import type { OAuthDataType } from '../login/page';
import LoginForm from "./loginForm";

export default function Login({ email, anyUser, orgName, oAuthData, initialStep }: { email?: string | null; anyUser: boolean; orgName?: string; oAuthData?: OAuthDataType; initialStep?: 'invite' }) {

  return (
    <div>
      <LoginForm email={email} anyUser={anyUser} orgName={orgName} oAuthData={oAuthData} initialStep={initialStep} />
    </div>
  );
}
