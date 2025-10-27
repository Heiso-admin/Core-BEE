import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  if (!name) {
    throw new Error("Missing name parameter");
  }

  const file = await db.query.files.findFirst({
    columns: {
      url: true,
    },
    where: (file, { and, eq, isNull }) =>
      and(eq(file.name, name), isNull(file.deletedAt)),
    orderBy: (file, { desc }) => [desc(file.createdAt)],
  });

  if (!file || !file.url) {
    return new Response(null, { status: 404 });
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: file.url,
    },
  });
}
