from datetime import datetime, timezone
from pathlib import Path
import os

import psycopg2
from dotenv import load_dotenv

from main import parse_all_pages


SCRAPER_PATH = Path(__file__).parent
UPSERT_TENDER_SQL = """
INSERT INTO tenders (
    procurement_no,
    publication_no,
    contracting_authority,
    document_type,
    subject,
    fpp_code,
    fpp_description,
    contract_type,
    contract_value_bracket,
    procedure_type,
    estimated_value,
    currency,
    closing_date,
    publication_date,
    source_url,
    raw_html,
    first_seen_at,
    last_seen_at,
    last_changed_at
) VALUES (
    %(procurement_no)s,
    %(publication_no)s,
    %(contracting_authority)s,
    %(document_type)s,
    %(subject)s,
    %(fpp_code)s,
    %(fpp_description)s,
    %(contract_type)s,
    %(contract_value_bracket)s,
    %(procedure_type)s,
    %(estimated_value)s,
    %(currency)s,
    %(closing_date)s,
    %(publication_date)s,
    %(source_url)s,
    %(raw_html)s,
    %(first_seen_at)s,
    %(last_seen_at)s,
    %(last_changed_at)s
)
ON CONFLICT (procurement_no, publication_no, document_type) DO UPDATE SET
    contracting_authority = EXCLUDED.contracting_authority,
    subject = EXCLUDED.subject,
    fpp_code = EXCLUDED.fpp_code,
    fpp_description = EXCLUDED.fpp_description,
    contract_type = EXCLUDED.contract_type,
    contract_value_bracket = EXCLUDED.contract_value_bracket,
    procedure_type = EXCLUDED.procedure_type,
    estimated_value = EXCLUDED.estimated_value,
    currency = EXCLUDED.currency,
    closing_date = EXCLUDED.closing_date,
    publication_date = EXCLUDED.publication_date,
    source_url = EXCLUDED.source_url,
    raw_html = EXCLUDED.raw_html,
    last_seen_at = EXCLUDED.last_seen_at,
    last_changed_at = EXCLUDED.last_changed_at
WHERE (tenders.contracting_authority, tenders.subject, tenders.fpp_code,
             tenders.fpp_description, tenders.contract_type, tenders.contract_value_bracket,
             tenders.procedure_type, tenders.estimated_value, tenders.currency,
             tenders.closing_date, tenders.publication_date, tenders.source_url,
             tenders.raw_html)
    IS DISTINCT FROM
            (EXCLUDED.contracting_authority, EXCLUDED.subject, EXCLUDED.fpp_code,
             EXCLUDED.fpp_description, EXCLUDED.contract_type, EXCLUDED.contract_value_bracket,
             EXCLUDED.procedure_type, EXCLUDED.estimated_value, EXCLUDED.currency,
             EXCLUDED.closing_date, EXCLUDED.publication_date, EXCLUDED.source_url,
             EXCLUDED.raw_html)
RETURNING (xmax = 0) AS inserted;
"""

TOUCH_LAST_SEEN_SQL = """
UPDATE tenders
SET last_seen_at = %s
WHERE procurement_no = %s
    AND publication_no IS NOT DISTINCT FROM %s
    AND document_type IS NOT DISTINCT FROM %s;
"""

INSERT_SCRAPE_RUN_SQL = """
INSERT INTO scrape_runs (
    started_at,
    finished_at,
    pages_scraped,
    rows_found,
    rows_new,
    rows_updated,
    errors,
    status
) VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
"""


def deduplicate_rows(rows: list[dict[str, object]]) -> list[dict[str, object]]:
    unique_rows = {}
    for row in rows:
        key = (row['procurement_no'], row['publication_no'], row['document_type'])
        unique_rows.setdefault(key, row)
    return list(unique_rows.values())


def get_database_url() -> str:
    load_dotenv(SCRAPER_PATH / '.env')
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        raise RuntimeError('DATABASE_URL is missing from scraper/.env')
    return database_url


def upsert_rows(connection, rows: list[dict[str, object]]) -> tuple[int, int]:
    rows_new = 0
    rows_updated = 0

    with connection.cursor() as cursor:
        for row in rows:
            now = datetime.now(timezone.utc)
            values = {
                **row,
                'currency': 'EUR',
                'source_url': None,
                'raw_html': None,
                'first_seen_at': now,
                'last_seen_at': now,
                'last_changed_at': now,
            }
            key = (row['procurement_no'], row['publication_no'], row['document_type'])
            cursor.execute(TOUCH_LAST_SEEN_SQL, (now, *key))
            cursor.execute(UPSERT_TENDER_SQL, values)
            result = cursor.fetchone()
            if result is None:
                continue
            if result[0]:
                rows_new += 1
            else:
                rows_updated += 1

    return rows_new, rows_updated


def insert_scrape_run(
    connection,
    started_at: datetime,
    finished_at: datetime,
    pages_scraped: int,
    rows_found: int,
    rows_new: int,
    rows_updated: int,
    errors: int,
    status: str,
) -> None:
    with connection.cursor() as cursor:
        cursor.execute(
            INSERT_SCRAPE_RUN_SQL,
            (started_at, finished_at, pages_scraped, rows_found, rows_new, rows_updated, errors, status),
        )


def sync_database() -> tuple[int, int, int]:
    started_at = datetime.now(timezone.utc)
    rows = deduplicate_rows(parse_all_pages())
    rows_found = len(rows)

    with psycopg2.connect(get_database_url()) as connection:
        rows_new, rows_updated = upsert_rows(connection, rows)
        insert_scrape_run(
            connection,
            started_at,
            datetime.now(timezone.utc),
            10,
            rows_found,
            rows_new,
            rows_updated,
            0,
            'success',
        )

    return rows_found, rows_new, rows_updated


def main() -> None:
    rows_found, rows_new, rows_updated = sync_database()
    print(f'Rows found: {rows_found}')
    print(f'Rows newly inserted: {rows_new}')
    print(f'Rows updated: {rows_updated}')


if __name__ == '__main__':
    main()
