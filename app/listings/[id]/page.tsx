'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import BottomNav from '../../../components/BottomNav'

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "#c8952a" : "none"} stroke="#c8952a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const CategoryIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
)

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "#e85d2f" : "none"} stroke={filled ? "#e85d2f" : "#fff"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)

const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
  </svg>
)

const BoxIcon = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#4a8c5c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)

export default function ListingPage() {
  const { id } = useParams()
  const router = useRouter()
  const [listing, setListing] = useState<any>(null)
  const [seller, setSeller] = useState<any>(null)
  const [sellerReviews, setSellerReviews] = useState<any[]>([])
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [markingSold, setMarkingSold] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('listings').select('*').eq('id', id).single()
      if (!error && data) {
        setListing(data)
        const { data: sellerData } = await supabase.from('profiles').select('*').eq('id', data.user_id).single()
        if (sellerData) setSeller(sellerData)
        const { data: sellerReviewsData } = await supabase.from('reviews').select('*').eq('seller_id', data.user_id)
        if (sellerReviewsData) setSellerReviews(sellerReviewsData)
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

  const handleMarkSold = async () => {
    if (!user || user.id !== listing.user_id) return
    setMarkingSold(true)
    const newSoldState = !listing.is_sold
    await supabase.from('listings').update({ is_sold: newSoldState }).eq('id', id)
    setListing({ ...listing, is_sold: newSoldState })
    setMarkingSold(false)
  }

  const handleReview = async () => {
    if (!user) { router.push('/auth'); return }
    setSubmitting(true)
    const { error } = await supabase.from('reviews').insert({ reviewer_id: user.id, seller_id: listing.user_id, listing_id: id, rating, comment })
    if (error) { setReviewMessage('Error submitting review') }
    else {
      setReviewMessage('Review submitted!')
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
  const sellerAvgRating = sellerReviews.length > 0 ? (sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length).toFixed(1) : null
  const allImages = listing ? [listing.image_url, ...(listing.extra_images || [])].filter(Boolean) : []
  const isOwner = user && listing && user.id === listing.user_id

  if (loading) return <div style={{ minHeight: '100vh', background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a8a8a' }}>Loading...</div>
  if (!listing) return <div style={{ minHeight: '100vh', background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a8a8a' }}>Listing not found</div>

  return (
    <main style={{ minHeight: '100vh', background: '#faf8f4', paddingBottom: '80px', fontFamily: "'DM Sans', sans-serif" }}>
      <nav style={{ background: '#1a3a2a', padding: '0 24px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={() => router.push('/')} style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#fff', cursor: 'pointer' }}>
          near<span style={{ color: '#7dcf9a', fontStyle: 'italic' }}>me</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleSave} style={{ background: saved ? '#e85d2f' : 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '100px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HeartIcon filled={saved} /> {saved ? 'Saved' : 'Save'}
          </button>
          <button onClick={handleShare} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '100px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShareIcon /> {copied ? 'Copied!' : 'Share'}
          </button>
          <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '100px', padding: '8px 18px', fontSize: '13px', cursor: 'pointer' }}>← Back</button>
        </div>
      </nav>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px' }}>
        {/* 이미지 갤러리 */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: '#e8f4f0', borderRadius: '16px', marginBottom: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {allImages.length > 0
            ? <img src={allImages[currentImageIndex]} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <BoxIcon />
          }
          {listing.is_sold && (
            <div style={{ position: 'absolute', top: '16px', left: '16px', background: '#c0392b', color: '#fff', fontSize: '14px', fontWeight: '700', padding: '6px 16px', borderRadius: '100px' }}>SOLD</div>
          )}
          {allImages.length > 1 && (
            <>
              <button onClick={() => setCurrentImageIndex(prev => (prev - 1 + allImages.length) % allImages.length)} style={{ position: 'absolute', left: '12px', background: 'rgba(0,0,0,0.4)', color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px' }}>‹</button>
              <button onClick={() => setCurrentImageIndex(prev => (prev + 1) % allImages.length)} style={{ position: 'absolute', right: '12px', background: 'rgba(0,0,0,0.4)', color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px' }}>›</button>
              <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
                {allImages.map((_, i) => (
                  <div key={i} onClick={() => setCurrentImageIndex(i)} style={{ width: i === currentImageIndex ? '16px' : '6px', height: '6px', borderRadius: '100px', background: i === currentImageIndex ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.2s' }} />
                ))}
              </div>
            </>
          )}
        </div>

        {allImages.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
            {allImages.map((img, i) => (
              <img key={i} src={img} alt={`${i}`} onClick={() => setCurrentImageIndex(i)} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: i === currentImageIndex ? '2px solid #1a3a2a' : '2px solid transparent', flexShrink: 0 }} />
            ))}
          </div>
        )}

        {/* 가격 + 제목 */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8e4de', padding: '24px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '700', color: listing.is_sold ? '#8a8a8a' : '#1a1a1a' }}>
              {listing.price === 0 || listing.price === null ? 'Free' : `$${listing.price}`}
            </div>
            {listing.is_sold && <span style={{ background: '#fde8e8', color: '#c0392b', fontSize: '13px', fontWeight: '700', padding: '4px 12px', borderRadius: '100px' }}>SOLD</span>}
          </div>
          <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>{listing.title}</div>
          {avgRating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
              {[1,2,3,4,5].map(s => <StarIcon key={s} filled={s <= Math.round(Number(avgRating))} />)}
              <span style={{ fontSize: '13px', color: '#8a8a8a', marginLeft: '4px' }}>{avgRating} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </div>
          )}
          <div style={{ fontSize: '13px', color: '#8a8a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CategoryIcon /> {listing.category}
            <span style={{ margin: '0 4px' }}>·</span>
            <ClockIcon /> {new Date(listing.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          {isOwner && (
            <button onClick={handleMarkSold} disabled={markingSold} style={{ marginTop: '14px', background: listing.is_sold ? '#e8f5e8' : '#fde8e8', color: listing.is_sold ? '#2d7a2d' : '#c0392b', border: 'none', borderRadius: '100px', padding: '8px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
              {markingSold ? 'Updating...' : listing.is_sold ? 'Mark as available' : 'Mark as sold'}
            </button>
          )}
        </div>

        {/* 판매자 프로필 */}
        <div onClick={() => router.push(`/user/${listing.user_id}`)} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8e4de', padding: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1a3a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#fff', fontWeight: '700', flexShrink: 0 }}>
            {seller?.email?.[0].toUpperCase() || '?'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>{seller?.full_name || seller?.email?.split('@')[0] || 'NearMe User'}</div>
            {sellerAvgRating ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {[1,2,3,4,5].map(s => <StarIcon key={s} filled={s <= Math.round(Number(sellerAvgRating))} />)}
                <span style={{ fontSize: '12px', color: '#8a8a8a', marginLeft: '4px' }}>{sellerAvgRating} · {sellerReviews.length} review{sellerReviews.length !== 1 ? 's' : ''}</span>
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: '#8a8a8a' }}>No reviews yet</div>
            )}
          </div>
          <div style={{ fontSize: '12px', color: '#8a8a8a' }}>View profile →</div>
        </div>

        {listing.description && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8e4de', padding: '24px', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>Description</div>
            <div style={{ fontSize: '14px', color: '#4a4a4a', lineHeight: '1.6' }}>{listing.description}</div>
          </div>
        )}

        {!listing.is_sold && (
          <>
            {isOwner && (
              <button onClick={async () => {
                const res = await fetch('/api/create-checkout-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId: listing.id, listingTitle: listing.title }) })
                const { url } = await res.json()
                window.location.href = url
              }} style={{ width: '100%', background: '#e85d2f', color: '#fff', border: 'none', borderRadius: '100px', padding: '16px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginBottom: '12px' }}>
                Boost this listing — NZ$9.99
              </button>
            )}
            {!isOwner && (
              <button onClick={() => {
                if (!user) { router.push('/auth'); return }
                router.push(`/messages?listing=${listing.id}&receiver=${listing.user_id}`)
              }} style={{ width: '100%', background: '#1a3a2a', color: '#fff', border: 'none', borderRadius: '100px', padding: '16px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginBottom: '12px' }}>
                Message seller
              </button>
            )}
          </>
        )}

        {listing.is_sold && (
          <div style={{ background: '#fde8e8', borderRadius: '14px', padding: '16px', textAlign: 'center', marginBottom: '12px', fontSize: '15px', fontWeight: '600', color: '#c0392b' }}>
            This item has been sold
          </div>
        )}

        {user && !isOwner && (
          <div style={{ marginBottom: '24px' }}>
            {reportSent ? (
              <div style={{ fontSize: '13px', color: '#8a8a8a', textAlign: 'center' }}>Report submitted. Thank you.</div>
            ) : (
              <button onClick={() => setShowReport(!showReport)} style={{ background: 'transparent', border: 'none', fontSize: '13px', color: '#8a8a8a', cursor: 'pointer', textDecoration: 'underline' }}>
                Report this listing
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

        {/* 리뷰 */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8e4de', padding: '24px', marginBottom: '16px' }}>
          <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Reviews {reviews.length > 0 && `(${reviews.length})`}</div>
          {reviews.length === 0 ? (
            <div style={{ fontSize: '14px', color: '#8a8a8a', marginBottom: '16px' }}>No reviews yet. Be the first!</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {reviews.map((review) => (
                <div key={review.id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    {[1,2,3,4,5].map(s => <StarIcon key={s} filled={s <= review.rating} />)}
                    <span style={{ fontSize: '12px', color: '#8a8a8a', marginLeft: '4px' }}>{new Date(review.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  {review.comment && <div style={{ fontSize: '14px', color: '#4a4a4a' }}>{review.comment}</div>}
                </div>
              ))}
            </div>
          )}
          {user && !isOwner && (
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Leave a review</div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                {[1,2,3,4,5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                    <StarIcon filled={star <= rating} />
                  </button>
                ))}
              </div>
              <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience..." rows={3} style={{ width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', marginBottom: '10px', fontFamily: "'DM Sans', sans-serif" }} />
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