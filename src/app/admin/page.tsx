"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, User, Phone, Mail, Stethoscope, Search, Edit, Trash2, Eye, CheckCircle, XCircle, AlertCircle, Users, BarChart3, Shield, Plus, RefreshCw, Building, Settings, Activity, FileText, TrendingUp, UserCheck, CalendarDays, CreditCard, Download } from "lucide-react"
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
  address?: string
  dateOfBirth: string
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
  const [users, setUsers] = useState<User[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
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

      // Get appointments
      const appointmentsRes = await fetch(`${API_URL}/appointments`, { headers })
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json()
        setAppointments(appointmentsData)
      }

      // Get users
      const usersRes = await fetch(`${API_URL}/users`, { headers })
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
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
      const confirmedAppointments = appointments.filter(apt => apt.status === 'CONFIRMED').length
      const confirmationRate = appointments.length > 0 ? Math.round((confirmedAppointments / appointments.length) * 100) : 0

      setStats({
        totalAppointments: appointments.length,
        todayAppointments,
        totalUsers: users.length,
        totalPatients: patients.length,
        confirmationRate
      })
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAppointments = appointments.filter((appointment) => {
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
      }
    } catch (error) {
      console.error("Error updating appointment status:", error)
    }
  }

  const updateUserStatus = async (id: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem("clinic_token")
      if (!token) return

      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
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
          <div className="bg-linear-to-br from-blue-500 to-cyan-600 p-4 rounded-full shadow-lg mb-4">
            <RefreshCw className="h-8 w-8 animate-spin text-white" />
          </div>
          <p className="text-gray-600">Chargement des données administratives...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50">
      {/* Header Clinique */}
      <div className="bg-white border-b border-blue-100 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-linear-to-br from-blue-500 to-cyan-600 p-3 rounded-xl shadow-lg">
                <Building className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Administration Clinique</h1>
                <p className="text-gray-600">Gestion complète - Clinique Santé Plus</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                <span className="text-sm text-blue-600 font-medium">Admin</span>
              </div>
              <Button onClick={fetchData} variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-linear-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Rendez-vous</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalAppointments}</p>
                </div>
                <CalendarDays className="h-10 w-10 text-blue-200" />
              </div>
              <div className="mt-4 flex items-center text-blue-100 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>Aujourd'hui: {stats.todayAppointments}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-cyan-500 to-cyan-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-sm">Personnel Actif</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalUsers}</p>
                </div>
                <UserCheck className="h-10 w-10 text-cyan-200" />
              </div>
              <div className="mt-4 flex items-center text-cyan-100 text-sm">
                <Activity className="h-4 w-4 mr-1" />
                <span>En ligne maintenant</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Patients Totals</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalPatients}</p>
                </div>
                <Users className="h-10 w-10 text-emerald-200" />
              </div>
              <div className="mt-4 flex items-center text-emerald-100 text-sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>Nouveaux ce mois</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Taux Confirmation</p>
                  <p className="text-3xl font-bold mt-1">{stats.confirmationRate}%</p>
                </div>
                <BarChart3 className="h-10 w-10 text-purple-200" />
              </div>
              <div className="mt-4 flex items-center text-purple-100 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+5% ce mois</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets de gestion */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="bg-white border border-blue-200 rounded-lg p-1 shadow-sm">
            <TabsTrigger value="appointments" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <CalendarDays className="h-4 w-4 mr-2" />
              Rendez-vous
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              Personnel
            </TabsTrigger>
            <TabsTrigger value="patients" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <UserCheck className="h-4 w-4 mr-2" />
              Patients
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Settings className="h-4 w-4 mr-2" />
              Services
            </TabsTrigger>
          </TabsList>

          {/* Onglet Rendez-vous */}
          <TabsContent value="appointments" className="space-y-6">
            <Card className="shadow-lg border-blue-100">
              <CardHeader className="bg-linear-to-r from-blue-50 to-cyan-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-blue-800">Gestion des Rendez-vous</CardTitle>
                    <CardDescription className="text-blue-600">Planification et suivi des consultations</CardDescription>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau Rendez-vous
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Filtres */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Rechercher un patient, médecin..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-blue-200 focus:border-blue-400"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48 border-blue-200">
                      <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="SCHEDULED">Planifié</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmé</SelectItem>
                      <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                      <SelectItem value="COMPLETED">Terminé</SelectItem>
                      <SelectItem value="CANCELLED">Annulé</SelectItem>
                      <SelectItem value="NO_SHOW">Absent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tableau des rendez-vous */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-blue-100">
                        <th className="text-left p-3 text-blue-700 font-medium">Patient</th>
                        <th className="text-left p-3 text-blue-700 font-medium">Médecin</th>
                        <th className="text-left p-3 text-blue-700 font-medium">Type</th>
                        <th className="text-left p-3 text-blue-700 font-medium">Date</th>
                        <th className="text-left p-3 text-blue-700 font-medium">Statut</th>
                        <th className="text-left p-3 text-blue-700 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map((appointment) => (
                        <tr key={appointment.id} className="border-b border-blue-50 hover:bg-blue-50/50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center space-x-3">
                              <div className="bg-blue-100 p-2 rounded-full">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{appointment.patient.fullName}</p>
                                <p className="text-sm text-gray-500">{appointment.patient.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <Stethoscope className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{appointment.doctor.fullName}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              {getTypeText(appointment.type)}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">
                              <p className="font-medium">{new Date(appointment.appointmentDate).toLocaleDateString('fr-FR')}</p>
                              <p className="text-gray-500">{new Date(appointment.appointmentDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {getStatusIcon(appointment.status)}
                              <span>{getStatusText(appointment.status)}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
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

          {/* Onglet Personnel */}
          <TabsContent value="users" className="space-y-6">
            <Card className="shadow-lg border-blue-100">
              <CardHeader className="bg-linear-to-r from-blue-50 to-cyan-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-blue-800">Gestion du Personnel</CardTitle>
                    <CardDescription className="text-blue-600">Administration des employés et professionnels</CardDescription>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter Employé
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-blue-100">
                        <th className="text-left p-3 text-blue-700 font-medium">Employé</th>
                        <th className="text-left p-3 text-blue-700 font-medium">Rôle</th>
                        <th className="text-left p-3 text-blue-700 font-medium">Spécialité</th>
                        <th className="text-left p-3 text-blue-700 font-medium">Contact</th>
                        <th className="text-left p-3 text-blue-700 font-medium">Date</th>
                        <th className="text-left p-3 text-blue-700 font-medium">Statut</th>
                        <th className="text-left p-3 text-blue-700 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-blue-50 hover:bg-blue-50/50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center space-x-3">
                              <div className="bg-blue-100 p-2 rounded-full">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{user.fullName}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              {user.role}
                            </span>
                          </td>
                          <td className="p-3">{user.specialization || "-"}</td>
                          <td className="p-3">
                            <div className="text-sm">
                              {user.phone && <p className="text-gray-600">{user.phone}</p>}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                          </td>
                          <td className="p-3">
                            <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.isActive)}`}>
                              {getStatusIcon(user.isActive)}
                              <span>{getStatusText(user.isActive)}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className={`${user.isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
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

          {/* Onglet Patients */}
          <TabsContent value="patients" className="space-y-6">
            <Card className="shadow-lg border-blue-100">
              <CardHeader className="bg-linear-to-r from-blue-50 to-cyan-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-blue-800">Gestion des Patients</CardTitle>
                    <CardDescription className="text-blue-600">Dossiers patients et informations médicales</CardDescription>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau Patient
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-blue-100">
                        <th className="text-left p-3 text-blue-700 font-medium">Patient</th>
                        <th className="text-left p-3 text-blue-700 font-medium">Contact</th>
                        <th className="text-left p-3 text-blue-700 font-medium">Date de naissance</th>
                        <th className="text-left p-3 text-blue-700 font-medium">Groupe sanguin</th>
                        <th className="text-left p-3 text-blue-700 font-medium">Allergies</th>
                        <th className="text-left p-3 text-blue-700 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((patient) => (
                        <tr key={patient.id} className="border-b border-blue-50 hover:bg-blue-50/50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center space-x-3">
                              <div className="bg-blue-100 p-2 rounded-full">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{patient.fullName}</p>
                                <p className="text-sm text-gray-500">{patient.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">
                              {patient.phone && <p className="text-gray-600">{patient.phone}</p>}
                              {patient.address && <p className="text-gray-500">{patient.address}</p>}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-sm text-gray-600">{new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}</span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              {patient.bloodType || 'Non spécifié'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-sm text-gray-600 truncate max-w-32 block">
                              {patient.allergies || 'Aucune'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
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

          {/* Onglet Services */}
          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="shadow-lg border-blue-100 hover:shadow-xl transition-shadow">
                <CardHeader className="bg-linear-to-r from-blue-50 to-cyan-50">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-500 p-3 rounded-lg">
                      <Stethoscope className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-blue-800">Services Médicaux</CardTitle>
                      <CardDescription className="text-blue-600">Configuration des spécialités</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Médecine générale</span>
                      <Button size="sm" variant="outline" className="border-blue-200 text-blue-600">Configurer</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Pédiatrie</span>
                      <Button size="sm" variant="outline" className="border-blue-200 text-blue-600">Configurer</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Cardiologie</span>
                      <Button size="sm" variant="outline" className="border-blue-200 text-blue-600">Configurer</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-blue-100 hover:shadow-xl transition-shadow">
                <CardHeader className="bg-linear-to-r from-cyan-50 to-blue-50">
                  <div className="flex items-center space-x-3">
                    <div className="bg-cyan-500 p-3 rounded-lg">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-blue-800">Facturation</CardTitle>
                      <CardDescription className="text-blue-600">Tarifs et paiements</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                      <FileText className="h-4 w-4 mr-2" />
                      Gérer les Tarifs
                    </Button>
                    <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Rapports Financiers
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-blue-100 hover:shadow-xl transition-shadow">
                <CardHeader className="bg-linear-to-r from-emerald-50 to-cyan-50">
                  <div className="flex items-center space-x-3">
                    <div className="bg-emerald-500 p-3 rounded-lg">
                      <Settings className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-blue-800">Paramètres</CardTitle>
                      <CardDescription className="text-blue-600">Configuration générale</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                      <Building className="h-4 w-4 mr-2" />
                      Infos Clinique
                    </Button>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                      <Shield className="h-4 w-4 mr-2" />
                      Sécurité
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
