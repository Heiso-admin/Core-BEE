import { Permission } from "./permission";

export interface MenuItem {
  id: string;
  name: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  permission?: Permission; // Permission control
}

export interface Menu {
  [key: string]: MenuItem;
}

export interface Settings {
  [key: string]: unknown;
}

export interface SiteBasic {
  name: string;
  title: string;
  baseUrl: string;
  domain: string;
  keywords: string;
  description: string;
}

export interface SiteBranding {
  organization: string;
  slogan: string;
  copyright: string;
}

export interface SiteAssets {
  logo: string;
  favicon: string;
  ogImage: string;
}

export interface SiteSettings {
  basic: SiteBasic;
  branding: SiteBranding;
  assets: SiteAssets;
}
