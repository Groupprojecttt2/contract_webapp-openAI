import { type NextRequest, NextResponse } from "next/server"
import { getContractRecommendations } from "@/lib/openai"

export async function POST(request: NextRequest) {
  try {
    const { contractType, industry, content } = await request.json()

    // Create the prompt for recommendations
    const prompt = `Generate AI-powered recommendations for improving this contract:

Contract Type: ${contractType || "General"}
Industry: ${industry || "General"}
${content ? `Current Content: ${content.substring(0, 1000)}...` : ""}

Provide recommendations in the following categories:

**HIGH PRIORITY IMPROVEMENTS**
- Critical missing clauses
- Legal compliance issues
- Risk mitigation requirements

**MEDIUM PRIORITY ENHANCEMENTS**
- Industry best practices
- Performance optimization
- Clarity improvements

**OPTIONAL ADDITIONS**
- Advanced protections
- Future-proofing considerations
- Competitive advantages

**SPECIFIC CLAUSE RECOMMENDATIONS**
- Force majeure provisions
- Intellectual property protections
- Dispute resolution mechanisms
- Termination procedures
- Payment and penalty terms

For each recommendation, provide:
- Brief explanation of importance
- Suggested implementation approach
- Potential impact on contract effectiveness

Focus on practical, implementable suggestions that add real value.`

    // System prompt for recommendations
    const systemPrompt = `You are an expert contract advisor with deep knowledge of legal best practices across industries.

Your recommendations should be:
- Practical and implementable
- Industry-specific when relevant
- Risk-focused and protective
- Compliant with legal standards
- Business-value oriented

Prioritize recommendations that provide the most protection and value while maintaining enforceability.`

    // Combine system prompt and contract prompt
    const fullPrompt = `${systemPrompt}\n\n${prompt}`;

    // Generate recommendations using OpenAI
    let recommendations = "";
    try {
      recommendations = await getContractRecommendations(content || "");
    } catch (err) {
      console.error("❌ OpenAI recommendations generation error:", err);
      return NextResponse.json({ error: "Failed to generate recommendations using OpenAI.", details: String(err) }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      recommendations,
      contractType,
      industry,
      aiProvider: "OpenAI GPT-4o-mini",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Recommendations generation error:", error)
    return NextResponse.json({ error: "Failed to generate recommendations. Please try again." }, { status: 500 })
  }
}
