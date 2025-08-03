import { type NextRequest, NextResponse } from "next/server"
import { generateChatResponse } from "@/lib/openai"

export async function POST(request: NextRequest) {
  try {
    const { message, attachments, contractContent, contractId, conversationHistory } = await request.json()

    if (!message && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ error: "Message or attachments required" }, { status: 400 })
    }

    // Check if the query is contract/legal related
    const contractKeywords = [
      "contract",
      "agreement",
      "legal",
      "law",
      "clause",
      "term",
      "liability",
      "breach",
      "compliance",
      "nda",
      "employment",
      "service",
      "partnership",
      "license",
      "consulting",
      "confidentiality",
      "intellectual property",
      "termination",
      "payment",
      "obligation",
      "rights",
      "jurisdiction",
      "arbitration",
      "dispute",
      "remedy",
      "damages",
      "warranty",
      "indemnity",
      "force majeure",
      "governing law",
      "amendment",
      "assignment",
      "severability",
      "waiver",
      "notice",
      "signature",
      "execution",
      "binding",
      "enforceable",
      "void",
      "voidable",
      "consideration",
      "mutual",
      "unilateral",
      "bilateral",
      "performance",
      "default",
      "cure",
      "material",
      "substantial",
      "reasonable",
      "good faith",
      "due diligence",
      "best efforts",
      "commercially reasonable",
    ]

    const isContractRelated =
      contractKeywords.some((keyword) => message.toLowerCase().includes(keyword.toLowerCase())) ||
      contractContent ||
      attachments?.some(
        (file: any) =>
          file.name.toLowerCase().includes("contract") ||
          file.name.toLowerCase().includes("agreement") ||
          file.type === "application/pdf",
      )

    // Domain-specific system prompt with strict boundaries
    let systemPrompt = `You are a specialized AI Legal Contract Assistant for Aramco Digital. You are EXCLUSIVELY designed to help with contracts, legal agreements, and related legal matters.

STRICT DOMAIN BOUNDARIES:
- You ONLY assist with contracts, legal agreements, legal documents, and contract law
- You ONLY provide advice on contract terms, clauses, legal language, and contract-related processes
- You ONLY generate, analyze, review, and improve legal contracts and agreements

AREAS OF EXPERTISE:
✅ Contract Analysis & Review
✅ Legal Document Generation (NDAs, Employment Contracts, Service Agreements, etc.)
✅ Contract Clause Interpretation
✅ Legal Risk Assessment
✅ Compliance & Regulatory Guidance
✅ Contract Negotiation Strategies
✅ Legal Term Definitions
✅ Contract Templates & Standards
✅ Legal Document Formatting
✅ Contract Lifecycle Management

WHAT YOU DO NOT HANDLE:
❌ General conversation or small talk
❌ Technical support unrelated to contracts
❌ Personal advice outside legal/contract context
❌ Entertainment, games, or casual topics
❌ Non-legal business advice
❌ Programming help (unless for legal document automation)
❌ General knowledge questions outside legal domain

RESPONSE PROTOCOL:
If a user asks about topics outside contracts/legal domain, respond with:
"I'm a specialized Legal Contract Assistant focused exclusively on contracts, legal agreements, and contract law. I can help you with contract analysis, legal document generation, clause interpretation, compliance guidance, and all contract-related matters. 

How can I assist you with your contract or legal document needs today?"

PROFESSIONAL STANDARDS:
- Always maintain professional legal assistant tone
- Provide accurate, detailed contract guidance
- Reference relevant legal principles when applicable
- Suggest specific contract improvements
- Offer template-based solutions when appropriate
- Include disclaimers for complex legal matters

Current context:
- Contract content available: ${contractContent ? "Yes" : "No"}
- Contract ID: ${contractId || "None"}
- User uploaded files: ${attachments && attachments.length > 0 ? "Yes" : "No"}

IMPORTANT: If the user's query is not related to contracts, legal agreements, or legal matters, politely redirect them back to contract-related assistance using the response protocol above.`

    if (contractContent) {
      systemPrompt += `\n\nCurrent contract content for analysis:\n${contractContent.substring(0, 2000)}...`
    }

    // Build conversation context
    let conversationContext = ""
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext = conversationHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join("\n")
    }

    // Handle file attachments
    let attachmentContext = ""
    if (attachments && attachments.length > 0) {
      attachmentContext = `\n\nUser has uploaded ${attachments.length} file(s):\n`
      attachments.forEach((file: any, index: number) => {
        attachmentContext += `${index + 1}. ${file.name} (${file.type})\n`
      })
    }

    // Check if user is requesting PDF generation
    const isPdfRequest =
      message.toLowerCase().includes("pdf") ||
      message.toLowerCase().includes("generate") ||
      message.toLowerCase().includes("create contract") ||
      message.toLowerCase().includes("template") ||
      message.toLowerCase().includes("download") ||
      message.toLowerCase().includes("export")

    const fullPrompt = `${conversationContext}\n\nUser: ${message}${attachmentContext}`

    // Generate response using OpenAI
    let text = "";
    try {
      text = await generateChatResponse(message, fullPrompt);
    } catch (err) {
      console.error("Chat API error:", err);
      
      // Handle OpenAI quota errors specifically
      if (err instanceof Error && err.message.includes("quota")) {
        return NextResponse.json(
          {
            error: "OpenAI quota exceeded. Please check your billing and try again later.",
            details: "You have exceeded your OpenAI API quota. Please add billing information or upgrade your plan.",
          },
          { status: 429 },
        )
      }
      
      return NextResponse.json(
        {
          error: "Failed to process chat message",
          details: process.env.NODE_ENV === "development" ? (err instanceof Error ? err.message : String(err)) : undefined,
        },
        { status: 500 },
      )
    }

    let generatedFiles = []

    // If user is requesting PDF generation and it's contract-related, create the files
    if (isPdfRequest && isContractRelated) {
      try {
        // Determine what type of document to generate
        let documentTitle = "AI Generated Contract"
        let documentContent = text

        if (message.toLowerCase().includes("service agreement") || message.toLowerCase().includes("service contract")) {
          documentTitle = "Service Agreement Contract"
          documentContent = generateServiceAgreementTemplate()
        } else if (message.toLowerCase().includes("nda") || message.toLowerCase().includes("non-disclosure")) {
          documentTitle = "Non-Disclosure Agreement"
          documentContent = generateNDATemplate()
        } else if (message.toLowerCase().includes("employment") || message.toLowerCase().includes("job contract")) {
          documentTitle = "Employment Contract"
          documentContent = generateEmploymentTemplate()
        } else if (message.toLowerCase().includes("consulting")) {
          documentTitle = "Consulting Agreement"
          documentContent = generateConsultingTemplate()
        } else if (message.toLowerCase().includes("partnership")) {
          documentTitle = "Partnership Agreement"
          documentContent = generatePartnershipTemplate()
        } else if (contractContent) {
          documentTitle = "Analyzed Contract"
          documentContent = contractContent
        }

        // Generate PDF using the document generation API
        const pdfResponse = await fetch(`${request.nextUrl.origin}/api/ai/generate-document`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: documentContent,
            title: documentTitle,
            formats: ["pdf", "docx"],
          }),
        })

        const pdfData = await pdfResponse.json()
        if (pdfData.success) {
          generatedFiles = pdfData.files
        }
      } catch (error) {
        console.error("PDF generation error:", error)
      }
    }

    return NextResponse.json({
      success: true,
      response: text,
      generatedFiles: generatedFiles.length > 0 ? generatedFiles : undefined,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      {
        error: "Failed to process chat message",
        details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined,
      },
      { status: 500 },
    )
  }
}

