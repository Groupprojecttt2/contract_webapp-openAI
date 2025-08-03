import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "@/lib/openai"

export async function POST(request: NextRequest) {
  try {
    const { contractContent, action, value } = await request.json()

    if (!contractContent || !action || !value) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Build a semantic prompt for OpenAI
    const prompt = `You are a legal contract assistant. Here is a contract:

${contractContent}

Instruction: ${action === "custom" ? value : getQuickActionInstruction(action, value)}

Please scan the contract and apply the requested change contextually and semantically. Update all relevant sections, references, and terms as needed. Do not simply replace text; ensure all legal and contextual references are correct. Return the full, updated contract.`

    // Process contract edit using OpenAI
    let updatedContract = ""
    try {
      updatedContract = await generateText(prompt, 'gpt-4o-mini', 8000)
    } catch (err) {
      console.error("Quick edit OpenAI error:", err)
      return NextResponse.json({ error: "Failed to process contract edit", details: String(err) }, { status: 500 })
    }

    if (!updatedContract || updatedContract.length < 100) {
      return NextResponse.json({ error: "Generated contract appears to be incomplete" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      updatedContract,
      action,
      value,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Quick edit error:", error)
    return NextResponse.json({ error: "Failed to process contract edit", details: String(error) }, { status: 500 })
  }
}

// Helper to turn quick action into a clear instruction
function getQuickActionInstruction(action: string, value: string): string {
  switch (action) {
    case "party-a":
      return `Change Party A's name and details to: "${value}". Update all references, signature blocks, and defined terms.`
    case "party-b":
      return `Change Party B's name and details to: "${value}". Update all references, signature blocks, and defined terms.`
    case "amount":
      return `Update the contract value/monetary amount to: "${value}". Update all monetary references consistently.`
    case "date":
      return `Update all relevant dates to: "${value}". This may include start date, end date, execution date, and effective date.`
    case "location":
      return `Change the jurisdiction, governing law, or location references to: "${value}". Update all related terms and clauses.`
    case "terms":
      return `Modify the contract terms as specified: "${value}". Integrate the requested changes professionally.`
    default:
      return value
  }
}
