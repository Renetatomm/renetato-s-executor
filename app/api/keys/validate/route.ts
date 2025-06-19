import { type NextRequest, NextResponse } from "next/server"

// Same storage reference as generation endpoint
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

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json()

    if (!key) {
      return NextResponse.json(
        {
          valid: false,
          error: "Key is required",
        },
        { status: 400 },
      )
    }

    const keyData = keyStorage.get(key)

    if (!keyData) {
      return NextResponse.json(
        {
          valid: false,
          error: "Invalid key",
        },
        { status: 404 },
      )
    }

    // Check if already used
    if (keyData.isUsed) {
      return NextResponse.json(
        {
          valid: false,
          error: "Key already used",
        },
        { status: 403 },
      )
    }

    // Check if expired
    if (new Date() > keyData.expiresAt) {
      return NextResponse.json(
        {
          valid: false,
          error: "Key expired",
        },
        { status: 403 },
      )
    }

    // Mark as used
    keyData.isUsed = true
    keyData.usedAt = new Date()
    keyStorage.set(key, keyData)

    return NextResponse.json({
      valid: true,
      message: "Key validated successfully",
    })
  } catch (error) {
    console.error("Key validation error:", error)
    return NextResponse.json(
      {
        valid: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
