import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { documentContent, fileName, fileType } = await request.json()

    if (!documentContent) {
      return NextResponse.json({ error: "Document content is required" }, { status: 400 })
    }

    // Convert base64 to buffer
    const docBuffer = Buffer.from(documentContent, "base64")

    try {
      // For Word documents, we'll do basic text extraction
      // In production, you'd use libraries like mammoth.js for .docx files

      let extractedText = ""

      if (fileType.includes("officedocument")) {
        // Modern .docx file
        try {
          // Basic approach for .docx files
          const docString = docBuffer.toString("binary")

          // Look for XML content in .docx (which is a zip file)
          // This is a simplified approach
          const textMatches = docString.match(/>([^<]+)</g)
          if (textMatches) {
            extractedText = textMatches
              .map((match) => match.slice(1, -1)) // Remove > and <
              .filter((text) => text.length > 2 && /[a-zA-Z]/.test(text)) // Filter meaningful text
              .join(" ")
              .replace(/\s+/g, " ")
              .trim()
          }
        } catch (error) {
          console.error("DOCX processing error:", error)
        }
      } else if (fileType.includes("msword")) {
        // Legacy .doc file
        try {
          const docString = docBuffer.toString("binary")
          // Basic text extraction for .doc files
          const cleanText = docString
            .replace(/[^\x20-\x7E\n\r\t]/g, " ") // Keep only printable characters
            .replace(/\s+/g, " ")
            .trim()

          if (cleanText.length > 50) {
            extractedText = cleanText
          }
        } catch (error) {
          console.error("DOC processing error:", error)
        }
      }

      // Clean up extracted text
      extractedText = extractedText
        .replace(/[^\x20-\x7E\n\r\t]/g, " ") // Keep only printable ASCII + whitespace
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim()

      if (extractedText && extractedText.length > 20) {
        console.log(`✅ Successfully extracted ${extractedText.length} characters from document: ${fileName}`)

        return NextResponse.json({
          success: true,
          text: extractedText,
          fileName,
          extractedLength: extractedText.length,
        })
      } else {
        console.log(`⚠️ Limited text extraction from document: ${fileName}`)

        return NextResponse.json({
          success: true,
          text: `Document "${fileName}" was uploaded but text extraction was limited. The file may contain complex formatting or require specialized processing.`,
          fileName,
          extractedLength: 0,
        })
      }
    } catch (extractionError) {
      console.error("Document text extraction error:", extractionError)

      return NextResponse.json({
        success: true,
        text: `Document "${fileName}" was uploaded successfully. However, text extraction failed. The AI can still reference that this document was provided.`,
        fileName,
        extractedLength: 0,
      })
    }
  } catch (error) {
    console.error("Document processing error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process document file",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
