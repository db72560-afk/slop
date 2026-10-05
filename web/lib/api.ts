export type Tender = {
  id: number;
  procurementNo: string;
  publicationNo: string | null;
  contractingAuthority: string | null;
  documentType: string | null;
  subject: string | null;
  fppCode: string | null;
  fppDescription: string | null;
  contractType: string | null;
  contractValueBracket: string | null;
  procedureType: string | null;
  estimatedValue: number | null;
  currency: string | null;
  closingDate: string | null;
  publicationDate: string | null;
  sourceUrl: string | null;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  lastChangedAt: string | null;
};

export type PaginatedResponse<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type TenderQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
  authority?: string;
  fppCode?: string;
  documentType?: string;
  minValue?: string;
  maxValue?: string;
  closingAfter?: string;
  closingBefore?: string;
  sort?: 'publicationDate' | 'closingDate' | 'estimatedValue';
  order?: 'asc' | 'desc';
};

export type Authority = {
  authority: string;
  tenderCount: number;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { cache: 'no-store' });
  if (!response.ok) {
    let message = `Kërkesa dështoi (${response.status})`;
    try {
      const body = await response.json() as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // Keep the status-based message when the API does not return JSON.
    }
    throw new ApiError(message, response.status);
  }
  return response.json() as Promise<T>;
}

export function getTenders(params: TenderQuery = {}): Promise<PaginatedResponse<Tender>> {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') searchParams.set(key, String(value));
  }
  const query = searchParams.toString();
  return request<PaginatedResponse<Tender>>(`/api/tenders${query ? `?${query}` : ''}`);
}

export function getTender(id: string): Promise<Tender> {
  return request<Tender>(`/api/tenders/${encodeURIComponent(id)}`);
}

export function getAuthorities(): Promise<Authority[]> {
  return request<Authority[]>('/api/authorities');
}
