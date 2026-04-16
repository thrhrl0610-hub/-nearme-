'use client'
import { useState, useEffect } from 'react'

export default function SplashScreen() {
  const [visible, setVisible] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true
    
    if (!isStandalone) return

    setVisible(true)
    const fadeTimer = setTimeout(() => setFadeOut(true), 1500)
    const hideTimer = setTimeout(() => setVisible(false), 2000)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: '#1a3a2a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.5s ease',
      pointerEvents: fadeOut ? 'none' : 'all',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'Georgia, serif',
          fontSize: '52px',
          color: '#ffffff',
          letterSpacing: '-0.5px',
        }}>
          near<span style={{ color: '#7dcf9a', fontStyle: 'italic' }}>me</span>
        </div>
        <div style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.5)',
          marginTop: '10px',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Your neighbourhood, online.
        </div>
      </div>
    </div>
  )
}