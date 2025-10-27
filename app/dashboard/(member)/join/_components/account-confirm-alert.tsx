"use client";

import { AlertCircleIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function AccountConfirmAlert({ email }: { email: string }) {
  return (
    <Alert>
      <AlertCircleIcon />
      <AlertTitle>Email ({email}) does not match.</AlertTitle>
      <AlertDescription>
        Please verify if you are logged in with the correct account?
        <Button
          size="sm"
          className="text-xs"
          onClick={() => {
            signOut({
              callbackUrl: "/",
            });
          }}
        >
          Log out
        </Button>
      </AlertDescription>
    </Alert>
  );
}
