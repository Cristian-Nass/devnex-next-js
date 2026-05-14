import crypto from "node:crypto";

/**
 * Cryptographically random hex string. Used for site-level secrets:
 * MySQL root/user passwords, WordPress admin password.
 *
 * Default 18 bytes ⇒ 36 hex chars (~144 bits of entropy). Override the
 * `bytes` argument to size up for longer secrets.
 */
export function randomHex(bytes = 18): string {
  return crypto.randomBytes(bytes).toString("hex");
}
