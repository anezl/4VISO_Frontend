const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')

const AUTH_TOKEN_KEY = 'authToken'
const AUTH_USER_KEY = 'authUser'

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY)

export const setAuthSession = (token, user) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token)

  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(AUTH_USER_KEY)
  }
}

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}

const redirectToLogin = () => {
  if (window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
}

const normalizeEndpoint = (endpoint) => (endpoint.startsWith('/') ? endpoint : `/${endpoint}`)

const shouldJsonEncode = (body) => {
  if (!body || typeof body !== 'object') {
    return false
  }

  return !(body instanceof FormData || body instanceof Blob || body instanceof URLSearchParams)
}

const parseResponseBody = async (response) => {
  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return response.json().catch(() => null)
  }

  return response.text().catch(() => '')
}

export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken()
  const headers = new Headers(options.headers || {})
  let body = options.body

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (shouldJsonEncode(body)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    body = JSON.stringify(body)
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
    const message = data?.message || `Request failed with status ${response.status}`

    throw new ApiError(message, response.status, data)
  }

  return data
}

export const api = {
  get: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
}
