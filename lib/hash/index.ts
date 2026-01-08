/**
 * Edge Runtime compatible password hashing utilities using Web Crypto API
 */

/**
 * Generate password hash using Web Crypto API (Edge Runtime compatible)
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  // Generate random salt
  const saltArray = new Uint8Array(16);
  crypto.getRandomValues(saltArray);
  const salt = Array.from(saltArray, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  // Create hash using Web Crypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = new Uint8Array(hashBuffer);
  const hash = Array.from(hashArray, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  return `${salt}:${hash}`;
}

/**
 * Verify password against stored hash using Web Crypto API (Edge Runtime compatible)
 * @param password Plain text password to verify
 * @param hashedPassword Stored password hash
 * @returns Boolean indicating if password matches
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  const [salt, hash] = hashedPassword.split(":");

  // Create verification hash using Web Crypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = new Uint8Array(hashBuffer);
  const verifyHash = Array.from(hashArray, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  return hash === verifyHash;
}

export async function temporaryCode(): Promise<string> {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateApiKey(): string {
  const prefix = "sk";
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  const hex = Array.from(randomBytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return `${prefix}_${hex}`;
}

// Hash API key for storage
export async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
