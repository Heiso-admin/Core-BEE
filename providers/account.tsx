"use client";

import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";
import type { TUser } from "@/lib/db/schema";
import { getAccount } from "@/server/user.service";

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
        if (!userId) return null;

        setIsLoading(true);
        const data = await getAccount(userId);
        if (data) {
          const { developer, membership: myMembership, ...account } = data;
          setAccount(account);
          setIsDeveloper(!!developer);
          setMembership(myMembership);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchAccount();
  }, [session?.user?.id]);

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
