// import { getProviders } from 'next-auth/react';
// import SignInProviderButton from './signInProviderButton';
import LoginForm from "./loginForm";

export default async function Login({ email }: { email?: string | null }) {
  // const providers = await getProviders();
  // let providerValues;
  // if (providers) {
  //   providerValues = Object.values(providers).filter(
  //     // Credentials are handled manually by the sign in form
  //     (p) => p.id != 'credentials'
  //   );
  // }

  return (
    <div>
      <LoginForm email={email} />
      {/* {providerValues && providerValues.length > 0 && (
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-foreground/40">
                or with
              </span>
            </div>
          </div>

          {providerValues.map((provider) => (
            <div key={provider.id} className="mt-6">
              <SignInProviderButton provider={provider} />
            </div>
          ))}
        </div>
      )} */}
    </div>
  );
}
