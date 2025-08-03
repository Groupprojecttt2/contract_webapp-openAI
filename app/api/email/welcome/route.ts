import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, company } = await request.json()

    // Email content
    const emailContent = {
      to: email,
      subject: "Welcome to ContractForge - Your Account is Ready!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to ContractForge</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e293b, #1e40af); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .features { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .feature { margin: 15px 0; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
            .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to ContractForge!</h1>
              <p>Your AI-powered contract generation platform</p>
            </div>
            <div class="content">
              <h2>Hello ${firstName} ${lastName}!</h2>
              <p>Thank you for joining ContractForge! Your account has been successfully created and you're ready to start generating professional contracts with the power of AI.</p>
              
              ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
              
              <a href="${request.nextUrl.origin}/dashboard" class="button">Access Your Dashboard</a>
              
              <div class="features">
                <h3>🚀 What you can do with ContractForge:</h3>
                <div class="feature">
                  <strong>🤖 AI Contract Generation</strong><br>
                  Generate professional contracts using advanced AI based on your specific requirements
                </div>
                <div class="feature">
                  <strong>📋 Professional Templates</strong><br>
                  Choose from dozens of pre-built templates for different contract types and industries
                </div>
                <div class="feature">
                  <strong>✨ Smart Highlighting</strong><br>
                  Automatically highlight important clauses, terms, and conditions for easy review
                </div>
                <div class="feature">
                  <strong>👥 Party Management</strong><br>
                  Clearly identify and manage all parties involved in your contracts
                </div>
                <div class="feature">
                  <strong>📤 Export & Share</strong><br>
                  Export contracts to PDF, Word, or share securely with stakeholders
                </div>
              </div>
              
              <h3>🎯 Getting Started:</h3>
              <ol>
                <li>Log in to your dashboard</li>
                <li>Browse our contract templates or use the AI generator</li>
                <li>Fill in your contract details</li>
                <li>Review the generated contract with smart highlighting</li>
                <li>Export and share your professional contract</li>
              </ol>
              
              <p>If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
              
              <p>Best regards,<br>The ContractForge Team</p>
            </div>
            <div class="footer">
              <p>This email was sent to ${email}</p>
              <p>ContractForge - Professional Contract Generation Platform</p>
              <p>© 2024 ContractForge. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }

    // Log email content (in production, this would be sent via email service)
    console.log("📧 WELCOME EMAIL SENT TO:", email)
    console.log("Subject:", emailContent.subject)
    console.log("Content preview:", emailContent.html.substring(0, 200) + "...")

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: "Welcome email sent successfully",
      emailSent: true,
      recipient: email,
    })
  } catch (error) {
    console.error("Welcome email error:", error)
    return NextResponse.json({ error: "Failed to send welcome email" }, { status: 500 })
  }
}
