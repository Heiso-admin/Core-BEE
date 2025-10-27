import { Elysia } from "elysia";
import { getAnalyticsTools, getSiteSetting } from "./site.service";

export const siteRoute = new Elysia({
  name: "siteRoute",
  prefix: "/site",
})
  .get("/", () => getSiteSetting())
  .get("/tracking", () => getAnalyticsTools());