// Enhanced template generators with professional legal language
function generateServiceAgreementTemplate() {
  return `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into on [DATE] between:

CLIENT: [CLIENT NAME]
Address: [CLIENT ADDRESS]
Email: [CLIENT EMAIL]
Phone: [CLIENT PHONE]

SERVICE PROVIDER: [PROVIDER NAME]  
Address: [PROVIDER ADDRESS]
Email: [PROVIDER EMAIL]
Phone: [PROVIDER PHONE]

RECITALS
WHEREAS, Client desires to engage Service Provider to provide certain services; and
WHEREAS, Service Provider has the expertise and capability to provide such services;

NOW, THEREFORE, in consideration of the mutual covenants contained herein, the parties agree:

1. SCOPE OF SERVICES
Service Provider agrees to provide the following services ("Services"):
- [DETAILED SERVICE DESCRIPTION]
- [SPECIFIC DELIVERABLES]
- [PERFORMANCE STANDARDS]
- [TIMELINE AND MILESTONES]

2. COMPENSATION AND PAYMENT TERMS
- Total Contract Value: $[AMOUNT]
- Payment Schedule: [PAYMENT SCHEDULE]
- Payment Terms: Net [NUMBER] days from invoice date
- Late Payment: [LATE PAYMENT PENALTY]
- Expenses: [EXPENSE REIMBURSEMENT POLICY]

3. TERM AND TERMINATION
- Commencement Date: [START DATE]
- Completion Date: [END DATE]
- Termination for Convenience: [NOTICE PERIOD] written notice
- Termination for Cause: Immediate upon material breach

4. INTELLECTUAL PROPERTY RIGHTS
- Work Product Ownership: [OWNERSHIP DESIGNATION]
- Pre-existing IP: Remains with original owner
- License Grants: [SPECIFIC LICENSE TERMS]

5. CONFIDENTIALITY
Both parties acknowledge they may receive confidential information and agree to:
- Maintain strict confidentiality
- Use information solely for Agreement purposes
- Return all confidential materials upon termination

6. WARRANTIES AND REPRESENTATIONS
Service Provider warrants that:
- Services will be performed in professional manner
- Work will conform to industry standards
- No infringement of third-party rights

7. LIMITATION OF LIABILITY
Service Provider's total liability shall not exceed the total amount paid under this Agreement.

8. INDEMNIFICATION
Each party shall indemnify the other against claims arising from their negligent acts or omissions.

9. FORCE MAJEURE
Neither party shall be liable for delays caused by circumstances beyond their reasonable control.

10. GOVERNING LAW AND DISPUTE RESOLUTION
This Agreement shall be governed by [JURISDICTION] law. Disputes shall be resolved through [DISPUTE RESOLUTION METHOD].

11. GENERAL PROVISIONS
- Entire Agreement: This Agreement constitutes the entire agreement
- Amendment: Must be in writing and signed by both parties
- Severability: Invalid provisions shall not affect remainder of Agreement
- Assignment: No assignment without prior written consent

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

CLIENT:                           SERVICE PROVIDER:

_________________________        _________________________
[CLIENT NAME]                    [PROVIDER NAME]
Title: [TITLE]                   Title: [TITLE]
Date: _______________           Date: _______________`
}

