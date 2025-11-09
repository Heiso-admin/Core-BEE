// Server Component
import { InvalidJoinToken } from "./_components/invalid-join-token";
import { MemberJoin } from "./_components/member-join";
import { getInviteToken } from "./_server/member.service";
import { auth } from '@/modules/auth/auth.config';
import { redirect } from "next/navigation";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = (searchParams?.token ?? '').trim();
  const membership = await getInviteToken({ token });
  const session = await auth();
  const user = session?.user
    ? {
      id: session.user.id ?? '',
      name: session.user.name ?? '',
      email: session.user.email ?? '',
      avatar: (session.user as any)?.image ?? '',
    }
    : null;

  console.log("JoinPage membership:", membership);

  const isMemberJoined = session?.member?.status === 'joined';
  if (isMemberJoined) {
    redirect('/dashboard');
  }

  if (!membership) {
    return <InvalidJoinToken />;
  }

  if ((membership as any)?.status === 'joined' || (membership as any)?.userId) {
    return <InvalidJoinToken />;
  }

  if (user && (membership as any)?.email && user.email && (membership as any).email !== user.email) {
    return <InvalidJoinToken />;
  }

  return <MemberJoin user={user} />;
}
