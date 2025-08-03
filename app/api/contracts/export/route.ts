import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { contractId, format, content, title } = await request.json()

    if (!contractId || !format || !content) {
      return NextResponse.json({ error: "Contract ID, format, and content are required" }, { status: 400 })
    }

    let mimeType: string
    let fileExtension: string

    switch (format.toLowerCase()) {
      case "pdf":
        mimeType = "application/pdf"
        fileExtension = "pdf"
        break
      case "docx":
      case "word":
        mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        fileExtension = "docx"
        break
      default:
        return NextResponse.json({ error: "Unsupported format. Use pdf or docx" }, { status: 400 })
    }

    let fileContent: Buffer

    if (format.toLowerCase() === "pdf") {
      // Enhanced PDF generation using jsPDF
      const { jsPDF } = await import("jspdf")

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Set up fonts and styling
      doc.setFont("helvetica", "normal")

      // Add header with company branding
      doc.setFillColor(0, 102, 51) // Aramco green
      doc.rect(0, 0, 210, 25, "F")

      // Company logo area (placeholder)
      doc.setFillColor(255, 255, 255)
      doc.rect(15, 5, 15, 15, "F")
      doc.setFontSize(8)
      doc.setTextColor(0, 102, 51)
      doc.text("LOGO", 17, 14)

      // Company name
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(255, 255, 255)
      doc.text("ARAMCO DIGITAL", 35, 15)

      // Contract title
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(0, 0, 0)
      doc.text(title || "CONTRACT DOCUMENT", 20, 40)

      // Add a professional line under title
      doc.setLineWidth(1)
      doc.setDrawColor(0, 102, 51)
      doc.line(20, 45, 190, 45)

      // Add document metadata
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(100, 100, 100)
      doc.text(`Document ID: ${contractId}`, 20, 55)
      doc.text(
        `Generated: ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        20,
        62,
      )

      // Reset for content
      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(0, 0, 0)

      const pageWidth = 170
      const lineHeight = 6
      let yPosition = 75

      // Clean and process content
      const cleanContent = content
        .replace(/\n\s*\n/g, "\n\n")
        .replace(/\t/g, "    ")
        .replace(/^\s+|\s+$/g, "")
        .trim()

      // Split content into sections for better formatting
      const sections = cleanContent.split(/\n\n+/)

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i].trim()
        if (!section) continue

        // Check if section is a header (all caps, short, or starts with number)
        const isHeader = /^[A-Z\s\d.-]{5,50}$/.test(section) || /^\d+\./.test(section)

        if (isHeader) {
          // Add some space before headers (except first)
          if (yPosition > 75) {
            yPosition += 4
          }

          doc.setFont("helvetica", "bold")
          doc.setFontSize(12)
        } else {
          doc.setFont("helvetica", "normal")
          doc.setFontSize(11)
        }

        const lines = doc.splitTextToSize(section, pageWidth)

        for (let j = 0; j < lines.length; j++) {
          // Check for page break
          if (yPosition > 270) {
            doc.addPage()
            yPosition = 20
          }

          doc.text(lines[j], 20, yPosition)
          yPosition += lineHeight
        }

        // Add extra space after sections
        yPosition += 3
      }

      // Add professional footer
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)

        // Footer line
        doc.setLineWidth(0.5)
        doc.setDrawColor(200, 200, 200)
        doc.line(20, 285, 190, 285)

        // Footer text
        doc.setFontSize(8)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(100, 100, 100)
        doc.text("Aramco Digital - Contract Management System", 20, 292)
        doc.text(`Page ${i} of ${pageCount}`, 160, 292)
        doc.text("Confidential Document", 85, 292)
      }

      const pdfBuffer = doc.output("arraybuffer")
      fileContent = Buffer.from(pdfBuffer)
    } else if (format.toLowerCase() === "docx") {
      // Enhanced Word document generation using docx library
      const {
        Document,
        Packer,
        Paragraph,
        TextRun,
        HeadingLevel,
        AlignmentType,
        BorderStyle,
        WidthType,
        Table,
        TableRow,
        TableCell,
      } = await import("docx")

      // Split content into paragraphs and identify structure
      const rawParagraphs = content.split(/\n\s*\n/).filter((p) => p.trim())

      const docElements = []

      // Document Header
      docElements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "ARAMCO DIGITAL",
              bold: true,
              size: 24,
              color: "006633",
            }),
          ],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
      )

      // Contract Title
      docElements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: title || "CONTRACT DOCUMENT",
              bold: true,
              size: 32,
              underline: {},
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
      )

      // Document Information Table
      const infoTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: "Document ID:", bold: true })],
                  }),
                ],
                width: { size: 30, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: contractId })],
                  }),
                ],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: "Generated:", bold: true })],
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: new Date().toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      })

      docElements.push(infoTable)
      docElements.push(new Paragraph({ text: "", spacing: { after: 400 } }))

      // Process content paragraphs
      rawParagraphs.forEach((paragraph) => {
        const trimmedParagraph = paragraph.trim()
        if (!trimmedParagraph) return

        // Detect if this is a header
        const isHeader = /^[A-Z\s\d.-]{5,50}$/.test(trimmedParagraph) || /^\d+\./.test(trimmedParagraph)
        const isSubHeader = /^[A-Z][a-z\s]+:/.test(trimmedParagraph)

        if (isHeader) {
          docElements.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: trimmedParagraph,
                  bold: true,
                  size: 24,
                  color: "006633",
                }),
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 200 },
            }),
          )
        } else if (isSubHeader) {
          docElements.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: trimmedParagraph,
                  bold: true,
                  size: 22,
                }),
              ],
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 150 },
            }),
          )
        } else {
          // Regular paragraph with smart formatting
          const lines = trimmedParagraph.split("\n")
          const children = []

          lines.forEach((line, index) => {
            if (index > 0) {
              children.push(new TextRun({ break: 1 }))
            }

            // Check for bullet points or numbered items
            if (/^[-*•]\s/.test(line)) {
              children.push(
                new TextRun({
                  text: line.replace(/^[-*•]\s/, "• "),
                  size: 22,
                }),
              )
            } else if (/^\d+\.\s/.test(line)) {
              children.push(
                new TextRun({
                  text: line,
                  size: 22,
                }),
              )
            } else {
              children.push(
                new TextRun({
                  text: line,
                  size: 22,
                }),
              )
            }
          })

          docElements.push(
            new Paragraph({
              children,
              spacing: { after: 200 },
              alignment: AlignmentType.JUSTIFIED,
            }),
          )
        }
      })

      // Document Footer
      docElements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "This document was generated by Aramco Digital Contract Management System.",
              italics: true,
              size: 18,
              color: "666666",
            }),
          ],
          spacing: { before: 600 },
          alignment: AlignmentType.CENTER,
        }),
      )

      const docInstance = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1440, // 1 inch
                  right: 1440,
                  bottom: 1440,
                  left: 1440,
                },
              },
            },
            children: docElements,
          },
        ],
      })

      const buffer = await Packer.toBuffer(docInstance)
      fileContent = buffer
    }

    // Create filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0]
    const cleanTitle = (title || "contract").replace(/[^a-zA-Z0-9]/g, "_")
    const filename = `${cleanTitle}_${timestamp}_${contractId.slice(-6)}.${fileExtension}`

    // Return file data as base64
    return NextResponse.json({
      success: true,
      filename,
      mimeType,
      content: fileContent.toString("base64"),
      size: fileContent.length,
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json(
      {
        error: "Failed to export contract",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
