import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

async function authenticate(request: NextRequest) {
  const token = request.cookies.get('capilux-auth')?.value
  if (!token) return false
  const payload = await verifyToken(token)
  return !!payload
}

// GET /api/categories/[id] — Get a single category with its products
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const category = await db.category.findUnique({
      where: { id },
      include: {
        products: {
          where: { isActive: true, isCombo: false },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    if (!category) {
      return NextResponse.json({ error: 'Categoria no encontrada' }, { status: 404 })
    }
    return NextResponse.json(category)
  } catch {
    return NextResponse.json({ error: 'Error al obtener categoria' }, { status: 500 })
  }
}

// PUT /api/categories/[id] — Update a category (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuth = await authenticate(request)
    if (!isAuth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, description, image, isActive } = body

    const data: any = {}

    if (name !== undefined) {
      data.name = name.trim()
      // Regenerate slug
      data.slug = name
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    }
    if (description !== undefined) data.description = description?.trim() || null
    if (image !== undefined) data.image = image || null
    if (isActive !== undefined) data.isActive = isActive

    const category = await db.category.update({
      where: { id },
      data,
    })

    return NextResponse.json(category)
  } catch {
    return NextResponse.json({ error: 'Error al actualizar categoria' }, { status: 500 })
  }
}

// DELETE /api/categories/[id] — Delete a category (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuth = await authenticate(request)
    if (!isAuth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Unlink products from this category before deleting
    await db.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    })

    await db.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error al eliminar categoria' }, { status: 500 })
  }
}
