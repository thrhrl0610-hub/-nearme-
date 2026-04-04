'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function BusinessPage() {
  const [ad, setAd] = useState<any>(null)
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    const fetchBusiness = async () => {
      const { data: adData } = await supabase
        .from('ads')
        .select('*')
        .eq('id', id)
        .single()

      if (adData) {
        setAd(adData)
        if (adData.user_id) {
          const { data: listingsData } = await supabase
            .from('listings')
            .select('*')
            .eq('user_id', adData.user_id)
            .order('created_at', { ascending: false })
            .limit(12)
          if (listingsData) setListings(listingsData)
        }
      }
      setLoading(false)
    }
    fetchBusiness()
  }, [id])

  if (loading) return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#faf8f4", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#8a8a8a" }}>Loading...</div>
    </main>
  )

  if (!ad) return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#faf8f4", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#8a8a8a" }}>Business not found</div>
    </main>
  )

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#faf8f4", minHeight: "100vh", paddingBottom: "80px" }}>
      {/* 헤더 */}
      <nav style={{ background: "#1a3a2a", padding: "0 24px", height: "58px", display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "100px", padding: "7px 14px", color: "#fff", fontSize: "13px", cursor: "pointer" }}>← Back</button>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "18px", color: "#fff" }}>
          near<span style={{ color: "#7dcf9a", fontStyle: "italic" }}>me</span>
        </div>
      </nav>

      {/* 비즈니스 히어로 */}
      <div style={{ background: "linear-gradient(135deg, #1a3a2a, #4a8c5c)", padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "72px", marginBottom: "16px" }}>{ad.emoji || '🏪'}</div>
        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Sponsored Business</div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "28px", color: "#fff", margin: "0 0 10px" }}>{ad.business_name}</h1>
        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.8)", margin: "0 0 12px" }}>{ad.description}</p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.15)", borderRadius: "100px", padding: "6px 14px", color: "rgba(255,255,255,0.9)", fontSize: "13px" }}>
          📍 {ad.location_name}
        </div>
        {ad.category && (
          <div style={{ marginTop: "10px" }}>
            <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: "100px", padding: "4px 12px", color: "#fff", fontSize: "12px" }}>{ad.category}</span>
          </div>
        )}
      </div>

      <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
        {/* 리스팅 섹션 */}
        {listings.length > 0 && (
          <>
            <div style={{ fontFamily: "Georgia, serif", fontSize: "20px", marginBottom: "16px" }}>
              Listings by {ad.business_name}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px" }}>
              {listings.map((item) => (
                <div key={item.id} onClick={() => router.push(`/listings/${item.id}`)} style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e8e4de", overflow: "hidden", cursor: "pointer" }}>
                  <div style={{ width: "100%", aspectRatio: "4/3", background: "#e8f4f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.image_url
                      ? <img src={item.image_url} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontSize: "32px" }}>📦</span>
                    }
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: "16px", fontWeight: "700", marginBottom: "2px" }}>
                      {item.price === 0 || item.price === null ? "Free" : `$${item.price}`}
                    </div>
                    <div style={{ fontSize: "13px", color: "#4a4a4a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {listings.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 24px", color: "#8a8a8a" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
            <div style={{ fontSize: "15px" }}>No listings yet from this business</div>
          </div>
        )}
      </div>

      {/* 하단 네비 */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #e8e4de", display: "flex", justifyContent: "space-around", padding: "8px 0 12px" }}>
        {[
          ["🏠", "Home", "/"],
          ["🔍", "Browse", "/browse"],
          ["➕", "Post", "/post"],
          ["💬", "Chat", "/messages"],
          ["👤", "Profile", "/profile"]
        ].map(([icon, label, href]) => (
          <div key={label} onClick={() => router.push(href as string)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", cursor: "pointer", fontSize: "11px", color: "#8a8a8a" }}>
            <div style={{ fontSize: "22px" }}>{icon}</div>
            {label}
          </div>
        ))}
      </div>
    </main>
  )
}