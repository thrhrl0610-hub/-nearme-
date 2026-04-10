'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import BottomNav from '../../../components/BottomNav'

export default function JobDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [job, setJob] = useState<any>(null)
  const [poster, setPoster] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJob = async () => {
      const { data } = await supabase.from('jobs').select('*').eq('id', params.id).single()
      if (data) {
        setJob(data)
        const { data: posterData } = await supabase.from('profiles').select('*').eq('id', data.user_id).single()
        if (posterData) setPoster(posterData)
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUser(user)
      setLoading(false)
    }
    fetchJob()
  }, [])

  if (loading) return <div style={{ minHeight: '100vh', background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a8a8a' }}>Loading...</div>
  if (!job) return <div style={{ minHeight: '100vh', background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a8a8a' }}>Job not found</div>

  const isOwner = user && user.id === job.user_id

  return (
    <main style={{ minHeight: '100vh', background: '#faf8f4', paddingBottom: '80px', fontFamily: "'DM Sans', sans-serif" }}>
      <nav style={{ background: '#1a3a2a', padding: '0 24px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={() => router.push('/')} style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#fff', cursor: 'pointer' }}>
          near<span style={{ color: '#7dcf9a', fontStyle: 'italic' }}>me</span>
        </div>
        <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '100px', padding: '8px 18px', fontSize: '13px', cursor: 'pointer' }}>← Back</button>
      </nav>

      <div style={{ padding: '24px', maxWidth: '640px', margin: '0 auto' }}>

        {/* Job 헤더 */}
        <div style={{ background: '#fff', borderRadius: '14px', border: `1px solid ${job.is_urgent ? '#e85d2f' : '#e8e4de'}`, padding: '24px', marginBottom: '16px', position: 'relative' }}>
          {job.is_urgent && (
            <div style={{ position: 'absolute', top: '-1px', left: '16px', background: '#e85d2f', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '0 0 8px 8px' }}>🔴 URGENT</div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', marginTop: job.is_urgent ? '12px' : '0' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: job.is_urgent ? '#fde8e8' : '#e8f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0 }}>💼</div>
            <div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>{job.title}</div>
              <div style={{ fontSize: '14px', color: '#8a8a8a' }}>{job.company}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <span style={{ background: '#e8f5e8', color: '#2d7a2d', fontSize: '13px', fontWeight: '600', padding: '4px 12px', borderRadius: '100px' }}>{job.pay_rate}</span>
            <span style={{ background: '#e8f4f0', color: '#2d5a3d', fontSize: '13px', padding: '4px 12px', borderRadius: '100px' }}>{job.job_type}</span>
            {job.location_name && <span style={{ background: '#f5f5f5', color: '#4a4a4a', fontSize: '13px', padding: '4px 12px', borderRadius: '100px' }}>📍 {job.location_name}</span>}
          </div>
          {job.description && (
            <div style={{ fontSize: '14px', color: '#4a4a4a', lineHeight: 1.7 }}>{job.description}</div>
          )}
        </div>

        {/* 게시자 */}
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8e4de', padding: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#1a3a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#fff', fontWeight: '700', flexShrink: 0 }}>
            {poster?.email?.[0]?.toUpperCase() || '?'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>{poster?.full_name || poster?.email?.split('@')[0] || 'NearMe User'}</div>
            <div style={{ fontSize: '12px', color: '#8a8a8a' }}>Posted {new Date(job.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })}</div>
          </div>
        </div>

        {/* 버튼 */}
        {!isOwner && (
          <button onClick={() => {
            if (!user) { router.push('/auth'); return }
            router.push(`/messages?receiver=${job.user_id}&job=${job.id}`)
          }} style={{ width: '100%', background: '#1a3a2a', color: '#fff', border: 'none', borderRadius: '100px', padding: '16px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginBottom: '12px' }}>
            💬 Apply / Message
          </button>
        )}

        {isOwner && (
          <div style={{ background: '#e8f4f0', borderRadius: '14px', padding: '16px', textAlign: 'center', fontSize: '14px', color: '#1a3a2a', marginBottom: '12px' }}>
            This is your job posting
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}