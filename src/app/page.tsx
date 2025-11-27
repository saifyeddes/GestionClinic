"use client"

import { Stethoscope, Calendar, Users, Shield, ArrowRight, Phone, Mail, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {

  const handleRoleSelection = (role: string) => {
    setTimeout(() => {
      window.location.href = `/${role}`
    }, 500)
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Stethoscope className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Clinique Santé Plus</h1>
          </div>
          <p className="text-xl text-gray-600 mb-8">
            Système de réservation de rendez-vous médicaux
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card 
            className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 hover:border-blue-300"
            onClick={() => handleRoleSelection("patient")}
          >
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-100 rounded-full">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-xl text-blue-600">Espace Patient</CardTitle>
              <CardDescription>
                Prenez rendez-vous avec nos médecins en quelques clics
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li className="flex items-center justify-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span>Réservation en ligne</span>
                </li>
                <li className="flex items-center justify-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>Choix des créneaux</span>
                </li>
                <li className="flex items-center justify-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span>Confirmation par email</span>
                </li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Accéder Patient
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 hover:border-green-300"
            onClick={() => handleRoleSelection("receptionist")}
          >
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-green-100 rounded-full">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-xl text-green-600">Espace Réceptionniste</CardTitle>
              <CardDescription>
                Gérez toutes les réservations des patients
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li className="flex items-center justify-center space-x-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <span>Gestion des patients</span>
                </li>
                <li className="flex items-center justify-center space-x-2">
                  <Calendar className="h-4 w-4 text-green-500" />
                  <span>Planning des rendez-vous</span>
                </li>
                <li className="flex items-center justify-center space-x-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span>Modification des créneaux</span>
                </li>
              </ul>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Accéder Réceptionniste
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 hover:border-purple-300"
            onClick={() => handleRoleSelection("admin")}
          >
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-purple-100 rounded-full">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <CardTitle className="text-xl text-purple-600">Espace Administrateur</CardTitle>
              <CardDescription>
                Gérez les réservations et les réceptionnistes
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li className="flex items-center justify-center space-x-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span>Gestion des réceptionnistes</span>
                </li>
                <li className="flex items-center justify-center space-x-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span>Supervision des réservations</span>
                </li>
                <li className="flex items-center justify-center space-x-2">
                  <Shield className="h-4 w-4 text-purple-500" />
                  <span>Contrôle d&apos;accès</span>
                </li>
              </ul>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Accéder Admin
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Contact Téléphone</h3>
              <p className="text-gray-600">01 23 45 67 89</p>
              <p className="text-sm text-gray-500">Du lundi au samedi, 8h-20h</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">contact@clinique-santeplus.fr</p>
              <p className="text-sm text-gray-500">Réponse sous 24h</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Adresse</h3>
              <p className="text-gray-600">123 Rue de la Santé</p>
              <p className="text-sm text-gray-500">75001 Paris</p>
            </CardContent>
          </Card>
        </div>

        <footer className="text-center text-gray-600 border-t pt-8">
          <p>&copy; 2024 Clinique Santé Plus. Tous droits réservés.</p>
          <p className="text-sm mt-2">Système de réservation médical moderne et sécurisé</p>
        </footer>
      </div>
    </div>
  )
}
