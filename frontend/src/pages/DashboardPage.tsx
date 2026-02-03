import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { authApi, profileApi, appointmentsApi, prescriptionsApi } from '../services/api'
import type { User, Profile, Appointment, Prescription } from '../types'
import { AppointmentStatus } from '../types'
import {
  DashboardShell, BentoCard, ProfileTab, ProfileCompletionModal, AppointmentCalendar,
  HomeIcon, CalendarIcon, DocumentIcon, UserIcon, PlusIcon, UploadIcon, DownloadIcon, TrashIcon,
  ClockIcon, StethoscopeIcon,
  type CalendarEvent,
} from '../components/dashboard/shared'
type Tab = 'overview' | 'appointments' | 'prescriptions' | 'profile'

function isProfileComplete(profile: Profile | null): boolean {
  if (!profile) return false
  return !!(profile.firstName && profile.lastName && profile.phone && profile.address && profile.city && profile.pc)
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [profileBannerDismissed, setProfileBannerDismissed] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [userData, profileData, appointmentsData, prescriptionsData] = await Promise.all([
        authApi.getMe(),
        profileApi.getMe(),
        appointmentsApi.getMine(),
        prescriptionsApi.getMine(),
      ])
      setUser(userData)
      setProfile(profileData)
      setAppointments(appointmentsData)
      setPrescriptions(prescriptionsData)
    } catch (error) {
      console.error('Error loading data:', error)
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }
  


  const handleLogout = async () => {
    try {
      await authApi.logout()
      navigate('/login')
    } catch {
      navigate('/login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  const upcomingAppointments = appointments
    .filter(a => a.status === AppointmentStatus.CONFIRMED && new Date(a.dateTime) > new Date())
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())

  const pastAppointments = appointments
    .filter(a => a.status === AppointmentStatus.COMPLETED || new Date(a.dateTime) < new Date())
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())

  const menuItems = [
    { id: 'overview' as Tab, label: 'Vue d\'ensemble', icon: HomeIcon },
    { id: 'appointments' as Tab, label: 'Mes rendez-vous', icon: CalendarIcon },
    { id: 'prescriptions' as Tab, label: 'Ordonnances', icon: DocumentIcon },
    { id: 'profile' as Tab, label: 'Mon profil', icon: UserIcon },
  ]

  return (
    <DashboardShell
      user={user}
      profile={profile}
      menuItems={menuItems}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as Tab)}
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
              <p className="text-sm text-amber-600">Renseignez vos informations personnelles pour profiter pleinement de la plateforme.</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
            <button
              onClick={() => setShowProfileModal(true)}
              className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
            >
              Completer
            </button>
            <button
              onClick={() => setProfileBannerDismissed(true)}
              className="p-1.5 text-amber-400 hover:text-amber-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <OverviewTab
          user={user}
          profile={profile}
          appointments={appointments}
          upcomingAppointments={upcomingAppointments}
          prescriptions={prescriptions}
          onOpenPrescriptionModal={() => setShowPrescriptionModal(true)}
          onOpenProfileModal={() => setShowProfileModal(true)}
          onTabChange={(tab) => setActiveTab(tab)}
        />
      )}
      {activeTab === 'appointments' && (
        <AppointmentsTab
          upcomingAppointments={upcomingAppointments}
          pastAppointments={pastAppointments}
          onReload={loadData}
        />
      )}
      {activeTab === 'prescriptions' && (
        <PrescriptionsTab
          prescriptions={prescriptions}
          onOpenUploadModal={() => setShowPrescriptionModal(true)}
        />
      )}
      {activeTab === 'profile' && (
        <ProfileTab profile={profile} user={user} onUpdate={loadData} />
      )}

      {/* Profile Completion Modal */}
      {showProfileModal && (
        <ProfileCompletionModal
          profile={profile}
          onClose={() => setShowProfileModal(false)}
          onSaved={() => {
            setShowProfileModal(false)
            loadData()
          }}
        />
      )}

      {/* Prescription Upload Modal */}
      {showPrescriptionModal && (
        <PrescriptionUploadModal
          onClose={() => setShowPrescriptionModal(false)}
          onUploaded={() => {
            setShowPrescriptionModal(false)
            loadData()
          }}
        />
      )}
    </DashboardShell>
  )
}

// =============================================================================
// BENTO OVERVIEW TAB
// =============================================================================

