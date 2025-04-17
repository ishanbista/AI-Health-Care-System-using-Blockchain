import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter, Poppins, Montserrat, Lora } from "next/font/google"
import { AuthProvider } from "@/lib/auth-context"
import { AppProvider } from "@/lib/app-context"
import { MessagingProvider } from "@/lib/messaging-context"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins"
})
const montserrat = Montserrat({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-montserrat"
})
const lora = Lora({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-lora",
  style: ["normal", "italic"]
})

export const metadata: Metadata = {
  title: "TeleHealth - AI + Blockchain Healthcare",
  description: "Connect with the right doctor using AI and blockchain technology",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} ${montserrat.variable} ${lora.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <AppProvider>
              <MessagingProvider>
                {children}
                <Toaster />
              </MessagingProvider>
            </AppProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}