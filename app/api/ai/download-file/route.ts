import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const content = searchParams.get("content")
    const filename = searchParams.get("filename")
    const mimeType = searchParams.get("type")

    if (!id || !content || !filename || !mimeType) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Decode the base64 content
    const decodedContent = Buffer.from(decodeURIComponent(content), "base64")

    // Create response with proper headers for file download
    const response = new NextResponse(decodedContent)

    response.headers.set("Content-Type", decodeURIComponent(mimeType))
    response.headers.set("Content-Disposition", `attachment; filename="${decodeURIComponent(filename)}"`)
    response.headers.set("Content-Length", decodedContent.length.toString())
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

    return response
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json(
      {
        error: "Failed to download file",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
