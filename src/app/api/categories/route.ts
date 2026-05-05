import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

async function authenticate(request: NextRequest) {
  const token = request.cookies.get('capilux-auth')?.value
  if (!token) return false
  const payload = await verifyToken(token)
  return !!payload
}

// GET /api/categories — List all categories (public: only active, admin: all)
export async function GET(request: NextRequest) {
  try {
    const isAuth = await authenticate(request)
    const categories = await db.category.findMany({
      where: isAuth ? {} : { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: { where: { isActive: true, isCombo: false } } } },
      },
    })
    return NextResponse.json(categories)
  } catch {
    return NextResponse.json({ error: 'Error al obtener categorias' }, { status: 500 })
  }
}

// POST /api/categories — Create a new category (admin only)
export async function POST(request: NextRequest) {
  try {
    const isAuth = await authenticate(request)
    if (!isAuth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, image, isActive } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Check for duplicate name or slug
    const existing = await db.category.findFirst({
      where: { OR: [{ name: name.trim() }, { slug }] },
    })
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una categoria con ese nombre' }, { status: 409 })
    }

    const category = await db.category.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        image: image || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al crear categoria' }, { status: 500 })
  }
}
