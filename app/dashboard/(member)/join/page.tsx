import { Suspense } from "react";
import { auth } from "@/app/(auth)/auth.config";
import { Card } from "@/components/ui/card";
import { AccountConfirmAlert } from "./_components/account-confirm-alert";
import { InvalidJoinToken } from "./_components/invalid-join-token";
import { JoinOrDecline } from "./_components/member-join";
import { getInviteToken } from "./_server/member.service";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ token: string }>;
}) {
  const session = await auth();
  const email = session?.user?.email;

  const { token } = await searchParams;
  if (!token) return null;

  const membership = await getInviteToken({ token });
  if (!membership) return <InvalidJoinToken />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Suspense fallback={<>Loading ...</>}>
        <div className="w-[480px] flex flex-col gap-4">
          {email && email !== membership.email && (
            <AccountConfirmAlert email={email} />
          )}

          <Card className="p-6 space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-xl font-medium">
                You have been invited to join
              </h1>
              <h2 className="text-base font-semibold">
                {/* {membership.organization.name} */}
                TODO: replace with site name
              </h2>
            </div>

            <JoinOrDecline id={membership.id} />
          </Card>
        </div>
      </Suspense>
    </div>
  );
}
