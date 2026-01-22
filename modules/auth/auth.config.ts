import { verifyPassword } from "@heiso/core/lib/hash";
import NextAuth, { CredentialsSignin, type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

declare module "next-auth" {
  interface Session {
    user: {
      isDeveloper: boolean;
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
  }

  interface User {
    isDeveloper: boolean;
  }
}

class InvalidLoginError extends CredentialsSignin {
  code = "Invalid identifier or password";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
    error: "/login", // 將 NextAuth 的錯誤（如 AccessDenied）導向 login，附帶 ?error=...
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      const isNewUser = account?.isNewUser;
      console.log("isNewUser", isNewUser);
      // 禁止已用 email/密碼登入過的帳號使用 OAuth 註冊
      try {
        // 僅處理 OAuth 供應商，略過 credentials
        if (!account || account.provider === "credentials") return true;

        const email = (user?.email || (profile && (profile as any).email) || "")
          .toString()
          .trim();
        if (!email) return true;

        // Dynamic DB
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

        // 已有在 member 用戶，目前都會有 roleId，所以用 role 去判斷是不是新用戶
        // if (existingMember?.roleId) {
        //   return false;
        // }

        // 第二次登入 OAuth：若已存在 member 且狀態為 invited，直接更新為 joined
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
          // return false; // 讓 NextAuth 回傳 error=AccessDenied，回到 login 顯示提示
          // return '/login?error=under_review';
        }

        return true;
      } catch (err) {
        console.error("[OAuth signIn] pre-check failed:", err);
        return true; // 若檢查失敗，不阻擋登入以避免誤判
      }
    },
    async jwt({ token, user }) {
      // 將使用者開發者標記與 email 同步到 token
      if (user) {
        token.isDeveloper = (user as any).isDeveloper;
        // 保留 email 以便後續查 membership
        token.email = (user as any).email ?? (token as any).email;
      }
      // 查詢 membership 狀態並寫入 token 供 middleware 判斷導向
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
          id: token.sub!,
        };
      }
      // 動態查詢當前使用者的 member 與 role，並以 member.userId 校正 session.user.id
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
      // 1. 若為相對路徑，預設會導回 baseUrl (通常是 localhost:3000 或主網域)
      // 若希望保留當前 subdomain，呼叫端應傳入完整 URL (absolute url)
      if (url.startsWith("/")) return `${baseUrl}${url}`;

      // 2. 驗證 Absolute URL
      try {
        const urlObj = new URL(url);
        const baseUrlObj = new URL(baseUrl);

        // A. 允許完全同源 (Origin Match)
        if (urlObj.origin === baseUrlObj.origin) {
          return url;
        }

        // B. 允許子網域 (Subdomain Match)
        // 例如 baseUrl=nbee.io, url=demo.nbee.io
        // 例如 baseUrl=localhost:3000, url=demo.localhost:3000
        // 簡單判斷: url hostname 結尾包含 baseUrl hostname (且 port 相同)
        // 注意: localhost 是一個特別案例 (TLD)
        const isSameRootDomain = urlObj.hostname.endsWith(baseUrlObj.hostname) || 
                                 baseUrlObj.hostname.endsWith(urlObj.hostname); // 互為包含 (或是解析主網域工具)
        
        // 寬鬆判斷 Port 必須一致 (開發環境)
        const isSamePort = urlObj.port === baseUrlObj.port;

        if (isSameRootDomain && isSamePort) {
          return url;
        }
      } catch (e) {
        // Invalid URL
      }

      return baseUrl;
    },
  },
  events: {
    // 當第三方 OAuth 成功登入時，建立或更新 members 資料為 review
    async signIn({ user, account, profile }) {
      try {
        // 僅處理 OAuth 供應商，略過 credentials
        if (!account || account.provider === "credentials") return;

        // 取用 email：優先取 user.email；其次 profile.email
        const email = (user?.email || (profile && (profile as any).email) || "")
          .toString()
          .trim();

        // 紀錄 OAuth 登入資訊（偵測供應商）
        console.log("[OAuth signIn] provider:", account.provider);

        if (!email) {
          console.warn(
            "[OAuth signIn] missing email from provider, skip upsert",
          );
          return;
        }

        // 動態載入 db 與 schema，避免在 edge/客戶端造成打包問題
        const { getDynamicDb } = await import("@heiso/core/lib/db/dynamic");
        const { users, members } = await import("@heiso/core/lib/db/schema");
        const { and, eq, isNull } = await import("drizzle-orm");
        const { hashPassword } = await import("@heiso/core/lib/hash");
        const { generateId } = await import("@heiso/core/lib/id-generator");

        // Tenant Context
        const { headers } = await import("next/headers");
        const h = await headers();
        const tenantId = h.get("x-tenant-id");

        const db = await getDynamicDb();

        // 嘗試以 email 查找現有使用者
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
        // 新用戶需要沒有 user (and no member in this tenant) 才可以建立
        // If user exists, we use it. If not, create user.
        if (!existingUser) {
          // 建立占位密碼（OAuth 用戶不需要實際密碼）
          const placeholderPassword = await hashPassword(
            generateId(undefined, 32),
          );

          const displayName = (
            user?.name ||
            (profile && (profile as any).name) ||
            email.split("@")[0]
          ).toString();
          const avatar =
            (user as any)?.image ||
            (profile as any)?.avatar_url ||
            (profile as any)?.picture ||
            null;

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
          console.log("[OAuth signIn] created user:", userId);
        } else {
          // 更新最後登入時間
          await db
            .update(users)
            .set({ lastLoginAt: new Date(), updatedAt: new Date() })
            .where(eq(users.id, existingUser.id));
          console.log("[OAuth signIn] existing user:", existingUser.id);
        }

        // Member Logic - Only if Tenant ID matches
        if (tenantId) {
          // 再次登入，但未審核過，僅更新 updateAt
          if (existingMember) {
            await db
              .update(members)
              .set({
                userId: userId ?? existingMember.userId,
                updatedAt: new Date(),
              })
              .where(eq(members.id, existingMember.id));
            console.log(
              "[OAuth signIn] synced existing member without status change:",
              existingMember.id,
            );
          } else {
            // 首次 OAuth 登入
            // 檢查該 Tenant 是否已有任何成員 (是否為第一位初始建立者)
            const hasAnyMember = await db.query.members.findFirst({
              where: (t, { eq, and, isNull }) =>
                and(eq(t.tenantId, tenantId), isNull(t.deletedAt)),
              columns: { id: true },
            });

            const isFirstMember = !hasAnyMember;

            const insertedMember = await db
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
            console.log(
              `[OAuth signIn] created member in ${isFirstMember ? "joined (OWNER)" : "review"} status:`,
              insertedMember?.[0]?.id,
            );
          }
        } else {
          console.log("[OAuth signIn] no tenant context, skipping member creation");
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
      authorization: {
        params: {
          prompt: "login",
        },
      },
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
        // 支援兩種授權路徑：1) 密碼登入、2) OTP 已驗證登入
        // 2) OTP 流程：前端已 verifyOTP 並提供 email + userId + otpVerified=true
        if (credentials?.otpVerified === "true") {
          const email = String(credentials?.email || "");
          const userId = String(credentials?.userId || "");
          if (!email || !userId) {
            throw new InvalidLoginError();
          }

          const { getUser } = await import("./_server/user.service");
          const user = await getUser(email);
          if (!user || user.id !== userId) {
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

        // 1) 密碼登入：維持原本的 username/password 流程
        if (!credentials?.username || !credentials?.password) {
          throw new InvalidLoginError();
        }

        const { username, password } = <{ username: string; password: string }>(
          credentials
        );
        const { getUser } = await import("./_server/user.service");
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

