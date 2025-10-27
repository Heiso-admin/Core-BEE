import { getUserPermissions } from "@/server/services/permission";

export async function GET() {
  const permissions = await getUserPermissions();
  return Response.json(permissions);
}
