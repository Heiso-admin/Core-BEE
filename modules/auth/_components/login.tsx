"use client";

import type { OAuthDataType } from '../login/page';
import LoginForm from "./loginForm";

export default function Login({ email, anyUser, orgName, oAuthData }: { email?: string | null; anyUser: boolean; orgName?: string; oAuthData?: OAuthDataType }) {

  return (
    <div>
      <LoginForm email={email} anyUser={anyUser} orgName={orgName} oAuthData={oAuthData} />
    </div>
  );
}
