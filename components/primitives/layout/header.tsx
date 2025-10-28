import { ChevronDownIcon, SlashIcon } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { auth } from '@/modules/auth/auth.config';
import { UserAvatar } from "@/components/primitives";
import { Logo } from "@/components/primitives/logo";
import type { UserAvatarMenuItem } from "@/components/primitives/user-avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { LanguageSwitcher } from '@/components/primitives';
import { getUserLocale } from "@/server/locale";
// import { Notification } from './notification';
import type { BreadcrumbProps } from "@/types/client";

export async function Header({
  breadcrumb,
  menu,
}: {
  breadcrumb?: BreadcrumbProps;
  menu: UserAvatarMenuItem[];
}) {
  const session = await auth();
  if (!session?.user) return null;
  const lang = await getUserLocale();

  return (
    <header className="w-full flex-none border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* <Notification /> */}

      <div className="flex h-12 px-2">
        <div className="w-full flex flex-1 items-center justify-between space-x-2">
          <div className="w-full flex-1 items-center justify-between md:w-auto md:flex-none">
            <nav className="flex space-x-6 text-sm">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      <BreadcrumbLink asChild>
                        <Logo
                          hasTitle={false}
                          classNames={{
                            img: "max-h-10 max-w-20 text-primary",
                          }}
                        />
                      </BreadcrumbLink>
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                  {breadcrumb?.items.length && (
                    <BreadcrumbSeparator>
                      <SlashIcon className="text-border" />
                    </BreadcrumbSeparator>
                  )}
                  {breadcrumb?.items.map((item, index) => (
                    <Fragment key={index}>
                      <BreadcrumbItem className={item.className}>
                        {item.isDropdown ? (
                          <DropdownMenu>
                            <BreadcrumbPage>
                              <DropdownMenuTrigger className="flex items-center gap-1 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5">
                                {item.title}
                                <ChevronDownIcon />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                {item.dropdownItems?.map((dropdownItem) => (
                                  <DropdownMenuItem
                                    key={dropdownItem.title}
                                    asChild
                                  >
                                    <Link href={dropdownItem.link}>
                                      {dropdownItem.title}
                                    </Link>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </BreadcrumbPage>
                          </DropdownMenu>
                        ) : (
                          <BreadcrumbPage>
                            {item.link ? (
                              <BreadcrumbLink asChild>
                                <Link
                                  href={item.link}
                                  className="flex items-center gap-1"
                                >
                                  {item.icon}
                                  {item.title}
                                </Link>
                              </BreadcrumbLink>
                            ) : (
                              <div className="flex items-center gap-1">
                                {item.icon}
                                {item.title}
                              </div>
                            )}
                          </BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumb?.items.length - 1 && (
                        <BreadcrumbSeparator>
                          <SlashIcon className="text-border" />
                        </BreadcrumbSeparator>
                      )}
                    </Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </nav>
          </div>

          <div className="flex items-center justify-between gap-2">
            {/* <LanguageSwitcher lang={lang} /> */}

            {/* <Button variant="ghost" size="icon" asChild>
              <Link href="/feedback" className="relative">
                <MessageCircle className="h-4 w-4" />
                <span className="sr-only">Feedback</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/docs" className="relative">
                <MessageSquare className="h-4 w-4" />
                <span className="sr-only">Document</span>
              </Link>
            </Button> */}
            <UserAvatar menu={menu} />
          </div>
        </div>
      </div>
    </header>
  );
}
