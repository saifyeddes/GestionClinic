"use client"

import { useState, useEffect, useCallback } from "react"
import { Edit, Eye, X, Clock, CheckCircle, CreditCard, Download, RefreshCw, FileText, FileDown, User, Bell, Calendar, Phone, Mail, MapPin, Heart, Stethoscope, CalendarDays, AlertCircle, Trash, Plus, Search, Pill, Shield, XCircle, Star, Settings } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Doctor {
  id: string
  fullName: string
  email: string
  specialization?: string
  avatar?: string
  rating?: number
  experience?: string
  consultationFee?: number
  available?: boolean
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
  price?: number
  doctor: {
    id: string
    fullName: string
    email: string
    specialization?: string
  }
  createdAt: string
  paymentStatus?: "PENDING" | "PAID" | "REFUNDED"
  prescriptionUrl?: string
  prescription?: {
    medications: string[]
    instructions: string
    followUpDate?: string
  }
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
  avatar?: string
}

interface PaymentData {
  cardNumber: string
  expiryDate: string
  cvv: string
  cardName: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patientInfo, setPatientInfo] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("appointments")
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  
  // Dialog states
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  
  // Form states
  const [newAppointment, setNewAppointment] = useState({
    doctorId: "",
    appointmentDate: "",
    time: "",
    type: "CONSULTATION",
    reason: "",
    symptoms: "",
    phone: ""
  })

  // État pour le calendrier
  const [showCalendar, setShowCalendar] = useState(false)
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState("")

  const [paymentData, setPaymentData] = useState<PaymentData>({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: ""
  })

  const [profileData, setProfileData] = useState({
    phone: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    bloodType: "",
    allergies: "",
    chronicDiseases: ""
  })

  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    pendingPayments: 0
  })

  // Initialize profile data when patient info loads
  useEffect(() => {
    if (patientInfo) {
      setProfileData({
        phone: patientInfo.phone || "",
        address: patientInfo.address || "",
        emergencyContact: patientInfo.emergencyContact || "",
        emergencyPhone: patientInfo.emergencyPhone || "",
        bloodType: patientInfo.bloodType || "",
        allergies: patientInfo.allergies || "",
        chronicDiseases: patientInfo.chronicDiseases || ""
      })
    }
  }, [patientInfo])

  const fetchPatientData = useCallback(async () => {
    try {
      const token = localStorage.getItem("clinic_token")
      if (!token) return

      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }

      // Get patient info
      const patientRes = await fetch(`${API_URL}/auth/me`, { headers })
      if (patientRes.ok) {
        const patientData = await patientRes.json()
        setPatientInfo(patientData)
      }

      // Get appointments - utiliser l'endpoint spécifique pour les patients
      const appointmentsRes = await fetch(`${API_URL}/appointments/patient`, { headers })
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json()
        setAppointments(appointmentsData)
      }

      // Get doctors
      const doctorsRes = await fetch(`${API_URL}/appointments/doctors`, { headers })
      if (doctorsRes.ok) {
        const doctorsData = await doctorsRes.json()
        setDoctors(doctorsData)
      }

      // Calculate stats
      const today = new Date()
      const upcoming = appointments.filter(apt => 
        new Date(apt.appointmentDate) > today && 
        ['SCHEDULED', 'CONFIRMED'].includes(apt.status)
      ).length
      const completed = appointments.filter(apt => apt.status === 'COMPLETED').length
      const pendingPayments = appointments.filter(apt => apt.paymentStatus === 'PENDING').length

      setStats({
        totalAppointments: appointments.length,
        upcomingAppointments: upcoming,
        completedAppointments: completed,
        pendingPayments: pendingPayments
      })
    } catch (error) {
      console.error("Error fetching patient data:", error)
    } finally {
      setLoading(false)
    }
  }, [appointments])

  useEffect(() => {
    fetchPatientData()
  }, [fetchPatientData])

  // Générer des dates disponibles (simulation)
  const generateAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      // Éviter les weekends
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split('T')[0])
      }
    }
    
    setAvailableDates(dates)
  }

  // Ouvrir le calendrier
  const openCalendar = () => {
    generateAvailableDates()
    setShowCalendar(true)
  }

  // Sélectionner une date depuis le calendrier
  const selectDate = (date: string) => {
    setNewAppointment(prev => ({ ...prev, appointmentDate: date }))
    setSelectedDate(date)
    setShowCalendar(false)
  }

  const createAppointment = async () => {
    try {
      const token = localStorage.getItem("clinic_token")
      if (!token) {
        alert("Vous devez être connecté pour prendre un rendez-vous")
        return
      }

      // Vérifier que tous les champs obligatoires sont remplis
      if (!newAppointment.doctorId || !newAppointment.appointmentDate || !newAppointment.time) {
        alert("Veuillez remplir tous les champs obligatoires")
        return
      }

      // Données formatées pour le nouvel endpoint patient
      const appointmentData = {
        doctorId: newAppointment.doctorId,
        appointmentDate: `${newAppointment.appointmentDate}T${newAppointment.time}:00`,
        type: newAppointment.type,
        reason: newAppointment.reason || "Consultation générale",
        symptoms: newAppointment.symptoms || "",
        duration: 30
      }

      console.log("Données envoyées à PostgreSQL (endpoint patient):", appointmentData)

      // Utiliser le nouvel endpoint pour patients
      const response = await fetch(`${API_URL}/appointments/patient-request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      })

      if (response.ok) {
        const createdAppointment = await response.json()
        console.log("✅ Rendez-vous créé dans PostgreSQL:", createdAppointment)
        
        fetchPatientData()
        
        setShowAppointmentForm(false)
        setNewAppointment({
          doctorId: "",
          appointmentDate: "",
          time: "",
          type: "CONSULTATION",
          reason: "",
          symptoms: "",
          phone: ""
        })
        
        alert("🎉 Rendez-vous créé avec succès et enregistré dans la base de données!")
        return
      } else {
        const errorData = await response.json()
        console.error("❌ Erreur lors de la création:", errorData)
        alert(`Erreur: ${errorData.message || 'Impossible de créer le rendez-vous'}`)
      }
      
    } catch (error) {
      console.error("❌ Erreur réseau:", error)
      alert("Erreur de connexion. Veuillez réessayer.")
    }
  }

  const cancelAppointment = async () => {
    if (!selectedAppointment) return
    
    try {
      const token = localStorage.getItem("clinic_token")
      if (!token) return

      const response = await fetch(`${API_URL}/appointments/${selectedAppointment.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'CANCELLED' })
      })

      if (response.ok) {
        setAppointments(prev => prev.map(apt => 
          apt.id === selectedAppointment.id ? { ...apt, status: 'CANCELLED' } : apt
        ))
        setShowCancelDialog(false)
        setSelectedAppointment(null)
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error)
    }
  }

  const deleteAppointment = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem("clinic_token")
      if (!token) {
        alert("Vous devez être connecté pour supprimer un rendez-vous")
        return
      }

      const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        alert("✅ Rendez-vous supprimé avec succès")
        fetchPatientData()
        setShowCancelDialog(false)
        setSelectedAppointment(null)
      } else {
        const errorData = await response.json()
        alert(`Erreur: ${errorData.message || 'Impossible de supprimer le rendez-vous'}`)
      }
    } catch (error) {
      console.error("❌ Erreur lors de la suppression:", error)
      alert("Erreur de connexion. Veuillez réessayer.")
    }
  }

  const updateAppointment = async (appointmentId: string, updateData: Partial<Appointment>) => {
    try {
      const token = localStorage.getItem("clinic_token")
      if (!token) {
        alert("Vous devez être connecté pour modifier un rendez-vous")
        return
      }

      const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        alert("✅ Rendez-vous modifié avec succès")
        fetchPatientData()
        setShowEditDialog(false)
        setSelectedAppointment(null)
      } else {
        const errorData = await response.json()
        alert(`Erreur: ${errorData.message || 'Impossible de modifier le rendez-vous'}`)
      }
    } catch (error) {
      console.error("❌ Erreur lors de la modification:", error)
      alert("Erreur de connexion. Veuillez réessayer.")
    }
  }

  const downloadPrescription = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem("clinic_token")
      if (!token) return

      // Simulate PDF download
      const response = await fetch(`${API_URL}/appointments/${appointmentId}/prescription`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ordonnance-${appointmentId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        // Fallback: create a simple PDF-like content
        const appointment = appointments.find(apt => apt.id === appointmentId)
        if (appointment && appointment.prescription) {
          const content = `
ORDONNANCE MÉDICALE
==================
Dr. ${appointment.doctor.fullName}
${appointment.doctor.specialization || 'Médecin'}

Patient: ${patientInfo?.fullName}
Date: ${new Date(appointment.appointmentDate).toLocaleDateString('fr-FR')}

Médicaments:
${appointment.prescription.medications.map(med => `- ${med}`).join('\n')}

Instructions:
${appointment.prescription.instructions}

${appointment.prescription.followUpDate ? `Suivi: ${appointment.prescription.followUpDate}` : ''}
          `.trim()
          
          const blob = new Blob([content], { type: 'text/plain' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `ordonnance-${appointmentId}.txt`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }
      }
    } catch (error) {
      console.error("Error downloading prescription:", error)
    }
  }

  const processPayment = async () => {
    if (!selectedAppointment) return
    
    try {
      const token = localStorage.getItem("clinic_token")
      if (!token) return

      // Simulate payment processing
      const paymentResponse = await fetch(`${API_URL}/appointments/${selectedAppointment.id}/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: selectedAppointment.price || 50,
          paymentMethod: 'credit_card',
          cardInfo: {
            last4: paymentData.cardNumber.slice(-4),
            expiry: paymentData.expiryDate
          }
        })
      })

      if (paymentResponse.ok) {
        setAppointments(prev => prev.map(apt => 
          apt.id === selectedAppointment.id ? { ...apt, paymentStatus: 'PAID' } : apt
        ))
        setShowPaymentDialog(false)
        setPaymentData({
          cardNumber: "",
          expiryDate: "",
          cvv: "",
          cardName: ""
        })
        setSelectedAppointment(null)
      }
    } catch (error) {
      console.error("Error processing payment:", error)
    }
  }

  const updateProfile = async () => {
    try {
      const token = localStorage.getItem("clinic_token")
      if (!token) return

      const response = await fetch(`${API_URL}/patients/profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      })

      if (response.ok) {
        setPatientInfo(prev => prev ? { ...prev, ...profileData } : null)
        setShowProfileDialog(false)
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch = appointment.doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED": 
      case "COMPLETED":
      case "PAID": 
        return "bg-green-100 text-green-800 border-green-200"
      case "SCHEDULED":
      case "IN_PROGRESS": 
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "CANCELLED":
      case "NO_SHOW":
      case "REFUNDED": 
        return "bg-red-100 text-red-800 border-red-200"
      case "PENDING": 
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default: 
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED": 
      case "COMPLETED":
      case "PAID": 
        return <CheckCircle className="h-4 w-4" />
      case "SCHEDULED":
      case "IN_PROGRESS": 
        return <Clock className="h-4 w-4" />
      case "CANCELLED":
      case "NO_SHOW":
      case "REFUNDED": 
        return <X className="h-4 w-4" />
      case "PENDING": 
        return <CreditCard className="h-4 w-4" />
      default: 
        return <Clock className="h-4 w-4" />
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
      case "PENDING": return "En attente"
      case "PAID": return "Payé"
      case "REFUNDED": return "Remboursé"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-4 rounded-full shadow-lg mb-4">
            <RefreshCw className="h-8 w-8 animate-spin text-white" />
          </div>
          <p className="text-gray-600">Chargement de votre espace patient...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header Patient */}
      <div className="bg-white border-b border-blue-100 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl shadow-lg">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Espace Patient</h1>
                <p className="text-gray-600">Plateforme médicale - Clinique Santé Plus</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">{patientInfo?.fullName || 'Patient'}</span>
              </div>
              <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
              <Button onClick={fetchPatientData} variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Cartes de statistiques améliorées */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Rendez-vous</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalAppointments}</p>
                  <p className="text-blue-100 text-xs mt-2">Historique complet</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <CalendarDays className="h-8 w-8 text-blue-200" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">À Venir</p>
                  <p className="text-3xl font-bold mt-1">{stats.upcomingAppointments}</p>
                  <p className="text-emerald-100 text-xs mt-2">Prochains rendez-vous</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <Clock className="h-8 w-8 text-emerald-200" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Consultations</p>
                  <p className="text-3xl font-bold mt-1">{stats.completedAppointments}</p>
                  <p className="text-purple-100 text-xs mt-2">Suivi médical</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <CheckCircle className="h-8 w-8 text-purple-200" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Paiements</p>
                  <p className="text-3xl font-bold mt-1">{stats.pendingPayments}</p>
                  <p className="text-amber-100 text-xs mt-2">En attente</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <CreditCard className="h-8 w-8 text-amber-200" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets principaux */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-blue-200 rounded-lg p-1 shadow-sm">
            <TabsTrigger value="appointments" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all">
              <Calendar className="h-4 w-4 mr-2" />
              Rendez-vous
            </TabsTrigger>
            <TabsTrigger value="medical" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all">
              <FileText className="h-4 w-4 mr-2" />
              Dossiers Médicaux
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all">
              <CreditCard className="h-4 w-4 mr-2" />
              Paiements
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all">
              <User className="h-4 w-4 mr-2" />
              Mon Profil
            </TabsTrigger>
          </TabsList>

          {/* Onglet Rendez-vous */}
          <TabsContent value="appointments" className="space-y-6">
            <Card className="shadow-lg border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-blue-800 flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Mes Rendez-vous
                    </CardTitle>
                    <CardDescription className="text-blue-600">Gérez vos consultations médicales</CardDescription>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700 transition-all" onClick={() => setShowAppointmentForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau Rendez-vous
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Filtres améliorés */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Rechercher un médecin, type de consultation..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-blue-200 focus:border-blue-400 transition-colors"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48 border-blue-200">
                      <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="SCHEDULED">Planifiés</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmés</SelectItem>
                      <SelectItem value="COMPLETED">Terminés</SelectItem>
                      <SelectItem value="CANCELLED">Annulés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Liste des rendez-vous améliorée */}
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <Card key={appointment.id} className="border-blue-100 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                              <Stethoscope className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{appointment.doctor.fullName}</h3>
                              <p className="text-sm text-gray-600">{appointment.doctor.specialization || 'Médecin'}</p>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="text-sm text-gray-500 flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(appointment.appointmentDate).toLocaleDateString('fr-FR')}
                                </span>
                                <span className="text-sm text-gray-500 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {new Date(appointment.appointmentDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              {appointment.reason && (
                                <p className="text-sm text-gray-600 mt-1">Motif: {appointment.reason}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(appointment.status)}>
                                {getStatusIcon(appointment.status)}
                                <span className="ml-1">{getStatusText(appointment.status)}</span>
                              </Badge>
                              <Badge variant="outline" className="border-blue-200 text-blue-600">
                                {getTypeText(appointment.type)}
                              </Badge>
                            </div>
                            {appointment.paymentStatus && (
                              <Badge className={getStatusColor(appointment.paymentStatus)}>
                                {getStatusIcon(appointment.paymentStatus)}
                                <span className="ml-1">{getStatusText(appointment.paymentStatus)}</span>
                              </Badge>
                            )}
                            {appointment.price && (
                              <span className="text-sm font-medium text-gray-700">
                                {appointment.price}€
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                            onClick={() => {
                              setSelectedAppointment(appointment)
                              setShowDetailsDialog(true)
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Détails
                          </Button>
                          {appointment.status === "SCHEDULED" && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-amber-200 text-amber-600 hover:bg-amber-50 transition-colors"
                              onClick={() => {
                                setSelectedAppointment(appointment)
                                setShowEditDialog(true)
                              }}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                            Modifier
                            </Button>
                          )}
                          {appointment.status === "SCHEDULED" && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                              onClick={() => {
                                setSelectedAppointment(appointment)
                                setShowCancelDialog(true)
                              }}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Annuler
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-red-600 text-red-600 hover:bg-red-50 transition-colors"
                            onClick={() => {
                              if (confirm("Êtes-vous sûr de vouloir supprimer ce rendez-vous ?")) {
                                deleteAppointment(appointment.id)
                              }
                            }}
                          >
                            <Trash className="h-3 w-3 mr-1" />
                            Supprimer
                          </Button>
                          {appointment.status === "COMPLETED" && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-green-200 text-green-600 hover:bg-green-50 transition-colors"
                              onClick={() => downloadPrescription(appointment.id)}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Ordonnance PDF
                            </Button>
                          )}
                          {appointment.paymentStatus === "PENDING" && (
                            <Button 
                              size="sm" 
                              className="bg-amber-600 hover:bg-amber-700 transition-colors"
                              onClick={() => {
                                setSelectedAppointment(appointment)
                                setShowPaymentDialog(true)
                              }}
                            >
                              <CreditCard className="h-3 w-3 mr-1" />
                              Payer
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Dossiers Médicaux */}
          <TabsContent value="medical" className="space-y-6">
            <Card className="shadow-lg border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle className="text-blue-800 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Mon Dossier Médical
                </CardTitle>
                <CardDescription className="text-blue-600">Historique de vos consultations et ordonnances</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="border-blue-100 hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <FileText className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">Consultations</h3>
                      <p className="text-sm text-gray-600 mb-4">{stats.completedAppointments} consultations terminées</p>
                      <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 w-full">
                        <FileDown className="h-4 w-4 mr-2" />
                        Voir toutes
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-blue-100 hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <Pill className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">Ordonnances</h3>
                      <p className="text-sm text-gray-600 mb-4">Téléchargez vos ordonnances</p>
                      <Button variant="outline" className="border-green-200 text-green-600 hover:bg-green-50 w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-blue-100 hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <Shield className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">Analytiques</h3>
                      <p className="text-sm text-gray-600 mb-4">Résultats d&apos;analyses</p>
                      <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50 w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Consulter
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Paiements */}
          <TabsContent value="payments" className="space-y-6">
            <Card className="shadow-lg border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle className="text-blue-800 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Mes Paiements
                </CardTitle>
                <CardDescription className="text-blue-600">Historique et gestion des paiements</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {appointments.filter(apt => apt.paymentStatus).map((appointment) => (
                    <Card key={appointment.id} className="border-blue-100">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{appointment.doctor.fullName}</h4>
                            <p className="text-sm text-gray-600">{new Date(appointment.appointmentDate).toLocaleDateString('fr-FR')}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{appointment.price || 50}€</p>
                            <Badge className={getStatusColor(appointment.paymentStatus || 'PENDING')}>
                              {getStatusText(appointment.paymentStatus || 'PENDING')}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Profil */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="shadow-lg border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle className="text-blue-800 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Mon Profil
                </CardTitle>
                <CardDescription className="text-blue-600">Informations personnelles et médicales</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Informations personnelles
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Nom:</span>
                        <span className="text-sm font-medium">{patientInfo?.fullName || 'Non renseigné'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm font-medium">{patientInfo?.email || 'Non renseigné'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Téléphone:</span>
                        <span className="text-sm font-medium">{patientInfo?.phone || 'Non renseigné'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Adresse:</span>
                        <span className="text-sm font-medium">{patientInfo?.address || 'Non renseigné'}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Heart className="h-4 w-4 mr-2" />
                      Informations médicales
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Groupe sanguin:</span>
                        <span className="text-sm font-medium">{patientInfo?.bloodType || 'Non renseigné'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Allergies:</span>
                        <span className="text-sm font-medium">{patientInfo?.allergies || 'Aucune'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Pill className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Maladies chroniques:</span>
                        <span className="text-sm font-medium">{patientInfo?.chronicDiseases || 'Aucune'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 mt-6">
                  <Button 
                    variant="outline" 
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                    onClick={() => setShowProfileDialog(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier mon profil
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>

      {/* Modal Nouveau Rendez-vous avec design moderne */}
        {showAppointmentForm && (
          <div className="fixed inset-0 bg-linear-to-br from-blue-900/80 via-cyan-900/70 to-teal-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header avec dégradé */}
              <div className="bg-linear-to-r from-blue-600 to-cyan-600 p-6 rounded-t-3xl border-b border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Nouveau Rendez-vous</h2>
                      <p className="text-blue-100 mt-1">Prenez rendez-vous avec un de nos médecins</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAppointmentForm(false)}
                    className="text-white/80 hover:text-white hover:bg-white/20 backdrop-blur-sm"
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              {/* Contenu avec background subtil */}
              <div className="p-6 bg-linear-to-br from-blue-50/50 via-white to-cyan-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="doctor">Médecin</Label>
                    <Select value={newAppointment.doctorId} onValueChange={(value) => setNewAppointment(prev => ({ ...prev, doctorId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un médecin" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            <div className="flex items-center">
                              <div>
                                <div className="font-medium">{doctor.fullName}</div>
                                <div className="text-sm text-gray-500">{doctor.specialization || 'Médecin'}</div>
                                {doctor.rating && (
                                  <div className="flex items-center text-xs text-amber-600">
                                    <Star className="h-3 w-3 mr-1" />
                                    {doctor.rating}
                                  </div>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="type">Type de consultation</Label>
                    <Select value={newAppointment.type} onValueChange={(value) => setNewAppointment(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CONSULTATION">Consultation</SelectItem>
                        <SelectItem value="FOLLOW_UP">Suivi</SelectItem>
                        <SelectItem value="EMERGENCY">Urgence</SelectItem>
                        <SelectItem value="CHECK_UP">Contrôle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={newAppointment.phone}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Votre numéro de téléphone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date du rendez-vous</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="date"
                        type="date"
                        value={newAppointment.appointmentDate}
                        onChange={(e) => setNewAppointment(prev => ({ ...prev, appointmentDate: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={openCalendar}
                        className="px-3"
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="time">Heure</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="reason">Motif de consultation</Label>
                    <Textarea
                      id="reason"
                      value={newAppointment.reason}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Décrivez brièvement le motif de votre consultation..."
                      rows={3}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="symptoms">Symptômes</Label>
                    <Textarea
                      id="symptoms"
                      value={newAppointment.symptoms}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, symptoms: e.target.value }))}
                      placeholder="Décrivez vos symptômes..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              
              {/* Footer avec design moderne */}
              <div className="p-6 bg-linear-to-r from-blue-50 to-cyan-50 border-t border-blue-100 rounded-b-3xl">
                <div className="flex space-x-3">
                  <Button 
                    onClick={createAppointment} 
                    className="bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white flex-1 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Prendre rendez-vous
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAppointmentForm(false)} 
                    className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Calendrier */}
        {showCalendar && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                    Choisir une date disponible
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCalendar(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {availableDates.map((date) => {
                    const dateObj = new Date(date)
                    const dayOfWeek = dateObj.getDay()
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
                    
                    return (
                      <Button
                        key={date}
                        variant={selectedDate === date ? "default" : "outline"}
                        className={`h-12 text-sm ${isWeekend ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'hover:bg-blue-50 hover:border-blue-300'}`}
                        onClick={() => !isWeekend && selectDate(date)}
                        disabled={isWeekend}
                      >
                        {dateObj.getDate()}
                      </Button>
                    )
                  })}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Information:</strong> Les dates en gris sont les weekends. 
                    Cliquez sur une date disponible pour la sélectionner.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Dialog Détails Rendez-vous */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Détails du Rendez-vous
            </DialogTitle>
            <DialogDescription>
              Informations complètes de votre consultation
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Médecin</Label>
                  <p className="font-semibold">{selectedAppointment.doctor.fullName}</p>
                  <p className="text-sm text-gray-500">{selectedAppointment.doctor.specialization || 'Médecin'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Type</Label>
                  <p className="font-semibold">{getTypeText(selectedAppointment.type)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Date</Label>
                  <p className="font-semibold">{new Date(selectedAppointment.appointmentDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Heure</Label>
                  <p className="font-semibold">{new Date(selectedAppointment.appointmentDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              {selectedAppointment.reason && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Motif</Label>
                  <p className="text-gray-700">{selectedAppointment.reason}</p>
                </div>
              )}
              {selectedAppointment.symptoms && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Symptômes</Label>
                  <p className="text-gray-700">{selectedAppointment.symptoms}</p>
                </div>
              )}
              {selectedAppointment.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Notes du médecin</Label>
                  <p className="text-gray-700">{selectedAppointment.notes}</p>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Label className="text-sm font-medium text-gray-600">Statut:</Label>
                <Badge className={getStatusColor(selectedAppointment.status)}>
                  {getStatusIcon(selectedAppointment.status)}
                  <span className="ml-1">{getStatusText(selectedAppointment.status)}</span>
                </Badge>
              </div>
              {selectedAppointment.paymentStatus && (
                <div className="flex items-center space-x-2">
                  <Label className="text-sm font-medium text-gray-600">Paiement:</Label>
                  <Badge className={getStatusColor(selectedAppointment.paymentStatus)}>
                    {getStatusIcon(selectedAppointment.paymentStatus)}
                    <span className="ml-1">{getStatusText(selectedAppointment.paymentStatus)}</span>
                  </Badge>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Annulation Rendez-vous */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Annuler le Rendez-vous
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir annuler ce rendez-vous ?
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="font-semibold text-red-800">{selectedAppointment.doctor.fullName}</p>
                <p className="text-sm text-red-600">
                  {new Date(selectedAppointment.appointmentDate).toLocaleDateString('fr-FR')} à{' '}
                  {new Date(selectedAppointment.appointmentDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <p className="text-sm text-gray-600">
                Cette action est irréversible. Vous devrez prendre un nouveau rendez-vous.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={cancelAppointment}>
              <X className="h-4 w-4 mr-2" />
              Confirmer l&apos;annulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Paiement */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payer la Consultation
            </DialogTitle>
            <DialogDescription>
              Informations de paiement sécurisées
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="font-semibold text-blue-800">{selectedAppointment.doctor.fullName}</p>
                <p className="text-sm text-blue-600">
                  {new Date(selectedAppointment.appointmentDate).toLocaleDateString('fr-FR')} à{' '}
                  {new Date(selectedAppointment.appointmentDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-lg font-bold text-blue-900 mt-2">
                  Montant: {selectedAppointment.price || 50}€
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardName">Nom sur la carte</Label>
                  <Input
                    id="cardName"
                    value={paymentData.cardName}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, cardName: e.target.value }))}
                    placeholder="Jean Dupont"
                  />
                </div>
                <div>
                  <Label htmlFor="cardNumber">Numéro de carte</Label>
                  <Input
                    id="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: e.target.value }))}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Date d&apos;expiration</Label>
                    <Input
                      id="expiryDate"
                      value={paymentData.expiryDate}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, expiryDate: e.target.value }))}
                      placeholder="MM/AA"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      value={paymentData.cvv}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value }))}
                      placeholder="123"
                      maxLength={3}
                      type="password"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-700 flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  Paiement sécurisé via notre partenaire bancaire
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Annuler
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={processPayment}>
              <CreditCard className="h-4 w-4 mr-2" />
              Payer {selectedAppointment?.price || 50}€
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Profil */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="h-5 w-5 mr-2" />
              Modifier mon Profil
            </DialogTitle>
            <DialogDescription>
              Mettez à jour vos informations personnelles et médicales
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="0123456789"
                />
              </div>
              <div>
                <Label htmlFor="bloodType">Groupe sanguin</Label>
                <Select value={profileData.bloodType} onValueChange={(value) => setProfileData(prev => ({ ...prev, bloodType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={profileData.address}
                onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 rue de la Santé, 75000 Paris"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContact">Contact d&apos;urgence</Label>
                <Input
                  id="emergencyContact"
                  value={profileData.emergencyContact}
                  onChange={(e) => setProfileData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  placeholder="Nom du contact"
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Téléphone d&apos;urgence</Label>
                <Input
                  id="emergencyPhone"
                  value={profileData.emergencyPhone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                  placeholder="0123456789"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                value={profileData.allergies}
                onChange={(e) => setProfileData(prev => ({ ...prev, allergies: e.target.value }))}
                placeholder="Listez vos allergies (séparez par des virgules)"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="chronicDiseases">Maladies chroniques</Label>
              <Textarea
                id="chronicDiseases"
                value={profileData.chronicDiseases}
                onChange={(e) => setProfileData(prev => ({ ...prev, chronicDiseases: e.target.value }))}
                placeholder="Listez vos maladies chroniques (séparez par des virgules)"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProfileDialog(false)}>
              Annuler
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={updateProfile}>
              <Edit className="h-4 w-4 mr-2" />
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Modification Rendez-vous */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="h-5 w-5 mr-2" />
              Modifier le Rendez-vous
            </DialogTitle>
            <DialogDescription>
              Modifiez les informations de votre rendez-vous
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editDoctor">Médecin</Label>
                <Select value={selectedAppointment.doctor.id} disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un médecin" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.fullName} - {doctor.specialization || 'Médecin'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editDate">Date</Label>
                <Input
                  id="editDate"
                  type="date"
                  value={new Date(selectedAppointment.appointmentDate).toISOString().split('T')[0]}
                  onChange={(e) => {
                    const time = new Date(selectedAppointment.appointmentDate).toTimeString().slice(0, 5)
                    setSelectedAppointment(prev => prev ? {
                      ...prev,
                      appointmentDate: `${e.target.value}T${time}:00`
                    } : null)
                  }}
                />
              </div>
              <div>
                <Label htmlFor="editTime">Heure</Label>
                <Input
                  id="editTime"
                  type="time"
                  value={new Date(selectedAppointment.appointmentDate).toTimeString().slice(0, 5)}
                  onChange={(e) => {
                    const date = new Date(selectedAppointment.appointmentDate).toISOString().split('T')[0]
                    setSelectedAppointment(prev => prev ? {
                      ...prev,
                      appointmentDate: `${date}T${e.target.value}:00`
                    } : null)
                  }}
                />
              </div>
              <div>
                <Label htmlFor="editType">Type de consultation</Label>
                <Select 
                  value={selectedAppointment.type} 
                  onValueChange={(value) => setSelectedAppointment(prev => prev ? {...prev, type: value} : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONSULTATION">Consultation</SelectItem>
                    <SelectItem value="FOLLOW_UP">Suivi</SelectItem>
                    <SelectItem value="EMERGENCY">Urgence</SelectItem>
                    <SelectItem value="SURGERY">Chirurgie</SelectItem>
                    <SelectItem value="VACCINATION">Vaccination</SelectItem>
                    <SelectItem value="CHECK_UP">Contrôle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editReason">Motif</Label>
                <Textarea
                  id="editReason"
                  value={selectedAppointment.reason || ''}
                  onChange={(e) => setSelectedAppointment(prev => prev ? {...prev, reason: e.target.value} : null)}
                  placeholder="Décrivez le motif de votre consultation"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="editSymptoms">Symptômes</Label>
                <Textarea
                  id="editSymptoms"
                  value={selectedAppointment.symptoms || ''}
                  onChange={(e) => setSelectedAppointment(prev => prev ? {...prev, symptoms: e.target.value} : null)}
                  placeholder="Décrivez vos symptômes"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700" 
              onClick={() => {
                if (selectedAppointment) {
                  updateAppointment(selectedAppointment.id, {
                    appointmentDate: selectedAppointment.appointmentDate,
                    type: selectedAppointment.type,
                    reason: selectedAppointment.reason,
                    symptoms: selectedAppointment.symptoms
                  })
                }
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
  
