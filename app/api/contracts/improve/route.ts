import { type NextRequest, NextResponse } from "next/server"
import { improveContract } from "@/lib/openai"

export async function POST(request: NextRequest) {
  try {
    const { content, improvementType = "general", specificConcerns } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Contract content is required for improvement" }, { status: 400 })
    }

    // Improve contract using OpenAI
    let improvedContract = ""
    try {
      improvedContract = await improveContract(content, improvementType)
    } catch (err) {
      console.error("Contract improvement OpenAI error:", err)
      return NextResponse.json({ error: "Failed to improve contract", details: String(err) }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      improvedContract,
      improvementType,
      aiProvider: "OpenAI GPT-4o-mini",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Contract improvement error:", error)
    return NextResponse.json({ error: "Failed to improve contract. Please try again." }, { status: 500 })
  }
}
