'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function AuthPage() {
  const [mode, setMode] = useState<'user' | 'biz'>('user')
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [bizName, setBizName] = useState('')
  const [suburb, setSuburb] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleAuth = async () => {
    setLoading(true)
    setMessage('')
    if (isSignup) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else { setMessage('Account created! Check your email ✅'); setTimeout(() => router.push('/'), 1500) }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else { setMessage('Welcome back! ✅'); setTimeout(() => router.push('/'), 1000) }
    }
    setLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', sans-serif" }}>
      {/* LEFT PANEL */}
      <div style={{ width: '44%', background: '#1a3a2a', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 52px', flexShrink: 0 }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: '#fff' }}>
          near<span style={{ color: '#7dcf9a', fontStyle: 'italic' }}>me</span>
        </div>
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '38px', color: '#fff', lineHeight: 1.15, marginBottom: '16px' }}>
            Your <span style={{ color: '#7dcf9a', fontStyle: 'italic' }}>neighbourhood</span>,<br />in your pocket.
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: '340px' }}>
            Buy, sell, find work, and discover what's happening — all within a few kilometres of where you are right now.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '28px' }}>
          {[['12k+', 'Local users'], ['340+', 'Businesses'], ['$0.14', 'Avg cost/click']].map(([num, label]) => (
            <div key={label}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: '#fff' }}>{num}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', background: '#faf8f4' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* MODE SWITCHER */}
          <div style={{ display: 'flex', background: '#e8e4de', borderRadius: '100px', padding: '4px', marginBottom: '32px', gap: '4px' }}>
            {[['user', "🏠 I'm a local"], ['biz', "📣 I'm a business"]].map(([m, label]) => (
              <button key={m} onClick={() => setMode(m as 'user' | 'biz')} style={{ flex: 1, border: 'none', borderRadius: '100px', padding: '10px 16px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', background: mode === m ? '#fff' : 'transparent', color: mode === m ? '#1a1a1a' : '#8a8a8a', boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>{label}</button>
            ))}
          </div>

          <div style={{ fontFamily: 'Georgia, serif', fontSize: '26px', marginBottom: '6px' }}>
            {mode === 'user' ? (isSignup ? 'Create your account' : 'Welcome back') : (isSignup ? 'List your business' : 'Business sign in')}
          </div>
          <div style={{ fontSize: '14px', color: '#8a8a8a', marginBottom: '24px' }}>
            {mode === 'user' ? (isSignup ? 'Join thousands of locals near you' : "Sign in to see what's near you") : (isSignup ? 'Start reaching locals in your area' : 'Access your advertiser dashboard')}
          </div>

          {mode === 'biz' && (
            <div style={{ background: '#fdf6e8', border: '1px solid #f0e4c0', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#c8952a', marginBottom: '20px' }}>
              🏆 30 days free on your first campaign
            </div>
          )}

          {mode === 'user' && (
            <div style={{ background: '#e8f4f0', borderRadius: '8px', padding: '12px 14px', fontSize: '13px', color: '#2d5a3d', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📍 We'll ask for your location to show nearby listings
            </div>
          )}

          {isSignup && mode === 'user' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#4a4a4a', display: 'block', marginBottom: '6px' }}>First name</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jamie" style={{ width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#4a4a4a', display: 'block', marginBottom: '6px' }}>Last name</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Wilson" style={{ width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
          )}

          {isSignup && mode === 'biz' && (
            <>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#4a4a4a', display: 'block', marginBottom: '6px' }}>Business name</label>
                <input value={bizName} onChange={e => setBizName(e.target.value)} placeholder="e.g. Pho Silverdale" style={{ width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#4a4a4a', display: 'block', marginBottom: '6px' }}>Suburb</label>
                <input value={suburb} onChange={e => setSuburb(e.target.value)} placeholder="e.g. Silverdale" style={{ width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#4a4a4a', display: 'block', marginBottom: '6px' }}>Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={{ width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#4a4a4a', display: 'block', marginBottom: '6px' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {message && (
            <div style={{ marginBottom: '16px', padding: '10px 14px', background: '#e8f5e8', borderRadius: '8px', fontSize: '13px', color: '#2d7a2d' }}>{message}</div>
          )}

          <button onClick={handleAuth} disabled={loading} style={{ width: '100%', background: mode === 'biz' ? '#c8952a' : '#1a3a2a', color: '#fff', border: 'none', borderRadius: '8px', padding: '13px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginBottom: '16px' }}>
            {loading ? 'Loading...' : mode === 'user' ? (isSignup ? 'Sign up free →' : 'Sign in') : (isSignup ? 'Start 30-day free trial →' : 'Sign in to dashboard')}
          </button>

          <div style={{ textAlign: 'center', fontSize: '13px', color: '#8a8a8a' }}>
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <span onClick={() => setIsSignup(!isSignup)} style={{ color: '#4a8c5c', cursor: 'pointer', textDecoration: 'underline' }}>
              {isSignup ? 'Sign in' : 'Sign up free'}
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}