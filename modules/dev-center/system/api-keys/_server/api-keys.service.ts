"use server";

import { db } from "@heiso/core/lib/db";
import type { TPublicApiKey } from "@heiso/core/lib/db/schema";
import { apiKeys } from "@heiso/core/lib/db/schema";
import { generateApiKey, hashApiKey } from "@heiso/core/lib/hash";
import { auth } from "@heiso/core/modules/auth/auth.config";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Get API key prefix for display
function getKeyPrefix(key: string): string {
  return `${key.substring(0, 12)}...`;
}

type TApiKeyWithKeyPrefix = TPublicApiKey & { keyPrefix: string };

// Get API Keys list
export async function getApiKeysList(
  options: { search?: string; start?: number; limit?: number } = {},
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { apiKeys: [], total: 0 };
  }

  const { search, start = 0, limit = 10 } = options;

  try {
    // Build where conditions
    const whereConditions = [
      eq(apiKeys.userId, session.user.id),
      isNull(apiKeys.deletedAt),
    ];

    if (search) {
      whereConditions.push(
        // Add search condition for name
        // Note: This is a simplified search, you might want to use ilike for case-insensitive search
      );
    }

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(apiKeys)
      .where(and(...whereConditions));

    // Get paginated results
    const results = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        userId: apiKeys.userId,
        description: apiKeys.description,
        keyPrefix: apiKeys.key, // We'll transform this to show only prefix
        rateLimit: apiKeys.rateLimit,
        isActive: apiKeys.isActive,
        lastUsedAt: apiKeys.lastUsedAt,
        expiresAt: apiKeys.expiresAt,
        createdAt: apiKeys.createdAt,
        updatedAt: apiKeys.updatedAt,
      })
      .from(apiKeys)
      .where(and(...whereConditions))
      .orderBy(desc(apiKeys.createdAt))
      .limit(limit)
      .offset(start);

    // Transform results to hide full key
    const transformedResults: TApiKeyWithKeyPrefix[] = results.map(
      (result) => ({
        ...result,
        keyPrefix: getKeyPrefix(result.keyPrefix),
      }),
    );

    return {
      apiKeys: transformedResults,
      total: totalResult.count,
    };
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return { apiKeys: [], total: 0 };
  }
}

// Get single API key
export async function getApiKey(
  id: string,
): Promise<TApiKeyWithKeyPrefix | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  try {
    const result = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        userId: apiKeys.userId,
        description: apiKeys.description,
        keyPrefix: apiKeys.key,
        rateLimit: apiKeys.rateLimit,
        isActive: apiKeys.isActive,
        lastUsedAt: apiKeys.lastUsedAt,
        expiresAt: apiKeys.expiresAt,
        createdAt: apiKeys.createdAt,
        updatedAt: apiKeys.updatedAt,
      })
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.id, id),
          eq(apiKeys.userId, session.user.id),
          isNull(apiKeys.deletedAt),
        ),
      )
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const apiKey = result[0];
    return {
      ...apiKey,
      keyPrefix: getKeyPrefix(apiKey.keyPrefix),
    };
  } catch (error) {
    console.error("Error fetching API key:", error);
    return null;
  }
}

// Create new API key
type RateLimit = { requests: number; window: number };
type CreateApiKeyInput = {
  name: string;
  description: string | null;
  expiresAt: Date | null;
  isActive?: boolean;
  rateLimit?: RateLimit;
};
type UpdateApiKeyInput = {
  name?: string;
  description?: string | null;
  expiresAt?: Date | null;
  isActive?: boolean;
  rateLimit?: RateLimit;
};

export async function createApiKey(data: CreateApiKeyInput): Promise<{
  success: boolean;
  apiKey?: TApiKeyWithKeyPrefix & { key: string };
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Generate new API key
    const newKey = generateApiKey();
    const hashedKey = await hashApiKey(newKey);
    const keyPrefix = getKeyPrefix(newKey);

    const [result] = await db
      .insert(apiKeys)
      .values({
        userId: session.user.id,
        name: data.name,
        description: data.description,
        key: hashedKey,
        rateLimit: data.rateLimit,
        isActive: data.isActive ?? true,
        expiresAt: data.expiresAt,
      })
      .returning({
        id: apiKeys.id,
        name: apiKeys.name,
        userId: apiKeys.userId,
        description: apiKeys.description,
        rateLimit: apiKeys.rateLimit,
        isActive: apiKeys.isActive,
        lastUsedAt: apiKeys.lastUsedAt,
        expiresAt: apiKeys.expiresAt,
        createdAt: apiKeys.createdAt,
        updatedAt: apiKeys.updatedAt,
      });

    revalidatePath("/dashboard/settings/api-keys", "page");

    return {
      success: true,
      apiKey: {
        ...result,
        keyPrefix,
        key: newKey, // Return the actual key only on creation
      },
    };
  } catch (error) {
    console.error("Error creating API key:", error);
    return { success: false, error: "Failed to create API key" };
  }
}

