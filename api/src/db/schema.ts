import {
  bigserial,
  date,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';

export const tenders = pgTable(
  'tenders',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    procurementNo: text('procurement_no').notNull(),
    publicationNo: text('publication_no'),
    contractingAuthority: text('contracting_authority'),
    documentType: text('document_type'),
    subject: text('subject'),
    fppCode: text('fpp_code'),
    fppDescription: text('fpp_description'),
    contractType: text('contract_type'),
    contractValueBracket: text('contract_value_bracket'),
    procedureType: text('procedure_type'),
    estimatedValue: numeric('estimated_value'),
    currency: text('currency').default('EUR'),
    closingDate: timestamp('closing_date', { mode: 'date' }),
    publicationDate: date('publication_date', { mode: 'string' }),
    sourceUrl: text('source_url'),
    rawHtml: text('raw_html'),
    firstSeenAt: timestamp('first_seen_at', { withTimezone: true, mode: 'date' }).defaultNow(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true, mode: 'date' }).defaultNow(),
    lastChangedAt: timestamp('last_changed_at', { withTimezone: true, mode: 'date' }).defaultNow(),
  },
  (table) => ({
    tenderIdentity: unique('tenders_procurement_no_publication_no_document_type_key').on(
      table.procurementNo,
      table.publicationNo,
      table.documentType,
    ),
  }),
);

export const scrapeRuns = pgTable('scrape_runs', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  startedAt: timestamp('started_at', { withTimezone: true, mode: 'date' }).defaultNow(),
  finishedAt: timestamp('finished_at', { withTimezone: true, mode: 'date' }),
  pagesScraped: integer('pages_scraped'),
  rowsFound: integer('rows_found'),
  rowsNew: integer('rows_new'),
  rowsUpdated: integer('rows_updated'),
  errors: integer('errors'),
  status: text('status'),
});
