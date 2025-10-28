'use client';

import { useEffect } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { monthlyRange } from '@/lib/format';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import Link from 'next/link';

type Usage = {
  date: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  fee: number;
};

const columns: ColumnDef<Usage>[] = [
  {
    header: 'Date',
    accessorKey: 'date',
    cell: ({ row }) => {
      const range = monthlyRange(row.getValue('date'));
      return (
        <div className="flex gap-1">
          <Link
            href={`/billing/usage/tokens?range=${encodeURIComponent(
              JSON.stringify(range)
            )}`}
            className="hover:underline"
          >
            {row.getValue('date')}
          </Link>
        </div>
      );
    },
  },
  {
    header: 'Input Tokens',
    cell: ({ row }) => {
      return (
        <div className="">{row.original.inputTokens.toLocaleString()}</div>
      );
    },
  },
  {
    header: 'Output Tokens',
    cell: ({ row }) => {
      return (
        <div className="">{row.original.outputTokens.toLocaleString()}</div>
      );
    },
  },
  {
    header: 'Fee',
    cell: ({ row }) => {
      return (
        <div className="">
          {row.original.fee ? `$ ${row.original.fee.toLocaleString()}` : ' -- '}
        </div>
      );
    },
  },
];

export function UsageYearTable({ data }: { data: Usage[] }) {
  const { setBreadcrumb } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumb([{ title: 'General Info' }, { title: 'AI Usage' }]);
  }, [setBreadcrumb]);

  const table = useReactTable({
    data,
    columns,
    // state: {
    //   sorting,
    //   columnFilters,
    // },
    // onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), //client-side filtering
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(), // client-side faceting
    getFacetedUniqueValues: getFacetedUniqueValues(), // generate unique values for select filter/autocomplete
    getFacetedMinMaxValues: getFacetedMinMaxValues(), // generate min/max values for range filter
    // onSortingChange: setSorting,
    enableSortingRemoval: false,
  });

  return (
    <div className="my-2 space-y-5">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted/50">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="relative h-10 border-t select-none"
                    aria-sort={
                      header.column.getIsSorted() === 'asc'
                        ? 'ascending'
                        : header.column.getIsSorted() === 'desc'
                        ? 'descending'
                        : 'none'
                    }
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <div
                        className={cn(
                          header.column.getCanSort() &&
                            'flex h-full cursor-pointer items-center justify-between gap-2 select-none'
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                        onKeyDown={(e) => {
                          // Enhanced keyboard handling for sorting
                          if (
                            header.column.getCanSort() &&
                            (e.key === 'Enter' || e.key === ' ')
                          ) {
                            e.preventDefault();
                            header.column.getToggleSortingHandler()?.(e);
                          }
                        }}
                        tabIndex={header.column.getCanSort() ? 0 : undefined}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: (
                            <ChevronUpIcon
                              className="shrink-0 opacity-60"
                              size={16}
                              aria-hidden="true"
                            />
                          ),
                          desc: (
                            <ChevronDownIcon
                              className="shrink-0 opacity-60"
                              size={16}
                              aria-hidden="true"
                            />
                          ),
                        }[header.column.getIsSorted() as string] ?? (
                          <span className="size-4" aria-hidden="true" />
                        )}
                      </div>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
