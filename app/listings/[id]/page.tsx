'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function ListingPage() {
  const { id } = useParams()
  const router = useRouter()
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchListing = async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single()

      if (!error && data) setListing(data)
      setLoading(false)
    }
    fetchListing()
  }, [id])

  if (loading) return (
    <div style={{minHeight: '100vh', background: '#faf8f4', display: 'flex',
      alignItems: 'center', justifyContent: 'center', color: '#8a8a8a'}}>
      Loading...
    </div>
  )

  if (!listing) return (
    <div style={{minHeight: '100vh', background: '#faf8f4', display: 'flex',
      alignItems: 'center', justifyContent: 'center', color: '#8a8a8a'}}>
      Listing not found
    </div>
  )

  return (
    <main style={{minHeight: '100vh', background: '#faf8f4', paddingBottom: '80px'}}>
      {/* NAV */}
      <nav style={{
        background: '#1a3a2a', padding: '0 24px', height: '58px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div
          onClick={() => router.push('/')}
          style={{fontFamily: 'Georgia, serif', fontSize: '22px', color: '#fff', cursor: 'pointer'}}
        >
          near<span style={{color: '#7dcf9a', fontStyle: 'italic'}}>me</span>
        </div>
        <button
          onClick={() => router.back()}
          style={{background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none',
            borderRadius: '100px', padding: '8px 18px', fontSize: '13px', cursor: 'pointer'}}
        >
          ← Back
        </button>
      </nav>

      <div style={{maxWidth: '680px', margin: '0 auto', padding: '24px'}}>
        {/* IMAGE */}
        <div style={{
          width: '100%', aspectRatio: '4/3', background: '#e8f4f0',
          borderRadius: '16px', marginBottom: '24px', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px'
        }}>
          {listing.image_url
            ? <img src={listing.image_url} alt={listing.title}
                style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            : '📦'}
        </div>

        {/* PRICE + TITLE */}
        <div style={{background: '#fff', borderRadius: '16px', border: '1px solid #e8e4de', padding: '24px', marginBottom: '16px'}}>
          <div style={{fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '700', marginBottom: '8px'}}>
            {listing.price === 0 || listing.price === null ? 'Free' : `$${listing.price}`}
          </div>
          <div style={{fontSize: '20px', fontWeight: '600', marginBottom: '12px'}}>{listing.title}</div>
          <div style={{fontSize: '13px', color: '#8a8a8a', marginBottom: '4px'}}>
            📦 {listing.category} · 🕐 {new Date(listing.created_at).toLocaleDateString('en-NZ', {day: 'numeric', month: 'short', year: 'numeric'})}
          </div>
        </div>

        {/* DESCRIPTION */}
        {listing.description && (
          <div style={{background: '#fff', borderRadius: '16px', border: '1px solid #e8e4de', padding: '24px', marginBottom: '16px'}}>
            <div style={{fontSize: '14px', fontWeight: '600', marginBottom: '10px'}}>Description</div>
            <div style={{fontSize: '14px', color: '#4a4a4a', lineHeight: '1.6'}}>{listing.description}</div>
          </div>
        )}

        {/* CONTACT */}
        <button style={{
          width: '100%', background: '#1a3a2a', color: '#fff', border: 'none',
          borderRadius: '100px', padding: '16px', fontSize: '16px',
          fontWeight: '600', cursor: 'pointer'
        }}>
          💬 Message seller
        </button>
      </div>
    </main>
  )
}