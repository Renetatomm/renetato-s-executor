import { type NextRequest, NextResponse } from "next/server"
import { generateSecureKey } from "@/lib/utils"

// In-memory storage for demo (use a real database in production)
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

const lastGeneration = new Map<string, Date>()
const COOLDOWN_MINUTES = 5

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    // Check cooldown
    const lastGen = lastGeneration.get(clientIP)
    if (lastGen) {
      const cooldownEnd = new Date(lastGen.getTime() + COOLDOWN_MINUTES * 60 * 1000)
      const now = new Date()

      if (now < cooldownEnd) {
        const remainingMs = cooldownEnd.getTime() - now.getTime()
        const remainingMinutes = Math.ceil(remainingMs / (1000 * 60))

        return NextResponse.json(
          {
            success: false,
            error: "Cooldown active",
            cooldownRemaining: remainingMinutes,
          },
          { status: 429 },
        )
      }
    }

    // Generate new key
    const key = generateSecureKey()
    const createdAt = new Date()
    const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000) // 24 hours

    keyStorage.set(key, {
      key,
      createdAt,
      expiresAt,
      isUsed: false,
      ipAddress: clientIP,
    })

    lastGeneration.set(clientIP, createdAt)

    return NextResponse.json({
      success: true,
      key,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error("Key generation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
