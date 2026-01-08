"use client";

import { Button } from "@heiso/core/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@heiso/core/components/ui/dropdown-menu";
import type { Locale } from "@heiso/core/i18n/config";
import { getSupportedLanguages } from "@heiso/core/i18n/config";
import { setUserLocale } from "@heiso/core/server/locale";
import { Languages } from "lucide-react";

export function LanguageSwitcher({
  lang,
  className,
  onChange,
  children,
}: {
  lang?: Locale;
  className?: string;
  onChange?: (value: Locale) => void;
  children?: React.ReactNode;
}) {
  const supportedLanguages = getSupportedLanguages();

  const changeLang = (value: Locale) => {
    setUserLocale(value);
    onChange?.(value);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={className} asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          {children ?? <Languages className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {supportedLanguages.map((language) => (
          <DropdownMenuCheckboxItem
            key={language.code}
            checked={lang === language.code}
            onClick={() => changeLang(language.code)}
          >
            {language.nativeName}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
