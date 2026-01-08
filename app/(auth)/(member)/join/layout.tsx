"use client";

import { Logo } from "@heiso/core/components/primitives";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-sub-background flex flex-col items-center justify-center">
      <main className="w-full max-w-lg bg-background py-16 px-12 rounded-[12px] shadow-[1px_1px_4px_0_rgba(0,0,0,0.1)] shadow-primary/70 relative flex flex-col items-center space-y-6">
        <div className="flex flex-col items-center justify-center mb-4">
          <Logo
            hasTitle={false}
            classNames={{
              img: "w-12 text-primary",
            }}
          />
        </div>
        {children}
      </main>
    </div>
  );
}
