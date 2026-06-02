import { NextRequest, NextResponse } from "next/server"

const SESSION_COOKIE_NAME = "rotiseria_session"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLogin = pathname === "/login"
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value)

  if (!hasSession && !isLogin) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (hasSession && isLogin) {
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = "/"
    homeUrl.search = ""
    return NextResponse.redirect(homeUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
