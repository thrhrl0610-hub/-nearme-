'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function JobDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJob = async () => {
      const { data } = await supabase.from('jobs').select('*').eq('id', params.id).single()
      if (data) setJob(data)
      setLoading(false)
    }
    fetchJob()
  }, [])

  if (loading) return <div style={{ minHeight: '100vh', background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a8a8a' }}>Loading...</div>
  if (!job) return <div style={{ minHeight: '100vh', background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a8a8a' }}>Job not found</div>

  return (
    <main style={{ minHeight: '100vh', background: '#faf8f4', paddingBottom: '80px' }}>
      <nav style={{ background: '#1a3a2a', padding: '0 24px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#fff' }}>
          near<span style={{ color: '#7dcf9a', fontStyle: 'italic' }}>me</span>
        </div>
        <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '100px', padding: '8px 18px', fontSize: '13px', cursor: 'pointer' }}>← Back</button>
      </nav>

      <div style={{ padding: '24px', maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8e4de', padding: '24px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#e8f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0 }}>💼</div>
            <div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>{job.title}</div>
              <div style={{ fontSize: '14px', color: '#8a8a8a' }}>{job.company}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <span style={{ background: '#e8f5e8', color: '#2d7a2d', fontSize: '13px', fontWeight: '600', padding: '4px 12px', borderRadius: '100px' }}>{job.pay_rate}</span>
            <span style={{ background: '#e8f4f0', color: '#2d5a3d', fontSize: '13px', padding: '4px 12px', borderRadius: '100px' }}>{job.job_type}</span>
          </div>
          {job.description && (
            <div style={{ fontSize: '14px', color: '#4a4a4a', lineHeight: 1.7 }}>{job.description}</div>
          )}
        </div>

        <button onClick={() => router.push('/messages')} style={{ width: '100%', background: '#1a3a2a', color: '#fff', border: 'none', borderRadius: '100px', padding: '14px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginBottom: '12px' }}>
          💬 Apply / Message
        </button>
        <button onClick={() => router.back()} style={{ width: '100%', background: 'transparent', color: '#1a3a2a', border: '1.5px solid #e8e4de', borderRadius: '100px', padding: '14px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
          ← Back to listings
        </button>
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #e8e4de', display: 'flex', justifyContent: 'space-around', padding: '8px 0 12px' }}>
        {[['🏠', 'Home', '/'], ['🔍', 'Browse', '/browse'], ['➕', 'Post', '/post'], ['💬', 'Chat', '/messages'], ['👤', 'Profile', '/profile']].map(([icon, label, href]) => (
          <div key={label} onClick={() => router.push(href as string)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', cursor: 'pointer', fontSize: '11px', color: '#8a8a8a' }}>
            <div style={{ fontSize: '22px' }}>{icon}</div>
            {label}
          </div>
        ))}
      </div>
    </main>
  )
}