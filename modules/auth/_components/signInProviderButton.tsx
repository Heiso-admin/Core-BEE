"use client";

// import type { ClientSafeProvider } from 'next-auth/react';
import { Button } from "@heiso/core/components/ui/button";
import { signIn } from "next-auth/react";

export default function SignInProviderButton({ provider }: { provider: any }) {
  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={() =>
        signIn(provider.id, {
          callbackUrl: "/",
        })
      }
    >
      Sign in with {provider.name}
    </Button>
  );
}
