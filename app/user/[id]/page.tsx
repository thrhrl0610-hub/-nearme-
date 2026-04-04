'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function UserProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [listings, setListings] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', id).single()
      if (profileData) setProfile(profileData)

      const { data: listingsData } = await supabase.from('listings').select('*').eq('user_id', id).order('created_at', { ascending: false })
      if (listingsData) setListings(listingsData)

      const { data: reviewsData } = await supabase.from('reviews').select('*').eq('seller_id', id).order('created_at', { ascending: false })
      if (reviewsData) setReviews(reviewsData)

      setLoading(false)
    }
    fetchData()
  }, [id])

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : null

  if (loading) return <div style={{ minHeight: '100vh', background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a8a8a' }}>Loading...</div>

  return (
    <main style={{ minHeight: '100vh', background: '#faf8f4', paddingBottom: '80px' }}>
      <nav style={{ background: '#1a3a2a', padding: '0 24px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={() => router.push('/')} style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#fff', cursor: 'pointer' }}>
          near<span style={{ color: '#7dcf9a', fontStyle: 'italic' }}>me</span>
        </div>
        <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '100px', padding: '8px 18px', fontSize: '13px', cursor: 'pointer' }}>← Back</button>
      </nav>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px' }}>
        {/* PROFILE CARD */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8e4de', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#1a3a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', color: '#fff', fontWeight: '700', flexShrink: 0 }}>
              {profile?.email?.[0].toUpperCase() || '?'}
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{profile?.full_name || profile?.email?.split('@')[0] || 'NearMe User'}</div>
              {avgRating && (
                <div style={{ fontSize: '14px', color: '#c8952a' }}>
                  {'⭐'.repeat(Math.round(Number(avgRating)))} {avgRating} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                </div>
              )}
              <div style={{ fontSize: '13px', color: '#8a8a8a', marginTop: '4px' }}>{listings.length} listing{listings.length !== 1 ? 's' : ''} posted</div>
            </div>
          </div>
        </div>

        {/* LISTINGS */}
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', marginBottom: '16px' }}>Listings</div>
        {listings.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8e4de', padding: '40px', textAlign: 'center', color: '#8a8a8a', fontSize: '14px' }}>No listings yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {listings.map((item) => (
              <div key={item.id} onClick={() => router.push(`/listings/${item.id}`)} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8e4de', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '10px', background: '#e8f4f0', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                  {item.image_url ? <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '3px' }}>{item.title}</div>
                  <div style={{ fontSize: '13px', color: '#4a8c5c', fontWeight: '500' }}>{item.price === 0 ? 'Free' : `$${item.price}`}</div>
                  <div style={{ fontSize: '12px', color: '#8a8a8a' }}>{item.category}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REVIEWS */}
        {reviews.length > 0 && (
          <>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', marginBottom: '16px' }}>Reviews</div>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8e4de', padding: '24px' }}>
              {reviews.map((review) => (
                <div key={review.id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ color: '#c8952a' }}>{'⭐'.repeat(review.rating)}</span>
                    <span style={{ fontSize: '12px', color: '#8a8a8a' }}>{new Date(review.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  {review.comment && <div style={{ fontSize: '14px', color: '#4a4a4a' }}>{review.comment}</div>}
                </div>
              ))}
            </div>
          </>
        )}
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