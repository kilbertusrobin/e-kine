// Enums as const objects (compatible with erasableSyntaxOnly)
export const UserRole = {
  PATIENT: 'patient',
  PRACTITIONER: 'practitioner'
} as const
export type UserRole = typeof UserRole[keyof typeof UserRole]

export const AppointmentStatus = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
} as const
export type AppointmentStatus = typeof AppointmentStatus[keyof typeof AppointmentStatus]

// User & Auth
export interface User {
  id: string
  email: string
  googlePicture: string | null
  role: UserRole
  isActive: boolean
  emailVerified: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
  profile?: Profile
  isPatient: boolean
  isPractitioner: boolean
  canLogin: boolean
}

export interface Profile {
  id: string
  lastName: string | null
  firstName: string | null
  address: string | null
  city: string | null
  pc: string | null
  phone: string | null
  userId: string
  createdAt: string
  updatedAt: string
  isComplete: boolean
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: 'Bearer'
  expiresIn: number
  user: User
}

export interface AuthStatus {
  authenticated: boolean
  role: UserRole
  canLogin: boolean
}

// Appointments
export interface Appointment {
  id: string
  practitionerId: string
  patientId: string
  careTypeId: string | null
  dateTime: string
  status: AppointmentStatus
  notes: string | null
  createdAt: string
  updatedAt: string
  practitioner?: {
    id: string
    email: string
    googlePicture: string | null
  }
  patient?: {
    id: string
    email: string
    googlePicture: string | null
  }
  careType?: CareType | null
}

export interface AvailableSlots {
  date: string
  practitionerId: string
  availableSlots: string[]
  allSlots: {
    dateTime: string
    available: boolean
  }[]
}

// Care Types
export interface CareType {
  id: string
  label: string
  createdAt: string
  updatedAt: string
}

// Prescriptions
export interface Prescription {
  id: string
  pdfData: string
  filename: string
  userId: string
  user?: User
  createdAt: string
  updatedAt: string
}

// Update DTOs
export interface UpdateProfileDto {
  lastName?: string
  firstName?: string
  address?: string
  city?: string
  pc?: string
  phone?: string
}

export interface CreateAppointmentDto {
  practitionerId: string
  dateTime: string
  careTypeId?: string
  notes?: string
}

export interface UpdateAppointmentDto {
  dateTime?: string
  careTypeId?: string
  status?: AppointmentStatus
  notes?: string
}