function generateNDATemplate() {
  return `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into on [DATE] between:

DISCLOSING PARTY: [COMPANY NAME]
Address: [COMPANY ADDRESS]
Email: [COMPANY EMAIL]

RECEIVING PARTY: [RECIPIENT NAME]
Address: [RECIPIENT ADDRESS]
Email: [RECIPIENT EMAIL]

RECITALS
WHEREAS, Disclosing Party possesses certain confidential and proprietary information;
WHEREAS, Receiving Party desires access to such information for [PURPOSE];

NOW, THEREFORE, the parties agree:

1. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" includes all non-public, proprietary information disclosed by Disclosing Party, including but not limited to:
- Technical data, trade secrets, know-how
- Business plans, financial information
- Customer lists, supplier information
- Marketing strategies, pricing information
- Software, algorithms, source code
- Any information marked as "Confidential"

2. OBLIGATIONS OF RECEIVING PARTY
Receiving Party agrees to:
- Hold all Confidential Information in strict confidence
- Not disclose to any third parties without prior written consent
- Use Confidential Information solely for [SPECIFIED PURPOSE]
- Protect information with same care as own confidential information
- Limit access to employees with legitimate need-to-know

3. EXCEPTIONS
This Agreement does not apply to information that:
- Is publicly available through no breach of this Agreement
- Was known to Receiving Party prior to disclosure
- Is independently developed without use of Confidential Information
- Is required to be disclosed by law or court order

4. RETURN OF MATERIALS
Upon termination or request, Receiving Party shall:
- Return all documents containing Confidential Information
- Delete all electronic copies and derivatives
- Provide written certification of compliance

5. TERM
This Agreement shall remain in effect for [DURATION] years from execution date.

6. REMEDIES
Receiving Party acknowledges that breach may cause irreparable harm, entitling Disclosing Party to:
- Seek injunctive relief without posting bond
- Recover attorney fees and costs
- Pursue all available legal and equitable remedies

7. GOVERNING LAW
This Agreement shall be governed by [JURISDICTION] law without regard to conflict of law principles.

8. GENERAL PROVISIONS
- Entire Agreement: Supersedes all prior agreements
- Amendment: Must be in writing
- Severability: Invalid provisions do not affect remainder
- Binding Effect: Binds successors and assigns

DISCLOSING PARTY:                RECEIVING PARTY:

_________________________       _________________________
[COMPANY NAME]                   [RECIPIENT NAME]
By: [NAME]                       
Title: [TITLE]                   
Date: _______________           Date: _______________`
}

