"use client"

import { useState, useEffect, useCallback } from "react"
import { Clock, User, Search, Eye, CheckCircle, XCircle, AlertCircle, Building, CalendarDays, LogOut, Bell, Settings, RefreshCw, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"


// Type Patient est conservé pour une utilisation future
type Patient = {
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

// Suppression de la référence à Stethoscope dans le code
export default function ReceptionistDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  // État pour la gestion des patients (futur développement)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  
  // Dialog states
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  // État pour la boîte de dialogue des détails du patient (futur développement)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const fetchReceptionistData = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("clinic_token")
      if (!token) {
        console.error("No token found in localStorage")
        setLoading(false)
        return
      }

      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }

      console.log("🔄 Récupération des données...")
      console.log("📍 URL de l'API:", API_URL)

      try {
        const appointmentsRes = await fetch(`${API_URL}/appointments`, { headers })

        if (appointmentsRes.ok) {
          const appointmentsData = await appointmentsRes.json()
          console.log("✅ Rendez-vous chargés:", appointmentsData.length, "éléments")
          setAppointments(appointmentsData)
        } else {
          console.error("❌ Échec du chargement des rendez-vous:", appointmentsRes.status, appointmentsRes.statusText)
          const errorText = await appointmentsRes.text()
          console.error("❌ Réponse d'erreur:", errorText)
        }

        // La gestion des patients est désactivée pour le moment
        console.log("ℹ️ La gestion des patients est désactivée pour le moment")

      } catch (error) {
        console.error("❌ Error fetching data:", error)
      }

    } catch (error) {
      console.error("❌ Error in fetchReceptionistData:", error)
    } finally {
      setLoading(false)
      console.log("🏁 Fetch completed")
    }
  }, [])

  useEffect(() => {
    fetchReceptionistData()
  }, [fetchReceptionistData])


  const updateAppointmentStatus = async (appointmentId: string, status: Appointment["status"]) => {
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

  const cancelAppointment = async (appointmentId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) {
      await updateAppointmentStatus(appointmentId, 'CANCELLED')
    }
  }

  const filteredAppointments = appointments.filter((appointment) => {
    if (!appointment) return false
    const matchesSearch = searchTerm === "" || 
      (appointment.patient?.fullName && appointment.patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
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
        return <XCircle className="h-4 w-4" />
      case "PENDING": 
        return <AlertCircle className="h-4 w-4" />
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
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-linear-to-br from-purple-500 to-pink-600 p-4 rounded-full shadow-lg mb-4">
            <Clock className="h-8 w-8 animate-spin text-white" />
          </div>
          <p className="text-gray-600">Chargement de votre espace réception...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Réceptionniste */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-3xl font-bold bg-linear-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Tableau de bord</h2>
              <Badge className="bg-linear-to-r from-blue-500 to-indigo-600 text-white border-0 px-4 py-2 shadow-lg">
                Réceptionniste
              </Badge>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="icon" 
                className="border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition-all"
                onClick={fetchReceptionistData}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-linear-to-br from-blue-600 to-indigo-700 p-4 rounded-2xl shadow-xl">
                <Building className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Espace Réception</h1>
                <p className="text-slate-600 font-medium">Clinique Santé Plus - Gestion Professionnelle</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-600 hover:bg-slate-50 transition-all">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-600 hover:bg-slate-50 transition-all">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
              <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50 transition-all">
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">Rendez-vous aujourd&apos;hui</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {appointments.filter(apt => 
                      new Date(apt.appointmentDate).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">En attente de confirmation</p>
                </div>
                <div className="bg-linear-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg">
                  <CalendarDays className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">Total rendez-vous</p>
                  <p className="text-3xl font-bold text-slate-900">{appointments.length}</p>
                  <p className="text-xs text-slate-500 mt-1">Cette période</p>
                </div>
                <div className="bg-linear-to-br from-indigo-500 to-indigo-600 p-4 rounded-2xl shadow-lg">
                  <Clock className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">Confirmés</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {appointments.filter(apt => apt.status === 'CONFIRMED').length}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Validés</p>
                </div>
                <div className="bg-linear-to-br from-emerald-500 to-emerald-600 p-4 rounded-2xl shadow-lg">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">Taux d&apos;occupation</p>
                  <p className="text-3xl font-bold text-slate-900">78%</p>
                  <p className="text-xs text-emerald-600 mt-1">+12% ce mois</p>
                </div>
                <div className="bg-linear-to-br from-amber-500 to-orange-600 p-4 rounded-2xl shadow-lg">
                  <ArrowUp className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value="appointments" className="space-y-6">
          <TabsList className="bg-white/90 backdrop-blur-sm border border-slate-200/60 p-1 rounded-xl shadow-lg">
            <TabsTrigger value="appointments" className="data-[state=active]:bg-linear-to-r from-blue-600 to-indigo-600 data-[state=active]:text-white rounded-lg px-6 py-3 font-medium transition-all">
              <CalendarDays className="h-4 w-4 mr-2" />
              Rendez-vous
            </TabsTrigger>
          </TabsList>

          {/* Onglet Rendez-vous */}
          <TabsContent value="appointments" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50 border-b border-slate-200/30">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-800 flex items-center">
                      <CalendarDays className="h-6 w-6 mr-3 text-blue-600" />
                      Gestion des Rendez-vous
                    </CardTitle>
                    <CardDescription className="text-slate-600 mt-1">
                      Consultez et gérez tous les rendez-vous de la clinique
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Rechercher un patient..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64 border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-slate-700"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
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
                    <Card key={appointment.id} className="bg-white border border-slate-200/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-xl">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <Badge className={`${getStatusColor(appointment.status)} px-3 py-1 rounded-full text-xs font-medium shadow-sm`}>
                            {getStatusIcon(appointment.status)}
                            <span className="ml-1">{getStatusText(appointment.status)}</span>
                          </Badge>
                          <span className="text-sm text-slate-500 font-medium">
                            {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString('fr-FR') : 'Date non définie'}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2 text-lg">{appointment.patient?.fullName || 'Patient non défini'}</h4>
                          <div className="flex items-center text-slate-600 mb-1">
                            <User className="h-4 w-4 mr-2 text-slate-400" />
                            <p className="text-sm">Dr. {appointment.doctor?.fullName || 'Médecin non défini'}</p>
                          </div>
                          <div className="flex items-center text-slate-500">
                            <Clock className="h-4 w-4 mr-2 text-slate-400" />
                            <p className="text-sm">
                              {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'Heure non définie'}
                            </p>
                          </div>
                        </div>
                        
                        {appointment.reason && (
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-slate-700 mb-1">Motif:</p>
                            <p className="text-sm text-slate-600">{appointment.reason}</p>
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          {appointment.paymentStatus && (
                            <Badge className={`${getStatusColor(appointment.paymentStatus)} px-2 py-1 rounded-full text-xs font-medium`}>
                              {getStatusIcon(appointment.paymentStatus)}
                              <span className="ml-1">{getStatusText(appointment.paymentStatus)}</span>
                            </Badge>
                          )}
                          {appointment.price && (
                            <span className="text-sm font-semibold text-slate-700 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                              {appointment.price}€
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 pt-4 border-t border-slate-100">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition-all"
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
                              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg transition-all"
                              onClick={() => updateAppointmentStatus(appointment.id, 'CONFIRMED')}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Confirmer
                            </Button>
                          )}

                          {(appointment.status === "SCHEDULED" || appointment.status === "CONFIRMED") && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all"
                              onClick={() => cancelAppointment(appointment.id)}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Annuler
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
                  <Label className="text-sm font-medium">Médecin</Label>
                  <p className="text-sm text-gray-900">Dr. {selectedAppointment.doctor.fullName}</p>
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
                <div>
                  <Label className="text-sm font-medium">Statut</Label>
                  <p className="text-sm text-gray-900">{getStatusText(selectedAppointment.status)}</p>
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

      {/* La gestion détaillée des patients et médecins sera implémentée dans une prochaine version */}
    </div>
  )
}
