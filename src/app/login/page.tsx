'use client';

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => null);
      console.log("Réponse du backend:", data);
      if (!res.ok) {
        throw new Error(data?.message ?? "Échec de la connexion");
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem("clinic_token", data.accessToken);
        window.localStorage.setItem("clinic_user", JSON.stringify(data.user));
      }

      const role = data.user?.role as string | undefined;
      let redirect = "/";
      if (role === "ADMIN") redirect = "/admin";
      else if (role === "DOCTOR") redirect = "/dashboard/doctor";
      else if (role === "RECEPTIONIST") redirect = "/receptionist";
      else if (role === "PATIENT") redirect = "/patient";
      
      console.log("Redirection vers:", redirect, "pour le rôle:", role);
      router.push(redirect);
    } catch (err: any) {
      setError(err.message ?? "Échec de la connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-5xl w-full grid gap-8 md:grid-cols-[1.2fr,1fr] items-center">
        {/* Section gauche - Informations */}
        <section className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-700">
              Bienvenue de retour
            </p>
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              Connectez-vous à votre <span className="text-blue-600">espace clinique</span>
            </h1>
            <p className="text-gray-600 text-lg">
              Utilisez le même compte que vous soyez patient, médecin, administrateur ou réceptionniste.
            </p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-gray-800">Pourquoi choisir notre plateforme ?</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                </div>
                <span className="text-gray-700">Accès sécurisé basé sur les rôles</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                </div>
                <span className="text-gray-700">Gestion des rendez-vous en temps réel</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                </div>
                <span className="text-gray-700">Centralisation des données patients</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium">P</div>
              <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium">M</div>
              <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium">A</div>
            </div>
            <span>Rejoint par +500 professionnels de santé</span>
          </div>
        </section>

        {/* Section droite - Formulaire */}
        <section className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-100 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connexion</h2>
            <p className="text-gray-600 text-sm">Accédez à votre tableau de bord personnalisé</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="vous@exemple.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Mot de passe oublié ?
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] shadow-lg"
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Pas encore de compte ?{" "}
              <Link href="/register" className="text-blue-600 font-semibold hover:text-blue-700">
                Créer un compte
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
