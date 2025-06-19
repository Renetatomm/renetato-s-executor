import type { NextRequest } from "next/server"

// Same storage reference as other endpoints
const keyStorage = new Map<
  string,
  {
    key: string
    createdAt: Date
    expiresAt: Date
    isUsed: boolean
    usedAt?: Date
    ipAddress?: string
  }
>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")

    if (!key) {
      return new Response("INVALID", { status: 400 })
    }

    const keyData = keyStorage.get(key)

    if (!keyData) {
      return new Response("INVALID", { status: 404 })
    }

    // Check if already used
    if (keyData.isUsed) {
      return new Response("INVALID", { status: 403 })
    }

    // Check if expired (24 hours from creation)
    const now = new Date()
    if (now > keyData.expiresAt) {
      return new Response("INVALID", { status: 403 })
    }

    // Mark as used
    keyData.isUsed = true
    keyData.usedAt = now
    keyStorage.set(key, keyData)

    return new Response("VALID", { status: 200 })
  } catch (error) {
    console.error("Key validation error:", error)
    return new Response("INVALID", { status: 500 })
  }
}
