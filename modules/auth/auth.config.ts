import { verifyPassword } from "@heiso/core/lib/hash";
import NextAuth, { CredentialsSignin, type DefaultSession, type User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

// Extend types
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
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Original Logic from Core
      try {
        if (!account || account.provider === "credentials") return true;

        const email = (user?.email || (profile && (profile as any).email) || "")
          .toString()
          .trim();
        if (!email) return true;

        const { getDynamicDb } = await import("@heiso/core/lib/db/dynamic");
        const db = await getDynamicDb();

        const { users, members } = await import("@heiso/core/lib/db/schema");
        const { and, eq, isNull } = await import("drizzle-orm");

        const existingMember = await db.query.members.findFirst({
          where: (t, ops) =>
            ops.and(ops.eq(t.email, email), ops.isNull(t.deletedAt)),
          columns: { id: true, status: true, userId: true, roleId: true },
        });

        const existingUser = await db.query.users.findFirst({
          where: (t, ops) => ops.eq(t.email, email),
          columns: { id: true, loginMethod: true },
        });

        if (
          existingUser &&
          existingMember &&
          existingMember.status === "invited"
        ) {
          await db
            .update(users)
            .set({
              mustChangePassword: false,
              updatedAt: new Date(),
            })
            .where(and(eq(users.id, existingUser.id)));

          await db
            .update(members)
            .set({
              inviteToken: "",
              tokenExpiredAt: null,
              status: "joined",
              updatedAt: new Date(),
            })
            .where(
              and(eq(members.id, existingMember.id), isNull(members.deletedAt)),
            );
        }

        return true;
      } catch (err) {
        console.error("[OAuth signIn] pre-check failed:", err);
        return true;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.isDeveloper = (user as any).isDeveloper;
        token.isAdminUser = (user as any).isAdminUser;
        token.email = (user as any).email ?? (token as any).email;
      }

      // Admin User Strategy: Skip Core membership check
      if (token.isAdminUser) {
        return token;
      }

      try {
        const userId = token.sub;
        const email = (token as any).email as string | undefined;
        const { findMembershipByUserOrEmail } = await import(
          "@heiso/core/modules/account/authentication/_server/auth.service"
        );
        const membership = await findMembershipByUserOrEmail({ userId, email });
        (token as any).memberStatus = membership?.status ?? null;
      } catch (e) {
        console.warn("[jwt] attach memberStatus failed:", e);
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          isDeveloper: token.isDeveloper as boolean,
          isAdminUser: token.isAdminUser as boolean,
          id: token.sub!,
        };
      }

      // Admin User Strategy: Grant All Permissions
      if (token.isAdminUser) {
        session.member = {
          status: 'joined',
          isOwner: true,
          roleName: 'Internal Admin',
          fullAccess: true,
        };
        return session;
      }

      try {
        const userId = session.user?.id;
        const email = session.user?.email ?? undefined;
        if (userId || email) {
          const { findMembershipByUserOrEmail } = await import(
            "@heiso/core/modules/account/authentication/_server/auth.service"
          );
          const membership = await findMembershipByUserOrEmail({
            userId,
            email,
          });

          if (membership?.userId) {
            session.user.id = membership.userId;
            session.user.email = membership.email ?? session.user.email;
          }

          session.member = {
            status: membership?.status ?? null,
            isOwner: !!membership?.isOwner,
            roleName: membership?.role?.name ?? null,
            fullAccess: !!membership?.role?.fullAccess || !!membership?.isOwner,
          };
        }
      } catch (e) {
        console.warn("[session] attach member failed:", e);
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const urlObj = new URL(url);
        const baseUrlObj = new URL(baseUrl);
        if (urlObj.origin === baseUrlObj.origin) return url;
        const isSameRootDomain = urlObj.hostname.endsWith(baseUrlObj.hostname) ||
          baseUrlObj.hostname.endsWith(urlObj.hostname);
        const isSamePort = urlObj.port === baseUrlObj.port;
        if (isSameRootDomain && isSamePort) return url;
      } catch (e) { }
      return baseUrl;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      // Admin User Logic
      if (account?.provider === "credentials" && (user as any).isAdminUser) {
        try {
          // Use dynamic imports to match core patterns and avoid bundler issues
          const { drizzle } = await import("drizzle-orm/postgres-js");
          const postgres = await import("postgres");
          const { adminUsers } = await import("@heiso/hive/schema");
          const { eq } = await import("drizzle-orm");

          const connectionString = process.env.HIVE_DATABASE_URL;
          if (connectionString) {
            const client = postgres.default(connectionString);
            const db = drizzle(client);

            // Cast to any to avoid Drizzle version mismatch types
            await db.update(adminUsers as any)
              .set({ lastLoginAt: new Date() })
              .where(eq((adminUsers as any).id, user.id!));

            await client.end();
          }
        } catch (e) {
          console.error("[Admin signIn] Failed to update lastLoginAt", e);
        }
        return;
      }

      // Original OAuth Logic
      try {
        if (!account || account.provider === "credentials") return;

        const email = (user?.email || (profile && (profile as any).email) || "")
          .toString()
          .trim();
        console.log("[OAuth signIn] provider:", account.provider);

        if (!email) return;

        const { getDynamicDb } = await import("@heiso/core/lib/db/dynamic");
        const { users, members } = await import("@heiso/core/lib/db/schema");
        const { and, eq, isNull } = await import("drizzle-orm");
        const { hashPassword } = await import("@heiso/core/lib/hash");
        const { generateId } = await import("@heiso/core/lib/id-generator");

        const { headers } = await import("next/headers");
        const h = await headers();
        const tenantId = h.get("x-tenant-id");

        const db = await getDynamicDb();

        const existingUser = await db.query.users.findFirst({
          where: (t, _ops) => eq(t.email, email),
        });

        let existingMember: any = null;
        if (tenantId) {
          existingMember = await db.query.members.findFirst({
            where: (t, _ops) => and(eq(t.email, email), isNull(t.deletedAt), eq(t.tenantId, tenantId)),
          });
        }

        let userId = existingUser?.id;
        if (!existingUser) {
          const placeholderPassword = await hashPassword(
            generateId(undefined, 32),
          );
          const displayName = (user?.name || (profile && (profile as any).name) || email.split("@")[0]).toString();
          const avatar = (user as any)?.image || (profile as any)?.avatar_url || (profile as any)?.picture || null;

          const inserted = await db
            .insert(users)
            .values({
              email,
              name: displayName,
              password: placeholderPassword,
              avatar: avatar ?? undefined,
              active: false,
              lastLoginAt: new Date(),
              loginMethod: account.provider,
              mustChangePassword: false,
              updatedAt: new Date(),
            })
            .returning();

          userId = inserted?.[0]?.id;
        } else {
          await db
            .update(users)
            .set({ lastLoginAt: new Date(), updatedAt: new Date() })
            .where(eq(users.id, existingUser.id));
        }

        if (tenantId) {
          if (existingMember) {
            await db
              .update(members)
              .set({ userId: userId ?? existingMember.userId, updatedAt: new Date() })
              .where(eq(members.id, existingMember.id));
          } else {
            const hasAnyMember = await db.query.members.findFirst({
              where: (t, { eq, and, isNull }) => and(eq(t.tenantId, tenantId), isNull(t.deletedAt)),
              columns: { id: true },
            });
            const isFirstMember = !hasAnyMember;
            await db
              .insert(members)
              .values({
                email,
                userId: userId ?? undefined,
                loginMethod: account.provider,
                status: isFirstMember ? "joined" : "review",
                isOwner: isFirstMember,
                updatedAt: new Date(),
                tenantId,
              })
              .returning();
          }
        }
      } catch (err) {
        console.error("[OAuth signIn] member upsert failed:", err);
      }
    },
  },
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
      authorization: { params: { prompt: "login" } },
    }),
    Credentials({
      credentials: {
        username: { label: "Username" },
        password: { label: "Password", type: "password" },
        email: { label: "Email" },
        otpVerified: { label: "OTP Verified" },
        userId: { label: "User ID" },
      },
      async authorize(credentials, _req) {
        if (credentials?.otpVerified === "true") {
          const email = String(credentials?.email || "");
          const userId = String(credentials?.userId || "");
          if (!email || !userId) throw new InvalidLoginError();
          const { getUser } = await import("./_server/user.service");
          const user = await getUser(email);
          if (!user || user.id !== userId) throw new InvalidLoginError();
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            isDeveloper: !!user?.developer,
          };
        }

        if (!credentials?.username || !credentials?.password) throw new InvalidLoginError();
        const { username, password } = <{ username: string; password: string }>credentials;
        const { getUser } = await import("./_server/user.service");

        // 1. Try Core User
        let user = await getUser(username);

        // 2. Try Hive Admin User
        if (!user) {
          try {
            const { drizzle } = await import("drizzle-orm/postgres-js");
            const postgres = await import("postgres");
            const { adminUsers } = await import("@heiso/hive/schema");
            const { eq } = await import("drizzle-orm");

            const connectionString = process.env.HIVE_DATABASE_URL;
            if (connectionString) {
              const client = postgres.default(connectionString);
              const db = drizzle(client);

              // Cast table to any for Drizzle version fix
              const adminUser = await db.select().from(adminUsers as any).where(eq((adminUsers as any).email, username)).limit(1);
              if (adminUser.length > 0) {
                const target = adminUser[0];
                const isMatch = await verifyPassword(password, target.password);
                await client.end();

                if (isMatch) {
                  return {
                    id: target.id,
                    name: target.name,
                    email: target.email,
                    isDeveloper: true,
                    isAdminUser: true,
                  } as User;
                }
              } else {
                await client.end();
              }
            }
          } catch (e) {
            console.error("Hive Login Check Failed", e);
          }
        }

        if (!user) throw new InvalidLoginError();
        const isMatch = await verifyPassword(password, user.password);
        if (!isMatch) throw new InvalidLoginError();
        return { id: user.id, name: user.name, email: user.email, isDeveloper: !!user?.developer };
      },
    }),
  ],
});
