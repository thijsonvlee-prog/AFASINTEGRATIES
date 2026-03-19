import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Sidebar } from "@/components/Sidebar"
import { ToastContainer } from "@/components/ToastContainer"

export const metadata: Metadata = {
  title: "AFAS Integratieplatform",
  description: "Integratieplatform voor AFAS Profit connectoren",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className="font-sans antialiased">
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto pt-14 md:pt-0 bg-background">
            <div className="mx-auto p-4 md:p-8 max-w-7xl animate-fade-in">
              {children}
            </div>
          </main>
        </div>
        <ToastContainer />
      </body>
    </html>
  )
}
