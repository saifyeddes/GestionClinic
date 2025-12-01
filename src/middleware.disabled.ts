import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = ['/login', '/register', '/']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Vérifier si la route est publique
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Vérifier si la route est protégée (commence par /dashboard, /admin, /patient, /receptionist)
  const protectedRoutes = ['/dashboard', '/admin', '/patient', '/receptionist']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Vérifier si le token JWT est présent
    const token = request.cookies.get('clinic_token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      // Rediriger vers la page de login si pas de token
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      // Vérifier la validité du token (simple vérification de structure)
      // En production, vous devriez vérifier le token avec votre clé secrète
      const tokenParts = token.split('.')
      if (tokenParts.length !== 3) {
        throw new Error('Token invalide')
      }

      // Décoder le payload pour vérifier l'expiration
      const payload = JSON.parse(atob(tokenParts[1]))
      const currentTime = Date.now() / 1000

      if (payload.exp && payload.exp < currentTime) {
        throw new Error('Token expiré')
      }

      // Vérifier si l'utilisateur a le bon rôle pour accéder à la route
      const userRole = payload.role

      // Vérification des permissions par rôle
      if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('error', 'access_denied')
        return NextResponse.redirect(loginUrl)
      }

      if (pathname.startsWith('/dashboard/doctor') && userRole !== 'DOCTOR') {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('error', 'access_denied')
        return NextResponse.redirect(loginUrl)
      }

      if (pathname.startsWith('/patient') && userRole !== 'PATIENT') {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('error', 'access_denied')
        return NextResponse.redirect(loginUrl)
      }

      if (pathname.startsWith('/receptionist') && userRole !== 'RECEPTIONIST') {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('error', 'access_denied')
        return NextResponse.redirect(loginUrl)
      }

    } catch {
      // Token invalide ou expiré, rediriger vers login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('error', 'token_invalid')
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
