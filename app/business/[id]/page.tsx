'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import BottomNav from '../../../components/BottomNav'

export default function BusinessPage() {
  const [ad, setAd] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    const fetchBusiness = async () => {
      const { data: adData } = await supabase.from('ads').select('*').eq('id', id).single()
      if (adData) {
        setAd(adData)
        // 조회수 기록
        const { data: { user } } = await supabase.auth.getUser()
        await supabase.from('ad_views').insert({
          ad_id: id,
          user_id: user?.id || null,
        })
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

  const heroColor = ad.hero_color || '#1a3a2a'

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#faf8f4", minHeight: "100vh", paddingBottom: "80px" }}>
      <nav style={{ background: heroColor, padding: "0 24px", height: "58px", display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "100px", padding: "7px 14px", color: "#fff", fontSize: "13px", cursor: "pointer" }}>← Back</button>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "18px", color: "#fff" }}>
          near<span style={{ color: "#7dcf9a", fontStyle: "italic" }}>me</span>
        </div>
      </nav>

      <div style={{ background: heroColor, padding: "40px 24px 32px", textAlign: "center" }}>
        <div style={{ width: "90px", height: "90px", borderRadius: "18px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", background: "rgba(255,255,255,0.15)" }}>
          {ad.image_url
            ? <img src={ad.image_url} alt={ad.business_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ fontSize: "52px" }}>{ad.emoji || '🏪'}</span>
          }
        </div>
        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Sponsored Business</div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "30px", color: "#fff", margin: "0 0 10px" }}>{ad.business_name}</h1>
        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.85)", margin: "0 0 14px" }}>{ad.description}</p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.15)", borderRadius: "100px", padding: "7px 16px", color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>
          📍 {ad.location_name}
        </div>
        {ad.category && (
          <div style={{ marginTop: "12px" }}>
            <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: "100px", padding: "5px 14px", color: "#fff", fontSize: "13px" }}>{ad.category}</span>
          </div>
        )}
      </div>

      {ad.poster_url && (
        <div style={{ width: "100%" }}>
          <img src={ad.poster_url} alt={`${ad.business_name} poster`} style={{ width: "100%", display: "block" }} />
        </div>
      )}

      {!ad.poster_url && (
        <div style={{ textAlign: "center", padding: "48px 24px", color: "#8a8a8a" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📣</div>
          <div style={{ fontSize: "15px" }}>Stay tuned for updates from {ad.business_name}!</div>
        </div>
      )}

      <BottomNav />
    </main>
  )
}