// Update API key
export async function updateApiKey(
  id: string,
  data: UpdateApiKeyInput,
): Promise<{ success: boolean; data?: TApiKeyWithKeyPrefix; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const result = await db
      .update(apiKeys)
      .set({
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        expiresAt: data.expiresAt,
        rateLimit: data.rateLimit,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(apiKeys.id, id),
          eq(apiKeys.userId, session.user.id),
          isNull(apiKeys.deletedAt),
        ),
      )
      .returning({
        id: apiKeys.id,
        name: apiKeys.name,
        userId: apiKeys.userId,
        description: apiKeys.description,
        keyPrefix: apiKeys.key,
        rateLimit: apiKeys.rateLimit,
        isActive: apiKeys.isActive,
        lastUsedAt: apiKeys.lastUsedAt,
        expiresAt: apiKeys.expiresAt,
        createdAt: apiKeys.createdAt,
        updatedAt: apiKeys.updatedAt,
      });

    if (result.length === 0) {
      return { success: false, error: "API key not found" };
    }

    const updatedApiKey: TApiKeyWithKeyPrefix = {
      ...result[0],
      keyPrefix: getKeyPrefix(result[0].keyPrefix),
    };

    revalidatePath("/dashboard/settings/api-keys", "page");
    return { success: true, data: updatedApiKey };
  } catch (error) {
    console.error("Error updating API key:", error);
    return { success: false, error: "Failed to update API key" };
  }
}

// Delete API key (soft delete)
export async function deleteApiKey(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const result = await db
      .update(apiKeys)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(apiKeys.id, id),
          eq(apiKeys.userId, session.user.id),
          isNull(apiKeys.deletedAt),
        ),
      )
      .returning({ id: apiKeys.id });

    if (result.length === 0) {
      return { success: false, error: "API key not found" };
    }

    revalidatePath("/dashboard/settings/api-keys", "page");
    return { success: true };
  } catch (error) {
    console.error("Error deleting API key:", error);
    return { success: false, error: "Failed to delete API key" };
  }
}

// Verify API key (for authentication middleware)
export async function verifyApiKey(key: string): Promise<{
  valid: boolean;
  userId?: string;
  apiKeyId?: string;
}> {
  if (!key) {
    return { valid: false };
  }

  try {
    const hashedKey = await hashApiKey(key);

    const result = await db
      .select({
        id: apiKeys.id,
        userId: apiKeys.userId,
        isActive: apiKeys.isActive,
        expiresAt: apiKeys.expiresAt,
      })
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.key, hashedKey),
          eq(apiKeys.isActive, true),
          isNull(apiKeys.deletedAt),
        ),
      )
      .limit(1);

    if (result.length === 0) {
      return { valid: false };
    }

    const apiKey = result[0];

    // Check if key is expired
    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      return { valid: false };
    }

    // Update last used timestamp
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, apiKey.id));

    return {
      valid: true,
      userId: apiKey.userId,
      apiKeyId: apiKey.id,
    };
  } catch (error) {
    console.error("Error verifying API key:", error);
    return { valid: false };
  }
}

// Toggle API key status
export async function toggleApiKeyStatus(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // First get current status
    const [currentApiKey] = await db
      .select({ isActive: apiKeys.isActive })
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.id, id),
          eq(apiKeys.userId, session.user.id),
          isNull(apiKeys.deletedAt),
        ),
      )
      .limit(1);

    if (!currentApiKey) {
      return { success: false, error: "API key not found" };
    }

    // Toggle status
    await db
      .update(apiKeys)
      .set({
        isActive: !currentApiKey.isActive,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(apiKeys.id, id),
          eq(apiKeys.userId, session.user.id),
          isNull(apiKeys.deletedAt),
        ),
      );

    revalidatePath("/dashboard/settings/api-keys", "page");
    return { success: true };
  } catch (error) {
    console.error("Error toggling API key status:", error);
    return { success: false, error: "Failed to toggle API key status" };
  }
}
