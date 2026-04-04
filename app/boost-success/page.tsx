'use client'
import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

function BoostSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const listingId = searchParams.get('listing')

  useEffect(() => {
    const activateBoost = async () => {
      if (!listingId) return
      const boostedUntil = new Date()
      boostedUntil.setDate(boostedUntil.getDate() + 7)
      await supabase.from('listings').update({
        is_boosted: true,
        boosted_until: boostedUntil.toISOString()
      }).eq('id', listingId)
    }
    activateBoost()
  }, [listingId])

  return (
    <main style={{ minHeight: '100vh', background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🚀</div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '28px', marginBottom: '12px' }}>Your listing is boosted!</div>
        <div style={{ fontSize: '15px', color: '#8a8a8a', marginBottom: '32px' }}>It will appear at the top of the feed for 7 days.</div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={() => router.push(`/listings/${listingId}`)} style={{ background: '#1a3a2a', color: '#fff', border: 'none', borderRadius: '100px', padding: '12px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>View listing →</button>
          <button onClick={() => router.push('/')} style={{ background: 'transparent', color: '#1a3a2a', border: '1.5px solid #e8e4de', borderRadius: '100px', padding: '12px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Go home</button>
        </div>
      </div>
    </main>
  )
}

export default function BoostSuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <BoostSuccessContent />
    </Suspense>
  )
}