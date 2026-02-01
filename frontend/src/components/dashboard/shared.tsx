import { useState, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, type View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { fr } from 'date-fns/locale/fr'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { profileApi } from '../../services/api'
import type { User, Profile, Appointment } from '../../types'

// =============================================================================
// CALENDAR CONFIG
// =============================================================================

const locales = { 'fr': fr }
export const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales })

export const calendarMessages = {
  allDay: 'Journee',
  previous: 'Precedent',
  next: 'Suivant',
  today: "Aujourd'hui",
  month: 'Mois',
  week: 'Semaine',
  day: 'Jour',
  agenda: 'Agenda',
  date: 'Date',
  time: 'Heure',
  event: 'Evenement',
  noEventsInRange: 'Aucun rendez-vous sur cette periode',
  showMore: (total: number) => `+ ${total} de plus`,
}

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  status: string
  appointment: Appointment
}

// =============================================================================
// CALENDAR COMPONENT
// =============================================================================

export function AppointmentCalendar({
  events,
  onSelectEvent,
  defaultView = 'month',
}: {
  events: CalendarEvent[]
  onSelectEvent?: (event: CalendarEvent) => void
  defaultView?: View
}) {
  const [view, setView] = useState<View>(defaultView)
  const [date, setDate] = useState(new Date())

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    let backgroundColor = '#2563eb'
    let borderColor = '#1d4ed8'

    if (event.status === 'cancelled') {
      backgroundColor = '#ef4444'
      borderColor = '#dc2626'
    } else if (event.status === 'completed') {
      backgroundColor = '#6b7280'
      borderColor = '#4b5563'
    }

    return {
      style: {
        backgroundColor,
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: '6px',
        color: 'white',
        fontSize: '12px',
        padding: '2px 6px',
        border: 'none',
        borderLeftWidth: '3px',
        borderLeftStyle: 'solid' as const,
        borderLeftColor: borderColor,
      },
    }
  }, [])

  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      view={view}
      onView={setView}
      date={date}
      onNavigate={setDate}
      culture="fr"
      messages={calendarMessages}
      eventPropGetter={eventStyleGetter}
      onSelectEvent={onSelectEvent}
      style={{ height: '100%' }}
      views={['month', 'week', 'day']}
      popup
    />
  )
}

// =============================================================================
// BENTO CARD
// =============================================================================

