"use client"

import { useState, useEffect, useCallback } from "react"
import { Edit, Eye, X, Clock, CheckCircle, CreditCard, Download, RefreshCw, FileText, FileDown, User, Bell, Calendar, Phone, Mail, MapPin, Heart, Stethoscope, CalendarDays, AlertCircle, Trash, Plus, Search, Pill, Shield, XCircle, Star, Settings, Users, Activity, TrendingUp } from 'lucide-react'
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
  user: {
    id: string
    email: string
    fullName: string
  }
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
  patient: {
    id: string
    fullName: string
    email: string
    phone?: string
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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctorInfo, setDoctorInfo] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("appointments")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  
  // Dialog states
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showPatientDialog, setShowPatientDialog] = useState(false)
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false)

  const fetchDoctorData = useCallback(async () => {
    try {
      const token = localStorage.getItem("clinic_token")
      if (!token) return

      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }

      // Get doctor info
      const doctorRes = await fetch(`${API_URL}/auth/me`, { headers })
      if (doctorRes.ok) {
        const doctorData = await doctorRes.json()
        setDoctorInfo(doctorData)
      }

      // Get appointments
      const appointmentsRes = await fetch(`${API_URL}/appointments`, { headers })
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json()
        setAppointments(appointmentsData)
      }

      // Get patients
      const patientsRes = await fetch(`${API_URL}/patients`, { headers })
      if (patientsRes.ok) {
        const patientsData = await patientsRes.json()
        setPatients(patientsData)
      }

    } catch (error) {
      console.error("Error fetching doctor data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDoctorData()
  }, [fetchDoctorData])

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const token = localStorage.getItem("clinic_token")
      if (!token) return

      const response = await fetch(`${API_URL}/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        setAppointments(prev => prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status } : apt
        ))
      }
    } catch (error) {
      console.error("Error updating appointment status:", error)
    }
  }

  const createPrescription = async (appointmentId: string, prescriptionData: any) => {
    try {
      const token = localStorage.getItem("clinic_token")
      if (!token) return

      const response = await fetch(`${API_URL}/appointments/${appointmentId}/prescription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(prescriptionData)
      })

      if (response.ok) {
        setShowPrescriptionDialog(false)
        setSelectedAppointment(null)
        fetchDoctorData()
      }
    } catch (error) {
      console.error("Error creating prescription:", error)
    }
  }

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch = appointment.patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-full shadow-lg mb-4">
            <RefreshCw className="h-8 w-8 animate-spin text-white" />
          </div>
          <p className="text-gray-600">Chargement de votre espace médecin...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header Médecin */}
      <div className="bg-white border-b border-green-100 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Espace Médecin</h1>
                <p className="text-gray-600">Plateforme médicale - Clinique Santé Plus</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                <User className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">{doctorInfo?.fullName || 'Médecin'}</span>
              </div>
              <Button variant="outline" size="sm" className="border-green-200 text-green-600 hover:bg-green-50">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm" className="border-green-200 text-green-600 hover:bg-green-50">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-green-100 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Rendez-vous aujourd'hui</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {appointments.filter(apt => 
                      new Date(apt.appointmentDate).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CalendarDays className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-green-100 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Patients totaux</p>
                  <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-green-100 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Consultations terminées</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {appointments.filter(apt => apt.status === 'COMPLETED').length}
                  </p>
                </div>
                <div className="bg-emerald-100 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-green-100 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Taux de satisfaction</p>
                  <p className="text-2xl font-bold text-gray-900">4.8</p>
                </div>
                <div className="bg-amber-100 p-3 rounded-full">
                  <Star className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-green-200 p-1 rounded-lg shadow-sm">
            <TabsTrigger value="appointments" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <Calendar className="h-4 w-4 mr-2" />
              Rendez-vous
            </TabsTrigger>
            <TabsTrigger value="patients" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              Patients
            </TabsTrigger>
          </TabsList>

          {/* Onglet Rendez-vous */}
          <TabsContent value="appointments" className="space-y-6">
            <Card className="shadow-lg border-green-100">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-green-800 flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Mes Rendez-vous
                    </CardTitle>
                    <CardDescription className="text-green-600">
                      Gérez vos consultations et rendez-vous
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Rechercher un patient..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="SCHEDULED">Planifié</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmé</SelectItem>
                        <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                        <SelectItem value="COMPLETED">Terminé</SelectItem>
                        <SelectItem value="CANCELLED">Annulé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAppointments.map((appointment) => (
                    <Card key={appointment.id} className="border-green-100 hover:shadow-md transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusIcon(appointment.status)}
                            <span className="ml-1">{getStatusText(appointment.status)}</span>
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(appointment.appointmentDate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{appointment.patient.fullName}</h4>
                          <p className="text-sm text-gray-600">{appointment.type}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(appointment.appointmentDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        
                        {appointment.reason && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Motif:</p>
                            <p className="text-sm text-gray-600">{appointment.reason}</p>
                          </div>
                        )}

                        {appointment.symptoms && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Symptômes:</p>
                            <p className="text-sm text-gray-600">{appointment.symptoms}</p>
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
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

                        <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-green-200 text-green-600 hover:bg-green-50"
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
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => updateAppointmentStatus(appointment.id, 'CONFIRMED')}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Confirmer
                            </Button>
                          )}
                          
                          {appointment.status === "CONFIRMED" && (
                            <Button 
                              size="sm" 
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => updateAppointmentStatus(appointment.id, 'IN_PROGRESS')}
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Commencer
                            </Button>
                          )}
                          
                          {appointment.status === "IN_PROGRESS" && (
                            <>
                              <Button 
                                size="sm" 
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => {
                                  setSelectedAppointment(appointment)
                                  setShowPrescriptionDialog(true)
                                }}
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                Ordonnance
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => updateAppointmentStatus(appointment.id, 'COMPLETED')}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Terminer
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Patients */}
          <TabsContent value="patients" className="space-y-6">
            <Card className="shadow-lg border-green-100">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-green-800 flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Mes Patients
                    </CardTitle>
                    <CardDescription className="text-green-600">
                      Consultez les informations de vos patients
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Rechercher un patient..."
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {patients.map((patient) => (
                    <Card key={patient.id} className="border-green-100 hover:shadow-md transition-all cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-green-100 p-2 rounded-full">
                              <User className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{patient.fullName}</h4>
                              <p className="text-sm text-gray-600">{patient.user.email}</p>
                            </div>
                          </div>
                          <Badge className={patient.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {patient.isActive ? "Actif" : "Inactif"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          {patient.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-4 w-4 mr-2" />
                              {patient.phone}
                            </div>
                          )}
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            {patient.user.email}
                          </div>
                          {patient.address && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              {patient.address}
                            </div>
                          )}
                        </div>

                        {(patient.bloodType || patient.allergies || patient.chronicDiseases) && (
                          <div className="border-t pt-3 space-y-2">
                            {patient.bloodType && (
                              <div className="flex items-center text-sm">
                                <Heart className="h-4 w-4 mr-2 text-red-500" />
                                <span className="font-medium">Groupe:</span>
                                <span className="ml-1 text-gray-600">{patient.bloodType}</span>
                              </div>
                            )}
                            {patient.allergies && (
                              <div className="flex items-center text-sm">
                                <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                                <span className="font-medium">Allergies:</span>
                                <span className="ml-1 text-gray-600">{patient.allergies}</span>
                              </div>
                            )}
                            {patient.chronicDiseases && (
                              <div className="flex items-center text-sm">
                                <Shield className="h-4 w-4 mr-2 text-blue-500" />
                                <span className="font-medium">Maladies:</span>
                                <span className="ml-1 text-gray-600">{patient.chronicDiseases}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center space-x-2 pt-3 border-t">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-green-200 text-green-600 hover:bg-green-50"
                            onClick={() => {
                              setSelectedPatient(patient)
                              setShowPatientDialog(true)
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Détails
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Dossier
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog Détails Rendez-vous */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Détails du Rendez-vous
            </DialogTitle>
            <DialogDescription>
              Informations complètes du rendez-vous
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Patient</Label>
                  <p className="text-sm text-gray-900">{selectedAppointment.patient.fullName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedAppointment.appointmentDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Heure</Label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedAppointment.appointmentDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm text-gray-900">{selectedAppointment.type}</p>
                </div>
              </div>
              
              {selectedAppointment.reason && (
                <div>
                  <Label className="text-sm font-medium">Motif</Label>
                  <p className="text-sm text-gray-900">{selectedAppointment.reason}</p>
                </div>
              )}
              
              {selectedAppointment.symptoms && (
                <div>
                  <Label className="text-sm font-medium">Symptômes</Label>
                  <p className="text-sm text-gray-900">{selectedAppointment.symptoms}</p>
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

      {/* Dialog Détails Patient */}
      <Dialog open={showPatientDialog} onOpenChange={setShowPatientDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Détails du Patient
            </DialogTitle>
            <DialogDescription>
              Informations complètes du patient
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nom complet</Label>
                  <p className="text-sm text-gray-900">{selectedPatient.fullName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-gray-900">{selectedPatient.user.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Téléphone</Label>
                  <p className="text-sm text-gray-900">{selectedPatient.phone || 'Non renseigné'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Adresse</Label>
                  <p className="text-sm text-gray-900">{selectedPatient.address}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date de naissance</Label>
                  <p className="text-sm text-gray-900">{selectedPatient.dateOfBirth}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Statut</Label>
                  <p className="text-sm text-gray-900">{selectedPatient.isActive ? 'Actif' : 'Inactif'}</p>
                </div>
              </div>
              
              {(selectedPatient.bloodType || selectedPatient.allergies || selectedPatient.chronicDiseases) && (
                <div className="border-t pt-4 space-y-3">
                  <h4 className="font-medium text-gray-900">Informations médicales</h4>
                  {selectedPatient.bloodType && (
                    <div>
                      <Label className="text-sm font-medium">Groupe sanguin</Label>
                      <p className="text-sm text-gray-900">{selectedPatient.bloodType}</p>
                    </div>
                  )}
                  {selectedPatient.allergies && (
                    <div>
                      <Label className="text-sm font-medium">Allergies</Label>
                      <p className="text-sm text-gray-900">{selectedPatient.allergies}</p>
                    </div>
                  )}
                  {selectedPatient.chronicDiseases && (
                    <div>
                      <Label className="text-sm font-medium">Maladies chroniques</Label>
                      <p className="text-sm text-gray-900">{selectedPatient.chronicDiseases}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPatientDialog(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Ordonnance */}
      <Dialog open={showPrescriptionDialog} onOpenChange={setShowPrescriptionDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Créer une Ordonnance
            </DialogTitle>
            <DialogDescription>
              Rédigez une ordonnance pour ce patient
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="medications">Médicaments</Label>
              <Textarea
                id="medications"
                placeholder="Listez les médicaments (un par ligne)"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="Instructions pour le patient"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="followUp">Date de suivi</Label>
              <Input id="followUp" type="date" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrescriptionDialog(false)}>
              Annuler
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                if (selectedAppointment) {
                  createPrescription(selectedAppointment.id, {
                    medications: [],
                    instructions: '',
                    followUpDate: ''
                  })
                }
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Créer l'ordonnance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
