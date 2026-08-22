import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { createLead, createProject, listAppointments, listLeads, listProjects, listQuotes, updateAppointmentStatus, updateLeadStatus, updateProjectStatus, updateQuoteStatus } from "./db";

const leadStatus = z.enum(["new", "contacted", "qualified", "closed"]);
const projectStatus = z.enum(["idea", "active", "review", "completed", "archived"]);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  leads: router({
    create: publicProcedure.input(z.object({
      name: z.string().trim().min(1).max(160),
      contact: z.string().trim().min(1).max(320),
      businessType: z.string().max(100).optional(),
      serviceType: z.string().max(100).optional(),
      budget: z.string().max(100).optional(),
      details: z.string().max(10000).optional(),
      source: z.string().max(60).optional(),
    })).mutation(async ({ input }) => {
      const id = await createLead({ ...input, source: input.source ?? "website" });
      return { success: true, id };
    }),
    list: adminProcedure.query(() => listLeads()),
    updateStatus: adminProcedure.input(z.object({ id: z.number().int().positive(), status: leadStatus })).mutation(async ({ input }) => {
      await updateLeadStatus(input.id, input.status);
      return { success: true } as const;
    }),
  }),
  quotes: router({
    list: adminProcedure.query(() => listQuotes()),
    updateStatus: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["draft", "sent", "accepted", "declined"]) })).mutation(async ({ input }) => {
      await updateQuoteStatus(input.id, input.status);
      return { success: true } as const;
    }),
  }),
  appointments: router({
    list: adminProcedure.query(() => listAppointments()),
    updateStatus: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["requested", "confirmed", "completed", "cancelled"]) })).mutation(async ({ input }) => {
      await updateAppointmentStatus(input.id, input.status);
      return { success: true } as const;
    }),
  }),
  projects: router({
    list: adminProcedure.query(() => listProjects()),
    create: adminProcedure.input(z.object({
      name: z.string().trim().min(1).max(180),
      clientName: z.string().max(180).optional(),
      serviceType: z.string().max(100).optional(),
      status: projectStatus.optional(),
      progress: z.number().int().min(0).max(100).optional(),
      notes: z.string().max(10000).optional(),
    })).mutation(async ({ input }) => {
      const id = await createProject({ ...input, status: input.status ?? "idea", progress: input.progress ?? 0 });
      return { success: true, id };
    }),
    updateStatus: adminProcedure.input(z.object({ id: z.number().int().positive(), status: projectStatus, progress: z.number().int().min(0).max(100).optional() })).mutation(async ({ input }) => {
      await updateProjectStatus(input.id, input.status, input.progress);
      return { success: true } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
