"use client";

import {
  type ColumnDef,
  type SortingState,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { ProtectedArea } from "@/components/permission/protected-area";
import { Avatar, DataPagination } from "@/components/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Member } from "../_server/team.service";
import { InviteMember } from "./invite-member";
import { MemberActions } from "./member-actions";
import { SearchInput } from "@/components/ui/search-input";
import { CaptionTotal } from '@/components/ui/caption-total';
import { readableDate } from "@/lib/utils/format";
import { RadioGroup } from '@/components/ui/radio-group';
import { RadioTagGroupItem, RadioTagLabel } from '@/components/ui/radio-tag';
import { capitalize } from 'lodash';

export enum MemberStatus {
  Invited = "invited",        // 已邀請/待驗證
  Joined = "joined",          // 已加入/啟用
  Review = "review",          // 待審核
  Disabled = "suspend",      // 停用/已拒絕
  Owner = "Owner",            // 擁有者
}

type FilterStatus = "all" | MemberStatus;

export interface Role {
  id: string;
  name: string;
}

const filterStatuses: FilterStatus[] = [
  'all',
  MemberStatus.Review,
  MemberStatus.Joined,
  MemberStatus.Disabled,
];

export function MemberList({ data, roles }: { data: Member[]; roles: Role[] }) {
  const { data: session } = useSession();
  const [filtering, setFiltering] = useState('');
  const te = useTranslations('dashboard.permission.team');
  const t = useTranslations('dashboard.permission.team.members');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>(
    filterStatuses[0]
  );
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const AllRoles: Role[] = [
    { id: MemberStatus.Owner, name: MemberStatus.Owner },
    ...roles,
  ];

  const showStatus = useCallback(
    (member: string | null) => {
      switch (member) {
        case MemberStatus.Invited:
          return <Badge status="blue">{t('statuses.invited')}</Badge>;
        case MemberStatus.Disabled:
          return <Badge status="hidden">{t('statuses.declined')}</Badge>;
        case MemberStatus.Joined:
          return <Badge status="green">{t('statuses.joined')}</Badge>;
        case MemberStatus.Review:
          return <Badge status="yellow">{t('statuses.review')}</Badge>;
        default:
          return member;
      }
    },
    [t]
  );

  const columns: ColumnDef<Member>[] = [
    {
      header: t('user'),
      accessorFn: (row) => {
        const userName = row.user?.name || row.email.split('@')[0];
        return `${userName} ${row.email}`;
      },
      sortingFn: 'basic',
      cell: ({ row }) => {
        const { user } = row.original;
        const isYou = user?.id === session?.user.id;
        return <MemberUser member={row.original} isYou={isYou} />;
      },
    },
    {
      accessorFn: (row) => {
        if (row.isOwner) {
          return MemberStatus.Owner;
        }
        return row.role?.name || 'No Role';
      },
      sortingFn: (rowA, rowB) => {
        const aValue = rowA.original.isOwner
          ? '0_Owner'
          : `1_${rowA.original.role?.name || 'ZZZ_No_Role'}`;
        const bValue = rowB.original.isOwner
          ? '0_Owner'
          : `1_${rowB.original.role?.name || 'ZZZ_No_Role'}`;
        return aValue.localeCompare(bValue);
      },
      header: t('role'),
      cell: ({ row }) => {
        const isOwner = row.original.isOwner;
        const isRole =
          roles.find((role) => role.id === row.original.roleId)?.name || null;

        if (isOwner) return <Badge variant="tag">{MemberStatus.Owner}</Badge>;
        return isRole && <Badge variant="tag">{isRole}</Badge>;
      },
    },
    {
      header: t('status'),
      accessorKey: 'status',
      sortingFn: 'basic',
      cell: ({ row }) => showStatus(row.original.status),
    },
    {
      header: t('signin'),
      id: 'signin',
      accessorFn: (row) => row.user?.loginMethod?.trim() || 'login',
      sortingFn: 'text',
      cell: ({ getValue }) => capitalize(String(getValue())),
    },
    {
      header: t('createdDate'),
      accessorKey: 'createdAt',
      sortingFn: 'datetime',
      cell: ({ row }) => readableDate(row.original.createdAt),
    },
    {
      header: t('updatedDate'),
      id: 'lastLoginAt',
      accessorFn: (row) => row.user?.lastLoginAt ?? null,
      sortingFn: 'datetime',
      cell: ({ getValue }) => {
        const value = getValue() as Date | string | null;
        return value ? readableDate(value) : '-';
      },
    },
    {
      header: t('actions'),
      id: 'actions',
      cell: ({ row }) => {
        const isYou = row.original.user?.id === session?.user.id;
        return (
          !isYou && (
            <div className="w-full flex items-center justify-center gap-2">
              <ProtectedArea resource="member" action="edit">
                <MemberActions
                  member={row.original}
                  currentMembers={data}
                  roles={roles}
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">{t('more')}</span>
                  </Button>
                </MemberActions>
              </ProtectedArea>
            </div>
          )
        );
      },
    },
  ];

  const columnFilters = useMemo(
    () =>
      filterStatus === 'all' ? [] : [{ id: 'status', value: filterStatus }],
    [filterStatus]
  );

  const table = useReactTable({
    data: data,
    columns,
    state: {
      sorting,
      globalFilter: filtering ?? '',
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const totalRows = table.getFilteredRowModel().rows.length;
  const userName = session?.user?.name;
  if (!userName) return null;

  return (
    <div className="container mx-auto pt-4 pr-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <CaptionTotal title={te('title')} total={totalRows} />
        <div className="flex gap-2">
          <SearchInput
            value={filtering}
            onChange={(e) => setFiltering(e.target.value)}
            placeholder={t('searchMembers')}
          />
          <ProtectedArea resource={'member'} action={'edit'}>
            {/* <AddMember roles={AllRoles} /> */}
            <InviteMember userName={userName} roles={roles}>
              <Button>
                <Plus className="h-4 w-4" /> {t('invite')}
              </Button>
            </InviteMember>
          </ProtectedArea>
        </div>
      </div>
      <RadioGroup
        value={filterStatus}
        className="flex items-center gap-3 mb-2"
        onValueChange={(value) => setFilterStatus(value as FilterStatus)}
      >
        <span className="pl-0.5 text-sm text-text-secondary">
          {t('filter.title')}:
        </span>
        {filterStatuses.map((item) => (
          <div className="flex items-center gap-3" key={item}>
            <RadioTagGroupItem className="hidden" value={item} id={item} />
            <RadioTagLabel htmlFor={item}>{t(`filter.${item}`)}</RadioTagLabel>
          </div>
        ))}
      </RadioGroup>

      <div className="layout-split-pane flex flex-col justify-between grow overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSortable = header.column.getCanSort();
                  const sorted = header.column.getIsSorted(); // false | 'asc' | 'desc'
                  return (
                    <TableHead
                      key={header.id}
                      isSortable={isSortable}
                      sorted={sorted}
                      onClick={
                        isSortable
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      isCenter={header.column.id === 'actions'}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="">
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <DataPagination
          className="border-t"
          total={totalRows}
          inputPage={pagination.pageIndex + 1}
          onInputPageChange={(page) => table.setPageIndex(page - 1)}
          defaultRows={pagination.pageSize}
          onChangeRows={(rows) => table.setPageSize(rows)}
        />
      </div>
    </div>
  );
}

export const MemberUser = ({ member, isYou }: { member: Member, isYou: boolean }) => {
  const t = useTranslations("dashboard.permission.team.members");
  const { email, user } = member;
  const userName = user?.name || email.split("@")[0];
  return (
    <div className="flex items-center gap-3 min-h-[35px]">
      <Avatar
        className="h-8 w-8"
        image={user?.avatar}
        displayName={email.split("@")[0]}
      />
      <div className="flex flex-col">
        <span>{userName}</span>
        <span className="text-neutral">{email}</span>
      </div>
      {isYou && (
        <Badge
          variant="outline"
          className="text-xs text-muted-foreground"
        >
          {t("you")}
        </Badge>
      )}
    </div>
  );
}
