import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "@/lib/openai"

export async function POST(request: NextRequest) {
  try {
    const { content, contractType } = await request.json()

    // Create the prompt for review checklist
    const prompt = `Create a comprehensive review checklist for this contract:

Contract Type: ${contractType || "General"}
${content ? `Contract Content: ${content.substring(0, 1500)}...` : ""}

Generate a detailed checklist with the following sections:

**ESSENTIAL ELEMENTS** ✅❌
- [ ] Parties clearly identified with full legal names
- [ ] Scope of work/services clearly defined
- [ ] Payment terms and amounts specified
- [ ] Contract duration and key dates
- [ ] Termination procedures outlined
- [ ] Governing law specified
- [ ] Signature blocks present

**LEGAL REQUIREMENTS** ✅❌
- [ ] Legal capacity of parties confirmed
- [ ] Consideration clearly stated
- [ ] Compliance with applicable regulations
- [ ] Required disclosures included
- [ ] Witness/notarization requirements met

**RISK MANAGEMENT** ✅❌
- [ ] Liability limitations included
- [ ] Indemnification clauses present
- [ ] Insurance requirements specified
- [ ] Force majeure provisions
- [ ] Confidentiality protections
- [ ] Intellectual property rights addressed

**OPERATIONAL CLARITY** ✅❌
- [ ] Performance standards defined
- [ ] Delivery/milestone requirements
- [ ] Communication procedures
- [ ] Change management process
- [ ] Dispute resolution mechanism

**COMPLIANCE & STANDARDS** ✅❌
- [ ] Industry-specific requirements
- [ ] Regulatory compliance addressed
- [ ] Quality standards specified
- [ ] Safety requirements included

Provide an overall completion score and priority recommendations for missing items.`

    // System prompt for review checklist
    const systemPrompt = `You are a meticulous legal reviewer specializing in contract completeness and compliance.

Your checklist should be:
- Comprehensive and thorough
- Specific to the contract type
- Prioritized by importance
- Actionable and clear
- Compliant with legal standards

Use checkboxes (✅ for complete, ❌ for missing, ⚠️ for needs review) and provide specific guidance for each item.`

    // Combine system prompt and contract prompt
    const fullPrompt = `${systemPrompt}\n\n${prompt}`;

    // Generate review checklist using OpenAI
    let checklist = "";
    try {
      checklist = await generateText(fullPrompt, 'gpt-4o-mini', 4000);
    } catch (err) {
      console.error("❌ Review checklist generation error:", err);
      return NextResponse.json({ error: "Failed to generate review checklist using OpenAI.", details: String(err) }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      checklist,
      contractType,
      aiProvider: "OpenAI GPT-4o-mini",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Review checklist generation error:", error)
    return NextResponse.json({ error: "Failed to generate review checklist. Please try again." }, { status: 500 })
  }
}
