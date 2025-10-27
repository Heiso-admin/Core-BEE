import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/skeleton";
import { MemberList } from "./_components/member-list";
import { getRoles } from "./_server/role.service";
import { getTeamMembers } from "./_server/team.service";

export default async function Team() {
  const t = await getTranslations("dashboard.permission.team");
  return (
    <div className="container m-auto max-w-6xl justify-start py-10 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <TeamManagement />
      </Suspense>
    </div>
  );
}

async function TeamManagement() {
  const [members, roles] = await Promise.all([getTeamMembers(), getRoles()]);
  return <MemberList data={members} roles={roles} />;
}
