import type { Metadata } from 'next'
import './globals.css'
import SplashScreen from '../components/SplashScreen'

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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a3a2a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NearMe" />
      </head>
      <body>
        <SplashScreen />
        {children}
      </body>
    </html>
  )
}