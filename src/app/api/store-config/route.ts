import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Public endpoint - returns only store-related config (no secrets)
export async function GET() {
  try {
    const keys = [
      'STORE_NAME',
      'STORE_LOGO',
      'STORE_FAVICON',
      'STORE_TITLE',
      'STORE_DESCRIPTION',
      'STORE_WHATSAPP',
    ]
    const configs = await db.config.findMany({
      where: { key: { in: keys } },
    })
    const configMap: Record<string, string> = {}
    for (const c of configs) {
      configMap[c.key] = c.value
    }
    return NextResponse.json(configMap)
  } catch {
    return NextResponse.json({})
  }
}
