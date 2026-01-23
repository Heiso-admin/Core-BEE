import { verifyPassword } from "@heiso/core/lib/hash";
import NextAuth, { CredentialsSignin, type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUser } from "./user.service";

declare module "next-auth" {
  interface Session {
    user: {
      isDeveloper: boolean;
      isAdminUser?: boolean;
    } & DefaultSession["user"];
    member?: {
      status: string | null;
      isOwner: boolean;
      roleName: string | null;
      fullAccess: boolean;
    };
  }
  interface JWT {
    isDeveloper?: boolean;
    memberStatus?: string | null;
    isAdminUser?: boolean;
  }

  interface User {
    isDeveloper: boolean;
    isAdminUser?: boolean;
  }
}

class InvalidLoginError extends CredentialsSignin {
  code = "Invalid identifier or password";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isDeveloper = user.isDeveloper;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          isDeveloper: token.isDeveloper as boolean,
          id: token.sub!,
        };
      }

      return session;
    },
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username" },
        password: { label: "Password", type: "password" },
        email: { label: "Email" },
        otpVerified: { label: "OTP Verified" },
        userId: { label: "User ID" },
      },
      async authorize(credentials) {
        // Handle OTP verification flow
        if (credentials?.otpVerified === "true" && credentials?.userId) {
          const user = await getUser(credentials.email as string);
          if (!user || user.id !== credentials.userId) {
            throw new InvalidLoginError();
          }
          const isDeveloper = !!user?.developer;
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            isDeveloper,
          };
        }

        // Handle traditional username/password flow
        if (!credentials?.username || !credentials?.password) {
          throw new InvalidLoginError();
        }

        const { username, password } = <{ username: string; password: string }>(
          credentials
        );
        const user = await getUser(username);

        if (!user) {
          throw new InvalidLoginError();
        }

        const isMatch = await verifyPassword(password, user.password);
        if (!isMatch) {
          throw new InvalidLoginError();
        }

        const isDeveloper = !!user?.developer;
        return { id: user.id, name: user.name, email: user.email, isDeveloper };
      },
    }),
  ],
});
