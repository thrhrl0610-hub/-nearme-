'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleAuth = async () => {
    setLoading(true)
    setMessage('')
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Welcome back! ✅')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Account created! Check your email ✅')
    }
    setLoading(false)
  }

  return (
    <main style={{
      minHeight: '100vh', background: '#faf8f4',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff', borderRadius: '14px',
        border: '1px solid #e8e4de', padding: '40px',
        width: '100%', maxWidth: '400px'
      }}>
        <div style={{
          fontFamily: 'Georgia, serif', fontSize: '28px',
          color: '#1a3a2a', marginBottom: '8px', textAlign: 'center'
        }}>
          near<span style={{color: '#4a8c5c', fontStyle: 'italic'}}>me</span>
        </div>
        <div style={{
          fontSize: '14px', color: '#8a8a8a',
          textAlign: 'center', marginBottom: '32px'
        }}>
          {isLogin ? 'Sign in to your account' : 'Create your account'}
        </div>

        <div style={{marginBottom: '16px'}}>
          <label style={{fontSize: '13px', fontWeight: '500', color: '#4a4a4a'}}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            style={{
              width: '100%', marginTop: '6px',
              border: '1.5px solid #e8e4de', borderRadius: '8px',
              padding: '10px 14px', fontSize: '14px', outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{marginBottom: '24px'}}>
          <label style={{fontSize: '13px', fontWeight: '500', color: '#4a4a4a'}}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{
              width: '100%', marginTop: '6px',
              border: '1.5px solid #e8e4de', borderRadius: '8px',
              padding: '10px 14px', fontSize: '14px', outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {message && (
          <div style={{
            marginBottom: '16px', padding: '10px 14px',
            background: '#e8f5e8', borderRadius: '8px',
            fontSize: '13px', color: '#2d7a2d'
          }}>{message}</div>
        )}

        <button
          onClick={handleAuth}
          disabled={loading}
          style={{
            width: '100%', background: '#1a3a2a', color: '#fff',
            border: 'none', borderRadius: '100px', padding: '12px',
            fontSize: '15px', fontWeight: '600', cursor: 'pointer'
          }}
        >
          {loading ? 'Loading...' : isLogin ? 'Sign in' : 'Sign up'}
        </button>

        <div
          onClick={() => setIsLogin(!isLogin)}
          style={{
            marginTop: '16px', textAlign: 'center',
            fontSize: '13px', color: '#4a8c5c',
            cursor: 'pointer', textDecoration: 'underline'
          }}
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </div>
      </div>
    </main>
  )
}
