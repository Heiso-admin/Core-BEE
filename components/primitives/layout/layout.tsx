// 'use client';

import type { UserAvatarMenuItem } from "@/components/primitives/user-avatar";
import type { BreadcrumbProps, Navigation } from "@/types/client";
// import { useState, useEffect } from 'react';
import { Header } from "./header";
import { DashboardSidebar } from "./sidebar";
// import { useIsMobile } from '@/hooks/use-mobile';

export function Layout({
  navigation,
  breadcrumb,
  menu,
  children,
}: {
  navigation?: Navigation;
  breadcrumb?: BreadcrumbProps;
  menu: UserAvatarMenuItem[];
  children: React.ReactNode;
}) {
  // const [sidebarOpen, setSidebarOpen] = useState(true);
  // const isMobile = useIsMobile();

  // Auto-collapse sidebar on mobile devices
  // useEffect(() => {
  //   if (isMobile) {
  //     setSidebarOpen(false);
  //   } else {
  //     setSidebarOpen(true);
  //   }
  // }, [isMobile]);

  return (
    <div className="relative flex flex-col h-screen w-full bg-background">
      <Header breadcrumb={breadcrumb} menu={menu} />

      <div className="flex-1 flex flex-wrap h-full">
        {/* Sidebar */}
        <DashboardSidebar navigation={navigation} />

        {/* Page Content */}
        <main className="flex-1 w-full h-full max-h-[calc(100vh-3rem)] overflow-x-hidden overflow-y-auto bg-background/95">
          {children}
        </main>
      </div>
    </div>
  );
}