function generateEmploymentTemplate() {
  return `EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is entered into on [DATE] between:

EMPLOYER: [COMPANY NAME]
Address: [COMPANY ADDRESS]
Email: [COMPANY EMAIL]

EMPLOYEE: [EMPLOYEE NAME]
Address: [EMPLOYEE ADDRESS]
Email: [EMPLOYEE EMAIL]
Social Security Number: [SSN]

1. EMPLOYMENT RELATIONSHIP
- Position: [JOB TITLE]
- Department: [DEPARTMENT]
- Reporting Manager: [SUPERVISOR NAME]
- Employment Type: [FULL-TIME/PART-TIME]
- Start Date: [START DATE]

2. DUTIES AND RESPONSIBILITIES
Employee shall:
- [PRIMARY JOB RESPONSIBILITIES]
- [KEY PERFORMANCE EXPECTATIONS]
- [SPECIFIC DUTIES AND TASKS]
- Comply with all company policies and procedures
- Maintain professional standards and conduct

3. COMPENSATION AND BENEFITS
- Base Salary: $[ANNUAL SALARY] per year
- Pay Frequency: [WEEKLY/BI-WEEKLY/MONTHLY]
- Benefits Package: [HEALTH, DENTAL, VISION, 401K, ETC.]
- Vacation Days: [NUMBER] days per year
- Sick Leave: [SICK LEAVE POLICY]
- Performance Reviews: [REVIEW SCHEDULE]

4. WORKING CONDITIONS
- Standard Hours: [HOURS] per week
- Work Schedule: [SCHEDULE]
- Location: [WORK LOCATION]
- Remote Work: [REMOTE WORK POLICY]
- Overtime: [OVERTIME POLICY]

5. CONFIDENTIALITY AND NON-DISCLOSURE
Employee agrees to:
- Maintain confidentiality of proprietary information
- Not disclose trade secrets or confidential data
- Return all company property upon termination

6. INTELLECTUAL PROPERTY
- Work-for-Hire: All work products belong to Company
- Inventions: Company owns all job-related inventions
- Copyright: Company retains all copyrights in work product

7. NON-COMPETE AND NON-SOLICITATION
For [DURATION] after termination, Employee shall not:
- Compete with Company within [GEOGRAPHIC AREA]
- Solicit Company customers or employees
- Use Company confidential information for competing purposes

8. TERMINATION
- At-Will Employment: Either party may terminate with [NOTICE PERIOD]
- Termination for Cause: Immediate termination for misconduct
- Severance: [SEVERANCE POLICY IF APPLICABLE]
- Final Pay: Due within [TIMEFRAME] of termination

9. DISPUTE RESOLUTION
Any disputes shall be resolved through:
- [ARBITRATION/MEDIATION/COURT PROCEEDINGS]
- Governing Law: [JURISDICTION]
- Venue: [COURT LOCATION]

10. GENERAL PROVISIONS
- Entire Agreement: Supersedes all prior agreements
- Amendment: Must be in writing and signed
- Severability: Invalid clauses don't void entire agreement
- Binding: Agreement binds heirs and successors

EMPLOYER:                        EMPLOYEE:

_________________________       _________________________
[COMPANY NAME]                   [EMPLOYEE NAME]
By: [NAME]
Title: [TITLE]
Date: _______________           Date: _______________`
}

function generateConsultingTemplate() {
  return `CONSULTING AGREEMENT

This Consulting Agreement ("Agreement") is entered into on [DATE] between:

CLIENT: [CLIENT NAME]
Address: [CLIENT ADDRESS]

CONSULTANT: [CONSULTANT NAME]
Address: [CONSULTANT ADDRESS]

1. CONSULTING SERVICES
Consultant agrees to provide the following services:
- [SPECIFIC CONSULTING SERVICES]
- [PROJECT OBJECTIVES]
- [EXPECTED DELIVERABLES]
- [PERFORMANCE METRICS]

2. COMPENSATION
- Hourly Rate: $[RATE] per hour
- Estimated Hours: [TOTAL HOURS]
- Maximum Fee: $[MAXIMUM AMOUNT]
- Expense Reimbursement: [EXPENSE POLICY]

3. TERM AND SCHEDULE
- Project Duration: [START DATE] to [END DATE]
- Work Schedule: [SCHEDULE REQUIREMENTS]
- Milestone Dates: [KEY MILESTONES]

4. INDEPENDENT CONTRACTOR STATUS
Consultant is an independent contractor, not an employee.

IN WITNESS WHEREOF, the parties execute this Agreement.

CLIENT: ___________________ DATE: ___________
CONSULTANT: ___________________ DATE: ___________`
}

function generatePartnershipTemplate() {
  return `PARTNERSHIP AGREEMENT

This Partnership Agreement is entered into on [DATE] between:

PARTNERS:
[PARTNER 1 NAME] - [OWNERSHIP PERCENTAGE]%
[PARTNER 2 NAME] - [OWNERSHIP PERCENTAGE]%

1. BUSINESS PURPOSE
The partnership shall engage in: [BUSINESS DESCRIPTION]

2. CAPITAL CONTRIBUTIONS
- [PARTNER 1]: $[AMOUNT]
- [PARTNER 2]: $[AMOUNT]

3. PROFIT AND LOSS SHARING
Profits and losses shall be shared according to ownership percentages.

4. MANAGEMENT AND DECISION MAKING
- [MANAGEMENT STRUCTURE]
- [DECISION MAKING PROCESS]
- [AUTHORITY LIMITATIONS]

5. PARTNERSHIP DISSOLUTION
Partnership may be dissolved by [DISSOLUTION TERMS].

PARTNERS:
[PARTNER 1]: ___________________ DATE: ___________
[PARTNER 2]: ___________________ DATE: ___________`
}
