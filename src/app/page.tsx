"use client"

import { useState } from "react"
import { Stethoscope, Heart, Users, Clock, CheckCircle, Phone, Mail, MapPin, ArrowRight, Calendar, Shield, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("patient")

  const features = [
    {
      icon: <Stethoscope className="h-8 w-8 text-blue-600" />,
      title: "Médecins Qualifiés",
      description: "Notre équipe de médecins expérimentés vous garantit des soins de qualité"
    },
    {
      icon: <Heart className="h-8 w-8 text-red-600" />,
      title: "Soins Personnalisés",
      description: "Chaque patient bénéficie d'un suivi médical adapté à ses besoins"
    },
    {
      icon: <Users className="h-8 w-8 text-emerald-600" />,
      title: "Équipe Dédiée",
      description: "Personnel administratif et médical à votre écoute"
    },
    {
      icon: <Clock className="h-8 w-8 text-purple-600" />,
      title: "Rendez-vous Rapides",
      description: "Prise de rendez-vous simplifiée et sans attente"
    }
  ]

  const handleRoleSelection = (role: string) => {
    setTimeout(() => {
      window.location.href = `/${role}`
    }, 500)
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-cyan-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-blue-100 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-linear-to-br from-blue-500 to-cyan-600 p-2 rounded-lg">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Clinique Santé Plus</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#services" className="text-gray-600 hover:text-blue-600 transition-colors">Services</a>
              <a href="#team" className="text-gray-600 hover:text-blue-600 transition-colors">Équipe</a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</a>
              <Link href="/login">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Espace Connexion
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
                <Shield className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Soins médicaux de confiance</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Votre Santé,<br />
                <span className="bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Notre Priorité</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Accédez à des soins médicaux de qualité avec notre équipe de professionnels dévoués. 
                Prenez rendez-vous en ligne et bénéficiez d'un suivi personnalisé.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Créer un Compte
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                    Se Connecter
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-linear-to-br from-blue-100 to-cyan-100 rounded-2xl p-8 shadow-xl">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-white shadow-lg">
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">5000+</p>
                      <p className="text-sm text-gray-600">Patients</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white shadow-lg">
                    <CardContent className="p-4 text-center">
                      <Stethoscope className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">25+</p>
                      <p className="text-sm text-gray-600">Médecins</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white shadow-lg">
                    <CardContent className="p-4 text-center">
                      <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">15+</p>
                      <p className="text-sm text-gray-600">Années</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white shadow-lg">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">98%</p>
                      <p className="text-sm text-gray-600">Satisfaction</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pourquoi Nous Choisir?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez tous les avantages de faire confiance à notre clinique pour votre santé
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-blue-100 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section id="services" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Accès par Rôle</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Chaque espace est adapté à vos besoins spécifiques
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <Card 
              className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 hover:border-blue-300"
              onClick={() => handleRoleSelection('patient')}
            >
              <CardHeader className="text-center">
                <div className="bg-linear-to-br from-blue-500 to-blue-600 p-4 rounded-full w-fit mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-blue-800">Espace Patient</CardTitle>
                <CardDescription className="text-blue-600">
                  Réservation, modification, paiement et téléchargement ordonnances PDF
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Prise de rendez-vous en ligne</li>
                  <li>• Modification/annulation simple</li>
                  <li>• Téléchargement ordonnances PDF</li>
                  <li>• Paiement en ligne sécurisé</li>
                </ul>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 hover:border-emerald-300"
              onClick={() => handleRoleSelection('dashboard/doctor')}
            >
              <CardHeader className="text-center">
                <div className="bg-linear-to-br from-emerald-500 to-emerald-600 p-4 rounded-full w-fit mx-auto mb-4">
                  <Stethoscope className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-emerald-800">Espace Médecin</CardTitle>
                <CardDescription className="text-emerald-600">
                  Gestion agenda, dossiers médicaux et ordonnances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Gestion complete de l'agenda</li>
                  <li>• Dossiers médicaux numériques</li>
                  <li>• Ordonnances électroniques</li>
                  <li>• Suivi des patients</li>
                </ul>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 hover:border-cyan-300"
              onClick={() => handleRoleSelection('receptionist')}
            >
              <CardHeader className="text-center">
                <div className="bg-linear-to-br from-cyan-500 to-cyan-600 p-4 rounded-full w-fit mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-cyan-800">Espace Réceptionniste</CardTitle>
                <CardDescription className="text-cyan-600">
                  Rendez-vous, enregistrement patients et facturation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Prise de rendez-vous téléphonique</li>
                  <li>• Enregistrement patients</li>
                  <li>• Gestion des plannings</li>
                  <li>• Facturation et paiements</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-4">Pour l'accès administrateur, veuillez contacter le support technique</p>
            <Link href="/admin">
              <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                Accès Admin
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contactez-nous</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Notre équipe est à votre disposition pour répondre à toutes vos questions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-blue-100">
              <CardContent className="p-6">
                <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Téléphone</h3>
                <p className="text-gray-600">+33 1 234 567 890</p>
                <p className="text-sm text-gray-500">Lun-Ven: 8h-20h</p>
              </CardContent>
            </Card>
            <Card className="text-center border-blue-100">
              <CardContent className="p-6">
                <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600">contact@clinique-santeplus.fr</p>
                <p className="text-sm text-gray-500">Réponse sous 24h</p>
              </CardContent>
            </Card>
            <Card className="text-center border-blue-100">
              <CardContent className="p-6">
                <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Adresse</h3>
                <p className="text-gray-600">123 Rue de la Santé</p>
                <p className="text-sm text-gray-500">75001 Paris, France</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">Clinique Santé Plus</span>
              </div>
              <p className="text-gray-400 text-sm">
                Votre santé est notre priorité. Une équipe de professionnels dévoués à votre service.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Médecine générale</li>
                <li>Cardiologie</li>
                <li>Pédiatrie</li>
                <li>Urgences</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Accès Rapide</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/login" className="hover:text-white">Espace Connexion</Link></li>
                <li><Link href="/register" className="hover:text-white">Créer Compte</Link></li>
                <li><a href="#services" className="hover:text-white">Services</a></li>
                <li><a href="#contact" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Horaires</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Lundi - Vendredi: 8h - 20h</li>
                <li>Samedi: 9h - 18h</li>
                <li>Dimanche: 9h - 12h</li>
                <li>Urgences: 24/7</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Clinique Santé Plus. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
