"use client";

import { Search } from "lucide-react";
import { DynamicIcon, iconNames } from "lucide-react/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type IconName = (typeof iconNames)[number];

interface IconSelectorProps {
  value?: IconName | string;
  onChange: (iconName: IconName) => void;
  placeholder?: string;
  className?: string;
  maxIcons?: number;
  children?: React.ReactNode;
}

export function IconSelector({
  children,
  value,
  onChange,
  placeholder = "Search icons...",
  className = "",
  maxIcons = 50,
}: IconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter and prepare icons
  const filteredIcons = useMemo(() => {
    const searchLower = searchTerm.toLowerCase().trim();

    const icons = searchLower
      ? iconNames.filter(
          (name) =>
            name.toLowerCase().includes(searchLower) ||
            name.replace(/-/g, " ").includes(searchLower) ||
            name.replace(/-/g, "").includes(searchLower),
        )
      : iconNames;

    return icons.slice(0, maxIcons);
  }, [searchTerm, maxIcons]);

  // Get selected icon display name
  const selectedIconDisplay = useMemo(() => {
    if (!value || !iconNames.includes(value as IconName)) return null;
    return (value as string).replace(/-/g, " ");
  }, [value]);

  const handleSelect = useCallback(
    (iconName: IconName) => {
      onChange(iconName);
      setIsOpen(false);
      setSearchTerm("");
    },
    [onChange],
  );

  // const columns = window?.innerWidth < 768 ? 5 : 8;
  const columns =
    typeof window !== "undefined" && window.innerWidth < 768 ? 5 : 8;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          role="combobox"
          aria-expanded={isOpen}
          className={cn("", className)}
        >
          <div className="flex items-center gap-2">
            {value ? (
              <DynamicIcon name={value as IconName} size={20} />
            ) : children ? (
              children
            ) : (
              <span className="text-muted-foreground"></span>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="p-2 border-b">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 border-none focus-visible:ring-transparent"
            />
          </div>
        </div>
        <ScrollArea className="h-[300px] p-2">
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
            }}
          >
            {filteredIcons.length === 0 ? (
              <div className="col-span-full text-center py-4 text-muted-foreground">
                No icons found
              </div>
            ) : (
              filteredIcons.map((iconName) => (
                <Button
                  key={iconName}
                  variant={value === iconName ? "secondary" : "ghost"}
                  size="sm"
                  className="aspect-square p-2"
                  onClick={() => handleSelect(iconName)}
                  title={iconName.replace(/-/g, " ")}
                >
                  <DynamicIcon name={iconName} size={20} />
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
