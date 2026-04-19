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
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setMessage(error.message); setLoading(false); return }
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          full_name: mode === 'biz' ? bizName : `${firstName} ${lastName}`.trim(),
          is_business: mode === 'biz',
          business_name: mode === 'biz' ? bizName : null,
          suburb: mode === 'biz' ? suburb : null,
        })
      }
      setMessage('Account created! Check your email ✅')
      setTimeout(() => {
        if (mode !== 'biz') {
          localStorage.setItem('nearme_show_onboarding', 'true')
        }
        router.push(mode === 'biz' ? '/advertiser' : '/')
      }, 1500)
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setMessage(error.message); setLoading(false); return }
      if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('is_business').eq('id', data.user.id).single()
        setMessage('Welcome back! ✅')
        setTimeout(() => router.push(profile?.is_business ? '/advertiser' : '/'), 1000)
      }
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://www.nearmenow.co.nz' }
    })
  }

  const handleAppleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: 'https://www.nearmenow.co.nz' }
    })
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @media (max-width: 768px) {
          .auth-left { display: none !important; }
          .auth-right { padding: 32px 24px !important; }
        }
      `}</style>

      <div className="auth-left" style={{ width: '44%', background: '#1a3a2a', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 52px', flexShrink: 0 }}>
        <div onClick={() => router.push('/')} style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: '#fff', cursor: 'pointer' }}>
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

      <div className="auth-right" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', background: '#faf8f4' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
            <button onClick={() => router.push('/')} style={{ background: '#f0f0f0', border: 'none', borderRadius: '100px', padding: '7px 14px', fontSize: '13px', color: '#1a1a1a', cursor: 'pointer' }}>← Back</button>
            <div onClick={() => router.push('/')} style={{ fontFamily: 'Georgia, serif', fontSize: '24px', color: '#1a3a2a', cursor: 'pointer' }}>
              near<span style={{ color: '#4a8c5c', fontStyle: 'italic' }}>me</span>
            </div>
            <div style={{ width: '60px' }} />
          </div>

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

          <button onClick={handleAppleLogin} style={{ width: '100%', background: '#000', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: '500', color: '#fff', cursor: 'pointer', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <svg width="18" height="18" viewBox="0 0 384 512" fill="#fff">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
            </svg>
            Continue with Apple
          </button>

          <button onClick={handleGoogleLogin} style={{ width: '100%', background: '#fff', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1, height: '1px', background: '#e8e4de' }} />
            <span style={{ fontSize: '12px', color: '#8a8a8a' }}>or continue with email</span>
            <div style={{ flex: 1, height: '1px', background: '#e8e4de' }} />
          </div>

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