"use client";

import LoginForm from "./loginForm";

export default function Login({ email }: { email?: string | null }) {

  return (
    <div>
      <LoginForm email={email} />
    </div>
  );
}
