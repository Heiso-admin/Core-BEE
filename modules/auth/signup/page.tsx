import { SignUp } from "../_components";

export default async function Page({
  searchParams,
}: {
  searchParams?: { email?: string };
}) {
  const sp = await searchParams;
  const email = sp?.email ?? "";

  return (
    <div className="w-full max-w-md space-y-10">
      <SignUp email={email} />
    </div>
  );
}
