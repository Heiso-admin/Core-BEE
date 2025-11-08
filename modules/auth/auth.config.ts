import NextAuth, { CredentialsSignin, type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
import { verifyPassword } from '@/lib/hash';
import { getUser } from './_server/user.service';

declare module 'next-auth' {
  interface Session {
    user: {
      isDeveloper: boolean;
    } & DefaultSession['user'];
  }
  interface JWT {
    isDeveloper?: boolean;
  }

  interface User {
    isDeveloper: boolean;
  }
}

class InvalidLoginError extends CredentialsSignin {
  code = 'Invalid identifier or password';
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
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      authorization: {
        params: {
          scope: "openid profile email User.Read",
        },
      },
    }),
    Credentials({
      credentials: {
        username: { label: 'Username' },
        password: { label: 'Password', type: 'password' },
        email: { label: 'Email' },
        otpVerified: { label: 'OTP Verified' },
        userId: { label: 'User ID' },
      },
      async authorize(credentials, req) {
        // 支援兩種授權路徑：1) 密碼登入、2) OTP 已驗證登入
        // 2) OTP 流程：前端已 verifyOTP 並提供 email + userId + otpVerified=true
        if (credentials?.otpVerified === 'true') {
          const email = String(credentials?.email || '');
          const userId = String(credentials?.userId || '');
          if (!email || !userId) {
            throw new InvalidLoginError();
          }

          const user = await getUser(email);
          if (!user || user.id !== userId) {
            throw new InvalidLoginError();
          }

          const isDeveloper = !!user?.developer;
          const isAdmin = false;
          return { id: user.id, name: user.name, email: user.email, isDeveloper, isAdmin };
        }

        // 1) 密碼登入：維持原本的 username/password 流程
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
        const isAdmin = false;
        return { id: user.id, name: user.name, email: user.email, isDeveloper, isAdmin };
      },
    }),
  ],
});
