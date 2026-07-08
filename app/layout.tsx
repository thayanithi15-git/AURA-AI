import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'AURA - AI Digital Wealth Advisor',
  description: 'Personalized wealth management and interactive financial advisory bot powered by AI.',
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    title: 'AURA - AI Digital Wealth Advisor',
    description: 'Personalized wealth management and interactive financial advisory bot powered by AI.',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'AURA - AI Digital Wealth Advisor',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased font-sans">{children}</body>
    </html>
  )
}
