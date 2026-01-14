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
    const hasOwner = await checkTenantHasOwner(tenantId);
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
