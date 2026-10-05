# SPEC — Scraper për e-Prokurimi Kosovë (Njoftimet e Publikuara)

## 1. Konteksti

Objektivi: scraper që nxjerr rregullisht (çdo natë) listën e njoftimeve të
publikuara nga `e-prokurimi.rks-gov.net`, i ruan në Postgres, dhe mban gjurmë
të ndryshimeve (afate që ndryshojnë, statuse, njoftime të reja).

Kjo është faza 1 e projektit: **vetëm ingestion + databazë**. Pa UI, pa
alerte, pa autentikim. Qëllimi është një tabelë Postgres e populluar dhe e
saktë, plus job që mund të rifreskohet pa dublikime.

## 2. Arkitektura e konfirmuar (nga rikonjicioni manual)

- **Nuk ka API JSON.** Burimi është ASP.NET WebForms që kthen HTML.
- **Endpoint kryesor (lista e njoftimeve, faqja 1):**

  ```
  GET https://e-prokurimi.rks-gov.net/SPIN_PROD/APPLICATION/IPN/Common/SearchFrm.aspx
      ?filterState=%253cISearchEngineFieldCollection%252b%252f%253e
      &providerKey=ObjavljeniDokumenti_Idom3.RPN.BL.ObjavljeniDokumentiSearch__sq-AL
      &guid=b043a538-21d2-4c76-8c38-a56cc93de596
  ```

- **KONFIRMUAR STATELESS:** kjo URL u testua me `Invoke-WebRequest` (PowerShell,
  pa cookies, pa User-Agent të veçantë, pa sesion paraprak) dhe ktheu HTML të
  plotë me tabelën e rezultateve (faqja 1, ~50 rreshta, nga gjithsej 10 faqe).
  `guid` mund të jetë statik/i ripërdorshëm — nuk duket i lidhur me sesion.
  → **Nuk nevojitet Playwright për leximin e faqes 1.** `requests`/`httpx`
  i thjeshtë mjafton.

- **Paginacioni (faqet 2-10): ASP.NET postback, JO URL e re.**
  Numrat e faqeve në HTML janë linke `javascript:__doPostBack(...)`, p.sh.:

  ```html
  <a href="javascript:__doPostBack('uiView$gridResults$ctl24$ctl02','')">3</a>
  ```

  Pattern i vërejtur: `__EVENTTARGET = uiView$gridResults$ctl24$ctl0<N-1>`
  (për faqen N), `__EVENTARGUMENT = ''`. **Duhet konfirmuar në kod** (mos
  supozo vetëm nga faqja 3 — nxirr programatikisht linket e krejt numrave të
  faqeve nga HTML-ja e faqes 1, mos i llogarit me formulë të hardkoduar).

  Për të shkuar te faqja N, duhet POST te i njëjti URL me:
  - `__VIEWSTATE`, `__VIEWSTATEGENERATOR`, `__EVENTVALIDATION` — nxirren si
    `<input type="hidden">` nga HTML-ja e **përgjigjes së fundit** (ndryshojnë
    çdo herë, duhen rifreskuar pas çdo faqeje, jo të ruajtura statike).
  - `__EVENTTARGET` = vlera e nxjerrë nga `__doPostBack(...)` e linkut të
    faqes përkatëse.
  - `__EVENTARGUMENT` = pjesa e dytë e `__doPostBack(...)` (zakonisht bosh).
  - Krejt fushat e tjera të formës (filtrat — numrin e prokurimit, AK, etj.)
    duhen ridërguar bosh/siç ishin, përndryshe serveri mund të rivendos
    kërkimin.

  Implementim: `requests.Session()`, GET fillestar për faqen 1, pastaj POST
  sekuencial për çdo faqe, duke rimarrë VIEWSTATE nga çdo përgjigje para se
  të kërkosh faqen tjetër. **Mos i kërko faqet paralelisht** — secila varet
  nga state-i i së mëparshmes.

- **Shpejtësia e serverit: E NGADALTË.** Një kërkesë e vetme (faqja 1) mori
  ~11 sekonda gjatë testimit. Vendos timeout ≥30s për çdo kërkesë HTTP, dhe
  mos e godit me shumë kërkesa paralele — rrezikon bllokim IP dhe amund të
  jetë server publik i dobët.

