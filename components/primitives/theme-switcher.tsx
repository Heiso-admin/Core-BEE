"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeSwitcher({ className }: { className?: string }) {
  const { setTheme, theme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState<string>();

  useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  return (
    <div
      className={cn(
        "flex items-center bg-background border rounded-full p-1 space-x-2 shadow-sm",
        className,
      )}
    >
      <Button
        variant={currentTheme === "system" ? "default" : "ghost"}
        size="icon"
        className={"rounded-full h-6 w-6"}
        onClick={() => setTheme("system")}
        aria-label="System theme"
      >
        <Monitor className="h-4 w-4" />
      </Button>
      <Button
        variant={currentTheme === "light" ? "default" : "ghost"}
        size="icon"
        className={"rounded-full h-6 w-6"}
        onClick={() => setTheme("light")}
        aria-label="Light theme"
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        variant={currentTheme === "dark" ? "default" : "ghost"}
        size="icon"
        className={"rounded-full h-6 w-6"}
        onClick={() => setTheme("dark")}
        aria-label="Dark theme"
      >
        <Moon className="h-4 w-4" />
      </Button>
    </div>
  );
}
