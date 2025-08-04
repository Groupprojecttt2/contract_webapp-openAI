"use client"



import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface ChatMessage {
  id: string
  role: "assistant" | "user"
  content: string
  timestamp: Date
  type?: "suggestion" | "file"
  files?: any[]
}

const ContractSuiteInterface = () => {
  const [input, setInput] = useState("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your AI contract assistant powered by OpenAI. I can help you with:\n\n📄 Generate contracts from templates\n🔍 Analyze existing contracts\n✨ Suggest improvements and optimizations\n📎 Process uploaded documents\n\nChoose a template",
      timestamp: new Date(),
      type: "suggestion",
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [temperature, setTemperature] = useState(0.5)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const { toast } = useToast()

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setChatMessages((prevMessages) => [...prevMessages, userMessage])
    const currentInput = input
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
          attachments: [],
          contractContent: null,
          contractId: null,
          conversationHistory: chatMessages.slice(-5),
        }),
      })

      const data = await response.json()

      if (data.success) {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          files: data.generatedFiles || [],
        }
        setChatMessages((prevMessages) => [...prevMessages, aiResponse])
      } else {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `I encountered an error: ${data.error}. Please try again.`,
          timestamp: new Date(),
        }
        setChatMessages((prevMessages) => [...prevMessages, errorMessage])
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      }
      setChatMessages((prevMessages) => [...prevMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      const fileMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: `Uploaded file: ${file.name}`,
        timestamp: new Date(),
        type: "file",
      }

      setChatMessages((prevMessages) => [...prevMessages, fileMessage])
      setIsLoading(true)

      try {
        // Convert file to base64
        const reader = new FileReader()
        reader.onload = async () => {
          const base64Content = reader.result?.toString().split(",")[1]

          const response = await fetch("/api/ai/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: `Please analyze this uploaded file: ${file.name}`,
              attachments: [
                {
                  name: file.name,
                  type: file.type,
                  size: file.size,
                  content: base64Content,
                },
              ],
              contractContent: null,
              contractId: null,
              conversationHistory: chatMessages.slice(-3),
            }),
          })

          const data = await response.json()

          if (data.success) {
            const aiResponse: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: data.response,
              timestamp: new Date(),
              files: data.generatedFiles || [],
            }
            setChatMessages((prevMessages) => [...prevMessages, aiResponse])
          }
          setIsLoading(false)
        }
        reader.readAsDataURL(file)
      } catch (error) {
        console.error("File upload error:", error)
        setIsLoading(false)
      }

      event.target.value = ""
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  const handleSettingsToggle = () => {
    setIsSettingsOpen(!isSettingsOpen)
  }

  const handleTemperatureChange = (value: number[]) => {
    setTemperature(value[0] / 100)
  }

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode)
  }

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Header */}
      <header className="bg-blue-100 dark:bg-blue-600 p-4">
        <h1 className="text-2xl font-bold text-white">OpenAI Contract Assistant</h1>
        <p className="text-gray-400">Advanced AI-powered contract generation and analysis</p>
      </header>

      {/* Chat Interface */}
      <div className="flex-grow overflow-hidden">
        <div ref={chatContainerRef} className="p-4 h-full overflow-y-auto">
          {chatMessages.map((message) => (
            <div key={message.id} className={`mb-2 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`rounded-lg p-3 w-3/4 max-w-3/4 ${
                  message.role === "user"
                    ? "bg-blue-100 dark:bg-blue-200 text-gray-800 dark:text-gray-200"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                }`}
              >
                {message.type === "file" ? (
                  <div>
                    <p>{message.content}</p>
                  </div>
                ) : (
                  <p>{message.content}</p>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="mb-2 flex justify-start">
              <div className="rounded-lg p-3 w-3/4 max-w-3/4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                <p>Loading...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-200 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Ask me anything..."
            className="flex-grow rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage()
              }
            }}
          />
          <Button onClick={handleSendMessage} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send"}
          </Button>
          <label htmlFor="upload-file" className="cursor-pointer">
            <input type="file" id="upload-file" className="hidden" onChange={handleFileUpload} />
            <Button variant="secondary">
              Upload File
            </Button>
          </label>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Settings</Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>Application Settings</SheetTitle>
                <SheetDescription>Customize your experience.</SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <p className="text-right">Temperature</p>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={temperature * 100}
                    onChange={(e) => handleTemperatureChange([Number(e.target.value)])}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <p className="text-right">Dark Mode</p>
                  <input
                    type="checkbox"
                    checked={isDarkMode}
                    onChange={handleThemeToggle}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <p className="text-right">Schedule</p>
                  <input
                    type="date"
                    value={selectedDate ? selectedDate.toISOString().slice(0, 10) : ""}
                    onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : undefined)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button type="button">Save changes</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-300 dark:bg-gray-800 p-2">
        <div className="text-xs text-gray-400 mt-2 text-center">
          Powered by OpenAI - Professional contract assistance! 🚀
        </div>
      </footer>
    </div>
  )
}

export { ContractSuiteInterface }
export default ContractSuiteInterface
