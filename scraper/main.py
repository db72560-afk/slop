from datetime import date, datetime
from collections import Counter
from pathlib import Path
from pprint import pprint
import re
import time

from bs4 import BeautifulSoup
import requests


ENDPOINT_URL = (
    'https://e-prokurimi.rks-gov.net/SPIN_PROD/APPLICATION/IPN/Common/SearchFrm.aspx'
    '?filterState=%253cISearchEngineFieldCollection%252b%252f%253e'
    '&providerKey=ObjavljeniDokumenti_Idom3.RPN.BL.ObjavljeniDokumentiSearch__sq-AL'
    '&guid=b043a538-21d2-4c76-8c38-a56cc93de596'
)
PAGE_PATH = Path(__file__).with_name('page1.html')
PAGES_PATH = PAGE_PATH.parent
ROW_ID_PATTERN = re.compile(r'^uiView_gridResults_Row_\d+$')
POSTBACK_PATTERN = re.compile(r"__doPostBack\('([^']*)','([^']*)'\)")
HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/131.0.0.0 Safari/537.36'
    ),
}


class PageFetchError(RuntimeError):
    def __init__(self, pages_fetched: int, cause: Exception):
        super().__init__(str(cause))
        self.pages_fetched = pages_fetched


def get_form_data(soup: BeautifulSoup) -> list[tuple[str, str]]:
    form = soup.find('form', id='form1')
    if form is None:
        raise ValueError('Could not find form1 in the page HTML')

    data = []
    for control in form.find_all(['input', 'select', 'textarea']):
        name = control.get('name')
        if not name:
            continue

        control_type = control.get('type', '').lower()
        if control.name == 'input' and control_type in {'button', 'file', 'image', 'reset', 'submit'}:
            continue
        if control.name == 'input' and control_type in {'checkbox', 'radio'} and not control.has_attr('checked'):
            continue

        if control.name == 'select':
            options = control.find_all('option')
            selected = [option.get('value', option.get_text()) for option in options if option.has_attr('selected')]
            data.extend((name, value) for value in (selected or ['']))
        else:
            data.append((name, control.get('value', control.get_text())))

    return data


def get_postback_target(soup: BeautifulSoup, page_number: int) -> tuple[str, str]:
    results_table = soup.find('table', id='uiView_gridResults')
    if results_table is None:
        raise ValueError('Could not find the results table in the page HTML')

    for link in results_table.find_all('a'):
        if link.get_text(strip=True) != str(page_number):
            continue
        match = POSTBACK_PATTERN.search(link.get('href', ''))
        if match:
            return match.group(1), match.group(2)

    raise ValueError(f'Could not find a postback link for page {page_number}')


def request_with_retries(session: requests.Session, method: str, url: str, **kwargs) -> requests.Response:
    backoffs = (5, 15, 30)
    for attempt in range(3):
        try:
            response = session.request(method, url, **kwargs)
            response.raise_for_status()
            return response
        except requests.RequestException:
            if attempt == 2:
                raise
            time.sleep(backoffs[attempt])

    raise RuntimeError('HTTP request retry loop ended unexpectedly')


def fetch_all_pages(save_html: bool = False) -> list[bytes]:
    page_html = []

    with requests.Session() as session:
        session.headers.update(HEADERS)

        try:
            response = request_with_retries(session, 'GET', ENDPOINT_URL, timeout=45)
        except Exception as error:
            raise PageFetchError(0, error) from error
        current_html = response.content
        page_html.append(current_html)
        if save_html:
            PAGE_PATH.write_bytes(current_html)

        for page_number in range(2, 11):
            try:
                soup = BeautifulSoup(current_html, 'html.parser')
                event_target, event_argument = get_postback_target(soup, page_number)
                post_data = [
                    (name, value)
                    for name, value in get_form_data(soup)
                    if name not in {'__EVENTTARGET', '__EVENTARGUMENT'}
                ]
                post_data.extend((name, value) for name, value in (
                    ('__EVENTTARGET', event_target),
                    ('__EVENTARGUMENT', event_argument),
                ))

                response = request_with_retries(
                    session,
                    'POST',
                    ENDPOINT_URL,
                    data=post_data,
                    timeout=45,
                )
            except Exception as error:
                raise PageFetchError(len(page_html), error) from error
            current_html = response.content
            page_html.append(current_html)
            if save_html:
                page_path = PAGE_PATH.with_name(f'page{page_number}.html')
                page_path.write_bytes(current_html)

    return page_html


def parse_html(html: bytes | str, page_name: str) -> list[dict[str, object]]:
    soup = BeautifulSoup(html, 'html.parser')
    results_table = soup.find('table', id='uiView_gridResults')
    if results_table is None:
        raise ValueError(f'Could not find the results table in {page_name}')

    rows = results_table.find_all('tr', id=ROW_ID_PATTERN)
    parsed_rows = []
    for row in rows:
        cells = row.find_all('td', recursive=False)
        values = [
            cell.get('title') or cell.get_text(' ', strip=True)
            for cell in [cells[index] for index in (2, 4, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14)]
        ]
        if len(values) != 13:
            raise ValueError(f'Expected 13 data cells, found {len(values)} in row {row.get("id")}')

        estimated_value = values[10].replace(',', '').strip()
        closing_date = values[11].strip()
        publication_date = values[12].strip()
        parsed_rows.append({
            'procurement_no': values[0].strip() or None,
            'publication_no': values[1].strip() or None,
            'contracting_authority': values[2].strip() or None,
            'document_type': values[3].strip() or None,
            'subject': values[4].strip() or None,
            'fpp_code': values[5].strip() or None,
            'fpp_description': values[6].strip() or None,
            'contract_type': values[7].strip() or None,
            'contract_value_bracket': values[8].strip() or None,
            'procedure_type': values[9].strip() or None,
            'estimated_value': float(estimated_value) if estimated_value else None,
            'closing_date': datetime.strptime(closing_date, '%d.%m.%Y %H:%M') if closing_date else None,
            'publication_date': datetime.strptime(publication_date[:10], '%d.%m.%Y').date()
            if publication_date else None,
        })

    return parsed_rows


def parse_page(page_path: Path) -> list[dict[str, object]]:
    return parse_html(page_path.read_bytes(), page_path.name)


def parse_all_pages() -> list[dict[str, object]]:
    page_paths = sorted(
        PAGES_PATH.glob('page*.html'),
        key=lambda path: int(path.stem.removeprefix('page')),
    )
    expected_pages = [PAGES_PATH / f'page{page_number}.html' for page_number in range(1, 11)]
    missing_pages = [path.name for path in expected_pages if path not in page_paths]
    if missing_pages:
        raise FileNotFoundError(f'Missing page files: {", ".join(missing_pages)}')

    combined_rows = []
    for page_path in page_paths:
        combined_rows.extend(parse_page(page_path))
    return combined_rows


def main() -> None:
    rows = parse_all_pages()
    keys = [
        (row['procurement_no'], row['publication_no'], row['document_type'])
        for row in rows
    ]
    duplicate_count = sum(count - 1 for count in Counter(keys).values() if count > 1)

    print(f'Total rows: {len(rows)}')
    print(f'Duplicate combinations found: {duplicate_count}')
    print('First row:')
    pprint(rows[0], sort_dicts=False)
    print('Last row:')
    pprint(rows[-1], sort_dicts=False)


if __name__ == "__main__":
    main()
