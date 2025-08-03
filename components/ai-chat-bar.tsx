
"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  X,
  Send,
  Bot,
  User,
  Minimize2,
  Maximize2,
  Loader2,
  Sparkles,
  FileText,
  Brain,
  Paperclip,
  Download,
  FileIcon,
  ImageIcon,
  Upload,
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

interface AIChatBarProps {
  contractContent?: string
  contractId?: string
}

export function AIChatBar({ contractContent, contractId }: AIChatBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your AI contract assistant powered by OpenAI. I can:\n\n📄 Analyze and review contracts\n💼 Generate professional documents\n🧠 Provide legal insights and recommendations\n📎 Process uploaded files\n✨ Help with contract improvements\n\nHow can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isMinimized])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      // Check file size (max 25MB for PDFs)
      const maxSize = file.type === "application/pdf" ? 25 * 1024 * 1024 : 10 * 1024 * 1024
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is ${file.type === "application/pdf" ? "25MB" : "10MB"}.`)
        return
      }

      // Enhanced file type support
      const allowedTypes = [
        "text/plain",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "text/csv",
        "application/json",
        "text/markdown",
      ]

      if (!allowedTypes.includes(file.type)) {
        alert(`File type ${file.type} is not supported. Supported: PDF, Word, Text, Images, CSV, JSON, Markdown`)
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
      content: inputMessage.trim() || "📎 File(s) attached",
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

       // Check if response is JSON
       const contentType = response.headers.get("content-type");
       if (!contentType || !contentType.includes("application/json")) {
         throw new Error("Server returned non-JSON response");
       }

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
           content: `Sorry, I encountered an error: ${data.error || 'Unknown error'}. ${data.details ? `\n\nDetails: ${data.details}` : ''}`,
           timestamp: new Date(),
         }
         setMessages((prev) => [...prev, errorMessage])
       }
         } catch (error) {
       console.error("Chat error:", error)
       
       let errorContent = "Sorry, I'm having trouble connecting right now. Please try again in a moment."
       
       if (error instanceof Error) {
         if (error.message.includes("quota")) {
           errorContent = "OpenAI quota exceeded. Please check your billing and try again later."
         } else if (error.message.includes("non-JSON")) {
           errorContent = "Server error: Received invalid response. Please try again."
         } else {
           errorContent = `Connection error: ${error.message}`
         }
       }
       
       const errorMessage: Message = {
         id: (Date.now() + 1).toString(),
         role: "assistant",
         content: errorContent,
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

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Chat cleared! How can I help you with contracts and legal documents?",
        timestamp: new Date(),
      },
    ])
    setAttachedFiles([])
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
    if (type.includes("text") || type.includes("csv") || type.includes("json"))
      return <FileText className="w-4 h-4 text-yellow-400" />
    return <FileIcon className="w-4 h-4 text-gray-400" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const suggestedQuestions = [
    "Analyze this contract",
    "Generate a service agreement",
    "Review contract terms",
    "Create an NDA",
    "Explain legal clauses",
    "Improve contract language",
  ]

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full aramco-button-primary shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <div className="relative">
            <Brain className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-aramco-green-400 rounded-full animate-pulse"></div>
          </div>
        </Button>
        <div className="absolute bottom-16 right-0 bg-aramco-dark-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          AI Contract Assistant
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`aramco-card transition-all duration-300 ${isMinimized ? "w-80 h-16" : "w-96 h-[600px]"}`}>
        {/* Header */}
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-aramco-green-500 to-aramco-blue-500 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-sm">AI Assistant</CardTitle>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-aramco-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-aramco-green-400">OpenAI Powered</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-aramco-dark-400 hover:text-white h-8 w-8 p-0"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-aramco-dark-400 hover:text-white h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-4 pt-0 flex flex-col h-[520px]">
            {/* Messages */}
            <ScrollArea className="flex-1 mb-4">
              <div className="space-y-4 pr-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 bg-gradient-to-br from-aramco-green-500 to-aramco-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-lg text-sm ${
                        message.role === "user"
                          ? "bg-aramco-blue-600 text-white"
                          : "bg-aramco-dark-700 text-aramco-dark-100 border border-aramco-dark-600"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>

                      {/* File Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-black/20 rounded text-xs">
                              {getFileIcon(file.type)}
                              <span className="flex-1 truncate">{file.name}</span>
                              <span className="text-xs opacity-70">{formatFileSize(file.size)}</span>
                              {file.type === "application/pdf" && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-red-500/20 text-red-300 border-red-500/30"
                                >
                                  PDF
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Generated Files */}
                      {message.generatedFiles && message.generatedFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-medium text-aramco-green-300">📄 Generated Files:</p>
                          {message.generatedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 bg-aramco-green-500/10 border border-aramco-green-500/30 rounded"
                            >
                              {getFileIcon(file.type)}
                              <span className="flex-1 text-xs">{file.name}</span>
                              <Button
                                size="sm"
                                onClick={() => downloadGeneratedFile(file)}
                                className="h-6 px-2 text-xs bg-aramco-green-600 hover:bg-aramco-green-700"
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 bg-aramco-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-gradient-to-br from-aramco-green-500 to-aramco-blue-500 rounded-lg flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-aramco-dark-700 border border-aramco-dark-600 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-aramco-green-400" />
                        <span className="text-sm text-aramco-dark-300">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* File Attachments Preview */}
            {attachedFiles.length > 0 && (
              <div className="mb-3 p-2 bg-aramco-dark-700/50 rounded-lg border border-aramco-dark-600/50">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-4 h-4 text-aramco-green-400" />
                  <span className="text-xs text-white font-medium">Ready to Upload:</span>
                </div>
                <div className="space-y-1">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-1 bg-aramco-dark-800/50 rounded text-xs">
                      {getFileIcon(file.type)}
                      <span className="flex-1 truncate text-white">{file.name}</span>
                      <span className="text-aramco-dark-400">{formatFileSize(file.size)}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAttachment(index)}
                        className="h-5 w-5 p-0 text-red-400 hover:text-red-300"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Questions */}
            {messages.length <= 1 && (
              <div className="mb-4">
                <p className="text-xs text-aramco-dark-400 mb-2">Try these commands:</p>
                <div className="flex flex-wrap gap-1">
                  {suggestedQuestions.slice(0, 3).map((question, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer text-xs bg-aramco-dark-700 border-aramco-dark-600 text-aramco-dark-300 hover:bg-aramco-dark-600 hover:text-white transition-colors"
                      onClick={() => setInputMessage(question)}
                    >
                      {question}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about contracts..."
                  className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-aramco-green-500 focus:ring-1 focus:ring-aramco-green-500 pr-20 text-visible placeholder-visible"
                  disabled={isLoading}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  {contractContent && (
                    <FileText className="w-4 h-4 text-aramco-green-400" title="Contract context available" />
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-6 w-6 p-0 text-aramco-dark-400 hover:text-white"
                    disabled={isLoading}
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.csv,.json,.md"
                />
              </div>
              <Button
                onClick={sendMessage}
                disabled={(!inputMessage.trim() && attachedFiles.length === 0) || isLoading}
                className="aramco-button-primary px-3"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-aramco-green-400" />
                <span className="text-xs text-aramco-dark-400">Powered by OpenAI</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="text-xs text-aramco-dark-400 hover:text-white h-6 px-2"
              >
                Clear
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
