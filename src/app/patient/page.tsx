"use client"

import { useState, useEffect, useCallback } from "react"
import { Calendar, Clock, Stethoscope, MapPin, CheckCircle, Plus, RefreshCw, AlertCircle, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface Doctor {
  id: string
  fullName: string
  email: string
  specialization?: string
}

interface Appointment {
  id: string
  appointmentDate: string
  status: "SCHEDULED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW"
  type: string
  reason?: string
  notes?: string
  symptoms?: string
  duration: number
  doctor: {
    id: string
    fullName: string
    email: string
    specialization?: string
  }
  createdAt: string
}

interface Patient {
  id: string
  fullName: string
  email: string
  phone?: string
  dateOfBirth: string
  address: string
  emergencyContact?: string
  emergencyPhone?: string
  bloodType?: string
  allergies?: string
  chronicDiseases?: string
  isActive: boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export default function PatientInterface() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patientInfo, setPatientInfo] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [lastAppointment, setLastAppointment] = useState<Appointment | null>(null)
  
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    doctorId: "",
    type: "CONSULTATION",
    reason: "",
    symptoms: ""
  })

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
  ]

  const appointmentTypes = [
    { value: "CONSULTATION", label: "Consultation" },
    { value: "FOLLOW_UP", label: "Suivi" },
    { value: "EMERGENCY", label: "Urgence" },
    { value: "SURGERY", label: "Chirurgie" },
    { value: "VACCINATION", label: "Vaccination" },
    { value: "CHECK_UP", label: "Contrôle" }
  ]

  const fetchPatientData = useCallback(async () => {
    try {
      const token = localStorage.getItem("clinic_token")
      if (!token) return

      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }

      // Get current user info
      const userRes = await fetch(`${API_URL}/auth/profile`, { headers })
      if (userRes.ok) {
        const userData = await userRes.json()
        
        // Get patient info
        const patientRes = await fetch(`${API_URL}/patients`, { headers })
        if (patientRes.ok) {
          const patientsData = await patientRes.json()
          const currentPatient = patientsData.find((p: Patient) => p.email === userData.email)
          setPatientInfo(currentPatient || null)
        }

        // Get patient's appointments
        if (patientInfo) {
          const appointmentsRes = await fetch(`${API_URL}/appointments/patient/${patientInfo.id}`, { headers })
          if (appointmentsRes.ok) {
            const appointmentsData = await appointmentsRes.json()
            setAppointments(appointmentsData)
          }
        }
      }

      // Get doctors
      const doctorsRes = await fetch(`${API_URL}/users?role=DOCTOR`, { headers })
      if (doctorsRes.ok) {
        const doctorsData = await doctorsRes.json()
        setDoctors(doctorsData)
      }
    } catch (error) {
      console.error("Error fetching patient data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPatientData()
  }, [fetchPatientData])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!patientInfo) return

    try {
      const token = localStorage.getItem("clinic_token")
      const response = await fetch(`${API_URL}/appointments`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          appointmentDate: `${formData.date}T${formData.time}:00`,
          type: formData.type,
          reason: formData.reason,
          symptoms: formData.symptoms,
          duration: 30,
          doctorId: formData.doctorId,
          patientId: patientInfo.id,
          createdById: patientInfo.id
        })
      })

      if (response.ok) {
        const newAppointment = await response.json()
        setLastAppointment(newAppointment)
        setIsSubmitted(true)
        setAppointments(prev => [newAppointment, ...prev])
        
        // Reset form
        setFormData({
          date: "",
          time: "",
          doctorId: "",
          type: "CONSULTATION",
          reason: "",
          symptoms: ""
        })
        
        setTimeout(() => setIsSubmitted(false), 5000)
      }
    } catch (error) {
      console.error("Error creating appointment:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED": 
      case "COMPLETED":
        return "text-green-600 bg-green-50"
      case "SCHEDULED":
      case "IN_PROGRESS": 
        return "text-blue-600 bg-blue-50"
      case "CANCELLED":
      case "NO_SHOW":
        return "text-red-600 bg-red-50"
      default: 
        return "text-yellow-600 bg-yellow-50"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED": 
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />
      case "SCHEDULED":
      case "IN_PROGRESS": 
        return <AlertCircle className="h-4 w-4" />
      default: 
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "SCHEDULED": return "Planifié"
      case "CONFIRMED": return "Confirmé"
      case "IN_PROGRESS": return "En cours"
      case "COMPLETED": return "Terminé"
      case "CANCELLED": return "Annulé"
      case "NO_SHOW": return "Absent"
      default: return status
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case "CONSULTATION": return "Consultation"
      case "FOLLOW_UP": return "Suivi"
      case "EMERGENCY": return "Urgence"
      case "SURGERY": return "Chirurgie"
      case "VACCINATION": return "Vaccination"
      case "CHECK_UP": return "Contrôle"
      default: return type
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de votre espace patient...</p>
        </div>
      </div>
    )
  }

  if (isSubmitted && lastAppointment) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Rendez-vous confirmé!</h2>
            <p className="text-gray-600 mb-4">
              Votre rendez-vous a été pris avec succès pour le {new Date(lastAppointment.appointmentDate).toLocaleDateString('fr-FR')} à {new Date(lastAppointment.appointmentDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.
            </p>
            <p className="text-sm text-gray-500">
              Un email de confirmation a été envoyé à {patientInfo?.email}
            </p>
            <Button 
              onClick={() => setIsSubmitted(false)} 
              className="mt-6 w-full"
            >
              Nouveau rendez-vous
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Stethoscope className="h-10 w-10 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Espace Patient</h1>
              <p className="text-gray-600">Clinique Santé Plus - {patientInfo?.fullName}</p>
            </div>
          </div>
          <Button onClick={fetchPatientData} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Appointment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-blue-600">Prendre un rendez-vous</CardTitle>
                <CardDescription>
                  Réservez votre consultation en quelques clics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Date du rendez-vous</span>
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange("date", e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time" className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>Heure</span>
                      </Label>
                      <Select value={formData.time} onValueChange={(value) => handleInputChange("time", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une heure" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="doctor" className="flex items-center space-x-2">
                        <Stethoscope className="h-4 w-4" />
                        <span>Médecin</span>
                      </Label>
                      <Select value={formData.doctorId} onValueChange={(value) => handleInputChange("doctorId", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un médecin" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              Dr. {doctor.fullName} {doctor.specialization && `- ${doctor.specialization}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type" className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>Type de consultation</span>
                      </Label>
                      <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          {appointmentTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason" className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Motif de consultation</span>
                    </Label>
                    <Textarea
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => handleInputChange("reason", e.target.value)}
                      placeholder="Décrivez brièvement le motif de votre consultation..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="symptoms" className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>Symptômes</span>
                    </Label>
                    <Textarea
                      id="symptoms"
                      value={formData.symptoms}
                      onChange={(e) => handleInputChange("symptoms", e.target.value)}
                      placeholder="Décrivez vos symptômes..."
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Confirmer la réservation
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Patient Info & Appointments */}
          <div className="space-y-6">
            {patientInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mes informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Nom</Label>
                    <p className="font-medium">{patientInfo.fullName}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="font-medium">{patientInfo.email}</p>
                  </div>
                  {patientInfo.phone && (
                    <div>
                      <Label>Téléphone</Label>
                      <p className="font-medium">{patientInfo.phone}</p>
                    </div>
                  )}
                  <div>
                    <Label>Date de naissance</Label>
                    <p className="font-medium">{new Date(patientInfo.dateOfBirth).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    <Label>Adresse</Label>
                    <p className="font-medium">{patientInfo.address}</p>
                  </div>
                  {patientInfo.bloodType && (
                    <div>
                      <Label>Groupe sanguin</Label>
                      <p className="font-medium text-red-600">{patientInfo.bloodType}</p>
                    </div>
                  )}
                  {patientInfo.allergies && (
                    <div>
                      <Label>Allergies</Label>
                      <p className="font-medium text-orange-600">{patientInfo.allergies}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {appointments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mes rendez-vous</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {appointments.slice(0, 5).map((appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">
                            {new Date(appointment.appointmentDate).toLocaleDateString('fr-FR')}
                          </span>
                          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {getStatusIcon(appointment.status)}
                            <span>{getStatusText(appointment.status)}</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>{new Date(appointment.appointmentDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                          <div>Dr. {appointment.doctor.fullName}</div>
                          <div>{getTypeText(appointment.type)}</div>
                          {appointment.reason && (
                            <div className="mt-1 text-xs">{appointment.reason}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
