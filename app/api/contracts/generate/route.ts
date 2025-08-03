import { type NextRequest, NextResponse } from "next/server"
import { generateContract } from "@/lib/openai"
import admin from "@/lib/firebaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    const {
      contractType,
      templateId,
      title,
      description,
      party1Name,
      party1Type,
      party1Address,
      party2Name,
      party2Type,
      party2Address,
      duration,
      value,
      startDate,
      endDate,
      specialTerms,
      // Template-specific fields
      serviceDescription,
      deliverables,
      paymentTerms,
      projectTimeline,
      intellectualProperty,
      terminationNotice,
      jobTitle,
      department,
      supervisor,
      salary,
      workingHours,
      benefits,
      probationPeriod,
      remoteWork,
      vacationDays,
      purpose,
      confidentialInfo,
      permittedUses,
      ndaDuration,
      returnRequirement,
      exceptions,
      softwareName,
      licenseType,
      usageRights,
      restrictions,
      supportLevel,
      updates,
      consultingServices,
      objectives,
      hourlyRate,
      estimatedHours,
      expensePolicy,
      businessPurpose,
      partnershipType,
      capitalContributions,
      profitSharing,
      managementRoles,
      decisionMaking,
    } = formData

    // Validate required fields
    if (!contractType || !party1Name || !party2Name) {
      return NextResponse.json({ error: "Contract type and party information are required" }, { status: 400 })
    }

    // Create template-specific prompts
    let templateSpecificPrompt = ""
    let contractTypeName = ""

    switch (templateId) {
      case "1": // Service Agreement
        contractTypeName = "Service Agreement"
        templateSpecificPrompt = `
SERVICE AGREEMENT SPECIFIC DETAILS:
- Service Description: ${serviceDescription || "Professional services"}
- Key Deliverables: ${deliverables || "As specified"}
- Payment Terms: ${paymentTerms || "Net 30"}
- Project Timeline: ${projectTimeline || "As agreed"}
- Intellectual Property: ${intellectualProperty || "Client owns all IP"}
- Termination Notice: ${terminationNotice || "30 days"}

Include detailed sections for:
- Scope of Work with specific deliverables
- Payment schedule and terms
- Project milestones and deadlines
- Intellectual property ownership
- Change request procedures
- Quality standards and acceptance criteria`
        break

      case "2": // Employment Contract
        contractTypeName = "Employment Contract"
        templateSpecificPrompt = `
EMPLOYMENT CONTRACT SPECIFIC DETAILS:
- Job Title: ${jobTitle || "Employee"}
- Department: ${department || "General"}
- Reports To: ${supervisor || "Manager"}
- Annual Salary: ${salary || "As agreed"}
- Working Hours: ${workingHours || "40 hours/week"}
- Benefits: ${benefits || "Standard benefits package"}
- Probation Period: ${probationPeriod || "3 months"}
- Remote Work: ${remoteWork || "As per company policy"}
- Vacation Days: ${vacationDays || "15 days per year"}

Include comprehensive sections for:
- Job description and responsibilities
- Compensation and benefits details
- Working conditions and schedule
- Performance evaluation procedures
- Confidentiality and non-compete clauses
- Termination procedures and severance`
        break

      case "3": // NDA
        contractTypeName = "Non-Disclosure Agreement"
        templateSpecificPrompt = `
NON-DISCLOSURE AGREEMENT SPECIFIC DETAILS:
- Purpose: ${purpose || "Business discussions"}
- Confidential Information: ${confidentialInfo || "Proprietary business information"}
- Permitted Uses: ${permittedUses || "Evaluation purposes only"}
- Agreement Duration: ${ndaDuration || "2 years"}
- Return Policy: ${returnRequirement || "Upon request"}
- Exceptions: ${exceptions || "Publicly available information"}

Include detailed sections for:
- Definition of confidential information
- Obligations of receiving party
- Permitted and prohibited uses
- Return or destruction of information
- Remedies for breach
- Exceptions to confidentiality`
        break

      case "4": // Software License
        contractTypeName = "Software License Agreement"
        templateSpecificPrompt = `
SOFTWARE LICENSE AGREEMENT SPECIFIC DETAILS:
- Software Name: ${softwareName || "Licensed Software"}
- License Type: ${licenseType || "Single User"}
- Usage Rights: ${usageRights || "Standard usage rights"}
- Restrictions: ${restrictions || "No redistribution or modification"}
- Support Level: ${supportLevel || "Basic email support"}
- Updates Policy: ${updates || "Free updates for 1 year"}

Include comprehensive sections for:
- Software description and specifications
- License grant and scope
- Usage restrictions and limitations
- Support and maintenance terms
- Updates and upgrades policy
- Warranty disclaimers and liability limitations`
        break

      case "5": // Consulting Agreement
        contractTypeName = "Consulting Agreement"
        templateSpecificPrompt = `
CONSULTING AGREEMENT SPECIFIC DETAILS:
- Consulting Services: ${consultingServices || "Professional consulting services"}
- Project Objectives: ${objectives || "As defined by client"}
- Hourly Rate: ${hourlyRate || "$150/hour"}
- Estimated Hours: ${estimatedHours || "40 hours"}
- Expense Policy: ${expensePolicy || "Pre-approved expenses only"}
- Expected Deliverables: ${deliverables || "Reports and recommendations"}

Include detailed sections for:
- Consulting services description
- Project scope and objectives
- Fee structure and payment terms
- Expense reimbursement policy
- Independent contractor status
- Deliverables and timelines`
        break

      case "6": // Partnership Agreement
        contractTypeName = "Partnership Agreement"
        templateSpecificPrompt = `
PARTNERSHIP AGREEMENT SPECIFIC DETAILS:
- Business Purpose: ${businessPurpose || "General business partnership"}
- Partnership Type: ${partnershipType || "General Partnership"}
- Capital Contributions: ${capitalContributions || "Equal contributions"}
- Profit Sharing: ${profitSharing || "Equal shares"}
- Management Roles: ${managementRoles || "Shared management"}
- Decision Making: ${decisionMaking || "Majority vote"}

Include comprehensive sections for:
- Partnership formation and purpose
- Capital contributions and ownership
- Profit and loss distribution
- Management structure and responsibilities
- Decision-making procedures
- Partner withdrawal and dissolution`
        break

      default:
        contractTypeName = contractType || "Service Agreement"
        templateSpecificPrompt = "Standard contract terms and conditions."
    }

    // Build a structured prompt from user form fields
    const prompt = `Generate a comprehensive, professional ${contractTypeName} contract with the following details:

CONTRACT INFORMATION:
- Title: ${title || `${contractTypeName}`}
- Type: ${contractTypeName}
- Description: ${description || "Professional agreement"}

PARTIES INVOLVED:
First Party (Party A):
- Name: ${party1Name}
- Type: ${party1Type || "Company"}
- Address: ${party1Address || "Address to be provided"}

Second Party (Party B):
- Name: ${party2Name}
- Type: ${party2Type || "Company"}
- Address: ${party2Address || "Address to be provided"}

CONTRACT TERMS:
- Start Date: ${startDate || "To be determined"}
- End Date: ${endDate || "To be determined"}
- Duration: ${duration || "As specified"}
- Contract Value: ${value || "As agreed"}
- Special Terms: ${specialTerms || "Standard terms apply"}

${serviceDescription ? `- Service Description: ${serviceDescription}` : ""}
${deliverables ? `- Deliverables: ${deliverables}` : ""}
${paymentTerms ? `- Payment Terms: ${paymentTerms}` : ""}
${projectTimeline ? `- Project Timeline: ${projectTimeline}` : ""}
${intellectualProperty ? `- Intellectual Property: ${intellectualProperty}` : ""}
${terminationNotice ? `- Termination Notice: ${terminationNotice}` : ""}
${jobTitle ? `- Job Title: ${jobTitle}` : ""}
${department ? `- Department: ${department}` : ""}
${supervisor ? `- Supervisor: ${supervisor}` : ""}
${salary ? `- Salary: ${salary}` : ""}
${workingHours ? `- Working Hours: ${workingHours}` : ""}
${benefits ? `- Benefits: ${benefits}` : ""}
${probationPeriod ? `- Probation Period: ${probationPeriod}` : ""}
${remoteWork ? `- Remote Work: ${remoteWork}` : ""}
${vacationDays ? `- Vacation Days: ${vacationDays}` : ""}
${purpose ? `- Purpose: ${purpose}` : ""}
${confidentialInfo ? `- Confidential Info: ${confidentialInfo}` : ""}
${permittedUses ? `- Permitted Uses: ${permittedUses}` : ""}
${ndaDuration ? `- NDA Duration: ${ndaDuration}` : ""}
${returnRequirement ? `- Return Requirement: ${returnRequirement}` : ""}
${exceptions ? `- Exceptions: ${exceptions}` : ""}
${softwareName ? `- Software Name: ${softwareName}` : ""}
${licenseType ? `- License Type: ${licenseType}` : ""}
${usageRights ? `- Usage Rights: ${usageRights}` : ""}
${restrictions ? `- Restrictions: ${restrictions}` : ""}
${supportLevel ? `- Support Level: ${supportLevel}` : ""}
${updates ? `- Updates: ${updates}` : ""}
${consultingServices ? `- Consulting Services: ${consultingServices}` : ""}
${objectives ? `- Objectives: ${objectives}` : ""}
${hourlyRate ? `- Hourly Rate: ${hourlyRate}` : ""}
${estimatedHours ? `- Estimated Hours: ${estimatedHours}` : ""}
${expensePolicy ? `- Expense Policy: ${expensePolicy}` : ""}
${businessPurpose ? `- Business Purpose: ${businessPurpose}` : ""}
${partnershipType ? `- Partnership Type: ${partnershipType}` : ""}
${capitalContributions ? `- Capital Contributions: ${capitalContributions}` : ""}
${profitSharing ? `- Profit Sharing: ${profitSharing}` : ""}
${managementRoles ? `- Management Roles: ${managementRoles}` : ""}
${decisionMaking ? `- Decision Making: ${decisionMaking}` : ""}

REQUIREMENTS:
- Use professional legal language and structure.
- Include all necessary clauses and provisions for this contract type.
- Ensure clarity, enforceability, and compliance with best practices.
- Format the contract with clear section headings and logical flow.
`;

    // Compose the vectordb_query string
    const vectordb_query = `${title || contractTypeName}, ${contractTypeName}, ${description || "Professional agreement"}`;

    // Generate contract using OpenAI
    let generatedContract = "";
    try {
      generatedContract = await generateContract(prompt);
    } catch (err) {
      console.error("❌ OpenAI contract generation error:", err);
      return NextResponse.json({ error: "Failed to generate contract using OpenAI.", details: String(err) }, { status: 500 });
    }

    // Fallback highlights (since highlight analysis is not handled by backend)
    let highlights = [
      {
        type: "critical",
        text: "This Agreement shall commence on the Start Date and continue for the specified duration",
        reason: "Contract duration and commencement terms define the binding period",
      },
      {
        type: "financial",
        text: value || "Contract value as specified in the terms",
        reason: "Total contract value represents the primary financial obligation",
      },
      {
        type: "timeline",
        text: "Either party may terminate this Agreement with appropriate notice",
        reason: "Termination procedures and notice requirements are critical for exit strategy",
      },
      {
        type: "risk",
        text: "Limitation of liability and indemnification clauses",
        reason: "These clauses define risk allocation and potential exposure for both parties",
      },
    ];

    // Create contract object
    const contract = {
      id: Math.random().toString(36).substr(2, 9),
      title: title || `${contractTypeName}`,
      type: contractTypeName,
      status: "draft",
      content: generatedContract,
      parties: [
        {
          name: party1Name,
          type: party1Type || "Company",
          role: "First Party",
          address: party1Address || "Address to be provided",
        },
        {
          name: party2Name,
          type: party2Type || "Company",
          role: "Second Party",
          address: party2Address || "Address to be provided",
        },
      ],
      terms: {
        startDate: startDate || new Date().toISOString().split("T")[0],
        endDate: endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        value: value || "To be determined",
        duration: duration || "12 months",
      },
      highlights,
      templateId,
      templateSpecificData: {
        serviceDescription,
        deliverables,
        paymentTerms,
        projectTimeline,
        intellectualProperty,
        terminationNotice,
        jobTitle,
        department,
        supervisor,
        salary,
        workingHours,
        benefits,
        probationPeriod,
        remoteWork,
        vacationDays,
        purpose,
        confidentialInfo,
        permittedUses,
        ndaDuration,
        returnRequirement,
        exceptions,
        softwareName,
        licenseType,
        usageRights,
        restrictions,
        supportLevel,
        updates,
        consultingServices,
        objectives,
        hourlyRate,
        estimatedHours,
        expensePolicy,
        businessPurpose,
        partnershipType,
        capitalContributions,
        profitSharing,
        managementRoles,
        decisionMaking,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Fallback for empty or undefined contract content
    if (!contract.content || typeof contract.content !== "string" || contract.content.trim() === "") {
      contract.content = "⚠️ Contract generation failed. No content was produced by the AI. Please try again or check your prompt.";
    }

    console.log("📄 Contract object created successfully")

    const authHeader = request.headers.get("authorization")
    const jwt = authHeader?.replace("Bearer ", "")

    let userId = null;
    if (jwt) {
      try {
        const decoded = await admin.auth().verifyIdToken(jwt);
        userId = decoded.uid;
      } catch (e) {
        console.warn("Failed to verify JWT for user ID");
      }
    }
    // After generating the contract, insert it into Firestore
    const contractsCollection = admin.firestore().collection("contracts");
    const firestoreDoc = await contractsCollection.add({
      user_id: userId, // Set to actual user ID if available
      title: contract.title,
      content: contract.content,
      status: contract.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    // Add the Firestore document ID as the 'id' field
    await contractsCollection.doc(firestoreDoc.id).update({ id: firestoreDoc.id });

    return NextResponse.json({
      success: true,
      contract,
      firestoreId: firestoreDoc.id,
      message: `${contractTypeName} generated successfully using OpenAI` ,
      aiProvider: "OpenAI GPT-4o-mini",
    })
  } catch (error) {
    console.error("❌ Contract generation error:", error)

    // Provide more specific error messages
    const errorMessage = (error as Error).message || "";
    if (errorMessage.includes("API key")) {
      return NextResponse.json(
        { error: "API key is invalid or expired. Please check your configuration." },
        { status: 500 },
      )
    }

    if (errorMessage.includes("rate limit")) {
      return NextResponse.json(
        { error: "API rate limit exceeded. Please try again in a few moments." },
        { status: 429 },
      )
    }

    if (errorMessage.includes("quota")) {
      return NextResponse.json({ error: "API quota exceeded. Please check your account." }, { status: 429 })
    }

    return NextResponse.json(
      {
        error: "Failed to generate contract. Please try again or contact support if the issue persists.",
        details: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
      },
      { status: 500 },
    )
  }
}
