import { SignJWT, jwtVerify } from 'jose'
import { db } from '@/lib/db'

const JWT_SECRET = new TextEncoder().encode('forja-secret-key-2024')

export interface AuthPayload {
  email: string
  userId: string
  role: string
  permissions: string
  iat: number
  exp: number
}

export async function verifyCredentials(email: string, password: string): Promise<{ valid: boolean; user?: { id: string; email: string; name: string; role: string; permissions: string } }> {
  const user = await db.user.findUnique({ where: { email } })
  if (!user) return { valid: false }
  if (!user.isActive) return { valid: false }
  if (user.password !== password) return { valid: false }

  return {
    valid: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
    },
  }
}

export async function createToken(payload: { email: string; userId: string; role: string; permissions: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as AuthPayload
  } catch {
    return null
  }
}

export function parsePermissions(permissionsStr: string): Record<string, boolean> {
  try {
    return JSON.parse(permissionsStr)
  } catch {
    return { products: true, combos: true, orders: true, categories: true, config: true, users: false }
  }
}

export function hasPermission(permissionsStr: string, resource: string): boolean {
  const perms = parsePermissions(permissionsStr)
  return perms[resource] === true
}
