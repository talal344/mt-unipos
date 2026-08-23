import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Define root domain (production & local testing)
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'mtmodulix.com'

  // Extract subdomain (e.g., 'pos' from 'pos.mtmodulix.com' or 'pos.localhost:3000')
  let currentSubdomain: string | null = null

  if (hostname.includes(`.${rootDomain}`)) {
    currentSubdomain = hostname.replace(`.${rootDomain}`, '').split(':')[0]
  } else if (hostname.includes('.localhost')) {
    currentSubdomain = hostname.replace('.localhost', '').split(':')[0]
  }

  // Strip 'www' if present
  if (currentSubdomain === 'www') {
    currentSubdomain = null
  }

  // If no subdomain, serve main landing page
  if (!currentSubdomain) {
    return NextResponse.next()
  }

  const path = url.pathname

  // Global shared routes across all subdomains (e.g. login, auth, support)
  const globalRoutes = ['/login', '/about', '/contact', '/privacy', '/terms', '/support', '/demo']
  if (globalRoutes.some((route) => path === route || path.startsWith(`${route}/`))) {
    return NextResponse.next()
  }

  const sub = currentSubdomain.toLowerCase()

  // 1. POS Subdomain (pos.mtmodulix.com)
  if (sub === 'pos') {
    if (path === '/' || path === '/dashboard') {
      url.pathname = '/pos'
      return NextResponse.rewrite(url)
    }
  }

  // 2. HRMS Subdomain (hrms.mtmodulix.com)
  if (sub === 'hrms') {
    if (path === '/' || path === '/dashboard') {
      url.pathname = '/hrms'
      return NextResponse.rewrite(url)
    }
  }

  // 3. SMS / School Subdomain (school.mtmodulix.com / sms.mtmodulix.com)
  if (sub === 'sms' || sub === 'school') {
    if (path === '/' || path === '/dashboard') {
      url.pathname = '/sms'
      return NextResponse.rewrite(url)
    }
  }

  // 4. Admin Subdomain (admin.mtmodulix.com)
  if (sub === 'admin') {
    if (path === '/' || path === '/dashboard') {
      url.pathname = '/admin/dashboard'
      return NextResponse.rewrite(url)
    }
  }

  // 5. Central App Dashboard (app.mtmodulix.com)
  if (sub === 'app') {
    if (path === '/' || path === '/dashboard') {
      url.pathname = '/dashboard'
      return NextResponse.rewrite(url)
    }
  }

  // Generic Subdomain Mapping Fallback
  const subdomainRoutes: Record<string, string> = {
    pos: '/pos',
    hrms: '/hrms',
    sms: '/sms',
    school: '/sms',
    admin: '/admin',
    app: '/dashboard',
    crm: '/crm',
    accounting: '/accounting',
    inventory: '/inventory',
    pharmacy: '/pharmacy',
    restaurant: '/restaurant',
  }

  const targetFolder = subdomainRoutes[sub]
  if (targetFolder && !path.startsWith(targetFolder)) {
    url.pathname = `${targetFolder}${path === '/' ? '' : path}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extension (e.g. .svg, .png, .jpg)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
