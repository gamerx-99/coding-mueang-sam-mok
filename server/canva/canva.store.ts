import { CanvaAccount, canvaAccounts } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { decryptToken, encryptToken } from "./canva.crypto";

/**
 * Token store for Canva accounts — one row per app user.
 * Tokens are AES-256-GCM encrypted at rest (canva.crypto.ts).
 */

type StoredTokens = {
  accessToken: string;
  refreshToken: string | null;
  scopes: string | null;
  expiresAt: Date;
};

export async function upsertCanvaAccount(input: {
  userId: number;
  canvaUserId: string | null;
  displayName: string | null;
  email: string | null;
  tokens: StoredTokens;
}): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const values = {
    userId: input.userId,
    canvaUserId: input.canvaUserId,
    displayName: input.displayName,
    email: input.email,
    accessTokenEnc: encryptToken(input.tokens.accessToken),
    refreshTokenEnc: input.tokens.refreshToken
      ? encryptToken(input.tokens.refreshToken)
      : null,
    scopes: input.tokens.scopes,
    expiresAt: input.tokens.expiresAt,
  };
  await db
    .insert(canvaAccounts)
    .values(values)
    .onConflictDoUpdate({
      target: canvaAccounts.userId,
      set: {
        canvaUserId: values.canvaUserId,
        displayName: values.displayName,
        email: values.email,
        accessTokenEnc: values.accessTokenEnc,
        refreshTokenEnc: values.refreshTokenEnc,
        scopes: values.scopes,
        expiresAt: values.expiresAt,
      },
    });
}

export async function getCanvaAccount(
  userId: number
): Promise<CanvaAccount | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select()
    .from(canvaAccounts)
    .where(eq(canvaAccounts.userId, userId))
    .limit(1);
  return rows[0];
}

export function readAccessToken(account: CanvaAccount): string | null {
  return decryptToken(account.accessTokenEnc);
}

export function readRefreshToken(account: CanvaAccount): string | null {
  return account.refreshTokenEnc
    ? decryptToken(account.refreshTokenEnc)
    : null;
}

export async function updateTokens(
  userId: number,
  tokens: {
    accessToken: string;
    refreshToken?: string | null;
    expiresAt: Date;
    scopes?: string | null;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db
    .update(canvaAccounts)
    .set({
      accessTokenEnc: encryptToken(tokens.accessToken),
      ...(tokens.refreshToken
        ? { refreshTokenEnc: encryptToken(tokens.refreshToken) }
        : {}),
      expiresAt: tokens.expiresAt,
      ...(tokens.scopes !== undefined ? { scopes: tokens.scopes } : {}),
    })
    .where(eq(canvaAccounts.userId, userId));
}

export async function deleteCanvaAccount(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.delete(canvaAccounts).where(eq(canvaAccounts.userId, userId));
}

export function isExpiring(
  account: CanvaAccount,
  withinMs = 5 * 60 * 1000
): boolean {
  return account.expiresAt.getTime() - Date.now() < withinMs;
}
