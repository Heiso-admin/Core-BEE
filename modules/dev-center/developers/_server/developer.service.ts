"use server";

import { getDynamicDb } from "@heiso/core/lib/db/dynamic";
import type { TDeveloper, TUser } from "@heiso/core/lib/db/schema";
import { developers } from "@heiso/core/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";

type Developer = TDeveloper & {
  user: TUser;
};

async function getDevelopers(): Promise<Developer[]> {
  const db = await getDynamicDb();
  const devs = await db.query.developers.findMany({
    with: {
      user: true,
    },
  });

  return devs;
}

async function addDeveloper({ email }: { email: string }): Promise<TDeveloper> {
  const db = await getDynamicDb();
  const t = await getTranslations("devCenter.developers");

  const user = await db.query.users.findFirst({
    where: (t, { eq }) => eq(t.email, email),
  });

  if (!user) {
    throw new Error(t("errors.user_not_found"));
  }

  const [dev] = await db
    .insert(developers)
    .values({
      userId: user.id,
    })
    .returning();

  revalidatePath("./developers");
  return dev;
}

async function removeDeveloper({ id }: { id: string }): Promise<TDeveloper> {
  const db = await getDynamicDb();
  const t = await getTranslations("devCenter.developers");

  const [dev] = await db
    .delete(developers)
    .where(eq(developers.userId, id))
    .returning();

  if (!dev) {
    throw new Error(t("errors.developer_not_found"));
  }

  revalidatePath("./developers");
  return dev;
}

export { getDevelopers, addDeveloper, removeDeveloper, type Developer };
