"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, FileText, File, Loader2 } from "lucide-react"

interface ExportButtonProps {
  contractId: string
  contractTitle: string
  contractContent: string
}

export function ExportButton({ contractId, contractTitle, contractContent }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportingFormat, setExportingFormat] = useState("")

  const handleExport = async (format: string) => {
    setIsExporting(true)
    setExportingFormat(format)

    try {
      const response = await fetch("/api/contracts/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractId,
          format,
          content: contractContent,
          title: contractTitle,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Server returned an invalid response." }))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        const binaryString = atob(data.content)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }

        const blob = new Blob([bytes], { type: data.mimeType })
        const url = URL.createObjectURL(blob)

        const a = document.createElement("a")
        a.href = url
        a.download = data.filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        throw new Error(data.error || "An unknown error occurred on the server.")
      }
    } catch (error) {
      console.error("Export error:", error)
      const message = error instanceof Error ? error.message : "An unknown error occurred."
      alert(`Export failed: ${message}`)
    } finally {
      setIsExporting(false)
      setExportingFormat("")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-aramco-green-light hover:bg-aramco-green-dark text-white" disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Exporting {exportingFormat.toUpperCase()}...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download Contract
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-aramco-dark-800 border-aramco-dark-700 text-white">
        <DropdownMenuItem
          onClick={() => handleExport("pdf")}
          className="hover:bg-aramco-dark-700 focus:bg-aramco-dark-700 focus:text-white cursor-pointer"
          disabled={isExporting}
        >
          <FileText className="w-4 h-4 mr-2 text-red-400" />
          Download as PDF
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("docx")}
          className="hover:bg-aramco-dark-700 focus:bg-aramco-dark-700 focus:text-white cursor-pointer"
          disabled={isExporting}
        >
          <File className="w-4 h-4 mr-2 text-blue-400" />
          Download as Word
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
