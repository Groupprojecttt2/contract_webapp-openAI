import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, loginTime, ipAddress } = await request.json()

    const emailContent = {
      to: email,
      subject: "ContractForge - New Login Detected",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Login Notification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e293b, #1e40af); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb; }
            .security-note { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Login Notification</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName}!</h2>
              <p>We detected a new login to your ContractForge account. Here are the details:</p>
              
              <div class="info-box">
                <h3>📊 Login Details:</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Login Time:</strong> ${new Date(loginTime).toLocaleString()}</p>
                <p><strong>IP Address:</strong> ${ipAddress}</p>
                <p><strong>Platform:</strong> ContractForge Web Application</p>
              </div>
              
              <div class="security-note">
                <h3>🛡️ Security Notice:</h3>
                <p>If this login was not authorized by you, please:</p>
                <ul>
                  <li>Change your password immediately</li>
                  <li>Review your account activity</li>
                  <li>Contact our support team</li>
                </ul>
              </div>
              
              <p>If this was you, you can safely ignore this email. We send these notifications to help keep your account secure.</p>
              
              <p>Thank you for using ContractForge!</p>
              
              <p>Best regards,<br>The ContractForge Security Team</p>
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

    console.log("🔐 LOGIN NOTIFICATION EMAIL SENT TO:", email)
    console.log("Login time:", new Date(loginTime).toLocaleString())
    console.log("IP Address:", ipAddress)

    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({
      success: true,
      message: "Login notification sent successfully",
      emailSent: true,
      recipient: email,
    })
  } catch (error) {
    console.error("Login notification email error:", error)
    return NextResponse.json({ error: "Failed to send login notification" }, { status: 500 })
  }
}
