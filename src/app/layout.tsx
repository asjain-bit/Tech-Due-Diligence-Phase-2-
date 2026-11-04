import type { Metadata } from 'next'
import { Poppins, Fraunces } from 'next/font/google'
import { ThemeProvider } from '@/contexts/ThemeContext'
<<<<<<< HEAD
import { ToastProvider } from '@/components/ui/Toast'
import '@xyflow/react/dist/style.css'
=======
>>>>>>> 0eaebb0353032bc71bea6002cc159795d5251c2c
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
<<<<<<< HEAD
  title: 'M42 Workspace',
  description: 'M42 Workspace',
=======
  title: 'Tech Due Diligence',
  description: 'M42 Tech Due Diligence Portal',
>>>>>>> 0eaebb0353032bc71bea6002cc159795d5251c2c
  icons: {
    icon: '/favicon-square.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${fraunces.variable}`}
      data-theme="light"
      suppressHydrationWarning
    >
      <body className="bg-[#f8fafc] text-[#0d212c] antialiased">
<<<<<<< HEAD
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
=======
        <ThemeProvider>{children}</ThemeProvider>
>>>>>>> 0eaebb0353032bc71bea6002cc159795d5251c2c
      </body>
    </html>
  )
}