export function BentoCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-100 shadow-sm p-5 ${className}`}>
      {children}
    </div>
  )
}

// =============================================================================
// DASHBOARD SHELL (sidebar + layout)
// =============================================================================

export function DashboardShell({
  user,
  profile,
  menuItems,
  activeTab,
  onTabChange,
  onLogout,
  children,
}: {
  user: User | null
  profile: Profile | null
  menuItems: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[]
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-white rounded-lg shadow-md"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-200 z-50
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-100">
            <a href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">E-Kine</span>
            </a>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              {user?.googlePicture ? (
                <img src={user.googlePicture} alt="" className="w-12 h-12 rounded-full" />
              ) : (
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 font-semibold text-lg">
                    {profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {profile?.firstName && profile?.lastName
                    ? `${profile.firstName} ${profile.lastName}`
                    : user?.email}
                </p>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id)
                  setSidebarOpen(false)
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${activeTab === item.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
            >
              <LogoutIcon className="w-5 h-5" />
              <span className="font-medium">Deconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-72 min-h-screen">
        <div className="p-6 lg:p-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}

// =============================================================================
// PROFILE TAB
// =============================================================================

export function ProfileTab({
  profile,
  user,
  onUpdate,
}: {
  profile: Profile | null
  user: User | null
  onUpdate: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    pc: profile?.pc || '',
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      await profileApi.updateMe(formData)
      setEditing(false)
      onUpdate()
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mon profil</h1>
        <p className="text-gray-600 mt-1">Gerez vos informations personnelles</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 p-8">
          <div className="flex items-center space-x-6">
            {user?.googlePicture ? (
              <img src={user.googlePicture} alt="" className="w-24 h-24 rounded-full border-4 border-white shadow-lg" />
            ) : (
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-primary-600 font-bold text-3xl">
                  {profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
            <div className="text-white">
              <h2 className="text-2xl font-bold">
                {profile?.firstName && profile?.lastName
                  ? `${profile.firstName} ${profile.lastName}`
                  : 'Completez votre profil'}
              </h2>
              <p className="text-primary-100">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Informations personnelles</h3>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="text-primary-600 hover:text-primary-700 font-medium">
                Modifier
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <button onClick={() => setEditing(false)} className="text-gray-600 hover:text-gray-700 font-medium">
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileField label="Prenom" value={formData.firstName} editing={editing} onChange={(v) => setFormData({ ...formData, firstName: v })} />
            <ProfileField label="Nom" value={formData.lastName} editing={editing} onChange={(v) => setFormData({ ...formData, lastName: v })} />
            <ProfileField label="Telephone" value={formData.phone} editing={editing} onChange={(v) => setFormData({ ...formData, phone: v })} />
            <ProfileField label="Code postal" value={formData.pc} editing={editing} onChange={(v) => setFormData({ ...formData, pc: v })} />
            <ProfileField label="Ville" value={formData.city} editing={editing} onChange={(v) => setFormData({ ...formData, city: v })} />
            <ProfileField label="Adresse" value={formData.address} editing={editing} onChange={(v) => setFormData({ ...formData, address: v })} className="md:col-span-2" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Informations du compte</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Email</span>
            <span className="font-medium text-gray-900">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Compte verifie</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${user?.emailVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {user?.emailVerified ? 'Oui' : 'Non'}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-600">Membre depuis</span>
            <span className="font-medium text-gray-900">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProfileField({
  label, value, editing, onChange, className = '',
}: {
  label: string; value: string; editing: boolean; onChange: (v: string) => void; className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-600 mb-2">{label}</label>
      {editing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
        />
      ) : (
        <p className="text-gray-900 py-3">{value || '-'}</p>
      )}
    </div>
  )
}

// =============================================================================
// PROFILE COMPLETION MODAL
// =============================================================================

export function ProfileCompletionModal({
  profile, onClose, onSaved,
}: {
  profile: Profile | null; onClose: () => void; onSaved: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    pc: profile?.pc || '',
  })

  const handleSave = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Le prenom et le nom sont obligatoires.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await profileApi.updateMe(formData)
      onSaved()
    } catch {
      setError('Erreur lors de la sauvegarde. Reessayez.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Completez votre profil</h2>
            <p className="text-sm text-gray-500 mt-0.5">Ces informations sont necessaires pour utiliser la plateforme</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Prenom *</label>
              <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900" placeholder="Jean" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom *</label>
              <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900" placeholder="Dupont" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Telephone</label>
            <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900" placeholder="06 12 34 56 78" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
            <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900" placeholder="123 Rue de la Paix" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Code postal</label>
              <input type="text" value={formData.pc} onChange={(e) => setFormData({ ...formData, pc: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900" placeholder="75001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ville</label>
              <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900" placeholder="Paris" />
            </div>
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
            Plus tard
          </button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-60 transition-colors flex items-center space-x-2">
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
      </div>
    </div>
  )
}

// =============================================================================
// ICONS
// =============================================================================

export function HomeIcon({ className }: { className?: string }) {
  return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>)
}

export function CalendarIcon({ className }: { className?: string }) {
  return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>)
}

export function DocumentIcon({ className }: { className?: string }) {
  return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>)
}

export function UserIcon({ className }: { className?: string }) {
  return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>)
}

export function UsersIcon({ className }: { className?: string }) {
  return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>)
}

export function LogoutIcon({ className }: { className?: string }) {
  return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>)
}

export function PlusIcon({ className }: { className?: string }) {
  return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>)
}

export function UploadIcon({ className }: { className?: string }) {
  return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>)
}

export function DownloadIcon({ className }: { className?: string }) {
  return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>)
}

export function TrashIcon({ className }: { className?: string }) {
  return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>)
}

export function ClockIcon({ className }: { className?: string }) {
  return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>)
}

export function StethoscopeIcon({ className }: { className?: string }) {
  return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.8 2.3A.3.3 0 105.1 2H7.5a.3.3 0 01.3.3v.6a6 6 0 01-6 6h-.6a.3.3 0 01-.3-.3V7a.3.3 0 11.6 0" transform="translate(4, 1) scale(0.9)" /><circle cx="18" cy="14" r="2.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M18 11.5V8M9 12v1a5 5 0 005 5h1.5" /></svg>)
}

export function CheckIcon({ className }: { className?: string }) {
  return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>)
}
