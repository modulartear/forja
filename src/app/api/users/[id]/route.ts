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

// GET /api/users/[id] — Get a single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authed } = await authenticateAndCheck(request, 'users')
    if (!authed) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const user = await db.user.findUnique({
      where: { id },
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

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Error al obtener usuario' }, { status: 500 })
  }
}

// PUT /api/users/[id] — Update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authed, payload } = await authenticateAndCheck(request, 'users')
    if (!authed) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { email, password, name, role, isActive, permissions } = body

    // Only superadmin can modify superadmin users or assign superadmin role
    const targetUser = await db.user.findUnique({ where: { id } })
    if (!targetUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }
    if (targetUser.role === 'superadmin' && payload?.role !== 'superadmin') {
      return NextResponse.json({ error: 'No tienes permiso para modificar un superadmin' }, { status: 403 })
    }
    if (role === 'superadmin' && payload?.role !== 'superadmin') {
      return NextResponse.json({ error: 'No tienes permiso para asignar rol superadmin' }, { status: 403 })
    }

    const data: any = {}
    if (email !== undefined) data.email = email.trim().toLowerCase()
    if (password !== undefined && password.trim() !== '') data.password = password
    if (name !== undefined) data.name = name.trim()
    if (role !== undefined) data.role = role
    if (isActive !== undefined) data.isActive = isActive
    if (permissions !== undefined) data.permissions = typeof permissions === 'string' ? permissions : JSON.stringify(permissions)

    const user = await db.user.update({
      where: { id },
      data,
    })

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      isActive: user.isActive,
    })
  } catch {
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 })
  }
}

// DELETE /api/users/[id] — Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authed, payload } = await authenticateAndCheck(request, 'users')
    if (!authed) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Cannot delete yourself
    if (payload?.userId === id) {
      return NextResponse.json({ error: 'No podés eliminar tu propio usuario' }, { status: 400 })
    }

    // Only superadmin can delete superadmin
    const targetUser = await db.user.findUnique({ where: { id } })
    if (!targetUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }
    if (targetUser.role === 'superadmin' && payload?.role !== 'superadmin') {
      return NextResponse.json({ error: 'No tienes permiso para eliminar un superadmin' }, { status: 403 })
    }

    await db.user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 })
  }
}
