const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')

const AUTH_TOKEN_KEY = 'authToken'
const AUTH_USER_KEY = 'authUser'

export type UserRole = 'user' | 'pharma_company' | 'logistics_provider' | 'auditor_qa' | 'admin'

export interface AuthUser {
  user_id: string
  name: string
  email: string
  role: UserRole
  company_id: string | null
  email_verified: boolean
  created_at: string
  updated_at: string
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  body?: Record<string, unknown> | FormData | Blob | URLSearchParams | string | null
}

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export const getAuthToken = (): string | null => localStorage.getItem(AUTH_TOKEN_KEY)

export const getAuthUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export const setAuthSession = (token: string, user?: AuthUser | null): void => {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(AUTH_USER_KEY)
  }
}

export const clearAuthSession = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}

const redirectToLogin = (): void => {
  if (window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
}

const normalizeEndpoint = (endpoint: string): string =>
  endpoint.startsWith('/') ? endpoint : `/${endpoint}`

const shouldJsonEncode = (body: ApiRequestOptions['body']): boolean => {
  if (!body || typeof body !== 'object') return false
  return !(body instanceof FormData || body instanceof Blob || body instanceof URLSearchParams)
}

const parseResponseBody = async (response: Response): Promise<unknown> => {
  if (response.status === 204) return null
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return response.json().catch(() => null)
  }
  return response.text().catch(() => '')
}

export const apiRequest = async <T = unknown>(
  endpoint: string,
  options: ApiRequestOptions & { method?: string } = {},
): Promise<T> => {
  const token = getAuthToken()
  const headers = new Headers((options.headers as HeadersInit) || {})
  let body: BodyInit | null | undefined = options.body as BodyInit | null | undefined

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (shouldJsonEncode(options.body)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
    body = JSON.stringify(options.body)
  }

  const response = await fetch(`${API_BASE_URL}${normalizeEndpoint(endpoint)}`, {
    ...options,
    headers,
    body,
  })

  const data = await parseResponseBody(response)

  if (response.status === 401) {
    clearAuthSession()
    redirectToLogin()
  }

  if (!response.ok) {
    const message =
      (data as Record<string, string> | null)?.message ??
      `Request failed with status ${response.status}`
    throw new ApiError(message, response.status, data)
  }

  return data as T
}

export const api = {
  get: <T = unknown>(endpoint: string, options?: ApiRequestOptions): Promise<T> =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = unknown>(endpoint: string, body?: ApiRequestOptions['body'], options?: ApiRequestOptions): Promise<T> =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T = unknown>(endpoint: string, body?: ApiRequestOptions['body'], options?: ApiRequestOptions): Promise<T> =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T = unknown>(endpoint: string, body?: ApiRequestOptions['body'], options?: ApiRequestOptions): Promise<T> =>
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T = unknown>(endpoint: string, options?: ApiRequestOptions): Promise<T> =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
}
