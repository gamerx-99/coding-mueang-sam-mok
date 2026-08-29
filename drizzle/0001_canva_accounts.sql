-- Canva Integration C1: OAuth token storage (one row per app user)
CREATE TABLE IF NOT EXISTS "canvaAccounts" (
  "id" serial PRIMARY KEY,
  "userId" integer NOT NULL UNIQUE,
  "canvaUserId" varchar(120),
  "displayName" varchar(160),
  "email" varchar(320),
  "accessTokenEnc" text NOT NULL,
  "refreshTokenEnc" text,
  "scopes" text,
  "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
