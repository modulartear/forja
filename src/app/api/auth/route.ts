import { NextRequest, NextResponse } from 'next/server'
import { verifyCredentials, createToken, verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 })
    }

    const result = await verifyCredentials(email, password)
    if (!result.valid || !result.user) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    const token = await createToken({
      email: result.user.email,
      userId: result.user.id,
      role: result.user.role,
      permissions: result.user.permissions,
    })

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
    })
    response.cookies.set('capilux-auth', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('capilux-auth')?.value
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      email: payload.email,
      userId: payload.userId,
      role: payload.role,
      permissions: payload.permissions,
    })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set('capilux-auth', '', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return response
}
