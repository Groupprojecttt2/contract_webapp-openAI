import { type NextRequest, NextResponse } from "next/server"
import { explainText } from "@/lib/openai"

export async function POST(request: NextRequest) {
  try {
    const { selectedText, contractContent } = await request.json()

    if (!selectedText || !contractContent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Explain text using OpenAI
    const explanation = await explainText(selectedText, "legal")

    return NextResponse.json({
      success: true,
      explanation,
      selectedText,
    })
  } catch (error) {
    console.error("Text explanation error:", error)
    return NextResponse.json(
      {
        error: "Failed to explain text",
        details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : undefined) : undefined,
      },
      { status: 500 },
    )
  }
}
