import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Analytics App',
  description: 'Upload Excel files and generate AI-powered analytics and charts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}