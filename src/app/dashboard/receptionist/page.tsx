"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardReceptionistPage() {
  const router = useRouter()

  useEffect(() => {
    // Rediriger vers la page principale du réceptionniste
    router.replace("/receptionist")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirection vers l'espace réceptionniste...</p>
      </div>
    </div>
  )
}
