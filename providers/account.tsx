"use client";

import type { TUser } from "@heiso/core/lib/db/schema";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";

interface Membership {
  id: string;
  isOwner: boolean;
  role: {
    id: string;
    name: string;
    fullAccess: boolean;
  } | null;
}

interface AccountContextType {
  account: Partial<TUser> | null;
  isDeveloper: boolean;
  membership: Membership[] | null;
  isLoading: boolean;
  error: Error | null;
  updateAccount: (account: Partial<TUser>) => void;
}

const AccountContext = createContext<AccountContextType>({
  account: null,
  isDeveloper: false,
  membership: null,
  isLoading: false,
  error: null,
  updateAccount: () => {},
});

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [account, setAccount] = useState<Partial<TUser> | null>(null);
  const [isDeveloper, setIsDeveloper] = useState<boolean>(false);
  const [membership, setMembership] = useState<Membership[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchAccount() {
      try {
        const userId = session?.user?.id;
        const userEmail = session?.user?.email ?? "";

        if (!userId && !userEmail) return null;

        setIsLoading(true);

        // 改用 API 路由避免在 Client 端匯入 server/db 導致打包錯誤
        const res = await fetch("/api/account/me", {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch account: ${res.status}`);
        }
        const data = await res.json();

        if (data) {
          const { developer, membership: myMembership, ...account } = data;
          setAccount(account);
          setIsDeveloper(!!developer);
          setMembership(myMembership);
        } else {
          // No matching local account found
          setAccount(null);
          setIsDeveloper(false);
          setMembership(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchAccount();
  }, [session?.user?.id, session?.user?.email]);

  const updateAccount = (updatedAccount: Partial<TUser>) => {
    setAccount(updatedAccount);
  };

  return (
    <AccountContext.Provider
      value={{
        account,
        membership,
        isDeveloper,
        isLoading,
        error,
        updateAccount,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
}
