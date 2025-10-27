"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ProtectedArea } from "@/components/permission/protected-area";
import { ProtectedButton } from "@/components/permission/protected-button";
import { Avatar } from "@/components/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { EditMember } from "./edit-member";
import { InviteMember } from "./invite-member";
import { MemberActions } from "./member-actions";

export interface Role {
  id: string;
  name: string;
}

export function MemberList({ data, roles }: { data: Member[]; roles: Role[] }) {
  const { data: session } = useSession();
  const [filtering, setFiltering] = useState("");
  const t = useTranslations("dashboard.permission.team.members");

  const columns: ColumnDef<Member>[] = [
    {
      header: t("user"),
      cell: ({ row }) => {
        const { email, user } = row.original;
        const isYou = user?.id === session?.user.id;
        return (
          <div className="flex items-center gap-3 min-h-[35px]">
            <Avatar
              className="h-8 w-8"
              image={user?.avatar}
              displayName={email.split("@")[0]}
            />
            <span>{email}</span>
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
      },
    },
    // {
    //   accessorKey: 'mfaEnabled',
    //   header: 'Enabled MFA',
    //   cell: ({ row }) => {
    //     return <X className="h-4 w-4" />;
    //   },
    // },
    {
      header: t("status"),
      cell: ({ row }) => {
        return (
          <div className="w-10">
            {row.original.status === "invited" && (
              <Badge variant="outline" className="text-xs mr-10">
                {t("invited")}
              </Badge>
            )}

            {row.original.status === "declined" && (
              <Badge
                variant="outline"
                className="text-xs mr-10 border-destructive text-destructive"
              >
                {t("declined")}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: () => (
        <div className="flex items-center gap-1">
          {t("role")}
          <Button variant="ghost" size="icon" className="h-4 w-4">
            <span className="sr-only">{t("roleInfo")}</span>
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const isOwner = row.original.isOwner;
        return (
          <div className="w-10">
            {isOwner ? (
              <span>{t("owner")}</span>
            ) : (
              <Badge>{row.original.role?.name}</Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="w-[40px] flex items-center justify-center gap-2">
            <ProtectedArea resource="member" action="edit">
              <EditMember member={row.original} roles={roles}>
                <Button
                  variant="outline"
                  className="text-xs"
                  size="sm"
                  // disabled={row.original.status !== 'joined'}
                >
                  {t("edit")}
                </Button>
              </EditMember>

              <MemberActions member={row.original} currentMembers={data}>
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
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter: filtering,
    },
    onGlobalFilterChange: setFiltering,
  });

  const userName = session?.user?.name;
  if (!userName) return null;

  return (
    <div className="container mx-auto max-w-6xl justify-start py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder={t("filterMembers")}
            className="h-9 w-[180px]"
            value={filtering}
            onChange={(e) => setFiltering(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <ProtectedArea resource="team" action="invite">
            <AddMember roles={roles} />

            <InviteMember userName={userName} roles={roles}>
              <Button>{t("invite")}</Button>
            </InviteMember>
          </ProtectedArea>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="px-6 py-3 space-y-4">
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
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

          <div className="py-2 border-t text-start text-sm">
            {t("usersCount", {
              count: table.getFilteredRowModel().rows.length,
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
