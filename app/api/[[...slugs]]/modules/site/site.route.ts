import { Elysia } from "elysia";
import { getSiteSetting } from "./site.service";

export const siteRoute = new Elysia({
  name: "siteRoute",
  prefix: "/site",
}).get("/", () => getSiteSetting());