## 3. Fushat e konfirmuara në tabelën e rezultateve

Kolonat e vëna re në HTML (titujt e header-it, shqip):

| Kolona (shqip)              | Shënim                                                |
|---|---|
| Numrin e prokurimit         | Identifikues unik, p.sh. `220/70020-26-7309-5-5-8`    |
| Autoriteti kontraktues      | Emri i institucionit                                   |
| Numri i publikimit          | P.sh. `2026/220/70020-26-7309-5-5-8/B08-0020147`       |
| Lloji i dokumentit          | P.sh. "B08 Njoftim për dhënie të kontratës", "B10 Njoftimi për anulim..." — **kjo fushë përcakton llojin e ngjarjes, jo status i tenderit vetë** |
| Lënda e prokurimit / grupi  | Përshkrimi/titulli i objektit të prokurimit             |
| FPP                         | Kod (dukej si kod CPV-like, p.sh. `36121000-5`)        |
| FPP - Përshkrimi            | Përshkrim tekstual i FPP-së (p.sh. "Mobile zyre")       |
| Lloji i kontratës           | P.sh. "1 Furnizim", "5 Punë"                            |
| Vlera e kontratës           | **Kategori**, jo numër (p.sh. "Nuk është përcaktuar për llojin e procedurës", "2 Vlerë e mesme") |
| Procedura                   | P.sh. "Mini-tender", "5 Procedurë e negociuar pa publikim...", "1 Procedurë e hapur" |
| Vlera e parashikuar          | **Numër konkret** në euro, p.sh. `10,000.00`            |
| Data e Mbylljes              | Datë + orë, p.sh. `07.09.2026 12:00` — deadline-i        |
| Data e publikimit            | Vetëm datë, p.sh. `21.09.2026`                           |
| Ri-T... (e paverifikuar)     | Kolonë e prerë në screenshot — **duhet konfirmuar emri i plotë dhe kuptimi kur shihet faqja e plotë** |

⚠️ E RËNDËSISHME: `Lloji i dokumentit` tregon se kjo listë përmban **të gjitha
llojet e njoftimeve bashkë** (njoftime për kontratë, njoftime për dhënie,
njoftime për anulim, etj.) — jo vetëm tenderë "aktivë" të hapur për oferta.
Modeli i databazës duhet ta trajtojë çdo rresht si një **event/njoftim**, jo
domosdoshmërisht si "tender aktiv". Nevojitet logjikë shtesë (bazuar në
`Lloji i dokumentit` + datat) për të përcaktuar cili është statusi real i
tenderit (hapur/mbyllur/anuluar/dhënë).

## 4. Faza 0 e mbetur (para kodimit të plotë)

Këto duhen konfirmuar akoma manualisht, me DevTools, para se skema e
databazës të konsiderohet finale:

1. **Emri i plotë i kolonës "Ri-T..."** — scroll djathtas te tabela, shiko titullin e plotë.
2. **A ka kolonë "Status"** e dukshme diku (aktiv/mbyllur) përtej datave?
3. **HTML e faqes së detajuar të një njoftimi** (kur klikohet ikona 📋/rreshti) —
   a ka më shumë fusha atje (p.sh. dokumentet PDF bashkangjitur, operatori
   ekonomik fitues për njoftimet e dhënies)? Kap URL-në e asaj faqeje.
4. **Konfirmo numrin total të rezultateve** dhe nëse ndryshon çdo herë që
   kërkohet (a është snapshot i qëndrueshëm brenda një dite, apo ndryshon
   kur dikush tjetër shton njoftim ndërkohë që ti je duke paginuar?).
5. **Testo nëse `guid` është vërtet universal** — provo të njëjtin URL nesër
   (ditë tjetër) dhe shiko nëse ende funksionon, ose nëse skadon.

## 5. Skema fillestare e databazës (Postgres)

