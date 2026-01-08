// Server Component

import { auth } from "@heiso/core/modules/auth/auth.config";
import { InvalidJoinToken } from "./_components/invalid-join-token";
import { LogoutIfAuthenticated } from "./_components/logout-If-authenticated";
import { MemberJoin } from "./_components/member-join";
import { getInviteToken } from "./_server/member.service";

export type JoinUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
} | null;

export default async function JoinPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const session = await auth();
  if (session?.user) {
    return <LogoutIfAuthenticated />;
  }

  const { token } = await searchParams;
  if (!token) return null;

  const membership = await getInviteToken({ token });
  // 如果用戶已經登錄且邀請用戶不是當前用戶，則登出
  if (session?.user && membership?.user?.id !== session.user.id) {
    return <LogoutIfAuthenticated />;
  }

  const user = membership
    ? {
        id: membership.id ?? "",
        name: membership.user?.name ?? null,
        email: membership.email ?? "",
        avatar: membership.user?.avatar ?? null,
        status: membership.status ?? "",
      }
    : null;

  // 只有邀請狀態的用戶才能加入，其他狀態的用戶都不能加入 (AccountConfirmAlert)
  if (!membership || membership.status !== "invited") {
    return <InvalidJoinToken />;
  }

  return <MemberJoin user={user} />;
}
