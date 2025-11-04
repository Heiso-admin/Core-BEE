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
         <div className="text-center mt-5">
          <p className="text-sm text-neutral">You have successfully verified your email </p>
          <p className="text-sm text-sub-highlight"> {email}</p>
         </div>
        }
      />
      <SignUp email={email} />
    </div>
  );
}
