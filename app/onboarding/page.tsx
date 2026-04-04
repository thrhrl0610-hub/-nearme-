'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const router = useRouter()

  const steps = [
    {
      emoji: '📍',
      title: 'Hyperlocal listings',
      desc: 'See only what\'s near you — within 5, 10, or 20km of your location. No noise from the other side of the country.',
      bg: '#1a3a2a'
    },
    {
      emoji: '📦',
      title: 'Buy, sell & give away',
      desc: 'List anything from furniture to iPhones. Or give it away for free to someone in your neighbourhood.',
      bg: '#2d5a3d'
    },
    {
      emoji: '💼',
      title: 'Find local work',
      desc: 'Casual jobs, one-off gigs, and part-time roles — all within a few kilometres of where you are.',
      bg: '#1a3a2a'
    },
    {
      emoji: '📣',
      title: 'Promote your business',
      desc: 'Reach thousands of locals in your area. Cheaper and more targeted than Facebook or Google ads.',
      bg: '#2d5a3d'
    },
  ]

  const current = steps[step]

  return (
    <main style={{ minHeight: '100vh', background: current.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '60px 32px 48px', transition: 'background 0.4s' }}>
      {/* TOP */}
      <div style={{ fontFamily: 'Georgia, serif', fontSize: '24px', color: '#fff' }}>
        near<span style={{ color: '#7dcf9a', fontStyle: 'italic' }}>me</span>
      </div>

      {/* CONTENT */}
      <div style={{ textAlign: 'center', maxWidth: '320px' }}>
        <div style={{ fontSize: '80px', marginBottom: '32px' }}>{current.emoji}</div>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: '#fff', marginBottom: '16px', lineHeight: 1.2 }}>{current.title}</h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>{current.desc}</p>
      </div>

      {/* BOTTOM */}
      <div style={{ width: '100%', maxWidth: '320px' }}>
        {/* DOTS */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
          {steps.map((_, i) => (
            <div key={i} style={{ width: i === step ? '24px' : '8px', height: '8px', borderRadius: '100px', background: i === step ? '#fff' : 'rgba(255,255,255,0.3)', transition: 'all 0.3s' }} />
          ))}
        </div>

        {step < steps.length - 1 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={() => setStep(step + 1)} style={{ width: '100%', background: '#fff', color: '#1a3a2a', border: 'none', borderRadius: '100px', padding: '14px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>
              Next →
            </button>
            <button onClick={() => router.push('/auth')} style={{ width: '100%', background: 'transparent', color: 'rgba(255,255,255,0.6)', border: 'none', fontSize: '14px', cursor: 'pointer' }}>
              Skip
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={() => router.push('/auth')} style={{ width: '100%', background: '#fff', color: '#1a3a2a', border: 'none', borderRadius: '100px', padding: '14px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>
              Get started →
            </button>
            <button onClick={() => router.push('/')} style={{ width: '100%', background: 'transparent', color: 'rgba(255,255,255,0.6)', border: 'none', fontSize: '14px', cursor: 'pointer' }}>
              Browse without signing up
            </button>
          </div>
        )}
      </div>
    </main>
  )
}