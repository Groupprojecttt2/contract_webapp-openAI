import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export { openai };

// Helper function to generate text using OpenAI
export async function generateText(prompt: string, model: string = 'gpt-4o-mini', maxTokens: number = 4000) {
  try {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are a specialized AI Legal Contract Assistant for Aramco Digital. You are EXCLUSIVELY designed to help with contracts, legal agreements, and related legal matters. Provide professional, accurate, and detailed responses for all contract-related queries.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

// Helper function for contract analysis
export async function analyzeContract(content: string, analysisType: string = 'comprehensive') {
  const prompt = `Analyze this legal document and provide a comprehensive assessment:

Document Content:
${content}

Please provide analysis in the following format:

**DOCUMENT OVERVIEW**
- Document type and purpose
- Key parties involved
- Primary obligations and rights

**LEGAL COMPLIANCE**
- Compliance with standard legal requirements
- Missing essential clauses
- Regulatory considerations

**RISK ASSESSMENT**
- High-risk clauses or terms
- Potential legal vulnerabilities
- Recommended protections

**IMPROVEMENT RECOMMENDATIONS**
- Specific suggestions for enhancement
- Industry best practices to implement
- Clarity and enforceability improvements

**OVERALL SCORE**
- Completeness: X/10
- Legal soundness: X/10
- Risk level: Low/Medium/High
- Recommendation: Approve/Revise/Reject

Focus on practical, actionable insights that would be valuable for legal professionals.`;

  return await generateText(prompt, 'gpt-4o-mini', 6000);
}

// Helper function for contract generation
export async function generateContract(prompt: string) {
  return await generateText(prompt, 'gpt-4o-mini', 8000);
}

// Helper function for chat responses
export async function generateChatResponse(message: string, context: string = '') {
  const fullPrompt = context ? `${context}\n\nUser: ${message}` : message;
  return await generateText(fullPrompt, 'gpt-4o-mini', 4000);
}

// Helper function for contract improvements
export async function improveContract(content: string, improvementType: string = 'general') {
  const prompt = `Improve this contract by focusing on ${improvementType} aspects:

Original Contract:
${content}

Please provide an improved version that:
- Enhances clarity and readability
- Strengthens legal enforceability
- Addresses potential gaps or ambiguities
- Follows industry best practices
- Maintains the original intent while improving structure

Provide the improved contract content:`;

  return await generateText(prompt, 'gpt-4o-mini', 8000);
}

// Helper function for contract recommendations
export async function getContractRecommendations(content: string) {
  const prompt = `Based on this contract content, provide specific recommendations for improvement:

Contract Content:
${content}

Please provide recommendations in the following categories:

**STRUCTURAL IMPROVEMENTS**
- Organization and flow suggestions
- Missing sections to consider

**LEGAL ENHANCEMENTS**
- Clauses that could be strengthened
- Additional protections to consider

**RISK MITIGATION**
- Potential vulnerabilities to address
- Protective measures to implement

**COMPLIANCE CONSIDERATIONS**
- Regulatory requirements to verify
- Industry standards to align with

**BEST PRACTICES**
- Modern contract practices to adopt
- Industry-specific recommendations

Focus on actionable, specific recommendations that would improve the contract's effectiveness and enforceability.`;

  return await generateText(prompt, 'gpt-4o-mini', 4000);
}

// Helper function for text explanation
export async function explainText(text: string, explanationType: string = 'legal') {
  const prompt = `Explain this ${explanationType} text in clear, understandable terms:

Text to Explain:
${text}

Please provide:
1. A clear, simple explanation of what this text means
2. Key points and implications
3. Any important legal or business considerations
4. Practical implications for the parties involved

Make the explanation accessible to non-legal professionals while maintaining accuracy.`;

  return await generateText(prompt, 'gpt-4o-mini', 3000);
} 