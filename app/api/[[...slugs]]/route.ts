import { swagger } from "@elysiajs/swagger";
import pkg from "@heiso/core/package.json";
import { Elysia } from "elysia";
import { modules } from "./modules";

const { name, version } = pkg;
const app = new Elysia({ prefix: "/api" })
  .headers({
    "X-Powered-By": name,
  })
  // Manually handle CORS to avoid Response.clone errors in Next.js
  .onBeforeHandle(({ request, set, headers }) => {
    const origin = (headers.origin as string | undefined) ?? "*";
    set.headers["Access-Control-Allow-Origin"] = origin;
    set.headers["Access-Control-Allow-Credentials"] = "true";
    set.headers["Access-Control-Allow-Headers"] =
      "authorization, content-type, x-requested-with, x-api-key";
    set.headers["Access-Control-Allow-Methods"] =
      "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS";

    // Preflight requests
    if (request.method === "OPTIONS") {
      set.status = 204 as const;
      return new Response(null, { status: 204, headers: set.headers as any });
    }
  })
  .use(
    swagger({
      path: "/docs",
      exclude: ["/docs", "/docs/json"],
      documentation: {
        security: [{ bearerAuth: [] }],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
            },
          },
        },
        info: {
          title: `${name} docs`,
          description: `A playground api docs for ${name}`,
          version,
        },
      },
    }),
  )
  .get("/", () => `Hello ${name}:${version} API`)
  .get("/health", () => "ok")
  .use(modules);

export const GET = app.handle;
export const HEAD = app.handle;
export const POST = app.handle;
export const PUT = app.handle;
export const PATCH = app.handle;
export const DELETE = app.handle;
export const OPTIONS = app.handle;
