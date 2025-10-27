"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { TNavigationInsert, TNavigationUpdate } from "@/lib/db/schema";
import { navigations } from "@/lib/db/schema";

async function getNavigations() {
  const result = await db.query.navigations.findMany({
    where: (t, { isNull }) => isNull(t.deletedAt),
    orderBy: (t, { asc }) => [asc(t.createdAt)],
  });

  return result;
}

async function addNavigation({
  data,
  revalidateUri,
}: {
  data: TNavigationInsert;
  revalidateUri?: string;
}) {
  const result = await db
    .insert(navigations)
    .values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  if (revalidateUri) {
    revalidatePath(revalidateUri, "page");
  }
  return result;
}

async function updateNavigation({
  data,
  revalidateUri,
}: {
  data: TNavigationUpdate;
  revalidateUri?: string;
}) {
  const result = await db
    .update(navigations)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(navigations.id, data.id!))
    .returning();

  if (revalidateUri) {
    console.log("revalidateUri: ", revalidateUri);
    revalidatePath(revalidateUri, "page");
  }
  return result;
}

async function removeNavigation(id: string) {
  const result = await db
    .update(navigations)
    .set({
      deletedAt: new Date(),
    })
    .where(eq(navigations.id, id))
    .returning();

  revalidatePath("./navigation", "page");
  return result;
}

export { getNavigations, addNavigation, updateNavigation, removeNavigation };
