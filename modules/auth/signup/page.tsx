import Link from "next/link";
import { Header, SignUp } from "../_components";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ email: string }>;
}) {
  const email = (await searchParams).email;
  console.log("email: ", email);

  return (
    <div className="w-full max-w-md space-y-10">
      <Header
        title="Create a new account"
        description={
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Login
            </Link>
          </>
        }
      />
      <SignUp email={email} />
    </div>
  );
}
