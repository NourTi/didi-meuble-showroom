import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createManagedProduct, createOrderRequest, deleteManagedProduct, listManagedProducts, listOrderRequests, updateManagedProduct } from "../db";
import { notifyOwner } from "../_core/notification";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";

const categorySchema = z.enum(["bedrooms", "sofas", "kids"]);
const productInput = z.object({ slug: z.string().trim().min(3).max(160).regex(/^[a-z0-9-]+$/), category: categorySchema, nameAr: z.string().trim().min(2).max(180), nameFr: z.string().trim().min(2).max(180), descriptionAr: z.string().trim().min(10).max(1500), descriptionFr: z.string().trim().min(10).max(1500), priceDzd: z.number().int().min(0).max(50_000_000), dimensions: z.string().trim().min(2).max(120), imageUrl: z.string().url().max(2000).nullable().optional(), isAvailable: z.boolean(), isFeatured: z.boolean() });
export const orderInquiryInput = z.object({ customerName: z.string().trim().min(2).max(120), phone: z.string().trim().regex(/^\+?[0-9][0-9\s-]{7,30}$/), wilaya: z.string().trim().min(2).max(80), commune: z.string().trim().min(2).max(100), address: z.string().trim().min(6).max(1000), productLabel: z.string().trim().min(2).max(220), quantity: z.number().int().min(1).max(20), notes: z.string().trim().max(1000).nullable().optional() });

const attempts = new Map<string, { count: number; resetAt: number }>();
function assertRateLimit(key: string) { const now = Date.now(); const current = attempts.get(key); const record = !current || current.resetAt <= now ? { count: 0, resetAt: now + 900000 } : current; record.count += 1; attempts.set(key, record); if (record.count > 5) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many delivery requests. Please wait before trying again." }); }
function requestKey(headers: Record<string, string | string[] | undefined>) { const source = headers["x-forwarded-for"]; return (Array.isArray(source) ? source[0] : source)?.split(",")[0]?.trim() || "anonymous"; }
function reference() { return `DD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`; }

export const storefrontRouter = router({
  orders: router({ create: publicProcedure.input(orderInquiryInput).mutation(async ({ ctx, input }) => { assertRateLimit(requestKey(ctx.req.headers)); const orderReference = reference(); try { await createOrderRequest({ ...input, notes: input.notes || null, reference: orderReference }); } catch (error) { console.error("[Orders] Could not persist order request", error); throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "We could not save your request. Please call us directly." }); } const notificationSent = await notifyOwner({ title: "طلب جديد — Didi Meuble", content: `${input.customerName} طلب ${input.productLabel} إلى ${input.wilaya}. المرجع: ${orderReference}` }); return { reference: orderReference, notificationSent }; }) }),
  admin: router({ products: router({ list: adminProcedure.query(() => listManagedProducts()), create: adminProcedure.input(productInput).mutation(({ input }) => createManagedProduct({ ...input, imageUrl: input.imageUrl ?? null })), update: adminProcedure.input(z.object({ id: z.number().int().positive(), changes: productInput.partial() })).mutation(({ input }) => updateManagedProduct(input.id, input.changes)), remove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteManagedProduct(input.id)) }), orders: adminProcedure.query(() => listOrderRequests()) }),
});
