import { type NextRequest, NextResponse } from "next/server"
import { analyzeContract } from "@/lib/openai"

export async function POST(request: NextRequest) {
  try {
    const { content, analysisType = "comprehensive" } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Document content is required for analysis" }, { status: 400 })
    }

    console.log("🔍 Analyzing document with OpenAI...")

    // Analyze document using OpenAI
    const analysis = await analyzeContract(content, analysisType)

    console.log("✅ Document analysis completed with OpenAI")

    return NextResponse.json({
      success: true,
      analysis,
      analysisType,
      aiProvider: "OpenAI GPT-4o-mini",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Document analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze document. Please try again." }, { status: 500 })
  }
}
