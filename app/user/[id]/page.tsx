'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import BottomNav from '../../../components/BottomNav'
import ReportModal from '../../../components/ReportModal'

export default function UserProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [listings, setListings] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockLoading, setBlockLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showBlockConfirm, setShowBlockConfirm] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', id).single()
      if (profileData) setProfile(profileData)
      const { data: listingsData } = await supabase.from('listings').select('*').eq('user_id', id).order('created_at', { ascending: false })
      if (listingsData) setListings(listingsData)
      const { data: reviewsData } = await supabase.from('reviews').select('*').eq('seller_id', id).order('created_at', { ascending: false })
      if (reviewsData) setReviews(reviewsData)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUser(user)
        const { data: blockData } = await supabase.from('blocked_users').select('*').eq('blocker_id', user.id).eq('blocked_id', id).maybeSingle()
        if (blockData) setIsBlocked(true)
      }

      setLoading(false)
    }
    fetchData()
  }, [id])

  const handleBlock = async () => {
    if (!currentUser) { router.push('/auth'); return }
    setBlockLoading(true)

    if (isBlocked) {
      await supabase.from('blocked_users').delete().eq('blocker_id', currentUser.id).eq('blocked_id', id)
      setIsBlocked(false)
    } else {
      await supabase.from('blocked_users').insert({ blocker_id: currentUser.id, blocked_id: id })
      setIsBlocked(true)
    }

    setBlockLoading(false)
    setShowBlockConfirm(false)
    setShowMenu(false)
  }

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : null
  const isOwnProfile = currentUser && currentUser.id === id

  if (loading) return <div style={{ minHeight: '100vh', background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a8a8a' }}>Loading...</div>

  // 차단된 유저면 내용 숨김
  if (isBlocked) {
    return (
      <main style={{ minHeight: '100vh', background: '#faf8f4', paddingBottom: '80px' }}>
        <nav style={{ background: '#1a3a2a', padding: '0 24px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div onClick={() => router.push('/')} style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#fff', cursor: 'pointer' }}>
            near<span style={{ color: '#7dcf9a', fontStyle: 'italic' }}>me</span>
          </div>
          <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '100px', padding: '8px 18px', fontSize: '13px', cursor: 'pointer' }}>← Back</button>
        </nav>

        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8e4de', padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚫</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>User blocked</div>
            <div style={{ fontSize: '14px', color: '#4a4a4a', lineHeight: '1.5', marginBottom: '20px' }}>
              You've blocked this user. You won't see their listings, messages, or content.
            </div>
            <button
              onClick={handleBlock}
              disabled={blockLoading}
              style={{ background: '#1a3a2a', color: '#fff', border: 'none', borderRadius: '100px', padding: '12px 28px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
            >
              {blockLoading ? 'Unblocking...' : 'Unblock user'}
            </button>
          </div>
        </div>

        <BottomNav />
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#faf8f4', paddingBottom: '80px' }}>
      <nav style={{ background: '#1a3a2a', padding: '0 24px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={() => router.push('/')} style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#fff', cursor: 'pointer' }}>
          near<span style={{ color: '#7dcf9a', fontStyle: 'italic' }}>me</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
          {currentUser && !isOwnProfile && (
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ⋮
            </button>
          )}
          <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '100px', padding: '8px 18px', fontSize: '13px', cursor: 'pointer' }}>← Back</button>
          {showMenu && (
            <div style={{ position: 'absolute', top: '44px', right: '0', background: '#fff', border: '1px solid #e8e4de', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '6px', minWidth: '180px', zIndex: 100 }}>
              <div
                onClick={() => {
                  setShowMenu(false)
                  setShowReportModal(true)
                }}
                style={{ padding: '10px 14px', fontSize: '14px', color: '#c0392b', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                🚩 Report user
              </div>
              <div
                onClick={() => {
                  setShowMenu(false)
                  setShowBlockConfirm(true)
                }}
                style={{ padding: '10px 14px', fontSize: '14px', color: '#c0392b', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                🚫 Block user
              </div>
            </div>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px' }}>
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

      {/* 차단 확인 모달 */}
      {showBlockConfirm && (
        <div onClick={() => setShowBlockConfirm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: '20px', padding: '24px', maxWidth: '400px', width: '100%', fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>Block this user?</div>
            <div style={{ fontSize: '14px', color: '#4a4a4a', lineHeight: '1.5', marginBottom: '20px' }}>
              You won't see their listings, messages, or profile. They won't be notified. You can unblock them anytime.
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowBlockConfirm(false)}
                style={{ flex: 1, background: '#f0ede5', color: '#4a4a4a', border: 'none', borderRadius: '100px', padding: '14px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleBlock}
                disabled={blockLoading}
                style={{ flex: 1, background: '#c0392b', color: '#fff', border: 'none', borderRadius: '100px', padding: '14px', fontSize: '14px', fontWeight: '600', cursor: blockLoading ? 'not-allowed' : 'pointer' }}
              >
                {blockLoading ? 'Blocking...' : 'Block user'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentType="user"
        contentId={id as string}
        reportedUserId={id as string}
        userId={currentUser?.id || null}
      />

      <BottomNav />
    </main>
  )
}