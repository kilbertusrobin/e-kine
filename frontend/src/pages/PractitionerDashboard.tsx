import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { authApi, profileApi, appointmentsApi, careTypesApi, prescriptionsApi } from '../services/api'
import type { User, Profile, Appointment, CareType, Prescription } from '../types'
import { AppointmentStatus } from '../types'
import {
  DashboardShell, BentoCard, ProfileTab, ProfileCompletionModal, AppointmentCalendar,
  HomeIcon, CalendarIcon, UserIcon, UsersIcon, StethoscopeIcon, ClockIcon, CheckIcon, DocumentIcon,
  type CalendarEvent,
} from '../components/dashboard/shared'

type PractitionerTab = 'overview' | 'agenda' | 'patients' | 'prescriptions' | 'care-types' | 'profile'

function isProfileComplete(profile: Profile | null): boolean {
  if (!profile) return false
  return !!(profile.firstName && profile.lastName && profile.phone && profile.address && profile.city && profile.pc)
}

const statusConfig = {
  confirmed: { label: 'Confirme', classes: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Termine', classes: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Annule', classes: 'bg-red-100 text-red-700' },
}

export default function PractitionerDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<PractitionerTab>('overview')
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [myCareTypes, setMyCareTypes] = useState<CareType[]>([])
  const [allCareTypes, setAllCareTypes] = useState<CareType[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileBannerDismissed, setProfileBannerDismissed] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  const loadData = async () => {
    try {
      const [userData, profileData, appointmentsData, myCareTypesData, allCareTypesData, prescriptionsData] = await Promise.all([
        authApi.getMe(),
        profileApi.getMe(),
        appointmentsApi.getMine(),
        careTypesApi.getMine().catch(() => []),
        careTypesApi.getAll().catch(() => []),
        prescriptionsApi.getAll().catch(() => []),
      ])
      setUser(userData)
      setProfile(profileData)
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : [])
      setMyCareTypes(Array.isArray(myCareTypesData) ? myCareTypesData : [])
      setAllCareTypes(Array.isArray(allCareTypesData) ? allCareTypesData : [])
      setPrescriptions(Array.isArray(prescriptionsData) ? prescriptionsData : [])
    } catch (error) {
      console.error('[PractitionerDashboard] Error loading data:', error)
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleLogout = async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    navigate('/login')
  }

  // ── Derived data ──

  const calendarEvents: CalendarEvent[] = useMemo(() =>
    appointments.map(apt => ({
      id: apt.id,
      title: apt.patient?.email || 'Patient',
      start: new Date(apt.dateTime),
      end: new Date(new Date(apt.dateTime).getTime() + 30 * 60 * 1000),
      status: apt.status,
      appointment: apt,
    })), [appointments])

  const todayAppointments = useMemo(() => {
    const today = new Date()
    return appointments
      .filter(a => {
        const d = new Date(a.dateTime)
        return d.toDateString() === today.toDateString() && a.status !== AppointmentStatus.CANCELLED
      })
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
  }, [appointments])

  const stats = useMemo(() => {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7))
    weekStart.setHours(0, 0, 0, 0)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const patientsThisWeek = new Set(
      appointments
        .filter(a => new Date(a.dateTime) >= weekStart && a.status !== AppointmentStatus.CANCELLED)
        .map(a => a.patientId)
    ).size

    const upcomingTotal = appointments.filter(a =>
      a.status === AppointmentStatus.CONFIRMED && new Date(a.dateTime) > now
    ).length

    const completedThisMonth = appointments.filter(a =>
      a.status === AppointmentStatus.COMPLETED && new Date(a.dateTime) >= monthStart
    ).length

    const cancelled = appointments.filter(a => a.status === AppointmentStatus.CANCELLED).length
    const resolved = cancelled + completedThisMonth
    const cancellationRate = resolved > 0 ? Math.round((cancelled / resolved) * 100) : 0

    return { patientsThisWeek, upcomingTotal, completedThisMonth, cancellationRate }
  }, [appointments])

  const patients = useMemo(() => {
    const map = new Map<string, {
      id: string
      email: string
      googlePicture: string | null
      appointments: Appointment[]
      lastVisit: Date | null
    }>()
    appointments.forEach(apt => {
      if (!apt.patient) return
      const existing = map.get(apt.patient.id)
      if (existing) {
        existing.appointments.push(apt)
        const aptDate = new Date(apt.dateTime)
        if (!existing.lastVisit || aptDate > existing.lastVisit) {
          existing.lastVisit = aptDate
        }
      } else {
        map.set(apt.patient.id, {
          id: apt.patient.id,
          email: apt.patient.email,
          googlePicture: apt.patient.googlePicture,
          appointments: [apt],
          lastVisit: new Date(apt.dateTime),
        })
      }
    })
    return Array.from(map.values()).sort((a, b) => {
      if (!a.lastVisit) return 1
      if (!b.lastVisit) return -1
      return b.lastVisit.getTime() - a.lastVisit.getTime()
    })
  }, [appointments])

  // ── Menu items ──

  const menuItems = [
    { id: 'overview', label: "Vue d'ensemble", icon: HomeIcon },
    { id: 'agenda', label: 'Agenda', icon: CalendarIcon },
    { id: 'patients', label: 'Patients', icon: UsersIcon },
    { id: 'prescriptions', label: 'Ordonnances', icon: DocumentIcon },
    { id: 'care-types', label: 'Mes soins', icon: StethoscopeIcon },
    { id: 'profile', label: 'Mon profil', icon: UserIcon },
  ]

  const displayName = profile?.firstName && profile?.lastName
    ? `Dr. ${profile.firstName} ${profile.lastName}`
    : user?.email || ''

  const todayStr = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardShell
      user={user}
      profile={profile}
      menuItems={menuItems}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as PractitionerTab)}
      onLogout={handleLogout}
    >
      {/* Profile incomplete banner */}
      {profile && !isProfileComplete(profile) && !profileBannerDismissed && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-amber-800">Completez votre profil</p>
              <p className="text-sm text-amber-600">Renseignez vos informations pour que vos patients puissent vous identifier.</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
            <button onClick={() => setShowProfileModal(true)} className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors">
              Completer
            </button>
            <button onClick={() => setProfileBannerDismissed(true)} className="p-1.5 text-amber-400 hover:text-amber-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <OverviewTab
          displayName={displayName}
          todayStr={todayStr}
          user={user}
          profile={profile}
          stats={stats}
          todayAppointments={todayAppointments}
          calendarEvents={calendarEvents}
          onSelectEvent={(e) => setSelectedAppointment(e.appointment)}
          onNavigate={setActiveTab}
        />
      )}

      {activeTab === 'agenda' && (
        <AgendaTab
          calendarEvents={calendarEvents}
          selectedAppointment={selectedAppointment}
          onSelectEvent={(e) => setSelectedAppointment(e.appointment)}
          onCloseModal={() => setSelectedAppointment(null)}
          onReload={loadData}
        />
      )}

      {activeTab === 'patients' && (
        <PatientsTab patients={patients} />
      )}

      {activeTab === 'prescriptions' && (
        <PrescriptionsTab prescriptions={prescriptions} patients={patients} />
      )}

      {activeTab === 'care-types' && (
        <CareTypesTab
          allCareTypes={allCareTypes}
          myCareTypes={myCareTypes}
          onReload={loadData}
        />
      )}

      {activeTab === 'profile' && (
        <ProfileTab profile={profile} user={user} onUpdate={loadData} />
      )}

      {showProfileModal && (
        <ProfileCompletionModal
          profile={profile}
          onClose={() => setShowProfileModal(false)}
          onSaved={() => { setShowProfileModal(false); loadData() }}
        />
      )}
    </DashboardShell>
  )
}

