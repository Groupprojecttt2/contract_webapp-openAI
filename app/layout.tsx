import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ContractForge - Aramco Digital",
  description: "AI-Powered Contract Generation and Management",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-aramco-dark-900 text-gray-300`}>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
