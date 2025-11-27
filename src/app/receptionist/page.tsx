"use client"

import { useState } from "react"
import { Calendar, Clock, User, Phone, Mail, Stethoscope, Search, Edit, Trash2, Eye, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Reservation {
  id: string
  patientName: string
  email: string
  phone: string
  date: string
  time: string
  doctor: string
  reason: string
  status: "confirmed" | "pending" | "cancelled"
  createdAt: string
}

export default function ReceptionistInterface() {
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: "1",
      patientName: "Jean Dupont",
      email: "jean.dupont@email.com",
      phone: "06 12 34 56 78",
      date: "2024-12-01",
      time: "09:00",
      doctor: "Dr. Sarah Martin - Cardiologie",
      reason: "Consultation de routine",
      status: "confirmed",
      createdAt: "2024-11-25"
    },
    {
      id: "2",
      patientName: "Marie Laurent",
      email: "marie.laurent@email.com",
      phone: "06 23 45 67 89",
      date: "2024-12-01",
      time: "10:30",
      doctor: "Dr. Jean Dubois - Médecine générale",
      reason: "Douleur abdominale",
      status: "pending",
      createdAt: "2024-11-26"
    },
    {
      id: "3",
      patientName: "Pierre Bernard",
      email: "pierre.bernard@email.com",
      phone: "06 34 56 78 90",
      date: "2024-12-02",
      time: "14:00",
      doctor: "Dr. Marie Laurent - Pédiatrie",
      reason: "Visite de contrôle",
      status: "confirmed",
      createdAt: "2024-11-24"
    },
    {
      id: "4",
      patientName: "Sophie Petit",
      email: "sophie.petit@email.com",
      phone: "06 45 67 89 01",
      date: "2024-12-03",
      time: "11:00",
      doctor: "Dr. Pierre Bernard - Dermatologie",
      reason: "Examen de la peau",
      status: "cancelled",
      createdAt: "2024-11-23"
    }
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.phone.includes(searchTerm)
    const matchesStatus = statusFilter === "all" || reservation.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const updateReservationStatus = (id: string, status: Reservation["status"]) => {
    setReservations(prev => prev.map(res => 
      res.id === id ? { ...res, status } : res
    ))
  }

  const deleteReservation = (id: string) => {
    setReservations(prev => prev.filter(res => res.id !== id))
    setSelectedReservation(null)
  }

  const getStatusColor = (status: Reservation["status"]) => {
    switch (status) {
      case "confirmed": return "text-green-600 bg-green-50"
      case "pending": return "text-yellow-600 bg-yellow-50"
      case "cancelled": return "text-red-600 bg-red-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const getStatusIcon = (status: Reservation["status"]) => {
    switch (status) {
      case "confirmed": return <CheckCircle className="h-4 w-4" />
      case "pending": return <AlertCircle className="h-4 w-4" />
      case "cancelled": return <XCircle className="h-4 w-4" />
      default: return null
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

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Stethoscope className="h-10 w-10 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Espace Réceptionniste</h1>
              <p className="text-gray-600">Clinique Santé Plus</p>
            </div>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Nouvelle réservation
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Réservations aujourd&apos;hui</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En attente</p>
                  <p className="text-2xl font-bold text-yellow-600">3</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cette semaine</p>
                  <p className="text-2xl font-bold text-gray-900">45</p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par nom, email ou téléphone..."
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
                  <SelectItem value="confirmed">Confirmés</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="cancelled">Annulés</SelectItem>
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
                    <th className="text-left p-2">Statut</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{reservation.patientName}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{reservation.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{reservation.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-2">{reservation.date}</td>
                      <td className="p-2">{reservation.time}</td>
                      <td className="p-2">
                        <div className="flex items-center space-x-1">
                          <Stethoscope className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{reservation.doctor}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                          {getStatusIcon(reservation.status)}
                          <span>{getStatusText(reservation.status)}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedReservation(reservation)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedReservation(reservation)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteReservation(reservation.id)}
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

        {selectedReservation && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Détails de la réservation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Patient</Label>
                  <p className="font-medium">{selectedReservation.patientName}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedReservation.email}</p>
                </div>
                <div>
                  <Label>Téléphone</Label>
                  <p className="font-medium">{selectedReservation.phone}</p>
                </div>
                <div>
                  <Label>Date</Label>
                  <p className="font-medium">{selectedReservation.date}</p>
                </div>
                <div>
                  <Label>Heure</Label>
                  <p className="font-medium">{selectedReservation.time}</p>
                </div>
                <div>
                  <Label>Médecin</Label>
                  <p className="font-medium">{selectedReservation.doctor}</p>
                </div>
                <div className="md:col-span-2">
                  <Label>Motif de consultation</Label>
                  <p className="font-medium">{selectedReservation.reason}</p>
                </div>
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
