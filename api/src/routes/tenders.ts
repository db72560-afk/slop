import type { FastifyInstance } from 'fastify';
import { and, asc, count, desc, eq, gte, ilike, isNotNull, lt, lte, sql } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '../db/client.js';
import { tenders } from '../db/schema.js';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const isoDate = z
  .string()
  .regex(ISO_DATE_PATTERN, 'must be an ISO date in YYYY-MM-DD format')
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)), 'must be a valid date');

const tendersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().min(1).optional(),
  authority: z.string().trim().min(1).optional(),
  fppCode: z.string().trim().min(1).optional(),
  documentType: z.string().trim().min(1).optional(),
  minValue: z.coerce.number().finite().optional(),
  maxValue: z.coerce.number().finite().optional(),
  closingAfter: isoDate.optional(),
  closingBefore: isoDate.optional(),
  sort: z.enum(['publicationDate', 'closingDate', 'estimatedValue']).default('publicationDate'),
  order: z.enum(['asc', 'desc']).default('desc'),
}).superRefine((query, context) => {
  if (query.minValue !== undefined && query.maxValue !== undefined && query.minValue > query.maxValue) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['minValue'],
      message: 'must be less than or equal to maxValue',
    });
  }
});

type TenderRow = typeof tenders.$inferSelect;

type TenderResponse = Omit<TenderRow, 'rawHtml' | 'estimatedValue' | 'closingDate' | 'firstSeenAt' | 'lastSeenAt' | 'lastChangedAt'> & {
  closingDate: string | null;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  lastChangedAt: string | null;
  estimatedValue: number | null;
};

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

function serializeTender(tender: TenderRow): TenderResponse {
  return {
    id: tender.id,
    procurementNo: tender.procurementNo,
    publicationNo: tender.publicationNo,
    contractingAuthority: tender.contractingAuthority,
    documentType: tender.documentType,
    subject: tender.subject,
    fppCode: tender.fppCode,
    fppDescription: tender.fppDescription,
    contractType: tender.contractType,
    contractValueBracket: tender.contractValueBracket,
    procedureType: tender.procedureType,
    estimatedValue: tender.estimatedValue === null ? null : Number(tender.estimatedValue),
    currency: tender.currency,
    closingDate: tender.closingDate?.toISOString() ?? null,
    publicationDate: tender.publicationDate,
    sourceUrl: tender.sourceUrl,
    firstSeenAt: tender.firstSeenAt?.toISOString() ?? null,
    lastSeenAt: tender.lastSeenAt?.toISOString() ?? null,
    lastChangedAt: tender.lastChangedAt?.toISOString() ?? null,
  };
}

function parseDateStart(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function parseDateEnd(value: string): Date {
  const date = parseDateStart(value);
  date.setUTCDate(date.getUTCDate() + 1);
  return date;
}

function validationMessage(error: z.ZodError): string {
  return error.issues.map((issue) => `${issue.path.join('.') || 'query'} ${issue.message}`).join('; ');
}

export async function registerTenderRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/tenders', async (request, reply) => {
    const parsedQuery = tendersQuerySchema.safeParse(request.query);
    if (!parsedQuery.success) {
      return reply.code(400).send({ error: validationMessage(parsedQuery.error) });
    }

    const query = parsedQuery.data;
    const filters = [];
    if (query.q) {
      const search = `%${escapeLike(query.q)}%`;
      filters.push(sql`(${ilike(tenders.subject, search)} OR ${ilike(tenders.contractingAuthority, search)})`);
    }
    if (query.authority) {
      filters.push(eq(tenders.contractingAuthority, query.authority));
    }
    if (query.fppCode) {
      filters.push(ilike(tenders.fppCode, `${escapeLike(query.fppCode)}%`));
    }
    if (query.documentType) {
      filters.push(ilike(tenders.documentType, `${escapeLike(query.documentType)}%`));
    }
    if (query.minValue !== undefined) {
      filters.push(gte(tenders.estimatedValue, String(query.minValue)));
    }
    if (query.maxValue !== undefined) {
      filters.push(lte(tenders.estimatedValue, String(query.maxValue)));
    }
    if (query.closingAfter) {
      filters.push(gte(tenders.closingDate, parseDateStart(query.closingAfter)));
    }
    if (query.closingBefore) {
      filters.push(lt(tenders.closingDate, parseDateEnd(query.closingBefore)));
    }

    const where = and(...filters);
    const sortColumn = {
      publicationDate: tenders.publicationDate,
      closingDate: tenders.closingDate,
      estimatedValue: tenders.estimatedValue,
    }[query.sort];
    const orderBy = query.order === 'asc' ? asc(sortColumn) : desc(sortColumn);
    const [rows, totalRows] = await Promise.all([
      db.select().from(tenders).where(where).orderBy(orderBy, asc(tenders.id))
        .limit(query.pageSize).offset((query.page - 1) * query.pageSize),
      db.select({ total: count() }).from(tenders).where(where),
    ]);

    const total = Number(totalRows[0]?.total ?? 0);
    return {
      data: rows.map(serializeTender),
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize),
    };
  });

  app.get<{ Params: { id: string } }>('/api/tenders/:id', async (request, reply) => {
    const id = Number(request.params.id);
    if (!Number.isSafeInteger(id) || id < 1) {
      return reply.code(400).send({ error: 'id must be a positive integer' });
    }

    const rows = await db.select().from(tenders).where(eq(tenders.id, id)).limit(1);
    if (rows.length === 0) {
      return reply.code(404).send({ error: 'Tender not found' });
    }
    return serializeTender(rows[0]);
  });

  app.get('/api/authorities', async () => {
    const tenderCount = count(tenders.id).mapWith(Number);
    const rows = await db.select({
      authority: tenders.contractingAuthority,
      tenderCount,
    })
      .from(tenders)
      .where(isNotNull(tenders.contractingAuthority))
      .groupBy(tenders.contractingAuthority)
      .orderBy(desc(tenderCount), asc(tenders.contractingAuthority));

    return rows.map((row) => ({
      authority: row.authority,
      tenderCount: row.tenderCount,
    }));
  });
}
