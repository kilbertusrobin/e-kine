import type {
  User,
  Profile,
  AuthResponse,
  AuthStatus,
  Appointment,
  AvailableSlots,
  CareType,
  Prescription,
  UpdateProfileDto,
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Token management
const getAccessToken = () => localStorage.getItem('accessToken')
const getRefreshToken = () => localStorage.getItem('refreshToken')

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
}

export const clearTokens = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

// Base fetch with auth
async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    // Try to refresh token
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      // Retry with new token
      const newToken = getAccessToken()
      ;(headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`
      const retryResponse = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      })
      if (!retryResponse.ok) {
        throw new Error(`API Error: ${retryResponse.status}`)
      }
      return retryResponse.json()
    } else {
      clearTokens()
      window.location.href = '/login'
      throw new Error('Session expired')
    }
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    console.error(`API Error ${response.status}:`, errorBody)
    throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorBody?.message || errorBody)}`)
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) return false

    const data: AuthResponse = await response.json()
    setTokens(data.accessToken, data.refreshToken)
    return true
  } catch {
    return false
  }
}

// Auth API
export const authApi = {
  getMe: () => fetchWithAuth<User>('/auth/me'),
  getStatus: () => fetchWithAuth<AuthStatus>('/auth/status'),
  logout: async () => {
    const refreshToken = getRefreshToken()
    await fetchWithAuth('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
    clearTokens()
  },
  logoutAll: async () => {
    await fetchWithAuth('/auth/logout-all', { method: 'POST' })
    clearTokens()
  },
}

// Profile API
export const profileApi = {
  getMe: () => fetchWithAuth<Profile>('/profiles/me'),
  updateMe: (data: UpdateProfileDto) =>
    fetchWithAuth<Profile>('/profiles/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getById: (id: string) => fetchWithAuth<Profile>(`/profiles/${id}`),
}

// Appointments API
export const appointmentsApi = {
  getMine: () => fetchWithAuth<Appointment[]>('/appointments/me'),
  getAll: (filters?: {
    practitionerId?: string
    patientId?: string
    status?: string
    fromDate?: string
    toDate?: string
  }) => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
    }
    const query = params.toString() ? `?${params.toString()}` : ''
    return fetchWithAuth<Appointment[]>(`/appointments${query}`)
  },
  getById: (id: string) => fetchWithAuth<Appointment>(`/appointments/${id}`),
  create: (data: CreateAppointmentDto) =>
    fetchWithAuth<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateAppointmentDto) =>
    fetchWithAuth<Appointment>(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  cancel: (id: string) =>
    fetchWithAuth<Appointment>(`/appointments/${id}`, { method: 'DELETE' }),
  getAvailableSlots: async (practitionerId: string, date: string): Promise<AvailableSlots> => {
    try {
      const data = await fetchWithAuth<AvailableSlots>(
        `/appointments/available-slots?practitionerId=${practitionerId}&date=${date}`
      )
      return data
    } catch (err) {
      console.error('getAvailableSlots error:', err)
      return { date, practitionerId, availableSlots: [], allSlots: [] }
    }
  },
}

// Users API
export const usersApi = {
  getPractitioners: async (): Promise<User[]> => {
    try {
      const response = await fetch(`${API_URL}/users/practitioners`)
      if (!response.ok) return []
      return response.json() as Promise<User[]>
    } catch {
      return []
    }
  },
}

// Care Types API
export const careTypesApi = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/care-types`)
    return response.json() as Promise<CareType[]>
  },
  getMine: () => fetchWithAuth<CareType[]>('/care-types/me'),
  updateMine: (careTypeIds: string[]) =>
    fetchWithAuth<CareType[]>('/care-types/me', {
      method: 'PUT',
      body: JSON.stringify({ careTypeIds }),
    }),
}

// Prescriptions API
export const prescriptionsApi = {
  getMine: () => fetchWithAuth<Prescription[]>('/prescriptions/me'),
  getAll: () => fetchWithAuth<Prescription[]>('/prescriptions'),
  getById: (id: string) => fetchWithAuth<Prescription>(`/prescriptions/${id}`),
  create: async (file: File) => {
    const token = getAccessToken()
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_URL}/prescriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
    return response.json() as Promise<Prescription>
  },
  delete: (id: string) =>
    fetchWithAuth(`/prescriptions/${id}`, { method: 'DELETE' }),
}
