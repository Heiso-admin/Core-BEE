"use server";

import { eq, sql } from "drizzle-orm";
import { auth } from "@/app/(auth)/auth.config";
import { db } from "@/lib/db";
import { fileStorageCategories, files } from "@/lib/db/schema";
import { generateId } from "@/lib/id-generator";

function detectFileType(rawType: string) {
  const mimeToType: Record<string, string> = {
    "image/": "image",
    "video/": "video",
    "audio/": "audio",
    "application/pdf": "document",
    "application/zip": "archive",
    "application/x-rar-compressed": "archive",
    "application/x-7z-compressed": "archive",
  };

  let fileType = "other";
  for (const [mimePrefix, type] of Object.entries(mimeToType)) {
    if (rawType.startsWith(mimePrefix)) {
      fileType = type;
      break;
    }
  }

  return fileType;
}

export async function saveFile(file: {
  name: string;
  size: number;
  type: string;
  url: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!file) {
    return Response.json({ error: "No file data provided" }, { status: 400 });
  }

  const extension = file.name.split(".").pop() || "";
  const fileType = detectFileType(file.type);

  const result = await db.transaction(async (tx) => {
    const [fileRecord] = await tx
      .insert(files)
      .values({
        id: generateId(),
        name: file.name,
        size: file.size,
        type: fileType,
        extension,
        url: file.url,
        path: "",
        mimeType: file.type,
        metadata: {},
        ownerId: userId,
        storageCategoryId: fileType,
      })
      .returning();

    // Update storage category
    await tx
      .update(fileStorageCategories)
      .set({
        fileCount: sql`file_count + 1`,
        size: sql`size + ${file.size}`,
      })
      .where(eq(fileStorageCategories.id, fileType));

    return fileRecord;
  });

  return result;
}
