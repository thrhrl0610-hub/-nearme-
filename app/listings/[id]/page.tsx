'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import BottomNav from '../../../components/BottomNav'

export default function ListingPage() {
  const { id } = useParams()
  const router = useRouter()
  const [listing, setListing] = useState<any>(null)
  const [seller, setSeller] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewMessage, setReviewMessage] = useState('')
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportSent, setReportSent] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('listings').select('*').eq('id', id).single()
      if (!error && data) {
        setListing(data)
        const { data: sellerData } = await supabase.from('profiles').select('*').eq('id', data.user_id).single()
        if (sellerData) setSeller(sellerData)
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: saveData } = await supabase.from('saves').select('*').eq('user_id', user.id).eq('listing_id', id).single()
        if (saveData) setSaved(true)
      }
      const { data: reviewsData } = await supabase.from('reviews').select('*').eq('listing_id', id).order('created_at', { ascending: false })
      if (reviewsData) setReviews(reviewsData)
      setLoading(false)
    }
    fetchData()
  }, [id])

  const handleShare = async () => {
    const url = `https://www.nearmenow.co.nz/listings/${id}`
    if (navigator.share) {
      await navigator.share({ title: listing.title, text: `Check out this listing on NearMe!`, url })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSave = async () => {
    if (!user) { router.push('/auth'); return }
    if (saved) {
      await supabase.from('saves').delete().eq('user_id', user.id).eq('listing_id', id)
      setSaved(false)
    } else {
      await supabase.from('saves').insert({ user_id: user.id, listing_id: id })
      setSaved(true)
    }
  }

  const handleReview = async () => {
    if (!user) { router.push('/auth'); return }
    setSubmitting(true)
    const { error } = await supabase.from('reviews').insert({
      reviewer_id: user.id,
      seller_id: listing.user_id,
      listing_id: id,
      rating,
      comment
    })
    if (error) {
      setReviewMessage('Error submitting review')
    } else {
      setReviewMessage('Review submitted! ✅')
      setComment('')
      const { data: reviewsData } = await supabase.from('reviews').select('*').eq('listing_id', id).order('created_at', { ascending: false })
      if (reviewsData) setReviews(reviewsData)
    }
    setSubmitting(false)
  }

  const handleReport = async () => {
    if (!user) { router.push('/auth'); return }
    if (!reportReason) return
    await supabase.from('reports').insert({ reporter_id: user.id, listing_id: id, reason: reportReason })
    setReportSent(true)
    setShowReport(false)
  }

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : null

  if (loading) return <div style={{ minHeight: '100vh', background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a8a8a' }}>Loading...</div>
  if (!listing) return <div style={{ minHeight: '100vh', background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a8a8a' }}>Listing not found</div>

  return (
    <main style={{ minHeight: '100vh', background: '#faf8f4', paddingBottom: '80px' }}>
      <nav style={{ background: '#1a3a2a', padding: '0 24px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={() => router.push('/')} style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#fff', cursor: 'pointer' }}>
          near<span style={{ color: '#7dcf9a', fontStyle: 'italic' }}>me</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleSave} style={{ background: saved ? '#e85d2f' : 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '100px', padding: '8px 18px', fontSize: '13px', cursor: 'pointer' }}>
            {saved ? '❤️ Saved' : '🤍 Save'}
          </button>
          <button onClick={handleShare} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '100px', padding: '8px 18px', fontSize: '13px', cursor: 'pointer' }}>
            {copied ? '✅ Copied!' : '🔗 Share'}
          </button>
          <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '100px', padding: '8px 18px', fontSize: '13px', cursor: 'pointer' }}>← Back</button>
        </div>
      </nav>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px' }}>
        <div style={{ width: '100%', aspectRatio: '4/3', background: '#e8f4f0', borderRadius: '16px', marginBottom: '24px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px' }}>
          {listing.image_url
            ? <img src={listing.image_url} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '📦'}
        </div>

        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8e4de', padding: '24px', marginBottom: '16px' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
            {listing.price === 0 || listing.price === null ? 'Free' : `$${listing.price}`}
          </div>
          <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>{listing.title}</div>
          {avgRating && (
            <div style={{ fontSize: '14px', color: '#c8952a', marginBottom: '8px' }}>
              {'⭐'.repeat(Math.round(Number(avgRating)))} {avgRating} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
            </div>
          )}
          <div style={{ fontSize: '13px', color: '#8a8a8a' }}>
            📦 {listing.category} · 🕐 {new Date(listing.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>

        <div onClick={() => router.push(`/user/${listing.user_id}`)} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8e4de', padding: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#1a3a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#fff', fontWeight: '700', flexShrink: 0 }}>
            {seller?.email?.[0].toUpperCase() || '?'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>{seller?.full_name || seller?.email?.split('@')[0] || 'NearMe User'}</div>
            <div style={{ fontSize: '12px', color: '#8a8a8a' }}>View profile →</div>
          </div>
        </div>

        {listing.description && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8e4de', padding: '24px', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>Description</div>
            <div style={{ fontSize: '14px', color: '#4a4a4a', lineHeight: '1.6' }}>{listing.description}</div>
          </div>
        )}

        <button onClick={async () => {
          const res = await fetch('/api/create-checkout-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId: listing.id, listingTitle: listing.title }) })
          const { url } = await res.json()
          window.location.href = url
        }} style={{ width: '100%', background: '#e85d2f', color: '#fff', border: 'none', borderRadius: '100px', padding: '16px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginBottom: '12px' }}>
          🚀 Boost this listing — NZ$9.99
        </button>

        <button onClick={() => router.push(`/messages?listing=${listing.id}&receiver=${listing.user_id}`)} style={{ width: '100%', background: '#1a3a2a', color: '#fff', border: 'none', borderRadius: '100px', padding: '16px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginBottom: '12px' }}>
          💬 Message seller
        </button>

        {user && user.id !== listing.user_id && (
          <div style={{ marginBottom: '24px' }}>
            {reportSent ? (
              <div style={{ fontSize: '13px', color: '#8a8a8a', textAlign: 'center' }}>✅ Report submitted. Thank you.</div>
            ) : (
              <button onClick={() => setShowReport(!showReport)} style={{ background: 'transparent', border: 'none', fontSize: '13px', color: '#8a8a8a', cursor: 'pointer', textDecoration: 'underline' }}>
                🚩 Report this listing
              </button>
            )}
            {showReport && !reportSent && (
              <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8e4de', padding: '16px', marginTop: '8px' }}>
                <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Why are you reporting this?</div>
                {['Spam or scam', 'Inappropriate content', 'Wrong category', 'Already sold', 'Other'].map(reason => (
                  <div key={reason} onClick={() => setReportReason(reason)} style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', background: reportReason === reason ? '#e8f4f0' : 'transparent', color: reportReason === reason ? '#1a3a2a' : '#4a4a4a', marginBottom: '4px' }}>
                    {reportReason === reason ? '✓ ' : ''}{reason}
                  </div>
                ))}
                <button onClick={handleReport} disabled={!reportReason} style={{ marginTop: '8px', background: '#1a3a2a', color: '#fff', border: 'none', borderRadius: '100px', padding: '8px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: reportReason ? 1 : 0.5 }}>
                  Submit report
                </button>
              </div>
            )}
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8e4de', padding: '24px', marginBottom: '16px' }}>
          <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Reviews {reviews.length > 0 && `(${reviews.length})`}</div>
          {reviews.length === 0 ? (
            <div style={{ fontSize: '14px', color: '#8a8a8a', marginBottom: '16px' }}>No reviews yet. Be the first!</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {reviews.map((review) => (
                <div key={review.id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ color: '#c8952a' }}>{'⭐'.repeat(review.rating)}</span>
                    <span style={{ fontSize: '12px', color: '#8a8a8a' }}>{new Date(review.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  {review.comment && <div style={{ fontSize: '14px', color: '#4a4a4a' }}>{review.comment}</div>}
                </div>
              ))}
            </div>
          )}
          {user && user.id !== listing.user_id && (
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Leave a review</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', opacity: star <= rating ? 1 : 0.3 }}>⭐</button>
                ))}
              </div>
              <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience..." rows={3} style={{ width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', marginBottom: '10px' }} />
              {reviewMessage && <div style={{ fontSize: '13px', color: '#2d7a2d', marginBottom: '8px' }}>{reviewMessage}</div>}
              <button onClick={handleReview} disabled={submitting} style={{ background: '#1a3a2a', color: '#fff', border: 'none', borderRadius: '100px', padding: '10px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                {submitting ? 'Submitting...' : 'Submit review'}
              </button>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </main>
  )
}