// =============================================================================
// OVERVIEW TAB
// =============================================================================

function OverviewTab({
  displayName, todayStr, user, profile, stats, todayAppointments, calendarEvents, onSelectEvent, onNavigate,
}: {
  displayName: string
  todayStr: string
  user: User | null
  profile: Profile | null
  stats: { patientsThisWeek: number; upcomingTotal: number; completedThisMonth: number; cancellationRate: number }
  todayAppointments: Appointment[]
  calendarEvents: CalendarEvent[]
  onSelectEvent: (event: CalendarEvent) => void
  onNavigate: (tab: PractitionerTab) => void
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">

        {/* ── Welcome Card ── */}
        <div className="md:col-span-2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-8 right-8 w-20 h-20 bg-white/5 rounded-full" />
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1">
              <p className="text-primary-200 text-sm font-medium uppercase tracking-wider mb-1">{todayStr}</p>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">{displayName}</h1>
              <p className="text-primary-100 text-sm lg:text-base">
                {todayAppointments.length > 0
                  ? `${todayAppointments.length} rendez-vous aujourd'hui`
                  : "Aucun rendez-vous aujourd'hui"}
              </p>
            </div>
            {user?.googlePicture ? (
              <img src={user.googlePicture} alt="" className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl border-2 border-white/20 shadow-lg ml-4 flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center ml-4 flex-shrink-0">
                <span className="text-white/90 font-bold text-2xl">
                  {profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Stats ── */}
        <BentoCard className="bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-secondary-50 flex items-center justify-center">
              <UsersIcon className="w-5 h-5 text-secondary-600" />
            </div>
            <span className="text-xs font-semibold text-secondary-600 bg-secondary-50 px-2.5 py-1 rounded-full uppercase tracking-wide">Semaine</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{stats.patientsThisWeek}</p>
          <p className="text-sm text-gray-500 mt-1">patients cette semaine</p>
        </BentoCard>

        <BentoCard className="bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full uppercase tracking-wide">RDV</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{stats.upcomingTotal}</p>
          <p className="text-sm text-gray-500 mt-1">rendez-vous a venir</p>
        </BentoCard>

        {/* ── Calendar ── */}
        <div className="md:col-span-2 lg:row-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-primary-600" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">Calendrier</h2>
            </div>
            <button
              onClick={() => onNavigate('agenda')}
              className="text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors"
            >
              Voir tout
            </button>
          </div>
          <div className="p-4 ekine-calendar" style={{ height: 480 }}>
            <AppointmentCalendar events={calendarEvents} onSelectEvent={onSelectEvent} />
          </div>
        </div>

        {/* ── More Stats ── */}
        <BentoCard className="bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckIcon className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full uppercase tracking-wide">Mois</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{stats.completedThisMonth}</p>
          <p className="text-sm text-gray-500 mt-1">termines ce mois</p>
        </BentoCard>

        <BentoCard className="bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wide">Taux</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{stats.cancellationRate}%</p>
          <p className="text-sm text-gray-500 mt-1">taux d'annulation</p>
        </BentoCard>

        {/* ── Today's Appointments ── */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <ClockIcon className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">Aujourd'hui</h2>
              {todayAppointments.length > 0 && (
                <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                  {todayAppointments.length}
                </span>
              )}
            </div>
            {todayAppointments.length > 5 && (
              <button onClick={() => onNavigate('agenda')} className="text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors">
                Voir tout
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-50">
            {todayAppointments.length > 0 ? (
              todayAppointments.slice(0, 5).map((apt) => {
                const time = new Date(apt.dateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                const cfg = statusConfig[apt.status]
                return (
                  <div key={apt.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-700 font-bold text-sm">{time}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{apt.patient?.email || 'Patient'}</p>
                        <p className="text-xs text-gray-500">{apt.careType?.label || 'Consultation'}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${cfg.classes}`}>
                      {cfg.label}
                    </span>
                  </div>
                )
              })
            ) : (
              <div className="p-8 text-center">
                <ClockIcon className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">Aucun rendez-vous aujourd'hui</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <button
            onClick={() => onNavigate('agenda')}
            className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-primary-200 transition-all duration-200 text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center mb-3 group-hover:bg-primary-100 transition-colors">
              <CalendarIcon className="w-5 h-5 text-primary-600" />
            </div>
            <p className="font-semibold text-gray-900 text-sm">Voir l'agenda complet</p>
            <p className="text-xs text-gray-400 mt-0.5">Gerez vos rendez-vous</p>
          </button>
          <button
            onClick={() => onNavigate('care-types')}
            className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-secondary-200 transition-all duration-200 text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-secondary-50 flex items-center justify-center mb-3 group-hover:bg-secondary-100 transition-colors">
              <StethoscopeIcon className="w-5 h-5 text-secondary-600" />
            </div>
            <p className="font-semibold text-gray-900 text-sm">Gerer mes soins</p>
            <p className="text-xs text-gray-400 mt-0.5">Types de soins proposes</p>
          </button>
        </div>

      </div>
    </div>
  )
}

// =============================================================================
// AGENDA TAB
// =============================================================================

function AgendaTab({
  calendarEvents, selectedAppointment, onSelectEvent, onCloseModal, onReload,
}: {
  calendarEvents: CalendarEvent[]
  selectedAppointment: Appointment | null
  onSelectEvent: (event: CalendarEvent) => void
  onCloseModal: () => void
  onReload: () => Promise<void>
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
        <p className="text-gray-600 mt-1">Gerez vos rendez-vous et consultations</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 ekine-calendar" style={{ height: 680 }}>
          <AppointmentCalendar events={calendarEvents} onSelectEvent={onSelectEvent} defaultView="week" />
        </div>
      </div>

      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          onClose={onCloseModal}
          onReload={onReload}
        />
      )}
    </div>
  )
}

// =============================================================================
// APPOINTMENT DETAIL MODAL
// =============================================================================

function AppointmentDetailModal({
  appointment, onClose, onReload,
}: {
  appointment: Appointment
  onClose: () => void
  onReload: () => Promise<void>
}) {
  const [acting, setActing] = useState(false)
  const date = new Date(appointment.dateTime)
  const cfg = statusConfig[appointment.status]

  const handleComplete = async () => {
    setActing(true)
    try {
      await appointmentsApi.update(appointment.id, { status: AppointmentStatus.COMPLETED })
      await onReload()
      onClose()
    } catch (err) {
      console.error('Error completing appointment:', err)
      setActing(false)
    }
  }

  const handleCancel = async () => {
    setActing(true)
    try {
      await appointmentsApi.cancel(appointment.id)
      await onReload()
      onClose()
    } catch (err) {
      console.error('Error cancelling appointment:', err)
      setActing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {appointment.patient?.googlePicture ? (
                <img src={appointment.patient.googlePicture} alt="" className="w-12 h-12 rounded-full border-2 border-white/30" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
                  <span className="text-white font-bold text-lg">
                    {appointment.patient?.email?.[0]?.toUpperCase() || 'P'}
                  </span>
                </div>
              )}
              <div>
                <p className="text-white font-semibold">{appointment.patient?.email || 'Patient'}</p>
                <p className="text-primary-100 text-sm">{appointment.careType?.label || 'Consultation'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-xs text-gray-500">
                  {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${cfg.classes}`}>
              {cfg.label}
            </span>
          </div>

          {appointment.notes && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Notes</p>
              <p className="text-sm text-gray-700">{appointment.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {appointment.status === AppointmentStatus.CONFIRMED && (
          <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              disabled={acting}
              className="px-4 py-2.5 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 disabled:opacity-50 transition-colors text-sm"
            >
              Annuler le RDV
            </button>
            <button
              onClick={handleComplete}
              disabled={acting}
              className="px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-colors text-sm flex items-center space-x-2"
            >
              {acting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckIcon className="w-4 h-4" />
              )}
              <span>Marquer termine</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// PATIENTS TAB
// =============================================================================

function PatientsTab({
  patients,
}: {
  patients: {
    id: string
    email: string
    googlePicture: string | null
    appointments: Appointment[]
    lastVisit: Date | null
  }[]
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-1">{patients.length} patient{patients.length !== 1 ? 's' : ''} au total</p>
        </div>
      </div>

      {patients.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          {patients.map((patient) => {
            const isExpanded = expandedId === patient.id
            const sortedApts = [...patient.appointments].sort(
              (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
            )
            return (
              <div key={patient.id}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : patient.id)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors text-left"
                >
                  <div className="flex items-center space-x-4">
                    {patient.googlePicture ? (
                      <img src={patient.googlePicture} alt="" className="w-11 h-11 rounded-full" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-700 font-semibold">
                          {patient.email[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{patient.email}</p>
                      <p className="text-xs text-gray-500">
                        Derniere visite : {patient.lastVisit
                          ? patient.lastVisit.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                          : '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
                      {patient.appointments.length} RDV
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isExpanded && (
                  <div className="bg-gray-50/50 border-t border-gray-100 px-5 py-3 space-y-2">
                    {sortedApts.map((apt) => {
                      const d = new Date(apt.dateTime)
                      const cfg = statusConfig[apt.status]
                      return (
                        <div key={apt.id} className="flex items-center justify-between py-2.5 px-4 bg-white rounded-xl border border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-primary-50 flex flex-col items-center justify-center flex-shrink-0">
                              <span className="text-primary-700 font-bold text-xs">{d.getDate()}</span>
                              <span className="text-primary-500 text-[10px] uppercase">{d.toLocaleDateString('fr-FR', { month: 'short' })}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900">{apt.careType?.label || 'Consultation'}</p>
                              <p className="text-xs text-gray-500">
                                {d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                {apt.notes && ` -- ${apt.notes}`}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${cfg.classes}`}>
                            {cfg.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <UsersIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500">Aucun patient pour le moment</p>
          <p className="text-sm text-gray-400 mt-1">Vos patients apparaitront ici apres leur premier rendez-vous</p>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// CARE TYPES TAB
// =============================================================================

function CareTypesTab({
  allCareTypes, myCareTypes, onReload,
}: {
  allCareTypes: CareType[]
  myCareTypes: CareType[]
  onReload: () => Promise<void>
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(myCareTypes.map(ct => ct.id)))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSelectedIds(new Set(myCareTypes.map(ct => ct.id)))
  }, [myCareTypes])

  const hasChanges = useMemo(() => {
    const currentIds = new Set(myCareTypes.map(ct => ct.id))
    if (currentIds.size !== selectedIds.size) return true
    for (const id of selectedIds) {
      if (!currentIds.has(id)) return true
    }
    return false
  }, [myCareTypes, selectedIds])

  const toggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await careTypesApi.updateMine(Array.from(selectedIds))
      await onReload()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error('Error updating care types:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mes soins</h1>
        <p className="text-gray-600 mt-1">Selectionnez les types de soins que vous proposez</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-secondary-50 flex items-center justify-center">
              <StethoscopeIcon className="w-4 h-4 text-secondary-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Types de soins disponibles</h2>
              <p className="text-xs text-gray-500">{selectedIds.size} soin{selectedIds.size !== 1 ? 's' : ''} selectionne{selectedIds.size !== 1 ? 's' : ''}</p>
            </div>
          </div>
          {saved && (
            <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full flex items-center space-x-1.5">
              <CheckIcon className="w-4 h-4" />
              <span>Enregistre</span>
            </span>
          )}
        </div>

        <div className="p-5">
          {allCareTypes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allCareTypes.map((ct) => {
                const isSelected = selectedIds.has(ct.id)
                return (
                  <button
                    key={ct.id}
                    onClick={() => toggle(ct.id)}
                    className={`
                      flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-200 text-left
                      ${isSelected
                        ? 'border-primary-300 bg-primary-50/50'
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className={`
                      w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all
                      ${isSelected
                        ? 'bg-primary-600 border-primary-600'
                        : 'border-gray-300 bg-white'
                      }
                    `}>
                      {isSelected && <CheckIcon className="w-4 h-4 text-white" />}
                    </div>
                    <span className={`text-sm font-medium ${isSelected ? 'text-primary-800' : 'text-gray-700'}`}>
                      {ct.label}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">Aucun type de soin disponible</p>
            </div>
          )}
        </div>

        {/* Sticky save bar */}
        {hasChanges && (
          <div className="sticky bottom-0 p-4 border-t border-gray-100 bg-white/95 backdrop-blur-sm flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {selectedIds.size} soin{selectedIds.size !== 1 ? 's' : ''} selectionne{selectedIds.size !== 1 ? 's' : ''}
            </p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <span>Enregistrer</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// PRESCRIPTIONS TAB (practitioner view)
// =============================================================================

function PrescriptionsTab({
  prescriptions,
  patients,
}: {
  prescriptions: Prescription[]
  patients: {
    id: string
    email: string
    googlePicture: string | null
    appointments: Appointment[]
    lastVisit: Date | null
  }[]
}) {
  const patientMap = useMemo(() => {
    const map = new Map<string, { email: string; googlePicture: string | null }>()
    patients.forEach(p => map.set(p.id, { email: p.email, googlePicture: p.googlePicture }))
    return map
  }, [patients])

  const sorted = useMemo(() =>
    [...prescriptions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [prescriptions]
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ordonnances patients</h1>
        <p className="text-gray-600 mt-1">Consultez les prescriptions de vos patients</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {sorted.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {sorted.map((rx) => {
              const patient = patientMap.get(rx.userId)
              return (
                <div key={rx.id} className="p-5 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                        <path d="M14 2v6h6"/>
                        <path d="M16 13H8M16 17H8M10 9H8"/>
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{rx.filename}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(rx.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
                    {patient ? (
                      <div className="flex items-center space-x-2">
                        {patient.googlePicture ? (
                          <img src={patient.googlePicture} alt="" className="w-7 h-7 rounded-full" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-600 font-semibold text-xs">{patient.email[0]?.toUpperCase()}</span>
                          </div>
                        )}
                        <span className="text-sm text-gray-600 truncate max-w-[200px]">{patient.email}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Patient inconnu</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <DocumentIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune ordonnance</p>
          </div>
        )}
      </div>
    </div>
  )
}
