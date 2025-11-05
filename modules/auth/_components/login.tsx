"use client";

import LoginForm from "./loginForm";

export default function Login({ email, anyUser, orgName }: { email?: string | null; anyUser: boolean; orgName?: string }) {

  return (
    <div>
      <LoginForm email={email} anyUser={anyUser} orgName={orgName} />
    </div>
  );
}
