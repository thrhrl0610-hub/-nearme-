'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const slides = [
  {
    emoji: '📍',
    title: 'Welcome to nearme',
    description: 'Your neighbourhood, online. Everything local — all in one place.',
    bg: '#1a3a2a',
    accent: '#7dcf9a',
  },
  {
    emoji: '📦',
    title: 'Buy & sell locally',
    description: 'Find great deals from people just around the corner. No shipping, no hassle.',
    bg: '#1a3a2a',
    accent: '#7dcf9a',
  },
  {
    emoji: '💼',
    title: 'Find local jobs',
    description: 'Part-time, full-time, or just need a hand — discover work opportunities near you.',
    bg: '#1a3a2a',
    accent: '#7dcf9a',
  },
  {
    emoji: '🤝',
    title: 'Connect with your community',
    description: 'Meet the people next door. Buy, sell, hire — from neighbours you can trust.',
    bg: '#1a3a2a',
    accent: '#7dcf9a',
  },
]

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [current, setCurrent] = useState(0)

  const handleNext = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1)
    } else {
      localStorage.setItem('nearme_onboarded', 'true')
      onComplete()
    }
  }

  const slide = slides[current]
  const isLast = current === slides.length - 1

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: slide.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 32px',
      zIndex: 9998,
      fontFamily: "'DM Sans', sans-serif",
      transition: 'all 0.3s ease',
    }}>

      {/* Skip 버튼 */}
      {!isLast && (
        <button onClick={() => {
          localStorage.setItem('nearme_onboarded', 'true')
          onComplete()
        }} style={{
          position: 'absolute', top: '52px', right: '24px',
          background: 'transparent', border: 'none',
          color: 'rgba(255,255,255,0.5)', fontSize: '14px',
          cursor: 'pointer',
        }}>Skip</button>
      )}

      {/* 이모지 */}
      <div style={{ fontSize: '80px', marginBottom: '32px' }}>{slide.emoji}</div>

      {/* 텍스트 */}
      <div style={{
        fontFamily: 'Georgia, serif', fontSize: '32px',
        color: '#fff', textAlign: 'center', marginBottom: '16px', lineHeight: 1.2,
      }}>{slide.title}</div>

      <div style={{
        fontSize: '16px', color: 'rgba(255,255,255,0.65)',
        textAlign: 'center', lineHeight: 1.7, maxWidth: '300px', marginBottom: '48px',
      }}>{slide.description}</div>

      {/* 도트 인디케이터 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
        {slides.map((_, i) => (
          <div key={i} onClick={() => setCurrent(i)} style={{
            width: i === current ? '20px' : '8px', height: '8px',
            borderRadius: '100px',
            background: i === current ? slide.accent : 'rgba(255,255,255,0.25)',
            cursor: 'pointer', transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      {/* 버튼 */}
      <button onClick={handleNext} style={{
        width: '100%', maxWidth: '340px',
        background: slide.accent, color: '#1a3a2a',
        border: 'none', borderRadius: '100px',
        padding: '16px', fontSize: '16px', fontWeight: '700',
        cursor: 'pointer',
      }}>
        {isLast ? "Let's go →" : 'Next →'}
      </button>
    </div>
  )
}