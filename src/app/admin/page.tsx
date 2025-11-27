"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, User, Phone, Mail, Stethoscope, Search, Edit, Trash2, Eye, CheckCircle, XCircle, AlertCircle, Users, BarChart3, Shield, Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

interface User {
  id: string
  fullName: string
  email: string
  phone?: string
  role: string
  specialization?: string
  licenseNumber?: string
  isActive: boolean
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

export default function AdminInterface() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [users, setUsers] = useState<Record<string, any>[]>([])
  const [patients, setPatients] = useState<Record<string, any>[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showAddUser, setShowAddUser] = useState(false)
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    totalUsers: 0,
    totalPatients: 0,
    confirmationRate: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("clinic_token")
      if (!token) return

      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }

      // Fetch appointments
      const appointmentsRes = await fetch(`${API_URL}/appointments`, { headers })
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json()
        setAppointments(appointmentsData)
      }

      // Fetch users
      const usersRes = await fetch(`${API_URL}/users`, { headers })
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
      }

      // Fetch patients
      const patientsRes = await fetch(`${API_URL}/patients`, { headers })
      if (patientsRes.ok) {
        const patientsData = await patientsRes.json()
        setPatients(patientsData)
      }

      // Calculate stats
      if (appointmentsRes.ok && usersRes.ok && patientsRes.ok) {
        const appointmentsData = appointmentsRes.ok ? await appointmentsRes.json() : []
        const usersData = usersRes.ok ? await usersRes.json() : []
        const patientsData = patientsRes.ok ? await patientsRes.json() : []
        
        const today = new Date()
        const todayAppointments = appointmentsData.filter((apt: any) => {
          const aptDate = new Date(apt.appointmentDate)
          return aptDate.toDateString() === today.toDateString()
        })

        const confirmedAppointments = appointmentsData.filter((apt: any) => apt.status === "CONFIRMED")
        const confirmationRate = appointmentsData.length > 0 
          ? Math.round((confirmedAppointments.length / appointmentsData.length) * 100)
          : 0

        setStats({
          totalAppointments: appointmentsData.length,
          todayAppointments: todayAppointments.length,
          totalUsers: usersData.length,
          totalPatients: patientsData.length,
          confirmationRate
        })
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAppointments = appointments.filter((appointment: Appointment) => {
    const matchesSearch = appointment.patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.patient.phone?.includes(searchTerm) ||
                         appointment.doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase())
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
      }
    } catch (error) {
      console.error("Error updating appointment status:", error)
    }
  }

  const deleteAppointment = async (id: string) => {
    try {
      const token = localStorage.getItem("clinic_token")
      const response = await fetch(`${API_URL}/appointments/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        setAppointments(prev => prev.filter(apt => apt.id !== id))
        setSelectedAppointment(null)
      }
    } catch (error) {
      console.error("Error deleting appointment:", error)
    }
  }

  const updateUserStatus = async (id: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem("clinic_token")
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isActive })
      })

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === id ? { ...user, isActive } : user
        ))
      }
    } catch (error) {
      console.error("Error updating user status:", error)
    }
  }

  const getStatusColor = (status: string | boolean) => {
    switch (status) {
      case "CONFIRMED": 
      case "COMPLETED":
      case "active": 
      case true: 
        return "text-green-600 bg-green-50"
      case "SCHEDULED":
      case "IN_PROGRESS": 
        return "text-blue-600 bg-blue-50"
      case "CANCELLED":
      case "NO_SHOW":
      case "inactive": 
      case false: 
        return "text-red-600 bg-red-50"
      default: 
        return "text-yellow-600 bg-yellow-50"
    }
  }

  const getStatusIcon = (status: string | boolean) => {
    switch (status) {
      case "CONFIRMED": 
      case "COMPLETED":
      case "active": 
      case true: 
        return <CheckCircle className="h-4 w-4" />
      case "SCHEDULED":
      case "IN_PROGRESS": 
        return <AlertCircle className="h-4 w-4" />
      case "CANCELLED":
      case "NO_SHOW":
      case "inactive": 
      case false: 
        return <XCircle className="h-4 w-4" />
      default: 
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusText = (status: string | boolean) => {
    switch (status) {
      case "SCHEDULED": return "Planifié"
      case "CONFIRMED": return "Confirmé"
      case "IN_PROGRESS": return "En cours"
      case "COMPLETED": return "Terminé"
      case "CANCELLED": return "Annulé"
      case "NO_SHOW": return "Absent"
      case "active": 
      case true: 
        return "Actif"
      case "inactive": 
      case false: 
        return "Inactif"
      default: return String(status)
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
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="h-10 w-10 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Espace Administrateur</h1>
              <p className="text-gray-600">Clinique Santé Plus - Gestion en temps réel</p>
            </div>
          </div>
          <Button onClick={fetchData} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total rendez-vous</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aujourd&apos;hui</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Utilisateurs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
                </div>
                <User className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Taux de confirmation</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.confirmationRate}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
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
                        placeholder="Rechercher par patient, médecin ou téléphone..."
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
                        <th className="text-left p-2">Médecin</th>
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
                            <div className="flex items-center space-x-1">
                              <Stethoscope className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{appointment.doctor.fullName}</span>
                            </div>
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
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteAppointment(appointment.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
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

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gestion des utilisateurs</CardTitle>
                  <CardDescription>Gérez tous les comptes utilisateurs</CardDescription>
                </div>
                <Button onClick={() => setShowAddUser(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un utilisateur
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Nom</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Téléphone</th>
                        <th className="text-left p-2">Rôle</th>
                        <th className="text-left p-2">Spécialité</th>
                        <th className="text-left p-2">Date de création</th>
                        <th className="text-left p-2">Statut</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{user.fullName}</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">{user.email}</span>
                            </div>
                          </td>
                          <td className="p-2">
                            {user.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <span className="text-sm">{user.phone}</span>
                              </div>
                            )}
                          </td>
                          <td className="p-2">{user.role}</td>
                          <td className="p-2">{user.specialization || "-"}</td>
                          <td className="p-2">
                            <span className="text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                          </td>
                          <td className="p-2">
                            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.isActive)}`}>
                              {getStatusIcon(user.isActive)}
                              <span>{getStatusText(user.isActive)}</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex space-x-1">
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateUserStatus(user.id, !user.isActive)}
                              >
                                {user.isActive ? <XCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
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

          <TabsContent value="patients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Liste des patients</CardTitle>
                <CardDescription>Informations détaillées sur tous les patients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Nom</th>
                        <th className="text-left p-2">Contact</th>
                        <th className="text-left p-2">Date de naissance</th>
                        <th className="text-left p-2">Adresse</th>
                        <th className="text-left p-2">Contact d&apos;urgence</th>
                        <th className="text-left p-2">Groupe sanguin</th>
                        <th className="text-left p-2">Allergies</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((patient) => (
                        <tr key={patient.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{patient.fullName}</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <span className="text-sm">{patient.email}</span>
                              </div>
                              {patient.phone && (
                                <div className="flex items-center space-x-1">
                                  <Phone className="h-3 w-3 text-gray-400" />
                                  <span className="text-sm">{patient.phone}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-2">
                            <span className="text-xs text-gray-500">{new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}</span>
                          </td>
                          <td className="p-2">{patient.address}</td>
                          <td className="p-2">
                            {patient.emergencyContact && (
                              <div className="text-sm">
                                <div>{patient.emergencyContact}</div>
                                {patient.emergencyPhone && <div className="text-gray-500">{patient.emergencyPhone}</div>}
                              </div>
                            )}
                          </td>
                          <td className="p-2">{patient.bloodType || "-"}</td>
                          <td className="p-2">
                            <span className="text-sm truncate max-w-32 block">{patient.allergies || "-"}</span>
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
                  <span className="text-xs text-gray-500">{new Date(selectedAppointment.appointmentDate).toLocaleDateString('fr-FR')}</span>
                </div>
                <div>
                  <Label>Heure</Label>
                  <span className="text-xs text-gray-500">{new Date(selectedAppointment.appointmentDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div>
                  <Label>Médecin</Label>
                  <p className="font-medium">{selectedAppointment.doctor.fullName}</p>
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
                {selectedAppointment.notes && (
                  <div className="md:col-span-2">
                    <Label>Notes</Label>
                    <p className="font-medium">{selectedAppointment.notes}</p>
                  </div>
                )}
                <div>
                  <Label>Créé par</Label>
                  <p className="font-medium">{selectedAppointment.createdBy.fullName}</p>
                </div>
                <div>
                  <Label>Date de création</Label>
                  <p className="font-medium">{new Date(selectedAppointment.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
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
