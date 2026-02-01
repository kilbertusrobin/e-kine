import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { appointmentsApi, careTypesApi, usersApi } from '../services/api'
import type { User, CareType, AvailableSlots } from '../types'

type Step = 1 | 2 | 3

export default function BookingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(1)

  // Step 1
  const [practitioners, setPractitioners] = useState<User[]>([])
  const [practitionerId, setPractitionerId] = useState('')
  const [careTypes, setCareTypes] = useState<CareType[]>([])
  const [selectedCareType, setSelectedCareType] = useState('')
  const [loadingStep1, setLoadingStep1] = useState(true)

  // Step 2
  const [selectedDate, setSelectedDate] = useState('')
  const [slots, setSlots] = useState<AvailableSlots | null>(null)
  const [selectedSlot, setSelectedSlot] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Step 3
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      usersApi.getPractitioners(),
      careTypesApi.getAll().catch(() => []),
    ]).then(([pracData, careData]) => {
      setPractitioners(Array.isArray(pracData) ? pracData : [])
      setCareTypes(Array.isArray(careData) ? careData : [])
    }).catch(() => {}).finally(() => setLoadingStep1(false))
  }, [])

  const fetchSlots = async (pracId: string, date: string) => {
    setLoadingSlots(true)
    setSelectedSlot('')
    setSlots(null)
    try {
      const data = await appointmentsApi.getAvailableSlots(pracId, date)
      if (data && Array.isArray(data.allSlots)) {
        setSlots(data)
      } else {
        setSlots({ date, practitionerId: pracId, availableSlots: [], allSlots: [] })
      }
    } catch (err) {
      console.error('fetchSlots error:', err)
      setSlots({ date, practitionerId: pracId, availableSlots: [], allSlots: [] })
    } finally {
      setLoadingSlots(false)
    }
  }

  const isWeekend = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.getDay() === 0 || d.getDay() === 6
  }

  useEffect(() => {
    if (practitionerId.trim() && selectedDate && !isWeekend(selectedDate)) {
      fetchSlots(practitionerId.trim(), selectedDate)
    }
  }, [practitionerId, selectedDate])

  const canGoToStep2 = practitionerId.trim().length > 0
  const canGoToStep3 = selectedSlot.length > 0

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    const body = {
      practitionerId,
      dateTime: selectedSlot,
      careTypeId: selectedCareType || undefined,
      notes: notes || undefined,
    }
    console.log('Creating appointment with:', body)
    try {
      await appointmentsApi.create(body)
      navigate('/dashboard')
    } catch (err) {
      console.error('Appointment creation error:', err)
      setError('Impossible de creer le rendez-vous. Verifiez les informations et reessayez.')
      setSubmitting(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  const formatSlotTime = (isoStr: string) => {
    try {
      const d = new Date(isoStr)
      if (isNaN(d.getTime())) return '--:--'
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return '--:--'
    }
  }

  const selectedDateObj = selectedDate ? new Date(selectedDate + 'T00:00:00') : null
  const selectedPractitioner = practitioners.find(p => p.id === practitionerId)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Retour</span>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Prendre rendez-vous</h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Stepper */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                ${step >= s
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-500'
                }
              `}>
                {step > s ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : s}
              </div>
              <span className={`ml-2 text-sm font-medium hidden sm:block ${step >= s ? 'text-gray-900' : 'text-gray-400'}`}>
                {s === 1 && 'Praticien'}
                {s === 2 && 'Creneau'}
                {s === 3 && 'Confirmation'}
              </span>
              {s < 3 && <div className={`w-12 sm:w-20 h-0.5 mx-3 ${step > s ? 'bg-primary-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Practitioner & Care Type */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Choisissez votre praticien</h2>
            <p className="text-sm text-gray-500 mb-6">Selectionnez un kinesitherapeute et le type de soin</p>

            {loadingStep1 ? (
              <div className="space-y-5">
                <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Praticien</label>
                  {practitioners.length > 0 ? (
                    <div className="relative">
                      <select
                        value={practitionerId}
                        onChange={(e) => setPractitionerId(e.target.value)}
                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900 bg-white appearance-none"
                      >
                        <option value="">Selectionnez un praticien</option>
                        {practitioners.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.profile?.firstName && p.profile?.lastName
                              ? `${p.profile.firstName} ${p.profile.lastName}`
                              : p.email}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        value={practitionerId}
                        onChange={(e) => setPractitionerId(e.target.value)}
                        placeholder="Entrez l'identifiant du praticien"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900 placeholder:text-gray-400"
                      />
                      <p className="text-xs text-gray-400 mt-1.5">La liste des praticiens n'est pas encore disponible. Entrez l'identifiant manuellement.</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type de soin</label>
                  <div className="relative">
                    <select
                      value={selectedCareType}
                      onChange={(e) => setSelectedCareType(e.target.value)}
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900 bg-white appearance-none"
                    >
                      <option value="">Consultation generale</option>
                      {careTypes.map(ct => (
                        <option key={ct.id} value={ct.id}>{ct.label}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!canGoToStep2}
                className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Date & Slot */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Choisissez un creneau</h2>
            <p className="text-sm text-gray-500 mb-6">Selectionnez une date puis un horaire disponible</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={today}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val && isWeekend(val)) {
                      setError('Les rendez-vous ne sont pas disponibles le week-end')
                      return
                    }
                    setError('')
                    setSelectedDate(val)
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900"
                />
                {error && !submitting && (
                  <p className="text-sm text-red-600 mt-2">{error}</p>
                )}
              </div>

              {selectedDate && !isWeekend(selectedDate) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Creneaux disponibles — {selectedDateObj ? selectedDateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}
                  </label>

                  {loadingSlots ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : slots?.allSlots && slots.allSlots.length > 0 ? (
                    <div className="space-y-4">
                      {/* Morning */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Matin</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {(slots.allSlots || [])
                            .filter(s => {
                              const h = new Date(s.dateTime).getHours()
                              return h >= 9 && h < 13
                            })
                            .map(s => (
                              <button
                                key={s.dateTime}
                                disabled={!s.available}
                                onClick={() => setSelectedSlot(s.dateTime)}
                                className={`
                                  py-3 px-2 rounded-xl text-sm font-medium transition-all
                                  ${!s.available
                                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                                    : selectedSlot === s.dateTime
                                      ? 'bg-primary-600 text-white shadow-md ring-2 ring-primary-300'
                                      : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                                  }
                                `}
                              >
                                {formatSlotTime(s.dateTime)}
                              </button>
                            ))}
                        </div>
                      </div>
                      {/* Afternoon */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Apres-midi</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {(slots.allSlots || [])
                            .filter(s => {
                              const h = new Date(s.dateTime).getHours()
                              return h >= 14 && h < 17
                            })
                            .map(s => (
                              <button
                                key={s.dateTime}
                                disabled={!s.available}
                                onClick={() => setSelectedSlot(s.dateTime)}
                                className={`
                                  py-3 px-2 rounded-xl text-sm font-medium transition-all
                                  ${!s.available
                                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                                    : selectedSlot === s.dateTime
                                      ? 'bg-primary-600 text-white shadow-md ring-2 ring-primary-300'
                                      : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                                  }
                                `}
                              >
                                {formatSlotTime(s.dateTime)}
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <p className="text-gray-500 text-sm">Aucun creneau disponible pour cette date</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Retour
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canGoToStep3}
                className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Confirmez votre rendez-vous</h2>
            <p className="text-sm text-gray-500 mb-6">Verifiez les informations avant de valider</p>

            {/* Summary */}
            <div className="bg-primary-50 rounded-xl p-5 mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Praticien</span>
                <span className="text-sm font-semibold text-gray-900">
                  {selectedPractitioner
                    ? (selectedPractitioner.profile?.firstName && selectedPractitioner.profile?.lastName
                      ? `${selectedPractitioner.profile.firstName} ${selectedPractitioner.profile.lastName}`
                      : selectedPractitioner.email)
                    : practitionerId}
                </span>
              </div>
              <div className="border-t border-primary-100" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Date</span>
                <span className="text-sm font-semibold text-gray-900">
                  {selectedDateObj ? selectedDateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                </span>
              </div>
              <div className="border-t border-primary-100" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Heure</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatSlotTime(selectedSlot)}
                </span>
              </div>
              <div className="border-t border-primary-100" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Type de soin</span>
                <span className="text-sm font-semibold text-gray-900">
                  {careTypes.find(c => c.id === selectedCareType)?.label || 'Consultation generale'}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optionnel)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Decrivez brievement le motif de votre consultation..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900 placeholder:text-gray-400 resize-none"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Retour
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-60 transition-colors flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Confirmation...</span>
                  </>
                ) : (
                  <span>Confirmer le rendez-vous</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
