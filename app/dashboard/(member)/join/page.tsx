// Server Component
import { AccountConfirmAlert } from './_components/account-confirm-alert';
import { InvalidJoinToken } from "./_components/invalid-join-token";
import { MemberJoin } from './_components/member-join';
import { getInviteToken } from "./_server/member.service";

export type JoinUser = { id: string; name?: string | null; email?: string | null; avatar?: string | null } | null;

export default async function JoinPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const { token } = await searchParams;
  if (!token) return null;

  const membership = await getInviteToken({ token });
  const user = membership
    ? {
      id: membership.id ?? '',
      name: membership.user?.name ?? null,
      email: membership.email ?? '',
      avatar: membership.user?.avatar ?? null,
      status: membership.status ?? '',
    }
    : null;

  // 只有邀請狀態的用戶才能加入，其他狀態的用戶都不能加入 (AccountConfirmAlert)
  if (!membership || membership.status !== 'invited') {
    return <InvalidJoinToken />;
  }

  return <MemberJoin user={user} />;
}
