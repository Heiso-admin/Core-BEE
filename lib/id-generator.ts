import { customAlphabet } from "nanoid";

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  10,
);

export function generateId(prefix?: string, length: number = 10) {
  if (!prefix) return nanoid(length); // e.g., "xYzAb93Dq1"
  return `${prefix}_${nanoid(length)}`; // e.g., "u_xYzAb93Dq1"
}

export const generateUserId = () => generateId("u");
export const generateRoleId = () => generateId("ro");
export const generatePermissionId = () => generateId("pe");
export const generateNavigationId = () => generateId("n");
export const generateOTP = () => customAlphabet("0123456789", 6);

export const generateInviteToken = () => generateId(undefined, 20);
