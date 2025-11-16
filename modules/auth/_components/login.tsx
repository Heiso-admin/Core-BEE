"use client";

import type { OAuthDataType } from '../login/page';
import LoginForm from "./loginForm";

export default function Login({ email, anyUser, orgName, oAuthData, systemOauth }: { email?: string | null; anyUser: boolean; orgName?: string; oAuthData?: OAuthDataType; systemOauth?: string }) {

  return (
    <div>
      <LoginForm email={email} anyUser={anyUser} orgName={orgName} oAuthData={oAuthData} systemOauth={systemOauth} />
    </div>
  );
}
