"use client"

import { useState, useEffect, useCallback } from "react"
import { User, Phone, Mail, Stethoscope, Search, Edit, Eye, CheckCircle, XCircle, AlertCircle, Users, Plus, RefreshCw, Activity, FileText, TrendingUp, UserCheck, CalendarDays, Download, Heart, ClipboardList, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

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
  patient: {
    id: string
    fullName: string
    email: string
    phone?: string
  }
  createdBy: {
    id: string
    fullName: string
  }
  createdAt: string
}

interface MedicalRecord {
  id: string
  patientId: string
  doctorId: string
  diagnosis: string
  treatment: string
  notes?: string
  prescription?: string
  createdAt: string
  updatedAt: string
  patient: {
    fullName: string
    email: string
    dateOfBirth: string
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
  user: {
    id: string
    email: string
    fullName: string
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export default function DoctorInterface() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [doctorInfo, setDoctorInfo] = useState<{
    id: string
    fullName: string
    email: string
    specialization?: string
  } | null>(null)
  const [stats, setStats] = useState({
    todayAppointments: 0,
    completedAppointments: 0,
    totalPatients: 0,
    upcomingAppointments: 0
  })

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

      // Get medical records
      const recordsRes = await fetch(`${API_URL}/medical-records`, { headers })
      if (recordsRes.ok) {
        const recordsData = await recordsRes.json()
        setMedicalRecords(recordsData)
      }

      // Get patients
      const patientsRes = await fetch(`${API_URL}/patients`, { headers })
      if (patientsRes.ok) {
        const patientsData = await patientsRes.json()
        setPatients(patientsData)
      }

      // Calculate stats
      const today = new Date().toISOString().split('T')[0]
      const todayAppointments = appointments.filter(apt => apt.appointmentDate.startsWith(today)).length
      const completedAppointments = appointments.filter(apt => apt.status === 'COMPLETED').length
      const upcomingAppointments = appointments.filter(apt => apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED').length
      const uniquePatients = patients.length

      setStats({
        todayAppointments,
        completedAppointments,
        totalPatients: uniquePatients,
        upcomingAppointments
      })
    } catch (error) {
      console.error("Error fetching doctor data:", error)
    } finally {
      setLoading(false)
    }
  }, [appointments, patients.length])

  useEffect(() => {
    fetchDoctorData()
  }, [fetchDoctorData])

