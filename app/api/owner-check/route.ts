import { type NextRequest, NextResponse } from "next/server"

const OWNER_IP = "190.82.118.145"

export async function GET(request: NextRequest) {
  try {
    const clientIP =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown"

    const isOwner = clientIP === OWNER_IP

    return NextResponse.json({
      isOwner,
      ip: clientIP,
    })
  } catch (error) {
    console.error("Owner check error:", error)
    return NextResponse.json({
      isOwner: false,
      ip: "unknown",
    })
  }
}
