"use client";
import { Button } from "@heiso/core/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@heiso/core/components/ui/select";
import { cn } from "@heiso/core/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { useEffect } from "react";

export default function Pagination({
  className,
  section,
  currentPage,
  totalPages,
}: {
  className?: string;
  section?: {
    path: string;
    query: URLSearchParams;
  };
  currentPage: number;
  totalPages: number;
}) {
  const indexPageLink = currentPage === 2;
  const hasPrevPage = currentPage > 1;
  const hasNextPage = totalPages > currentPage;

  const pageList = [];
  for (let i = 1; i <= totalPages; i++) {
    pageList.push(i);
  }

  const path = section ? `/${section.path}` : "/";
  const query = new URLSearchParams(section?.query ?? {});

  const getPageLink = (page: number) => {
    query.set("page", page.toString());
    return query.toString();
  };

  return (
    <>
      {totalPages > 1 && (
        <nav
          className={cn("mb-4 flex justify-center space-x-4", className)}
          aria-label="Pagination"
        >
          {/* previous */}
          {hasPrevPage ? (
            <Link
              href={
                indexPageLink ? path : `${path}?${getPageLink(currentPage - 1)}`
              }
              className="rounded-lg border border-primary px-2 py-2 text-dark"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="mt-1 h-5 w-5" />
            </Link>
          ) : (
            <span className="rounded-lg border border-primary px-2 py-2 text-dark">
              <span className="sr-only">Previous</span>
              <ChevronLeft className="mt-1 h-5 w-5" />
            </span>
          )}

          {/* page index */}
          {pageList.map((pagination, _i) => (
            <React.Fragment key={`page-${pagination}`}>
              {pagination === currentPage ? (
                <span
                  aria-current="page"
                  className={`rounded-lg border border-primary bg-primary px-4 py-2`}
                >
                  {pagination}
                </span>
              ) : (
                <Link
                  href={
                    pagination === 1
                      ? path
                      : `${path}?${getPageLink(pagination)}`
                  }
                  passHref
                  aria-current="page"
                  className={`rounded-lg border border-primary px-4 py-2 text-dark`}
                >
                  {pagination}
                </Link>
              )}
            </React.Fragment>
          ))}

          {/* next page */}
          {hasNextPage ? (
            <Link
              href={`${path}?${getPageLink(currentPage + 1)}`}
              className="rounded-lg border border-primary px-2 py-2 text-dark"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="mt-1 h-5 w-5" />
            </Link>
          ) : (
            <span className="rounded-lg border border-primary px-2 py-2 text-dark">
              <span className="sr-only">Next</span>
              <ChevronRight className="mt-1 h-5 w-5" />
            </span>
          )}
        </nav>
      )}
    </>
  );
}

export function DataPagination({
  className,
  total,
  inputPage,
  onInputPageChange,
  defaultRows,
  rowsOptions = [10, 20, 30, 40, 50],
  onChangeRows,
}: {
  className?: string;
  section?: {
    path: string;
    query: URLSearchParams;
  };
  total: number;
  inputPage?: number;
  onInputPageChange?: (page: number) => void;
  defaultRows?: number;
  rowsOptions?: number[];
  onChangeRows?: (rows: number) => void;
}) {
  const t = useTranslations("components.pagination");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const pageParam = searchParams.get("page");
  const rowsParam = searchParams.get("rows");
  const totalParam = searchParams.get("total");

  const defaultRowsValue = defaultRows ?? rowsOptions[0];
  const rowsRaw = Number(rowsParam ?? defaultRowsValue);
  const pageSize = Number.isFinite(rowsRaw)
    ? Math.max(1, rowsRaw)
    : defaultRowsValue;
  const options = rowsOptions.includes(pageSize)
    ? rowsOptions
    : [...rowsOptions, pageSize].sort((a, b) => a - b);
  const totalPages = Math.ceil(total / pageSize);

  const pageFromUrl = Math.max(1, Math.min(totalPages, Number(pageParam ?? 1)));
  const isPageControlled = inputPage !== undefined;
  const page = isPageControlled
    ? Math.max(1, Math.min(totalPages, Number(inputPage)))
    : pageFromUrl;
  const _totalItems = totalParam ? Math.max(0, Number(totalParam)) : undefined;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const setParam = (key: string, value: string | number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, String(value));
    router.push(`${pathname}?${params.toString()}`);
  };

  const goToPage = (nextPage: number) => {
    const target = Math.max(1, Math.min(totalPages, nextPage));
    if (onInputPageChange) {
      onInputPageChange(target);
    }
    if (!isPageControlled) {
      setParam("page", target);
    }
  };

  const onRowsChange = (value: string) => {
    const selected = Number(value);
    if (onChangeRows) {
      onChangeRows(selected);
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("rows", value);
    if (!isPageControlled) {
      params.set("page", "1");
    }
    router.push(`${pathname}?${params.toString()}`);
    if (isPageControlled && onInputPageChange) {
      onInputPageChange(1);
    }
  };

  // allow free typing; commit clamped value on blur/enter
  const [localInput, setLocalInput] = React.useState<string>(
    String(inputPage ?? page),
  );
  useEffect(() => {
    setLocalInput(String(inputPage ?? page));
  }, [inputPage, page]);

  const commitInputPage = () => {
    const n = Number(localInput);
    const base = inputPage ?? page;
    const target = Number.isNaN(n)
      ? base
      : Math.max(1, Math.min(totalPages, n));
    setLocalInput(String(target));
    if (onInputPageChange) {
      onInputPageChange(target);
    }
    if (!isPageControlled) {
      setParam("page", target);
    }
  };

  return (
    <div
      className={cn("flex items-center justify-between gap-4 py-2", className)}
    >
      <div className="text-sm text-muted-foreground">
        <span>
          {t("showingItems", {
            start,
            end,
            total: total,
          })}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon_sm"
          aria-label="Previous page"
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <input
          type="number"
          min={1}
          max={totalPages}
          step={1}
          className="w-12 rounded-md border px-2 py-1 text-sm"
          value={localInput}
          disabled={totalPages <= 1}
          onChange={(e) => {
            const val = e.target.value;
            setLocalInput(val);
            const n = Number(val);
            if (!Number.isNaN(n)) {
              const target = Math.max(1, Math.min(totalPages, n));
              if (onInputPageChange) {
                onInputPageChange(target);
              }
              if (!isPageControlled) {
                setParam("page", target);
              }
            }
          }}
          onBlur={commitInputPage}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitInputPage();
          }}
        />
        <span className="text-sm text-muted-foreground">of {totalPages}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon_sm"
          aria-label="Next page"
          onClick={() => goToPage(page + 1)}
          disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">{t("rows")}</span>
        <Select value={String(pageSize)} onValueChange={onRowsChange}>
          <SelectTrigger className="h-8 w-fit">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {options.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
