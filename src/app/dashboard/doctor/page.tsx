"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Stethoscope, CheckCircle, RefreshCw, AlertCircle, FileText, Edit, Eye, XCircle, Search, Users, User, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

interface Appointment {
  id: string
  appointmentDate: string
  status: "SCHEDULED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW"
  type: string
  reason?: string
  notes?: string
  symptoms?: string
  duration: number
  patient: {
    id: string
    fullName: string
    email: string
    phone?: string
    dateOfBirth: string
    address: string
    bloodType?: string
    allergies?: string
    chronicDiseases?: string
  }
  createdAt: string
}

interface MedicalRecord {
  id: string
  diagnosis: string
  treatment?: string
  prescription?: string
  observations?: string
  recommendations?: string
  bloodPressure?: string
  heartRate?: number
  temperature?: number
  weight?: number
  height?: number
  patient: {
    id: string
    fullName: string
    email: string
  }
  createdAt: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export default function DoctorInterface() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showMedicalRecordForm, setShowMedicalRecordForm] = useState(false)
  const [medicalRecordForm, setMedicalRecordForm] = useState({
    diagnosis: "",
    treatment: "",
    prescription: "",
    observations: "",
    recommendations: "",
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    weight: "",
    height: ""
  })
  const [stats, setStats] = useState({
    todayAppointments: 0,
    completedAppointments: 0,
    totalPatients: 0,
    pendingAppointments: 0
  })

  useEffect(() => {
    fetchDoctorData()
  }, [])

  const fetchDoctorData = async () => {
    try {
      const token = localStorage.getItem("clinic_token")
      if (!token) return

      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }

      // Get current user info to find doctor ID
      const userRes = await fetch(`${API_URL}/auth/profile`, { headers })
      if (!userRes.ok) return
      
      const userData = await userRes.json()
      const doctorId = userData.id

      // Fetch doctor's appointments
      const appointmentsRes = await fetch(`${API_URL}/appointments/doctor/${doctorId}`, { headers })
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json()
        setAppointments(appointmentsData)
        
        // Calculate stats
        const today = new Date()
        const todayAppointments = appointmentsData.filter((apt: Appointment) => {
          const aptDate = new Date(apt.appointmentDate)
          return aptDate.toDateString() === today.toDateString()
        })
        
        const completedAppointments = appointmentsData.filter((apt: Appointment) => apt.status === "COMPLETED")
        const pendingAppointments = appointmentsData.filter((apt: Appointment) => 
          apt.status === "SCHEDULED" || apt.status === "CONFIRMED"
        )
        
        const uniquePatients = new Set(appointmentsData.map((apt: Appointment) => apt.patient.id))

        setStats({
          todayAppointments: todayAppointments.length,
          completedAppointments: completedAppointments.length,
          totalPatients: uniquePatients.size,
          pendingAppointments: pendingAppointments.length
        })
      }

      // Fetch medical records created by this doctor
      const recordsRes = await fetch(`${API_URL}/medical-records/doctor/${doctorId}`, { headers })
      if (recordsRes.ok) {
        const recordsData = await recordsRes.json()
        setMedicalRecords(recordsData)
      }
    } catch (error) {
      console.error("Error fetching doctor data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.patient.phone?.includes(searchTerm)
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const updateAppointmentStatus = async (id: string, status: Appointment["status"]) => {
    try {
      const token = localStorage.getItem("clinic_token")
      const response = await fetch(`${API_URL}/appointments/${id}/status`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
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
        fetchDoctorData() // Refresh stats
      }
    } catch (error) {
      console.error("Error updating appointment status:", error)
    }
  }

  const createMedicalRecord = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem("clinic_token")
      const userRes = await fetch(`${API_URL}/auth/profile`, { headers: { "Authorization": `Bearer ${token}` } })
      const userData = await userRes.json()
      
      const medicalRecordData = {
        ...medicalRecordForm,
        patientId: selectedAppointment?.patient.id,
        doctorId: userData.id,
        heartRate: medicalRecordForm.heartRate ? parseInt(medicalRecordForm.heartRate) : undefined,
        temperature: medicalRecordForm.temperature ? parseFloat(medicalRecordForm.temperature) : undefined,
        weight: medicalRecordForm.weight ? parseFloat(medicalRecordForm.weight) : undefined,
        height: medicalRecordForm.height ? parseFloat(medicalRecordForm.height) : undefined
      }

      const response = await fetch(`${API_URL}/medical-records`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(medicalRecordData)
      })

      if (response.ok) {
        setShowMedicalRecordForm(false)
        setMedicalRecordForm({
          diagnosis: "",
          treatment: "",
          prescription: "",
          observations: "",
          recommendations: "",
          bloodPressure: "",
          heartRate: "",
          temperature: "",
          weight: "",
          height: ""
        })
        fetchDoctorData()
        updateAppointmentStatus(appointmentId, "COMPLETED")
      }
    } catch (error) {
      console.error("Error creating medical record:", error)
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
    <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Stethoscope className="h-10 w-10 text-emerald-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Espace Médecin</h1>
              <p className="text-gray-600">Clinique Santé Plus - Gestion médicale</p>
            </div>
          </div>
          <Button onClick={fetchDoctorData} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rendez-vous aujourd'hui</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
                </div>
                <Calendar className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Consultations terminées</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedAppointments}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Patients uniques</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En attente</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingAppointments}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
            <TabsTrigger value="records">Dossiers médicaux</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Rechercher par patient..."
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
                            {new Date(appointment.appointmentDate).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="p-2">
                            {new Date(appointment.appointmentDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
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
                              {appointment.status === "CONFIRMED" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateAppointmentStatus(appointment.id, "IN_PROGRESS")}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  Démarrer
                                </Button>
                              )}
                              {appointment.status === "IN_PROGRESS" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedAppointment(appointment)
                                    setShowMedicalRecordForm(true)
                                  }}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <FileText className="h-3 w-3" />
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

          <TabsContent value="records" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dossiers médicaux créés</CardTitle>
                <CardDescription>Historique des consultations et diagnostics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Patient</th>
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
                            <span className="text-sm truncate max-w-48 block">{record.diagnosis}</span>
                          </td>
                          <td className="p-2">
                            <span className="text-sm truncate max-w-48 block">{record.treatment || "-"}</span>
                          </td>
                          <td className="p-2">
                            {new Date(record.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="p-2">
                            <div className="flex space-x-1">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
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
                  <Label>Date de naissance</Label>
                  <p className="font-medium">{new Date(selectedAppointment.patient.dateOfBirth).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedAppointment.patient.email}</p>
                </div>
                <div>
                  <Label>Téléphone</Label>
                  <p className="font-medium">{selectedAppointment.patient.phone || "-"}</p>
                </div>
                <div>
                  <Label>Adresse</Label>
                  <p className="font-medium">{selectedAppointment.patient.address}</p>
                </div>
                <div>
                  <Label>Groupe sanguin</Label>
                  <p className="font-medium">{selectedAppointment.patient.bloodType || "-"}</p>
                </div>
                {selectedAppointment.patient.allergies && (
                  <div className="md:col-span-2">
                    <Label>Allergies</Label>
                    <p className="font-medium text-red-600">{selectedAppointment.patient.allergies}</p>
                  </div>
                )}
                {selectedAppointment.patient.chronicDiseases && (
                  <div className="md:col-span-2">
                    <Label>Maladies chroniques</Label>
                    <p className="font-medium text-orange-600">{selectedAppointment.patient.chronicDiseases}</p>
                  </div>
                )}
                <div>
                  <Label>Date du rendez-vous</Label>
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
              </div>
              <div className="flex space-x-2 mt-6">
                {selectedAppointment.status === "CONFIRMED" && (
                  <Button
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, "IN_PROGRESS")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Démarrer consultation
                  </Button>
                )}
                {selectedAppointment.status === "IN_PROGRESS" && (
                  <Button
                    onClick={() => setShowMedicalRecordForm(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Créer dossier médical
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

        {showMedicalRecordForm && selectedAppointment && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Créer un dossier médical</CardTitle>
              <CardDescription>Patient: {selectedAppointment.patient.fullName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="diagnosis">Diagnostic *</Label>
                  <Textarea
                    id="diagnosis"
                    value={medicalRecordForm.diagnosis}
                    onChange={(e) => setMedicalRecordForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                    placeholder="Décrivez le diagnostic..."
                    rows={3}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="treatment">Traitement</Label>
                  <Textarea
                    id="treatment"
                    value={medicalRecordForm.treatment}
                    onChange={(e) => setMedicalRecordForm(prev => ({ ...prev, treatment: e.target.value }))}
                    placeholder="Décrivez le traitement recommandé..."
                    rows={2}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="prescription">Prescription</Label>
                  <Textarea
                    id="prescription"
                    value={medicalRecordForm.prescription}
                    onChange={(e) => setMedicalRecordForm(prev => ({ ...prev, prescription: e.target.value }))}
                    placeholder="Médicaments prescrits..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="bloodPressure">Pression artérielle</Label>
                  <Input
                    id="bloodPressure"
                    value={medicalRecordForm.bloodPressure}
                    onChange={(e) => setMedicalRecordForm(prev => ({ ...prev, bloodPressure: e.target.value }))}
                    placeholder="120/80"
                  />
                </div>
                <div>
                  <Label htmlFor="heartRate">Fréquence cardiaque (bpm)</Label>
                  <Input
                    id="heartRate"
                    type="number"
                    value={medicalRecordForm.heartRate}
                    onChange={(e) => setMedicalRecordForm(prev => ({ ...prev, heartRate: e.target.value }))}
                    placeholder="72"
                  />
                </div>
                <div>
                  <Label htmlFor="temperature">Température (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={medicalRecordForm.temperature}
                    onChange={(e) => setMedicalRecordForm(prev => ({ ...prev, temperature: e.target.value }))}
                    placeholder="37.0"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Poids (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={medicalRecordForm.weight}
                    onChange={(e) => setMedicalRecordForm(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="70.0"
                  />
                </div>
                <div>
                  <Label htmlFor="height">Taille (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={medicalRecordForm.height}
                    onChange={(e) => setMedicalRecordForm(prev => ({ ...prev, height: e.target.value }))}
                    placeholder="175"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="observations">Observations</Label>
                  <Textarea
                    id="observations"
                    value={medicalRecordForm.observations}
                    onChange={(e) => setMedicalRecordForm(prev => ({ ...prev, observations: e.target.value }))}
                    placeholder="Observations supplémentaires..."
                    rows={2}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="recommendations">Recommandations</Label>
                  <Textarea
                    id="recommendations"
                    value={medicalRecordForm.recommendations}
                    onChange={(e) => setMedicalRecordForm(prev => ({ ...prev, recommendations: e.target.value }))}
                    placeholder="Recommandations pour le patient..."
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex space-x-2 mt-6">
                <Button
                  onClick={() => createMedicalRecord(selectedAppointment.id)}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!medicalRecordForm.diagnosis}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Enregistrer et terminer consultation
                </Button>
                <Button
                  onClick={() => setShowMedicalRecordForm(false)}
                  variant="outline"
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
