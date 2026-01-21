import config from "@heiso/core/config";
import { auth } from "@heiso/core/modules/auth/auth.config";
import { hasAnyUser } from "@heiso/core/server/services/auth";
import {
  getGeneralSettings,
  getSiteSettings,
} from "@heiso/core/server/services/system/setting";
import { redirect } from "next/navigation";
import { Login } from "../_components";
import InitializeTenantForm from "../_components/InitializeTenantForm";
import {
  checkTenantHasOwner,
  ensureMemberReviewOnFirstLogin,
  getMember,
} from "../_server/user.service";

export type OAuthDataType = {
  userId: string | null;
  email: string | null;
  status: string | null;
};
export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ join?: string; relogin?: string; error?: string }>;
}) {
  /* 
   * Only check for owner if we are in a tenant context.
   * On Root Domain (x-tenant-id missing), we show standard login.
   */
  const { headers } = await import("next/headers");
  const headersList = await headers();
  const tenantId = headersList.get("x-tenant-id");

  if (tenantId) {
    let hasOwner = false;
    let needsProvisioning = false;

    try {
      hasOwner = await checkTenantHasOwner(tenantId);
      // If table exists but no owner, it might mean partial initialization or just new tenant.
      // We should arguably run provisioning here too to ensure menus/defaults exist.
      if (!hasOwner) {
         needsProvisioning = true;
      }
    } catch (e: any) {
      // 42P01: undefined table (Schema missing)
      if (e.code === "42P01") {
         needsProvisioning = true;
      } else {
        throw e;
      }
    }

    if (needsProvisioning) {
        console.log(`[Login] Tenant ${tenantId} uninitialized (Missing Owner or Schema). Provisioning...`);
        const { HiveClient } = await import("@heiso/hive/client");
        const { provisionTenantDb } = await import("../../system/provisioning");
        
        // Use resolveSlug if we have tenantId/slug? 
        // We have tenantId but Hive expects hostname?
        // Actually we have x-tenant-id which is UUID. resolveTenant uses hostname.
        // Assuming host header is reliable for resolution.
        const host = headersList.get("host") || "";
        const resolved = await HiveClient.resolveTenant(host);
        
        // Subscriptions structure: { 'cms': ['module1', ...], ... }
        // Default to 'cms' if empty/missing
        const cmsModules = resolved.subscriptions['cms'] || [];
        const modules = cmsModules.length > 0 ? cmsModules : ["cms"];

        // Determine DB URL (Shared vs Isolated)
        const dbUrl = resolved.tenant?.dbConnection || process.env.DATABASE_URL;

        if (dbUrl) {
            await provisionTenantDb(dbUrl, modules, tenantId);
        } else {
             console.error("[Login] Cannot provision: No DATABASE_URL found.");
        }
    }

    // Re-check owner status after provisioning (if we just provisioned)
    // Actually, if we just provisioned, we know there is NO owner yet.
    // So we show the Init Form.
    if (!hasOwner) {
      return (
        <div className="w-full max-w-md space-y-10">
          <InitializeTenantForm />
        </div>
      );
    }
  }

  const anyUser = await hasAnyUser();
  const general = await getGeneralSettings();
  const site = await getSiteSettings();
  const orgName =
    (site as any)?.branding?.organization || config?.site?.organization;

  const session = await auth(); // oAuth 登入
  let email = "";
  let oAuthData: OAuthDataType | undefined;

  // 使用 oAuth 有可能會遇到第三方不願意給 email
  const { relogin, error } = (await searchParams) ?? {};
  const isRelogin = !!relogin;
  if (session?.user && !isRelogin) {
    const userId = session.user.id ?? undefined;
    const sessionEmail = session.user.email ?? undefined;

    // Fix: Verify if user really exists in DB (Zombie Session Check)
    if (sessionEmail) {
      const { getUser } = await import("../_server/user.service");
      const dbUser = await getUser(sessionEmail);
      if (!dbUser) {
          // User in session but not in DB. Force logout.
          redirect("/api/auth/signout");
      }
    }

    // 開發人員直接進 Dashboard
    if (session.user.isDeveloper) {
      redirect("/dashboard");
    }

    const member = await getMember({ id: userId, email: sessionEmail });

    if (member) {
      oAuthData = member;
      // 已加入：直接進 Dashboard
      if (member.status === "joined") {
        redirect("/dashboard");
      }

      // 非 joined：如無錯誤參數才導向 Pending；有錯誤時留在 login 顯示錯誤
      if (!error) {
        redirect(`/pending?error=${error}`);
      }
    } else {
      // 無成員紀錄：第一次登入，建立/刷新 member 並設為 review，不寄送 email
      if (sessionEmail) {
        try {
          await ensureMemberReviewOnFirstLogin(sessionEmail, userId);
          const refreshed = await getMember({ email: sessionEmail });
          if (refreshed) {
            oAuthData = refreshed;
          }
          email = sessionEmail;
        } catch {
          email = sessionEmail;
        }
      }
    }
  }

  return (
    <div className="w-full max-w-md space-y-10">
      <Login
        email={email}
        anyUser={anyUser}
        orgName={orgName}
        oAuthData={oAuthData}
        systemOauth={general.system_oauth as string}
      />
    </div>
  );
}
