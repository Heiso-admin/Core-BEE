"use client";

import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
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
import { AddMember } from "./add-member";
import { InviteMember } from "./invite-member";
import { MemberActions } from "./member-actions";
import { SearchInput } from "@/components/ui/search-input";
import { CaptionTotal } from "@/components/ui/caption";
import { readableDate } from "@/lib/utils/format";

export enum MemberStatus {
  Invited = "invited",        // 已邀請/待驗證
  Joined = "joined",          // 已加入/啟用
  Review = "review",          // 待審核
  Disabled = "disabled",      // 停用
  Declined = "declined",      // 已拒絕
  Owner = "Owner",            // 擁有者
}

export interface Role {
  id: string;
  name: string;
}

export function MemberList({ data, roles }: { data: Member[]; roles: Role[] }) {
  const { data: session } = useSession();
  const [filtering, setFiltering] = useState("");
  const te = useTranslations("dashboard.permission.team");
  const t = useTranslations("dashboard.permission.team.members");
  const [sorting, setSorting] = useState<SortingState>([]);
  console.log("roles--",data, roles);

  const AllRoles: Role[]= [{id: MemberStatus.Owner, name: MemberStatus.Owner},...roles]

  const showStatus = useCallback((member: string | null) => {
    switch (member) {
      case MemberStatus.Invited:
        return <Badge status="blue">{t("statuses.invited")}</Badge>;
      case MemberStatus.Declined:
      case MemberStatus.Disabled:
        return <Badge status="hidden">{t("statuses.declined")}</Badge>;
      case MemberStatus.Joined:
        return <Badge status="green">{t("statuses.joined")}</Badge>;
      case MemberStatus.Review:
        return <Badge status="yellow">{t("statuses.review")}</Badge>;
      default:
        return member;
    }
  }, [t]);
  
  const columns: ColumnDef<Member>[] = [
    {
      header: t("user"),
      accessorFn: (row) => {
        const userName = row.user?.name || row.email.split("@")[0];
        return `${userName} ${row.email}`;
      },
      sortingFn: "basic",
      cell: ({ row }) => {
        const { user } = row.original;
        const isYou = user?.id === session?.user.id;
        return (<MemberUser member={row.original} isYou={isYou} />
        );
      },
    },
    {
      accessorFn: (row) => {
        if (row.isOwner) {
          return MemberStatus.Owner; 
        }
        return row.role?.name || "No Role";
      },
      sortingFn: (rowA, rowB) => {
        const aValue = rowA.original.isOwner ? "0_Owner" : `1_${rowA.original.role?.name || "ZZZ_No_Role"}`;
        const bValue = rowB.original.isOwner ? "0_Owner" : `1_${rowB.original.role?.name || "ZZZ_No_Role"}`;
        return aValue.localeCompare(bValue);
      },
      header: t("role"),
      cell: ({ row }) => {
        const isOwner = row.original.isOwner;
        const nullOwner = row.original.role === null && !row.original.isOwner
        return (!nullOwner&&<Badge variant="tag">{isOwner? MemberStatus.Owner: row.original.role?.name}</Badge>);
      },
    },
    {
      header: t("status"),
      accessorKey: "status",
      sortingFn:"basic",
      cell: ({ row }) => showStatus(row.original.status)
    },
    {
      header: t("createdDate"),
      accessorKey: "createdAt",
      sortingFn:"datetime",
      cell: ({ row }) => (readableDate(row.original.createdAt)),
    },
    {
      header: t("updatedDate"),
      accessorKey: "updatedAt",
      sortingFn:"datetime",
      cell: ({ row }) => {
        const updateDate = row.original.updatedAt
        return(updateDate && row.original.status !== MemberStatus.Invited ? readableDate(updateDate) : "-")},
    },
    {
      header: t("actions"),
      id: "actions",
      cell: ({ row }) => {
        const isYou = row.original.user?.id === session?.user.id;
        return !isYou && (
          <div className="w-full flex items-center justify-center gap-2">
            <ProtectedArea resource="member" action="edit">
              <MemberActions member={row.original} currentMembers={data} roles={AllRoles}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">{t("more")}</span>
                </Button>
              </MemberActions>
            </ProtectedArea>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    // data: data.filter((item) => item.user?.email?.includes(filtering)),
    data,
    columns,
    state: {
      sorting,
      globalFilter: filtering ?? "",
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const totalRows = table.getFilteredRowModel().rows.length
  const userName = session?.user?.name;
  if (!userName) return null;

  return (
    <div className="container mx-auto pt-4 pr-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <CaptionTotal title={te("title")} total={totalRows} />
        <div className="flex gap-2">
          <SearchInput
            value={filtering}
            onChange={(e) => setFiltering(e.target.value)}
            placeholder={t("searchMembers")}
          />
          <ProtectedArea resource="team" action="invite">
            {/* <AddMember roles={AllRoles} /> */}
            <InviteMember userName={userName} roles={AllRoles}>
              <Button><Plus className="h-4 w-4" /> {t("invite")}</Button>
            </InviteMember>
          </ProtectedArea>
        </div>
      </div>

      <div className="layout-split-pane flex flex-col justify-between grow overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSortable = header.column.getCanSort();
                  const sorted = header.column.getIsSorted(); // false | 'asc' | 'desc'
                  return( 
                    <TableHead 
                      key={header.id} 
                      isSortable={isSortable} 
                      sorted={sorted} 
                      onClick={isSortable ? header.column.getToggleSortingHandler() : undefined}
                      isCenter={header.column.id === "actions"}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                      )}
                    </TableHead>)
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="">
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
      </div>
    </div>
  );
}

export const MemberUser = ({member, isYou}: {member: Member, isYou: boolean})=>{
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
