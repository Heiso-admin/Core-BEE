import NextAuth, { CredentialsSignin, type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/hash";
import { getUser } from "./user.service";

declare module "next-auth" {
  interface Session {
    user: {
      isAdmin: boolean;
    } & DefaultSession["user"];
  }
  interface JWT {
    isAdmin?: boolean;
  }

  interface User {
    isAdmin: boolean;
  }
}

class InvalidLoginError extends CredentialsSignin {
  code = "Invalid identifier or password";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          isAdmin: token.isAdmin as boolean,
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
      },
      async authorize(credentials) {
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

        const isAdmin = !!user?.administrator;
        return { id: user.id, name: user.name, email: user.email, isAdmin };
      },
    }),
  ],
});
