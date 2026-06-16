import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getAuthUser, setAuthSession, clearAuthSession, ApiError } from '../services/api'

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('setAuthSession / getAuthUser / clearAuthSession', () => {
  it('stores and reads user from localStorage', () => {
    const user = {
      user_id: '1', name: 'Seva', email: 'seva@test.com', role: 'user' as const,
      company_id: null, email_verified: true, created_at: '', updated_at: '',
    }
    setAuthSession('token123', user)
    expect(getAuthUser()?.name).toBe('Seva')
    expect(getAuthUser()?.email).toBe('seva@test.com')
  })

  it('returns null when nothing stored', () => {
    expect(getAuthUser()).toBeNull()
  })

  it('clearAuthSession removes user', () => {
    const user = {
      user_id: '1', name: 'Seva', email: 'seva@test.com', role: 'user' as const,
      company_id: null, email_verified: true, created_at: '', updated_at: '',
    }
    setAuthSession('token123', user)
    clearAuthSession()
    expect(getAuthUser()).toBeNull()
    expect(localStorage.getItem('authToken')).toBeNull()
  })
})

describe('ApiError', () => {
  it('has correct name, status and message', () => {
    const err = new ApiError('Not found', 404, { message: 'Not found' })
    expect(err.name).toBe('ApiError')
    expect(err.status).toBe(404)
    expect(err.message).toBe('Not found')
  })
})
