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

  const heroColor = ad.hero_color || '#1a3a2a'

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#faf8f4", minHeight: "100vh", paddingBottom: "80px" }}>
      {/* NAV */}
      <nav style={{ background: heroColor, padding: "0 24px", height: "58px", display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "100px", padding: "7px 14px", color: "#fff", fontSize: "13px", cursor: "pointer" }}>← Back</button>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "18px", color: "#fff" }}>
          near<span style={{ color: "#7dcf9a", fontStyle: "italic" }}>me</span>
        </div>
      </nav>

      {/* 포스터 있으면 히어로 위에 꽉 차게 */}
      {ad.poster_url ? (
        <div style={{ position: "relative" }}>
          <img src={ad.poster_url} alt={`${ad.business_name} poster`} style={{ width: "100%", display: "block", maxHeight: "420px", objectFit: "cover" }} />
          {/* 포스터 위에 오버레이로 비즈니스 정보 */}
          <div style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)", position: "absolute", bottom: 0, left: 0, right: 0, padding: "40px 24px 24px", textAlign: "center" }}>
            <div style={{ width: "70px", height: "70px", borderRadius: "14px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}>
              {ad.image_url
                ? <img src={ad.image_url} alt={ad.business_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: "40px" }}>{ad.emoji || '🏪'}</span>
              }
            </div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>Sponsored Business</div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "28px", color: "#fff", margin: "0 0 6px", textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>{ad.business_name}</h1>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.9)", margin: "0", textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>{ad.description}</p>
          </div>
        </div>
      ) : (
        /* 포스터 없으면 기존 히어로 */
        <div style={{ background: heroColor, padding: "40px 24px 32px", textAlign: "center" }}>
          <div style={{ width: "90px", height: "90px", borderRadius: "18px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", background: "rgba(255,255,255,0.2)" }}>
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
      )}

      {/* 태그 (포스터 있을 때) */}
      {ad.poster_url && (
        <div style={{ background: heroColor, padding: "14px 24px", display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.15)", borderRadius: "100px", padding: "6px 14px", color: "rgba(255,255,255,0.9)", fontSize: "13px" }}>
            📍 {ad.location_name}
          </div>
          {ad.category && (
            <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: "100px", padding: "6px 14px", color: "#fff", fontSize: "13px" }}>{ad.category}</span>
          )}
        </div>
      )}

      {/* 비즈니스 상세 설명 */}
      {ad.long_description && (
        <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e8e4de", padding: "20px 24px" }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: "18px", marginBottom: "12px" }}>About {ad.business_name}</div>
            <div style={{ fontSize: "15px", color: "#4a4a4a", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{ad.long_description}</div>
          </div>
        </div>
      )}

      {/* 포스터도 없고 설명도 없으면 빈 상태 */}
      {!ad.poster_url && !ad.long_description && (
        <div style={{ textAlign: "center", padding: "48px 24px", color: "#8a8a8a" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📣</div>
          <div style={{ fontSize: "15px" }}>Stay tuned for updates from {ad.business_name}!</div>
        </div>
      )}

      <BottomNav />
    </main>
  )
}