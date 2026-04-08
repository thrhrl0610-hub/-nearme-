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
        const { data: { user } } = await supabase.auth.getUser()
        await supabase.from('ad_views').insert({ ad_id: id, user_id: user?.id || null })
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
      {/* NAV - 흰 배경 + 비즈니스 이름 */}
      <nav style={{ background: "#fff", padding: "0 20px", height: "58px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid #e8e4de" }}>
        <button onClick={() => router.back()} style={{ background: "#f0f0f0", border: "none", borderRadius: "100px", padding: "7px 14px", color: "#1a1a1a", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap" }}>← Back</button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: "17px", fontWeight: "600", color: "#1a1a1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ad.business_name}</div>
          <div style={{ fontSize: "11px", color: "#8a8a8a" }}>{ad.category} · {ad.location_name}</div>
        </div>
        <div style={{ width: "60px" }} />
      </nav>

      <div style={{ padding: "16px 16px 0" }}>
        {/* 포스터 - 여백있는 둥근 카드 */}
        {ad.poster_url ? (
          <div style={{ borderRadius: "18px", overflow: "hidden", marginBottom: "16px", boxShadow: "0 2px 16px rgba(0,0,0,0.10)" }}>
            <img src={ad.poster_url} alt={`${ad.business_name} poster`} style={{ width: "100%", display: "block" }} />
          </div>
        ) : (
          <div style={{ borderRadius: "18px", overflow: "hidden", marginBottom: "16px", background: ad.hero_color || '#1a3a2a', padding: "40px 24px", textAlign: "center" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "16px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", background: "rgba(255,255,255,0.2)" }}>
              {ad.image_url
                ? <img src={ad.image_url} alt={ad.business_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: "48px" }}>{ad.emoji || '🏪'}</span>
              }
            </div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "26px", color: "#fff", margin: "0 0 8px" }}>{ad.business_name}</h1>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.85)", margin: "0" }}>{ad.description}</p>
          </div>
        )}

        {/* 비즈니스 태그라인 + 태그 */}
        <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e8e4de", padding: "16px 18px", marginBottom: "12px" }}>
          <div style={{ fontSize: "15px", fontWeight: "600", color: "#1a1a1a", marginBottom: "6px" }}>{ad.description}</div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ background: "#e8f4f0", borderRadius: "100px", padding: "4px 12px", color: "#1a3a2a", fontSize: "12px", fontWeight: "500" }}>📍 {ad.location_name}</span>
            {ad.category && <span style={{ background: "#e8f4f0", borderRadius: "100px", padding: "4px 12px", color: "#1a3a2a", fontSize: "12px", fontWeight: "500" }}>{ad.category}</span>}
            <span style={{ background: "#fdf6e8", borderRadius: "100px", padding: "4px 12px", color: "#c8952a", fontSize: "12px", fontWeight: "500" }}>📣 Sponsored</span>
          </div>
        </div>

        {/* 상세 설명 */}
        {ad.long_description && (
          <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e8e4de", padding: "16px 18px", marginBottom: "12px" }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: "16px", marginBottom: "10px" }}>About {ad.business_name}</div>
            <div style={{ fontSize: "14px", color: "#4a4a4a", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{ad.long_description}</div>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}