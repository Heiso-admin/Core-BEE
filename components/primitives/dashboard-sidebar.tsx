"use client";

import { cn } from "@heiso/core/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronsLeft, ChevronsRight, Menu, X } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import Link, { type LinkProps } from "next/link";
import type React from "react";
import { createContext, useContext, useState } from "react";

interface Links {
  title: string;
  path?: string;
  icon: React.JSX.Element | React.ReactNode | string;
  isActive?: boolean;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
  pinned: boolean;
  setPinned: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined,
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);
  const [pinned, setPinned] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider
      value={{ open, setOpen, animate, pinned, setPinned }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = ({
  className,
  children,
  ...rest
}: React.ComponentProps<"div">) => {
  return (
    <>
      <DesktopSidebar className={className}>{children}</DesktopSidebar>
      <MobileSidebar className={className} {...rest}>
        {children}
      </MobileSidebar>
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof motion.div>, "children"> & {
  children?: React.ReactNode;
}) => {
  const { open, setOpen, animate, pinned, setPinned } = useSidebar();
  const handleTogglePinned = () => {
    if (pinned) {
      setPinned(false);
      setOpen(false);
    } else {
      setPinned(true);
      setOpen(true);
    }
  };
  return (
    <motion.div
      className={cn(
        "h-full px-2 py-2 hidden md:flex md:flex-col bg-neutral-100 dark:bg-neutral-800 w-[50px] flex-shrink-0",
        className,
      )}
      animate={{
        width: animate ? (open ? "230px" : "50px") : "230px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        if (!pinned) setOpen(false);
      }}
      {...props}
    >
      {children}
      <div className="flex items-center justify-end mb-2 border-t pt-2">
        <button
          type="button"
          aria-label={pinned ? "Unpin sidebar" : "Pin sidebar"}
          onClick={handleTogglePinned}
          className={cn(
            "inline-flex items-center justify-center rounded-sm p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )}
        >
          {pinned ? (
            <ChevronsLeft strokeWidth={1.5} />
          ) : (
            <ChevronsRight strokeWidth={1.5} />
          )}
        </button>
      </div>
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <div
      className={cn(
        "h-10 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-neutral-100 dark:bg-neutral-800 w-full",
      )}
      {...props}
    >
      <div className="flex justify-end z-20 w-full">
        <button
          type="button"
          aria-label={open ? "Close sidebar" : "Open sidebar"}
          onClick={() => setOpen(!open)}
          className="inline-flex items-center justify-center rounded-sm p-1 text-neutral-800 hover:bg-(--state-active) hover:text-(--state-active-text)"
        >
          <Menu />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className={cn(
              "fixed h-full w-full inset-0 bg-white dark:bg-neutral-900 p-10 z-[100] flex flex-col justify-between",
              className,
            )}
          >
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => setOpen(!open)}
              className="absolute right-10 top-10 z-50 inline-flex items-center justify-center rounded-sm p-1 text-current dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              <X />
            </button>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SidebarLink = ({
  rootPath,
  link,
  className,
  isActive,
  ...props
}: {
  rootPath: string;
  link: Links;
  className?: string;
  isActive?: boolean;
  props?: LinkProps;
}) => {
  const { open, animate } = useSidebar();
  return (
    <Link
      href={`${rootPath}${link.path}`}
      className={cn(
        "min-h-8 flex items-center justify-start px-1.75 py-0 gap-2 group/sidebar rounded-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        className,
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
      )}
      {...props}
    >
      {/* <div className="min-h-4">{link.icon}</div> */}
      <div className="min-h-4">
        {typeof link.icon === "string" ? (
          <DynamicIcon
            name={link.icon as IconName}
            className={cn(
              "group-hover/sidebar:text-current",
              !isActive && "text-muted-foreground",
            )}
            size={20}
            strokeWidth={1.5}
          />
        ) : (
          <div className="min-h-4">{link.icon}</div>
        )}
      </div>
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className={cn(
          "text-sm hidden transition duration-150 whitespace-pre group-hover/sidebar:text-current !p-0 !m-0",
          !isActive && "text-muted-foreground font-normal",
        )}
      >
        {link.title}
      </motion.span>
    </Link>
  );
};
