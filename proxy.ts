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

  // If no subdomain or 'www', serve main landing page as normal
  if (!currentSubdomain || currentSubdomain === 'www') {
    return NextResponse.next()
  }

  const path = url.pathname

  // Global shared routes across all subdomains (e.g. login, auth, support)
  const globalRoutes = ['/login', '/about', '/contact', '/privacy', '/terms', '/support', '/demo']
  if (globalRoutes.some((route) => path === route || path.startsWith(`${route}/`))) {
    return NextResponse.next()
  }

  // Subdomain mapping table
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

  const targetFolder = subdomainRoutes[currentSubdomain.toLowerCase()]

  if (targetFolder) {
    // If path is not already prefixed with targetFolder
    if (!path.startsWith(targetFolder)) {
      url.pathname = `${targetFolder}${path === '/' ? '' : path}`
      return NextResponse.rewrite(url)
    }
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
