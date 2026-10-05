import argparse
from datetime import datetime, timezone
import sys

import psycopg2

from main import fetch_all_pages, parse_html
from sync_database import (
    deduplicate_rows,
    get_database_url,
    insert_scrape_run,
    upsert_rows,
)


PAGE_COUNT = 10


def parse_live_pages(save_html: bool) -> list[dict[str, object]]:
    page_html = fetch_all_pages(save_html=save_html)
    rows = []
    for page_number, html in enumerate(page_html, start=1):
        rows.extend(parse_html(html, f'page{page_number}.html'))
    return deduplicate_rows(rows)


def main() -> int:
    parser = argparse.ArgumentParser(description='Fetch and sync e-Prokurimi notices.')
    parser.add_argument(
        '--save-html',
        action='store_true',
        help='Save fetched responses as page1.html through page10.html.',
    )
    args = parser.parse_args()

    started_at = datetime.now(timezone.utc)
    connection = None
    pages_fetched = 0
    rows_found = 0

    try:
        connection = psycopg2.connect(get_database_url())
        page_rows = parse_live_pages(save_html=args.save_html)
        pages_fetched = PAGE_COUNT
        rows_found = len(page_rows)

        rows_new, rows_updated = upsert_rows(connection, page_rows)
        insert_scrape_run(
            connection,
            started_at,
            datetime.now(timezone.utc),
            pages_fetched,
            rows_found,
            rows_new,
            rows_updated,
            0,
            'success',
        )
        connection.commit()

        print(f'Pages fetched: {pages_fetched}')
        print(f'Rows found: {rows_found}')
        print(f'Rows newly inserted: {rows_new}')
        print(f'Rows updated: {rows_updated}')
        return 0
    except Exception as error:
        pages_fetched = max(pages_fetched, getattr(error, 'pages_fetched', 0))
        if connection is not None:
            connection.rollback()
            try:
                insert_scrape_run(
                    connection,
                    started_at,
                    datetime.now(timezone.utc),
                    pages_fetched,
                    rows_found,
                    0,
                    0,
                    1,
                    'failed',
                )
                connection.commit()
            except Exception as record_error:
                connection.rollback()
                print(f'Could not record failed scrape run: {record_error}', file=sys.stderr)
        print(f'Scrape failed: {error}', file=sys.stderr)
        return 1
    finally:
        if connection is not None:
            connection.close()


if __name__ == '__main__':
    raise SystemExit(main())
