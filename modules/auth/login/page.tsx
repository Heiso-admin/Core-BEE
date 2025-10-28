import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from '@/modules/auth/auth.config';
import config from "@/config";
import { getInvitation } from "@/server/user.service";
import { Header, Login } from "../_components";

export default async function Page() {
  const joinToken = (await cookies()).get("join-token");
  let email = "";

  if (joinToken) {
    const { invitation, user: invitedUser } = await getInvitation(
      joinToken.value,
    );

    email = invitedUser?.email || "";
    if (!invitedUser) {
      redirect(`/signup?email=${encodeURIComponent(invitation?.email || "")}`);
    }
  }

  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="w-full max-w-md space-y-10">
      <Header
        title="Sign into your account"
        description={
          <>
            New to {config.site.name}?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Sign up
            </Link>
          </>
        }
      />
      <Login email={email} />
    </div>
  );
}
