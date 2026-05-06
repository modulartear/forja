import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken, hasPermission } from '@/lib/auth'

async function authenticateAndCheck(request: NextRequest, resource: string) {
  const token = request.cookies.get('capilux-auth')?.value
  if (!token) return { authed: false, payload: null }
  const payload = await verifyToken(token)
  if (!payload) return { authed: false, payload: null }
  if (payload.role === 'superadmin') return { authed: true, payload }
  if (!hasPermission(payload.permissions, resource)) return { authed: false, payload }
  return { authed: true, payload }
}

// GET /api/users — List all users (superadmin or users permission)
export async function GET(request: NextRequest) {
  try {
    const { authed } = await authenticateAndCheck(request, 'users')
    if (!authed) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        permissions: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(users)
  } catch {
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 })
  }
}

// POST /api/users — Create a new user (superadmin or users permission)
export async function POST(request: NextRequest) {
  try {
    const { authed, payload } = await authenticateAndCheck(request, 'users')
    if (!authed) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { email, password, name, role, permissions } = body

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, contraseña y nombre son requeridos' }, { status: 400 })
    }

    // Only superadmin can create superadmin users
    if (role === 'superadmin' && payload?.role !== 'superadmin') {
      return NextResponse.json({ error: 'No tienes permiso para crear superadmins' }, { status: 403 })
    }

    // Check for duplicate email
    const existing = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 })
    }

    const user = await db.user.create({
      data: {
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
        role: role || 'editor',
        permissions: permissions || JSON.stringify({ products: true, combos: true, orders: true, categories: true, config: false, users: false }),
      },
    })

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      isActive: user.isActive,
    }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: 'Error al crear usuario: ' + (e.message || '') }, { status: 500 })
  }
}
