import { getDynamicDb } from "@heiso/core/lib/db/dynamic";
import { apiKeyAccessLogs, apiKeys } from "@heiso/core/lib/db/schema";
import { hashApiKey } from "@heiso/core/lib/hash";
import { eq } from "drizzle-orm";

// Verify API key (for authentication middleware)
export async function verifyApiKey(key: string): Promise<{
  valid: boolean;
  userId?: string;
  apiKeyId?: string;
  rateLimit?: {
    window: number;
    requests: number;
  } | null;
}> {
  const db = await getDynamicDb();
  
  if (!key) {
    return { valid: false };
  }

  try {
    const hashedKey = await hashApiKey(key);

    const apiKey = await db.query.apiKeys.findFirst({
      columns: {
        id: true,
        userId: true,
        rateLimit: true,
        isActive: true,
        expiresAt: true,
      },
      where: (t, { and, eq, isNull }) =>
        and(
          eq(t.key, hashedKey),
          eq(apiKeys.isActive, true),
          isNull(t.deletedAt),
        ),
    });

    if (!apiKey) {
      return { valid: false };
    }

    // Check if key is expired
    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      return { valid: false };
    }

    // Update last used timestamp
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, apiKey.id));

    const rateLimit = apiKey.rateLimit as {
      window: number;
      requests: number;
    } | null;

    return {
      valid: true,
      userId: apiKey.userId,
      apiKeyId: apiKey.id,
      rateLimit: rateLimit,
    };
  } catch (error) {
    console.error("Error verifying API key:", error);
    return { valid: false };
  }
}

// Store API key access log
export async function storeApiKeyAccessLog(params: {
  apiKeyId: string;
  userId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  userAgent?: string;
  ipAddress?: string;
  responseTime: number;
  errorMessage?: string;
}): Promise<void> {
  const db = await getDynamicDb();
  try {
    await db.insert(apiKeyAccessLogs).values({
      apiKeyId: params.apiKeyId,
      userId: params.userId,
      endpoint: params.endpoint,
      method: params.method,
      statusCode: params.statusCode,
      userAgent: params.userAgent,
      ipAddress: params.ipAddress,
      responseTime: params.responseTime,
      errorMessage: params.errorMessage,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Error storing API key access log:", error);
  }
}
