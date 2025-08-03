"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Send,
  User,
  Loader2,
  Paperclip,
  Download,
  FileText,
  FileIcon,
  ImageIcon,
  X,
  Sparkles,
  Scale,
  Gavel,
} from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  attachments?: FileAttachment[]
  generatedFiles?: GeneratedFile[]
}

interface FileAttachment {
  name: string
  size: number
  type: string
  content: string // base64 encoded
}

interface GeneratedFile {
  name: string
  type: "pdf" | "docx" | "txt"
  downloadUrl: string
}

interface ChatInterfaceProps {
  contractContent?: string
  contractId?: string
}

export function ChatInterface({ contractContent, contractId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "⚖️ **Welcome to your AI Legal Contract Assistant!**\n\nI'm specialized exclusively in contracts, legal agreements, and contract law. I can help you with:\n\n📋 **Contract Analysis & Review**\n📄 **Legal Document Generation** (NDAs, Employment, Service Agreements)\n🔍 **Contract Clause Interpretation**\n⚠️ **Legal Risk Assessment**\n✅ **Compliance & Regulatory Guidance**\n🤝 **Contract Negotiation Strategies**\n📚 **Legal Term Definitions**\n📝 **Contract Templates & Standards**\n\n*I focus exclusively on contract and legal matters. How can I assist you with your contract needs today?*",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`)
        return
      }

      // Check file type - focus on legal document types
      const allowedTypes = [
        "text/plain",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "image/gif",
      ]

      if (!allowedTypes.includes(file.type)) {
        alert(`File type ${file.type} is not supported. Please upload PDF, Word, or text documents.`)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const base64Content = content.split(",")[1] // Remove data:type;base64, prefix

        const attachment: FileAttachment = {
          name: file.name,
          size: file.size,
          type: file.type,
          content: base64Content,
        }

        setAttachedFiles((prev) => [...prev, attachment])
      }
      reader.readAsDataURL(file)
    })

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeAttachment = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const sendMessage = async () => {
    if ((!inputMessage.trim() && attachedFiles.length === 0) || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage.trim() || "📎 Legal document(s) attached",
      timestamp: new Date(),
      attachments: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    const currentAttachments = [...attachedFiles]
    setAttachedFiles([])
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage.trim(),
          attachments: currentAttachments,
          contractContent: contractContent || null,
          contractId: contractId || null,
          conversationHistory: messages.slice(-5),
        }),
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          generatedFiles: data.generatedFiles || undefined,
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `I apologize, but I encountered an error: ${data.error}. Please try again with your contract-related question.`,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I'm having trouble connecting right now. Please try again with your contract or legal document question.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const downloadGeneratedFile = async (file: GeneratedFile) => {
    try {
      const response = await fetch(file.downloadUrl)
      const blob = await response.blob()

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = file.name
      a.style.display = "none"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download error:", error)
      alert("Failed to download file. Please try again.")
    }
  }

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText className="w-4 h-4 text-red-400" />
    if (type.includes("word") || type.includes("document")) return <FileIcon className="w-4 h-4 text-blue-400" />
    if (type.includes("image")) return <ImageIcon className="w-4 h-4 text-green-400" />
    return <FileIcon className="w-4 h-4 text-gray-400" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "⚖️ Chat cleared! I'm ready to help you with your contract and legal document needs. What can I assist you with?",
        timestamp: new Date(),
      },
    ])
    setAttachedFiles([])
  }

  // Legal-focused suggested questions
  const suggestedQuestions = [
    "Analyze this contract for risks",
    "Generate an employment agreement",
    "Review contract terms and clauses",
    "Create a non-disclosure agreement",
    "Explain liability clauses",
    "Draft a service agreement",
    "Check contract compliance",
    "Improve contract language",
  ]

  return (
    <div className="flex flex-col h-full bg-aramco-dark-900">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-aramco-dark-700 bg-aramco-dark-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">AI Legal Contract Assistant</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-aramco-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-aramco-green-400">Specialized in Contract Law</span>
              <span className="text-sm text-aramco-dark-400">•</span>
              <span className="text-sm text-aramco-dark-400">GPT-4 Legal Expert</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 rounded-full">
            <Gavel className="w-3 h-3 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">Legal Specialist</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            className="bg-transparent border-aramco-dark-600 text-aramco-dark-300 hover:bg-aramco-dark-700 hover:text-white"
          >
            Clear Chat
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div key={message.id} className="flex gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {message.role === "assistant" ? (
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Scale className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-aramco-blue-600 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">
                    {message.role === "assistant" ? "Legal Assistant" : "You"}
                  </span>
                  <span className="text-xs text-aramco-dark-400">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div className="prose prose-invert max-w-none">
                  <div className="text-aramco-dark-100 whitespace-pre-wrap leading-relaxed">{message.content}</div>
                </div>

                {/* File Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-aramco-dark-300">📎 Legal Documents Attached:</p>
                    <div className="grid gap-2">
                      {message.attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-aramco-dark-800 border border-aramco-dark-700 rounded-lg"
                        >
                          {getFileIcon(file.type)}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{file.name}</p>
                            <p className="text-xs text-aramco-dark-400">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generated Files */}
                {message.generatedFiles && message.generatedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-aramco-green-300">⚖️ Generated Legal Documents:</p>
                    <div className="grid gap-2">
                      {message.generatedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-aramco-green-500/10 border border-aramco-green-500/30 rounded-lg"
                        >
                          {getFileIcon(file.type)}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{file.name}</p>
                            <p className="text-xs text-aramco-green-300">Professional legal document ready</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => downloadGeneratedFile(file)}
                            className="bg-aramco-green-600 hover:bg-aramco-green-700 text-white"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading Message */}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-white">Legal Assistant</span>
                  <span className="text-xs text-aramco-dark-400">analyzing...</span>
                </div>
                <div className="flex items-center gap-2 text-aramco-dark-300">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Reviewing legal documents and contract terms...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-aramco-dark-700 bg-aramco-dark-800">
        <div className="max-w-4xl mx-auto p-4">
          {/* File Attachments Preview */}
          {attachedFiles.length > 0 && (
            <div className="mb-4 p-3 bg-aramco-dark-700 rounded-lg border border-aramco-dark-600">
              <div className="flex items-center gap-2 mb-2">
                <Paperclip className="w-4 h-4 text-aramco-green-400" />
                <span className="text-sm font-medium text-white">
                  {attachedFiles.length} legal document(s) attached
                </span>
              </div>
              <div className="grid gap-2">
                {attachedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-aramco-dark-800 rounded">
                    {getFileIcon(file.type)}
                    <div className="flex-1">
                      <p className="text-sm text-white">{file.name}</p>
                      <p className="text-xs text-aramco-dark-400">{formatFileSize(file.size)}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAttachment(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Legal Questions */}
          {messages.length <= 1 && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Gavel className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-300">Legal Assistant Suggestions:</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {suggestedQuestions.slice(0, 4).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(question)}
                    className="text-left p-2 text-xs bg-aramco-dark-700 hover:bg-aramco-dark-600 border border-aramco-dark-600 rounded text-aramco-dark-200 hover:text-white transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Row */}
          <div className="flex gap-3 items-end">
            {/* File Upload Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="bg-transparent border-aramco-dark-600 text-aramco-dark-300 hover:bg-aramco-dark-700 hover:text-white flex-shrink-0"
              disabled={isLoading}
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            {/* Message Input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about contracts, legal terms, or upload legal documents... (Shift+Enter for new line)"
                className="w-full min-h-[44px] max-h-32 p-3 pr-12 bg-aramco-dark-700 border border-aramco-dark-600 rounded-lg text-white placeholder:text-aramco-dark-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                disabled={isLoading}
                rows={1}
                style={{
                  height: "auto",
                  minHeight: "44px",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = "auto"
                  target.style.height = `${Math.min(target.scrollHeight, 128)}px`
                }}
              />
              {contractContent && (
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                  <FileText className="w-4 h-4 text-aramco-green-400" title="Contract context available" />
                </div>
              )}
            </div>

            {/* Send Button */}
            <Button
              onClick={sendMessage}
              disabled={(!inputMessage.trim() && attachedFiles.length === 0) || isLoading}
              className="bg-amber-600 hover:bg-amber-700 text-white flex-shrink-0"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
            />
          </div>

          {/* Helper Text */}
          <div className="flex items-center justify-between mt-2 text-xs text-aramco-dark-400">
            <div className="flex items-center gap-4">
              <span>Legal Documents: PDF, Word, Text (max 10MB)</span>
              {contractContent && (
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-aramco-green-400" />
                  <span className="text-aramco-green-400">Contract context loaded</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Scale className="w-3 h-3 text-amber-400" />
              <span className="text-amber-400">Legal Specialist Mode</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
