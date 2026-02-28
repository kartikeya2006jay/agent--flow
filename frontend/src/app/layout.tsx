import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { config } from "@/lib/config"
import { QueryProvider } from "@/components/providers/query-provider"
import { Toaster } from "@/components/ui/toaster"

const requiredVars = ['NEXT_PUBLIC_API_BASE_URL', 'NEXT_PUBLIC_APP_NAME', 'NEXT_PUBLIC_APP_VERSION']
for (const v of requiredVars) {
  if (!process.env[v]) throw new Error(`${v} is required in .env.local`)
}

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })

export const metadata: Metadata = {
  title: { default: config.app.name, template: `%s | ${config.app.name}` },
  description: "Multi-Agent Governance Middleware OS",
}

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#ffffff" }],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white font-sans antialiased">
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  )
}
