import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NearMe — Buy, sell and find local in New Zealand',
  description: 'NearMe is your local marketplace for New Zealand. Buy and sell items, find jobs, discover local businesses and events near you.',
  keywords: 'NZ marketplace, buy sell NZ, local listings New Zealand, jobs NZ, Trade Me alternative',
  openGraph: {
    title: 'NearMe — Local Marketplace NZ',
    description: 'Buy, sell and find local in New Zealand',
    url: 'https://nearme-plum.vercel.app',
    siteName: 'NearMe',
    locale: 'en_NZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NearMe — Local Marketplace NZ',
    description: 'Buy, sell and find local in New Zealand',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}