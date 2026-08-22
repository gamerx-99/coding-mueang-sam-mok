import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, InsertLead, InsertProject, appointments, InsertAppointment, leads, projects, quotes, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); }
    catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach((field) => { if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; } });
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  values.lastSignedIn ??= new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function createLead(input: InsertLead) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  const result = await db.insert(leads).values(input);
  return Number(result[0].insertId);
}

export async function listLeads() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(leads).orderBy(desc(leads.createdAt)).limit(100);
}

export async function updateLeadStatus(id: number, status: "new" | "contacted" | "qualified" | "closed") {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  await db.update(leads).set({ status }).where(eq(leads.id, id));
}

export async function listQuotes() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(quotes).orderBy(desc(quotes.createdAt)).limit(100);
}

export async function updateQuoteStatus(id: number, status: "draft" | "sent" | "accepted" | "declined") {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  await db.update(quotes).set({ status }).where(eq(quotes.id, id));
}

export async function listAppointments() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(appointments).orderBy(desc(appointments.scheduledAt)).limit(100);
}

export async function updateAppointmentStatus(id: number, status: "requested" | "confirmed" | "completed" | "cancelled") {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  await db.update(appointments).set({ status }).where(eq(appointments.id, id));
}

export async function listProjects() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(projects).orderBy(desc(projects.updatedAt)).limit(100);
}

export async function createProject(input: InsertProject) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  const result = await db.insert(projects).values(input);
  return Number(result[0].insertId);
}

export async function updateProjectStatus(id: number, status: "idea" | "active" | "review" | "completed" | "archived", progress?: number) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  await db.update(projects).set({ status, ...(progress === undefined ? {} : { progress }) }).where(eq(projects.id, id));
}
