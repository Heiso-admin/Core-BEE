import { getUserPermissions } from "@heiso/core/server/services/permission";

export async function GET() {
  const permissions = await getUserPermissions();
  return Response.json(permissions);
}
