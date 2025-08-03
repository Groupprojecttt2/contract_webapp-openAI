"use client"

import React from "react"
import { RiskAnalysisDashboard } from "@/components/risk-analysis-dashboard"

const sampleContract = `
SERVICE AGREEMENT

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
Date: _______________           Date: _______________
`

export default function TestRiskPage() {
  return (
    <div className="min-h-screen aramco-gradient p-8">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            🚀 Smart Contract Risk Analysis - Feature Demo
          </h1>
          <p className="text-aramco-dark-300">
            This demonstrates the new cutting-edge risk analysis feature with AI-powered scoring, 
            color-coded indicators, and industry-specific risk models.
          </p>
        </div>
        
        <RiskAnalysisDashboard 
          contractContent={sampleContract}
          industry="technology"
          contractType="service agreement"
        />
      </div>
    </div>
  )
} 