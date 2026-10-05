CREATE TABLE "scrape_runs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"started_at" timestamp with time zone DEFAULT now(),
	"finished_at" timestamp with time zone,
	"pages_scraped" integer,
	"rows_found" integer,
	"rows_new" integer,
	"rows_updated" integer,
	"errors" integer,
	"status" text
);
--> statement-breakpoint
CREATE TABLE "tenders" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"procurement_no" text NOT NULL,
	"publication_no" text,
	"contracting_authority" text,
	"document_type" text,
	"subject" text,
	"fpp_code" text,
	"fpp_description" text,
	"contract_type" text,
	"contract_value_bracket" text,
	"procedure_type" text,
	"estimated_value" numeric,
	"currency" text DEFAULT 'EUR',
	"closing_date" timestamp,
	"publication_date" date,
	"source_url" text,
	"raw_html" text,
	"first_seen_at" timestamp with time zone DEFAULT now(),
	"last_seen_at" timestamp with time zone DEFAULT now(),
	"last_changed_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "tenders_procurement_no_publication_no_document_type_key" UNIQUE("procurement_no","publication_no","document_type")
);