```sql
CREATE TABLE tenders (
  id                  BIGSERIAL PRIMARY KEY,
  procurement_no      TEXT NOT NULL,         -- "Numrin e prokurimit" — çelësi natyror
  publication_no       TEXT,                  -- "Numri i publikimit"
  contracting_authority TEXT,
  document_type        TEXT,                  -- "Lloji i dokumentit" (B08, B10, ...)
  subject               TEXT,                  -- "Lënda e prokurimit / grupi"
  fpp_code              TEXT,
  fpp_description       TEXT,
  contract_type         TEXT,
  contract_value_bracket TEXT,                 -- "Vlera e kontratës" (kategori tekstuale)
  procedure_type         TEXT,
  estimated_value         NUMERIC,             -- "Vlera e parashikuar"
  currency                 TEXT DEFAULT 'EUR',
  closing_date              TIMESTAMP,          -- "Data e Mbylljes"
  publication_date           DATE,               -- "Data e publikimit"
  source_url                  TEXT,               -- URL i faqes së detajuar (nëse gjendet)
  raw_html                     TEXT,               -- HTML i rreshtit/faqes, për ri-parse pa ri-scrape
  first_seen_at                 TIMESTAMPTZ DEFAULT now(),
  last_seen_at                   TIMESTAMPTZ DEFAULT now(),
  last_changed_at                 TIMESTAMPTZ DEFAULT now(),
  UNIQUE(procurement_no, publication_no, document_type)
);

CREATE TABLE scrape_runs (
  id             BIGSERIAL PRIMARY KEY,
  started_at     TIMESTAMPTZ DEFAULT now(),
  finished_at    TIMESTAMPTZ,
  pages_scraped  INT,
  rows_found     INT,
  rows_new       INT,
  rows_updated   INT,
  errors         INT,
  status         TEXT  -- 'success' | 'partial' | 'failed'
);
```

Logjika e upsert: çelësi natyror = `(procurement_no, publication_no,
document_type)`. Nëse ekziston → update fushat që ndryshuan + `last_changed_at`
+ `last_seen_at`. Nëse jo → insert + `first_seen_at`. **Mos fshi kurrë** —
një njoftim që del nga lista aktive s'do të thotë të dhëna e keqe, mund të
jetë thjesht arkivuar.

## 6. Rendi i zbatimit (hap pas hapi, për Claude Code)

Secili hap = commit i veçantë, i testuar para se të kalohet te tjetri.

1. **Script minimal**: GET faqja 1 me `requests`, ruaj HTML-in e papërpunuar
   në disk (`page1.html`). Verifiko me sy që përmban tabelën.
2. **Parser**: me `BeautifulSoup`, nxirr rreshtat e tabelës nga `page1.html`
   në një listë `dict`-esh Python. Printo 3 rreshtat e parë, krahaso me sy
   kundrejt browser-it.
3. **Paginacion**: shto logjikën POST për faqe 2-10, duke rimarrë VIEWSTATE
   çdo herë. Ruaj çdo faqe si `page{N}.html`, verifiko që janë 10 faqe të
   ndryshme (jo e njëjta faqe e përsëritur — gabim i zakonshëm nëse VIEWSTATE
   s'rifreskohet saktë).
4. **Bashkimi**: një script që lexon krejt `page*.html`, i parse-on të
   gjitha, i shkrin në një listë të vetme, kontrollon numrin total kundrejt
   numrit të pritur.
5. **Databaza**: lidhu me Postgres (lokal, Docker), krijo tabelat, shkruaj
   funksionin e upsert-it, ekzekuto mbi të dhënat e mbledhura.
6. **Run i plotë nga zero**: fshi HTML-t e ndërmjetme, bëj run të plotë nga
   interneti (jo nga disk), kontrollo kohën totale dhe numrin final të
   rreshtave në Postgres.
7. **Retry + logging**: shto retry (max 3, backoff 5s/15s/30s) rreth çdo
   kërkese HTTP, dhe logo çdo run në `scrape_runs`.
8. **Alarm bazik**: nëse `rows_found` bie >30% krahasuar me run-in e
   mëparshëm të suksesshëm, printo/dërgo paralajmërim (email/webhook —
   implementim i thjeshtë për fillim, p.sh. print në log që monitorohet).

## 7. Çfarë NUK përfshihet në këtë fazë

- UI/frontend
- Alerte për përdorues
- Lidhje me ARBK
- Ekstraktim nga PDF-të e bashkangjitura
- Faqja e detajuar e njoftimit (nëse s'nevojitet për fushat bazë)

Këto janë faza 2+, pas që faza 1 të jetë e qëndrueshme dhe e testuar për disa
ditë me radhë (cron çdo natë, pa dështime të pashpjegueshme).
