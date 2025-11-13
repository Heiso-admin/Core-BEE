import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from '@/modules/auth/auth.config';
import { Login } from "../_components";
import { hasAnyUser } from "@/server/services/auth";
import { getSiteSettings } from "@/server/services/system/setting";
import config from "@/config";
import { getMember, ensureMemberReviewOnFirstLogin } from '../_server/user.service';

export type OAuthDataType = {
  userId: string | null;
  email: string | null;
  status: string | null;
}
export default async function Page({ searchParams }: { searchParams?: { join?: string } }) {
  const anyUser = await hasAnyUser();
  const site = await getSiteSettings();
  const orgName = (site as any)?.branding?.organization || config?.site?.organization;

  const cookieStore = await cookies();
  const existingJoinCookie = cookieStore.get("join-token");
  const session = await auth(); // oAuth 登入
  let email = "";
  let oAuthData: OAuthDataType | undefined = undefined;

  // 使用 oAuth 有可能會遇到第三方不願意給 email
  if (session?.user) {
    const userId = session.user.id ?? undefined;
    const sessionEmail = session.user.email ?? undefined;

    const member = await getMember({ id: userId, email: sessionEmail });

    if (member) {
      oAuthData = member;
      // 已加入：直接進 Dashboard
      if (member.status === 'joined') {
        redirect("/dashboard");
      }
      // 非 joined：停留於 Login，由前端提示錯誤
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
      <Login email={email} anyUser={anyUser} orgName={orgName} oAuthData={oAuthData} />
    </div>
  );
}