  const filteredAppointments = appointments.filter((appointment) => {
    const search = searchTerm.toLowerCase()
    const patientFullName = appointment.patient?.fullName?.toLowerCase() ?? ""
    const patientEmail = appointment.patient?.email?.toLowerCase() ?? ""
    const patientPhone = appointment.patient?.phone ?? ""
    const matchesSearch =
      search === "" ||
      patientFullName.includes(search) ||
      patientEmail.includes(search) ||
      patientPhone.includes(searchTerm)
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const updateAppointmentStatus = async (id: string, status: Appointment["status"]) => {
    try {
      const token = localStorage.getItem("clinic_token")
      if (!token) return

      const response = await fetch(`${API_URL}/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        setAppointments(prev => prev.map(apt => 
          apt.id === id ? { ...apt, status } : apt
        ))
        if (selectedAppointment?.id === id) {
          setSelectedAppointment(prev => prev ? { ...prev, status } : null)
        }
      }
    } catch (error) {
      console.error("Error updating appointment status:", error)
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
      case "CANCELLED":
      case "NO_SHOW": 
        return <XCircle className="h-4 w-4" />
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
      <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de votre espace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-teal-50">
      {/* Header Médecin */}
      <div className="bg-white border-b border-emerald-100 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-linear-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-lg">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Espace Médecin</h1>
                <p className="text-gray-600">Plateforme médicale - Clinique Santé Plus</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
                <span className="text-sm text-emerald-600 font-medium">Dr. {doctorInfo?.fullName || 'Médecin'}</span>
              </div>
              <Button onClick={fetchDoctorData} variant="outline" size="sm" className="border-emerald-200 text-emerald-600 hover:bg-emerald-50">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Cartes de statistiques médicales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-linear-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Rendez-vous Aujourd&apos;hui</p>
                  <p className="text-3xl font-bold mt-1">{stats.todayAppointments}</p>
                </div>
                <CalendarDays className="h-10 w-10 text-emerald-200" />
              </div>
              <div className="mt-4 flex items-center text-emerald-100 text-sm">
                <Activity className="h-4 w-4 mr-1" />
                <span>À venir</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-teal-500 to-teal-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100 text-sm">Dossiers Médicaux</p>
                  <p className="text-3xl font-bold mt-1">{medicalRecords.length}</p>
                </div>
                <FileText className="h-10 w-10 text-teal-200" />
              </div>
              <div className="mt-4 flex items-center text-teal-100 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>Ce mois</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Patients Actifs</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalPatients}</p>
                </div>
                <UserCheck className="h-10 w-10 text-blue-200" />
              </div>
              <div className="mt-4 flex items-center text-blue-100 text-sm">
                <Heart className="h-4 w-4 mr-1" />
                <span>Suivi</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Consultations</p>
                  <p className="text-3xl font-bold mt-1">{stats.completedAppointments}</p>
                </div>
                <ClipboardList className="h-10 w-10 text-purple-200" />
              </div>
              <div className="mt-4 flex items-center text-purple-100 text-sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>Terminées</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets de gestion médicale */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appointments">Agenda</TabsTrigger>
            <TabsTrigger value="records">Dossiers médicaux</TabsTrigger>
            <TabsTrigger value="prescriptions">Ordonnances</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Rechercher un patient..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="SCHEDULED">Planifiés</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmés</SelectItem>
                      <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                      <SelectItem value="COMPLETED">Terminés</SelectItem>
                      <SelectItem value="CANCELLED">Annulés</SelectItem>
                      <SelectItem value="NO_SHOW">Absents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Patient</th>
                        <th className="text-left p-2">Contact</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Heure</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Statut</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map((appointment) => (
                        <tr key={appointment.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{appointment.patient.fullName}</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <span className="text-sm">{appointment.patient.email}</span>
                              </div>
                              {appointment.patient.phone && (
                                <div className="flex items-center space-x-1">
                                  <Phone className="h-3 w-3 text-gray-400" />
                                  <span className="text-sm">{appointment.patient.phone}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-2">
                            <span className="text-xs text-gray-500">{new Date(appointment.appointmentDate).toLocaleDateString('fr-FR')}</span>
                          </td>
                          <td className="p-2">
                            <span className="text-xs text-gray-500">{new Date(appointment.appointmentDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </td>
                          <td className="p-2">
                            <span className="text-sm">{getTypeText(appointment.type)}</span>
                          </td>
                          <td className="p-2">
                            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {getStatusIcon(appointment.status)}
                              <span>{getStatusText(appointment.status)}</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedAppointment(appointment)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              {appointment.status === "SCHEDULED" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateAppointmentStatus(appointment.id, "CONFIRMED")}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                              )}
                              {appointment.status === "CONFIRMED" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateAppointmentStatus(appointment.id, "IN_PROGRESS")}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <AlertCircle className="h-3 w-3" />
                                </Button>
                              )}
                              {appointment.status === "IN_PROGRESS" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateAppointmentStatus(appointment.id, "COMPLETED")}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Patients */}
          <TabsContent value="patients" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Mes Patients
                    </CardTitle>
                    <CardDescription>Consultez les informations de vos patients</CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher un patient..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {patients.filter((patient) => {
                    const search = searchTerm.toLowerCase()
                    const fullName = patient.fullName?.toLowerCase() ?? ""
                    const email = (patient.email ?? patient.user?.email ?? "").toLowerCase()
                    if (search === "") return true
                    return fullName.includes(search) || email.includes(search)
                  }).map((patient) => (
                    <Card key={patient.id} className="border-emerald-100 hover:shadow-md transition-all cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-emerald-100 p-2 rounded-full">
                              <User className="h-5 w-5 text-emerald-600" />
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

                        <div className="flex items-center space-x-2 pt-3 border-t">
                          <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-600 hover:bg-emerald-50">
                            <Eye className="h-3 w-3 mr-1" />
                            Détails
                          </Button>
                          <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
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

          <TabsContent value="records" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Dossiers Médicaux</CardTitle>
                    <CardDescription>Consultez et gérez l&apos;historique clinique de vos patients</CardDescription>
                  </div>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau Dossier
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Patient</th>
                        <th className="text-left p-2">Date de naissance</th>
                        <th className="text-left p-2">Diagnostic</th>
                        <th className="text-left p-2">Traitement</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicalRecords.map((record) => (
                        <tr key={record.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{record.patient.fullName}</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <span className="text-sm text-gray-600">{new Date(record.patient.dateOfBirth).toLocaleDateString('fr-FR')}</span>
                          </td>
                          <td className="p-2">
                            <span className="text-sm truncate max-w-32 block">{record.diagnosis}</span>
                          </td>
                          <td className="p-2">
                            <span className="text-sm truncate max-w-32 block">{record.treatment}</span>
                          </td>
                          <td className="p-2">
                            <span className="text-sm text-gray-500">{new Date(record.createdAt).toLocaleDateString('fr-FR')}</span>
                          </td>
                          <td className="p-2">
                            <div className="flex space-x-1">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Ordonnances</CardTitle>
                    <CardDescription>Visualisez les ordonnances émises pour vos patients</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Patient</th>
                        <th className="text-left p-2">Diagnostic</th>
                        <th className="text-left p-2">Ordonnance</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicalRecords.filter((record) => record.prescription).map((record) => (
                        <tr key={record.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{record.patient.fullName}</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <span className="text-sm truncate max-w-32 block">{record.diagnosis}</span>
                          </td>
                          <td className="p-2">
                            <span className="text-sm truncate max-w-48 block">{record.prescription}</span>
                          </td>
                          <td className="p-2">
                            <span className="text-sm text-gray-500">{new Date(record.createdAt).toLocaleDateString('fr-FR')}</span>
                          </td>
                          <td className="p-2">
                            <div className="flex space-x-1">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {selectedAppointment && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Détails du rendez-vous</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Patient</Label>
                  <p className="font-medium">{selectedAppointment.patient.fullName}</p>
                </div>
                <div>
                  <Label>Email patient</Label>
                  <p className="font-medium">{selectedAppointment.patient.email}</p>
                </div>
                {selectedAppointment.patient.phone && (
                  <div>
                    <Label>Téléphone patient</Label>
                    <p className="font-medium">{selectedAppointment.patient.phone}</p>
                  </div>
                )}
                <div>
                  <Label>Date</Label>
                  <p className="font-medium">{new Date(selectedAppointment.appointmentDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <Label>Heure</Label>
                  <p className="font-medium">{new Date(selectedAppointment.appointmentDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div>
                  <Label>Type</Label>
                  <p className="font-medium">{getTypeText(selectedAppointment.type)}</p>
                </div>
                <div>
                  <Label>Durée</Label>
                  <p className="font-medium">{selectedAppointment.duration} minutes</p>
                </div>
                <div>
                  <Label>Statut</Label>
                  <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                    {getStatusIcon(selectedAppointment.status)}
                    <span>{getStatusText(selectedAppointment.status)}</span>
                  </div>
                </div>
                {selectedAppointment.reason && (
                  <div className="md:col-span-2">
                    <Label>Motif</Label>
                    <p className="font-medium">{selectedAppointment.reason}</p>
                  </div>
                )}
                {selectedAppointment.symptoms && (
                  <div className="md:col-span-2">
                    <Label>Symptômes</Label>
                    <p className="font-medium">{selectedAppointment.symptoms}</p>
                  </div>
                )}
                {selectedAppointment.notes && (
                  <div className="md:col-span-2">
                    <Label>Notes</Label>
                    <p className="font-medium">{selectedAppointment.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex space-x-2 mt-6">
                {selectedAppointment.status === "SCHEDULED" && (
                  <Button
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, "CONFIRMED")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmer
                  </Button>
                )}
                {selectedAppointment.status === "CONFIRMED" && (
                  <Button
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, "IN_PROGRESS")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Démarrer
                  </Button>
                )}
                {selectedAppointment.status === "IN_PROGRESS" && (
                  <Button
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, "COMPLETED")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Terminer
                  </Button>
                )}
                {(selectedAppointment.status === "SCHEDULED" || selectedAppointment.status === "CONFIRMED") && (
                  <Button
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, "CANCELLED")}
                    variant="destructive"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                )}
                <Button
                  onClick={() => setSelectedAppointment(null)}
                  variant="outline"
                >
                  Fermer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