function OverviewTab({
  user,
  profile,
  appointments,
  upcomingAppointments,
  prescriptions,
  onOpenPrescriptionModal,
  onOpenProfileModal,
  onTabChange,
}: {
  user: User | null
  profile: Profile | null
  appointments: Appointment[]
  upcomingAppointments: Appointment[]
  prescriptions: Prescription[]
  onOpenPrescriptionModal: () => void
  onOpenProfileModal: () => void
  onTabChange: (tab: Tab) => void
}) {
  const displayName = profile?.firstName || user?.email?.split('@')[0] || 'Patient'

  const practitioners = useMemo(() => {
    const seen = new Map<string, { id: string; email: string; googlePicture: string | null }>()
    appointments.forEach(apt => {
      if (apt.practitioner && !seen.has(apt.practitioner.id)) {
        seen.set(apt.practitioner.id, apt.practitioner)
      }
    })
    return Array.from(seen.values())
  }, [appointments])

  const calendarEvents: CalendarEvent[] = useMemo(() =>
    appointments.map(apt => {
      const start = new Date(apt.dateTime)
      const end = new Date(start.getTime() + 30 * 60 * 1000)
      return {
        id: apt.id,
        title: apt.careType?.label || 'Consultation',
        start,
        end,
        status: apt.status,
        appointment: apt,
      }
    }), [appointments])

  const profileFields = profile
    ? [profile.firstName, profile.lastName, profile.phone, profile.address, profile.city, profile.pc]
    : []
  const filledFields = profileFields.filter(Boolean).length
  const profileProgress = Math.round((filledFields / 6) * 100)

  const todayStr = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">

        {/* Welcome Card - spans 2 cols */}
        <div className="md:col-span-2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1">
              <p className="text-primary-200 text-sm font-medium uppercase tracking-wider mb-1">{todayStr}</p>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">Bonjour, {displayName}</h1>
              <p className="text-primary-100 text-sm lg:text-base">
                {upcomingAppointments.length > 0
                  ? `Vous avez ${upcomingAppointments.length} rendez-vous a venir`
                  : 'Aucun rendez-vous a venir pour le moment'}
              </p>
            </div>
            {user?.googlePicture ? (
              <img
                src={user.googlePicture}
                alt=""
                className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl border-2 border-white/20 shadow-lg ml-4 flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center ml-4 flex-shrink-0">
                <span className="text-white/90 font-bold text-2xl">
                  {profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats: Upcoming Appointments */}
        <BentoCard className="bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full uppercase tracking-wide">RDV</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{upcomingAppointments.length}</p>
          <p className="text-sm text-gray-500 mt-1">rendez-vous a venir</p>
        </BentoCard>

        {/* Stats: Prescriptions */}
        <BentoCard className="bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-secondary-50 flex items-center justify-center">
              <DocumentIcon className="w-5 h-5 text-secondary-600" />
            </div>
            <span className="text-xs font-semibold text-secondary-600 bg-secondary-50 px-2.5 py-1 rounded-full uppercase tracking-wide">Docs</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{prescriptions.length}</p>
          <p className="text-sm text-gray-500 mt-1">ordonnances</p>
        </BentoCard>

        {/* Calendar Card - spans 2 cols, 2 rows */}
        <div className="md:col-span-2 lg:row-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-primary-600" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">Calendrier</h2>
            </div>
          </div>
          <div className="p-4 ekine-calendar" style={{ height: 480 }}>
            <AppointmentCalendar events={calendarEvents} />
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                <ClockIcon className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">Rendez-vous a venir</h2>
              {upcomingAppointments.length > 0 && (
                <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                  {upcomingAppointments.length}
                </span>
              )}
            </div>
            {upcomingAppointments.length > 5 && (
              <button onClick={() => onTabChange('appointments')} className="text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors">
                Voir tous
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-50">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.slice(0, 5).map((apt) => {
                const date = new Date(apt.dateTime)
                const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                const dayStr = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
                return (
                  <div key={apt.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-50 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-primary-700 font-bold text-sm">{date.getDate()}</span>
                        <span className="text-primary-500 text-[10px] uppercase">{date.toLocaleDateString('fr-FR', { month: 'short' })}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{apt.careType?.label || 'Consultation'}</p>
                        <p className="text-xs text-gray-500 capitalize">{dayStr} a {time}</p>
                        {apt.practitioner && (
                          <p className="text-xs text-gray-400 truncate">{apt.practitioner.email}</p>
                        )}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 flex-shrink-0">
                      Confirme
                    </span>
                  </div>
                )
              })
            ) : (
              <div className="p-8 text-center">
                <ClockIcon className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">Aucun rendez-vous a venir</p>
                <a href="/booking" className="text-primary-600 text-sm font-medium hover:underline mt-2 inline-block">
                  Prendre rendez-vous
                </a>
              </div>
            )}
          </div>
        </div>

        {/* My Practitioners */}
        <BentoCard className="bg-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-accent-50 flex items-center justify-center">
              <StethoscopeIcon className="w-4 h-4 text-accent-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Mes praticiens</h2>
          </div>
          {practitioners.length > 0 ? (
            <div className="space-y-3">
              {practitioners.slice(0, 3).map((pract) => (
                <div key={pract.id} className="flex items-center space-x-3">
                  {pract.googlePicture ? (
                    <img src={pract.googlePicture} alt="" className="w-9 h-9 rounded-full" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-accent-100 flex items-center justify-center">
                      <span className="text-accent-700 font-semibold text-sm">
                        {pract.email[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <p className="text-sm text-gray-700 truncate flex-1">{pract.email}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Aucun praticien pour le moment</p>
          )}
        </BentoCard>

        {/* Profile Completion */}
        <BentoCard className="bg-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Profil</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{profileProgress === 100 ? 'Complet' : 'A completer'}</span>
              <span className="text-sm font-semibold text-gray-900">{profileProgress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${profileProgress}%`,
                  background: profileProgress === 100
                    ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                    : 'linear-gradient(90deg, #f59e0b, #d97706)',
                }}
              />
            </div>
            <p className="text-xs text-gray-400">{filledFields}/6 informations renseignees</p>
          </div>
        </BentoCard>

        {/* Recent Prescriptions */}
        <BentoCard className="bg-white md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                <DocumentIcon className="w-4 h-4 text-red-500" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">Ordonnances recentes</h2>
            </div>
            <span className="text-xs text-gray-400">{prescriptions.length} total</span>
          </div>
          {prescriptions.length > 0 ? (
            <div className="space-y-3">
              {prescriptions.slice(0, 3).map((rx) => (
                <div key={rx.id} className="flex items-center justify-between group">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{rx.filename}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(rx.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <button className="p-1.5 text-gray-300 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <DownloadIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Aucune ordonnance</p>
          )}
        </BentoCard>

        {/* Quick Actions - spans 2 cols */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <a
            href="/booking"
            className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-primary-200 transition-all duration-200"
          >
            <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center mb-3 group-hover:bg-primary-100 transition-colors">
              <PlusIcon className="w-5 h-5 text-primary-600" />
            </div>
            <p className="font-semibold text-gray-900 text-sm">Prendre rendez-vous</p>
            <p className="text-xs text-gray-400 mt-0.5">Reservez un creneau</p>
          </a>
          <button
            onClick={onOpenPrescriptionModal}
            className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-secondary-200 transition-all duration-200 text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-secondary-50 flex items-center justify-center mb-3 group-hover:bg-secondary-100 transition-colors">
              <UploadIcon className="w-5 h-5 text-secondary-600" />
            </div>
            <p className="font-semibold text-gray-900 text-sm">Ajouter une ordonnance</p>
            <p className="text-xs text-gray-400 mt-0.5">Telechargez un PDF</p>
          </button>
        </div>

      </div>
    </div>
  )
}

// =============================================================================
// NEXT APPOINTMENT DISPLAY
// =============================================================================

function NextAppointmentDisplay({ appointment }: { appointment: Appointment }) {
  const date = new Date(appointment.dateTime)
  const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' })
  const dayNum = date.getDate()
  const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex items-center space-x-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex flex-col items-center justify-center text-white flex-shrink-0">
        <span className="text-xl font-bold leading-none">{dayNum}</span>
        <span className="text-[10px] uppercase tracking-wider mt-0.5 opacity-80">
          {date.toLocaleDateString('fr-FR', { month: 'short' })}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900">{appointment.careType?.label || 'Consultation'}</p>
        <p className="text-sm text-gray-500 capitalize">{dayName} a {time}</p>
        {appointment.practitioner && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{appointment.practitioner.email}</p>
        )}
      </div>
      <div className="flex-shrink-0">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
          Confirme
        </span>
      </div>
    </div>
  )
}

// =============================================================================
// APPOINTMENTS TAB
// =============================================================================

function AppointmentsTab({
  upcomingAppointments,
  pastAppointments,
  onReload,
}: {
  upcomingAppointments: Appointment[]
  pastAppointments: Appointment[]
  onReload: () => void
}) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes rendez-vous</h1>
          <p className="text-gray-600 mt-1">Gerez vos rendez-vous passes et a venir</p>
        </div>
        <a
          href="/booking"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nouveau RDV
        </a>
      </div>

      {/* Upcoming */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">A venir</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((apt) => (
              <div key={apt.id} className="p-6">
                <AppointmentCard appointment={apt} onCancel={onReload} />
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun rendez-vous a venir</p>
              <a href="/booking" className="text-primary-600 hover:underline mt-2 inline-block">
                Prendre rendez-vous
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Past */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Historique</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {pastAppointments.length > 0 ? (
            pastAppointments.slice(0, 5).map((apt) => (
              <div key={apt.id} className="p-6">
                <AppointmentCard appointment={apt} past />
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-500">Aucun historique de rendez-vous</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// PRESCRIPTIONS TAB
// =============================================================================

function PrescriptionsTab({ prescriptions, onOpenUploadModal }: { prescriptions: Prescription[]; onOpenUploadModal: () => void }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes ordonnances</h1>
          <p className="text-gray-600 mt-1">Consultez et gerez vos prescriptions medicales</p>
        </div>
        <button
          onClick={onOpenUploadModal}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <UploadIcon className="w-5 h-5 mr-2" />
          Ajouter
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {prescriptions.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {prescriptions.map((prescription) => (
              <div key={prescription.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                      <path d="M14 2v6h6"/>
                      <path d="M16 13H8M16 17H8M10 9H8"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{prescription.filename}</p>
                    <p className="text-sm text-gray-500">
                      Ajoute le {new Date(prescription.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <DownloadIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <DocumentIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Aucune ordonnance enregistree</p>
            <button onClick={onOpenUploadModal} className="text-primary-600 hover:underline">
              Ajouter votre premiere ordonnance
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// APPOINTMENT CARD
// =============================================================================

function AppointmentCard({
  appointment,
  featured = false,
  past = false,
  onCancel,
}: {
  appointment: Appointment
  featured?: boolean
  past?: boolean
  onCancel?: (id: string) => void
}) {
  const [cancelling, setCancelling] = useState(false)
  const date = new Date(appointment.dateTime)
  const statusColors = {
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-gray-100 text-gray-700',
  }

  const handleCancel = async () => {
    if (!window.confirm('Etes-vous sur de vouloir annuler ce rendez-vous ?')) return
    setCancelling(true)
    try {
      await appointmentsApi.cancel(appointment.id)
      onCancel?.(appointment.id)
    } catch (error) {
      console.error('Error cancelling appointment:', error)
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className={`flex items-center justify-between ${past ? 'opacity-75' : ''}`}>
      <div className="flex items-center space-x-4">
        <div className={`${featured ? 'w-16 h-16' : 'w-14 h-14'} bg-primary-50 rounded-xl flex flex-col items-center justify-center`}>
          <span className="text-primary-600 font-bold text-lg">{date.getDate()}</span>
          <span className="text-primary-600 text-xs uppercase">
            {date.toLocaleDateString('fr-FR', { month: 'short' })}
          </span>
        </div>
        <div>
          <p className="font-medium text-gray-900">
            {appointment.careType?.label || 'Consultation'}
          </p>
          <p className="text-sm text-gray-500">
            {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[appointment.status]}`}>
          {appointment.status === 'confirmed' && 'Confirme'}
          {appointment.status === 'cancelled' && 'Annule'}
          {appointment.status === 'completed' && 'Termine'}
        </span>
        {!past && appointment.status === 'confirmed' && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {cancelling ? (
              <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <TrashIcon className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// PRESCRIPTION UPLOAD MODAL
// =============================================================================

function PrescriptionUploadModal({
  onClose,
  onUploaded,
}: {
  onClose: () => void
  onUploaded: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    if (f.type !== 'application/pdf') {
      setError('Seuls les fichiers PDF sont acceptes.')
      return
    }
    setError('')
    setFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      await prescriptionsApi.create(file)
      onUploaded()
    } catch {
      setError('Erreur lors de l\'envoi. Reessayez.')
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Ajouter une ordonnance</h2>
            <p className="text-sm text-gray-500 mt-0.5">Telechargez votre prescription au format PDF</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drop zone */}
        <div className="p-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
              ${dragOver
                ? 'border-primary-400 bg-primary-50'
                : file
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }}
            />

            {file ? (
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto rounded-xl bg-green-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} Ko</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null) }}
                  className="text-sm text-red-500 hover:underline"
                >
                  Supprimer
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto rounded-xl bg-gray-100 flex items-center justify-center">
                  <UploadIcon className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-primary-600">Cliquez pour selectionner</span> ou glissez-deposez
                </p>
                <p className="text-xs text-gray-400">PDF uniquement</p>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Envoi...</span>
              </>
            ) : (
              <span>Envoyer</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
