"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, User, Phone, Mail, Stethoscope, Search, Edit, Trash2, Eye, CheckCircle, XCircle, AlertCircle, Users, BarChart3, Shield, Plus, RefreshCw, Building, Settings, Activity, FileText, TrendingUp, UserCheck, CalendarDays, CreditCard, Download, Heart, ClipboardList, Pill } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

interface Reservation {
  id: string
  patientName: string
  patientEmail: string
  patientPhone: string
  doctorName: string
  date: string
  time: string
  type: string
  status: "confirmed" | "pending" | "cancelled"
  notes?: string
  createdAt: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export default function ReceptionistInterface() {
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: "1",
      patientName: "Jean Dupont",
      patientEmail: "jean.dupont@email.com",
      patientPhone: "0123456789",
      doctorName: "Dr. Martin",
      date: new Date().toISOString().split('T')[0],
      time: "09:00",
      type: "Consultation",
      status: "confirmed",
      notes: "Première consultation",
      createdAt: new Date().toISOString()
    },
    {
      id: "2",
      patientName: "Marie Durand",
      patientEmail: "marie.durand@email.com",
      patientPhone: "0987654321",
      doctorName: "Dr. Bernard",
      date: new Date().toISOString().split('T')[0],
      time: "10:30",
      type: "Suivi",
      status: "pending",
      notes: "Contrôle post-opératoire",
      createdAt: new Date().toISOString()
    }
  ])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [showAddReservation, setShowAddReservation] = useState(false)
  const [newReservation, setNewReservation] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    doctorName: "",
    date: "",
    time: "",
    type: "CONSULTATION",
    notes: ""
  })

  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch = reservation.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.patientPhone?.includes(searchTerm) ||
                         reservation.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || reservation.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const updateReservationStatus = async (id: string, status: Reservation["status"]) => {
    try {
      const token = localStorage.getItem("clinic_token")
      if (!token) return

      const response = await fetch(`${API_URL}/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: status.toUpperCase() })
      })

      if (response.ok) {
        setReservations(prev => prev.map(res => 
          res.id === id ? { ...res, status } : res
        ))
        if (selectedReservation?.id === id) {
          setSelectedReservation(prev => prev ? { ...prev, status } : null)
        }
      }
    } catch (error) {
      console.error("Error updating reservation status:", error)
    }
  }

  const addReservation = async () => {
    try {
      const token = localStorage.getItem("clinic_token")
      if (!token) return

      const appointmentData = {
        ...newReservation,
        appointmentDate: `${newReservation.date}T${newReservation.time}:00`,
        type: newReservation.type,
        reason: newReservation.notes,
        duration: 30
      }

      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      })

      if (response.ok) {
        const createdAppointment = await response.json()
        const reservation: Reservation = {
          id: createdAppointment.id,
          patientName: newReservation.patientName,
          patientEmail: newReservation.patientEmail,
          patientPhone: newReservation.patientPhone,
          doctorName: newReservation.doctorName,
          date: newReservation.date,
          time: newReservation.time,
          type: newReservation.type,
          status: "pending",
          notes: newReservation.notes,
          createdAt: createdAppointment.createdAt
        }
        setReservations(prev => [...prev, reservation])
        setNewReservation({
          patientName: "",
          patientEmail: "",
          patientPhone: "",
          doctorName: "",
          date: "",
          time: "",
          type: "CONSULTATION",
          notes: ""
        })
        setShowAddReservation(false)
      }
    } catch (error) {
      console.error("Error adding reservation:", error)
    }
  }

  const deleteReservation = async (id: string) => {
    try {
      const token = localStorage.getItem("clinic_token")
      if (!token) return

      const response = await fetch(`${API_URL}/appointments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setReservations(prev => prev.filter(res => res.id !== id))
        setSelectedReservation(null)
      }
    } catch (error) {
      console.error("Error deleting reservation:", error)
    }
  }

  const getStatusColor = (status: Reservation["status"]) => {
    switch (status) {
      case "confirmed": 
        return "text-green-600 bg-green-50"
      case "pending": 
        return "text-blue-600 bg-blue-50"
      case "cancelled": 
        return "text-red-600 bg-red-50"
      default: 
        return "text-gray-600 bg-gray-50"
    }
  }

  const getStatusIcon = (status: Reservation["status"]) => {
    switch (status) {
      case "confirmed": 
        return <CheckCircle className="h-4 w-4" />
      case "pending": 
        return <AlertCircle className="h-4 w-4" />
      case "cancelled": 
        return <XCircle className="h-4 w-4" />
      default: 
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusText = (status: Reservation["status"]) => {
    switch (status) {
      case "confirmed": return "Confirmé"
      case "pending": return "En attente"
      case "cancelled": return "Annulé"
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

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-cyan-50">
      {/* Header Réceptionniste */}
      <div className="bg-white border-b border-blue-100 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-linear-to-br from-blue-500 to-cyan-600 p-3 rounded-xl shadow-lg">
                <Building className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Espace Réceptionniste</h1>
                <p className="text-gray-600">Accueil & Gestion - Clinique Santé Plus</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                <span className="text-sm text-blue-600 font-medium">Réceptionniste</span>
              </div>
              <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
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
                  <p className="text-blue-100 text-sm">Rendez-vous Aujourd'hui</p>
                  <p className="text-3xl font-bold mt-1">{reservations.filter(r => r.date === new Date().toISOString().split('T')[0]).length}</p>
                </div>
                <CalendarDays className="h-10 w-10 text-blue-200" />
              </div>
              <div className="mt-4 flex items-center text-blue-100 text-sm">
                <Activity className="h-4 w-4 mr-1" />
                <span>Aujourd'hui</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-cyan-500 to-cyan-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-sm">Confirmés</p>
                  <p className="text-3xl font-bold mt-1">{reservations.filter(r => r.status === 'confirmed').length}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-cyan-200" />
              </div>
              <div className="mt-4 flex items-center text-cyan-100 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>Ce mois</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">En Attente</p>
                  <p className="text-3xl font-bold mt-1">{reservations.filter(r => r.status === 'pending').length}</p>
                </div>
                <AlertCircle className="h-10 w-10 text-emerald-200" />
              </div>
              <div className="mt-4 flex items-center text-emerald-100 text-sm">
                <Clock className="h-4 w-4 mr-1" />
                <span>À traiter</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Patients</p>
                  <p className="text-3xl font-bold mt-1">{new Set(reservations.map(r => r.patientName)).size}</p>
                </div>
                <UserCheck className="h-10 w-10 text-purple-200" />
              </div>
              <div className="mt-4 flex items-center text-purple-100 text-sm">
                <Heart className="h-4 w-4 mr-1" />
                <span>Uniques</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tableau des réservations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gestion des Réservations</CardTitle>
                <CardDescription>Planification et suivi des rendez-vous</CardDescription>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddReservation(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Réservation
              </Button>
            </div>
          </CardHeader>
          <CardContent>
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
                  <SelectItem value="confirmed">Confirmés</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="cancelled">Annulés</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tableau */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blue-100">
                    <th className="text-left p-3 text-blue-700 font-medium">Patient</th>
                    <th className="text-left p-3 text-blue-700 font-medium">Contact</th>
                    <th className="text-left p-3 text-blue-700 font-medium">Médecin</th>
                    <th className="text-left p-3 text-blue-700 font-medium">Date</th>
                    <th className="text-left p-3 text-blue-700 font-medium">Heure</th>
                    <th className="text-left p-3 text-blue-700 font-medium">Type</th>
                    <th className="text-left p-3 text-blue-700 font-medium">Statut</th>
                    <th className="text-left p-3 text-blue-700 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation.id} className="border-b border-blue-50 hover:bg-blue-50/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{reservation.patientName}</p>
                            <p className="text-sm text-gray-500">{reservation.patientEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <p className="text-gray-600">{reservation.patientPhone}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <Stethoscope className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{reservation.doctorName}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-gray-600">{new Date(reservation.date).toLocaleDateString('fr-FR')}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-gray-600">{reservation.time}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {getTypeText(reservation.type)}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                          {getStatusIcon(reservation.status)}
                          <span>{getStatusText(reservation.status)}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                            <Eye className="h-3 w-3" />
                          </Button>
                          {reservation.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateReservationStatus(reservation.id, "confirmed")}
                              className="border-green-200 text-green-600 hover:bg-green-50"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
                          {reservation.status === "confirmed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateReservationStatus(reservation.id, "cancelled")}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-3 w-3" />
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

        {/* Modal nouvelle réservation */}
        {showAddReservation && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Nouvelle Réservation</CardTitle>
              <CardDescription>Ajouter un nouveau rendez-vous</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientName">Nom du patient</Label>
                  <Input
                    id="patientName"
                    value={newReservation.patientName}
                    onChange={(e) => setNewReservation(prev => ({ ...prev, patientName: e.target.value }))}
                    placeholder="Nom complet"
                  />
                </div>
                <div>
                  <Label htmlFor="patientEmail">Email du patient</Label>
                  <Input
                    id="patientEmail"
                    type="email"
                    value={newReservation.patientEmail}
                    onChange={(e) => setNewReservation(prev => ({ ...prev, patientEmail: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="patientPhone">Téléphone du patient</Label>
                  <Input
                    id="patientPhone"
                    value={newReservation.patientPhone}
                    onChange={(e) => setNewReservation(prev => ({ ...prev, patientPhone: e.target.value }))}
                    placeholder="0123456789"
                  />
                </div>
                <div>
                  <Label htmlFor="doctorName">Médecin</Label>
                  <Select value={newReservation.doctorName} onValueChange={(value) => setNewReservation(prev => ({ ...prev, doctorName: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un médecin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dr. Martin">Dr. Martin</SelectItem>
                      <SelectItem value="Dr. Bernard">Dr. Bernard</SelectItem>
                      <SelectItem value="Dr. Durand">Dr. Durand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newReservation.date}
                    onChange={(e) => setNewReservation(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Heure</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newReservation.time}
                    onChange={(e) => setNewReservation(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type de consultation</Label>
                  <Select value={newReservation.type} onValueChange={(value) => setNewReservation(prev => ({ ...prev, type: value }))}>
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
                <div className="md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newReservation.notes}
                    onChange={(e) => setNewReservation(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notes supplémentaires..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex space-x-2 mt-6">
                <Button onClick={addReservation} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer la réservation
                </Button>
                <Button variant="outline" onClick={() => setShowAddReservation(false)}>
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Détails de la réservation sélectionnée */}
        {selectedReservation && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Détails de la Réservation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Patient</Label>
                  <p className="font-medium">{selectedReservation.patientName}</p>
                </div>
                <div>
                  <Label>Email patient</Label>
                  <p className="font-medium">{selectedReservation.patientEmail}</p>
                </div>
                <div>
                  <Label>Téléphone patient</Label>
                  <p className="font-medium">{selectedReservation.patientPhone}</p>
                </div>
                <div>
                  <Label>Médecin</Label>
                  <p className="font-medium">{selectedReservation.doctorName}</p>
                </div>
                <div>
                  <Label>Date</Label>
                  <p className="font-medium">{new Date(selectedReservation.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <Label>Heure</Label>
                  <p className="font-medium">{selectedReservation.time}</p>
                </div>
                <div>
                  <Label>Type</Label>
                  <p className="font-medium">{getTypeText(selectedReservation.type)}</p>
                </div>
                <div>
                  <Label>Statut</Label>
                  <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReservation.status)}`}>
                    {getStatusIcon(selectedReservation.status)}
                    <span>{getStatusText(selectedReservation.status)}</span>
                  </div>
                </div>
                {selectedReservation.notes && (
                  <div className="md:col-span-2">
                    <Label>Notes</Label>
                    <p className="font-medium">{selectedReservation.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex space-x-2 mt-6">
                {selectedReservation.status === "pending" && (
                  <Button
                    onClick={() => updateReservationStatus(selectedReservation.id, "confirmed")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmer
                  </Button>
                )}
                {selectedReservation.status === "confirmed" && (
                  <Button
                    onClick={() => updateReservationStatus(selectedReservation.id, "cancelled")}
                    variant="destructive"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                )}
                <Button
                  onClick={() => setSelectedReservation(null)}
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
