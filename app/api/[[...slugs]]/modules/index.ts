import { Elysia } from "elysia";
import { storeApiKeyAccessLog, verifyApiKey } from "./index.service";
import { siteRoute } from "./site/site.route";

// In-memory rate limit buckets per apiKeyId
const rateBuckets = new Map<string, { windowStart: number; count: number }>();

const modules = new Elysia({
  name: "modules",
})
  .derive(async ({ headers }) => {
    const apiKey =
      headers["x-api-key"] || headers.authorization?.replace("Bearer ", "");

    if (!apiKey) {
      throw new Error("Missing API key");
    }

    const verification = await verifyApiKey(apiKey);

    if (!verification.valid) {
      throw new Error("Invalid or expired API key");
    }

    // Map window(seconds) -> duration(milliseconds) and requests -> max
    const rateDurationSeconds = verification.rateLimit?.window;
    const rateMax = verification.rateLimit?.requests;

    return {
      authenticated: true,
      userId: verification.userId,
      apiKeyId: verification.apiKeyId,
      // capture request start time for response time calculation
      requestStartTime: Date.now(),
      rateDurationSeconds,
      rateMax,
    };
  })
  // Apply custom rate limiter before handling routes
  .onBeforeHandle(({ apiKeyId, set, rateDurationSeconds, rateMax }) => {
    if (!apiKeyId) return;
    if (!rateDurationSeconds || !rateMax) return;

    const rateDuration = rateDurationSeconds * 1000;

    const key = apiKeyId as string;
    const now = Date.now();
    const existing = rateBuckets.get(key);
    const bucket = existing ?? { windowStart: now, count: 0 };

    // reset bucket if window expired
    if (now - bucket.windowStart >= rateDuration) {
      bucket.windowStart = now;
      bucket.count = 0;
    }

    // enforce limit
    if (bucket.count >= rateMax) {
      set.status = 429 as const;
      const retryAfterMs = bucket.windowStart + rateDuration - now;
      return {
        message: "Too Many Requests",
        limit: rateMax,
        windowMs: rateDuration,
        retryAfterMs: retryAfterMs > 0 ? retryAfterMs : 0,
      };
    }

    bucket.count += 1;
    rateBuckets.set(key, bucket);
  })
  // .use(rateLimitPlugin)
  .onAfterHandle(
    async ({ request, headers, set, apiKeyId, userId, requestStartTime }) => {
      // console.log('rateLimitOptions: ', rateLimitOptions);
      try {
        if (!apiKeyId || !userId) return;

        const url = new URL(request.url);
        const endpoint = url.pathname;
        const method = request.method;
        const statusCode = typeof set.status === "number" ? set.status : 200;
        const responseTime = Date.now() - (requestStartTime ?? Date.now());
        const userAgent = headers["user-agent"];
        const ipAddress = headers["x-forwarded-for"] || headers["x-real-ip"];

        await storeApiKeyAccessLog({
          apiKeyId,
          userId,
          endpoint,
          method,
          statusCode,
          userAgent,
          ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
          responseTime,
        });
      } catch (error) {
        // swallow logging errors to not affect API response
        console.error("Failed to store API key access log", error);
      }
    },
  )
  .use(siteRoute);

export { modules };
