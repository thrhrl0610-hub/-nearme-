'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function RealEstatePage() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'rent' | 'buy'>('all')
  const router = useRouter()

  useEffect(() => {
    const fetchListings = async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('category', 'Real Estate')
        .order('created_at', { ascending: false })
      if (!error && data) setListings(data)
      setLoading(false)
    }
    fetchListings()
  }, [])

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#faf8f4", minHeight: "100vh", paddingBottom: "80px" }}>
      <nav style={{ background: "#1a3a2a", padding: "0 24px", height: "58px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div onClick={() => router.push('/')} style={{ fontFamily: "Georgia, serif", fontSize: "22px", color: "#fff", cursor: "pointer" }}>
          near<span style={{ color: "#7dcf9a", fontStyle: "italic" }}>me</span>
        </div>
        <button onClick={() => router.push('/post')} style={{ background: "#e85d2f", color: "#fff", border: "none", borderRadius: "100px", padding: "8px 18px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>+ List Property</button>
      </nav>

      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg, #1a3a2a, #2d5a3d)", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏘️</div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "28px", color: "#fff", marginBottom: "8px" }}>Real Estate</h1>
        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.7)", marginBottom: "20px" }}>Find properties near you</p>

        {/* FILTER */}
        <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.15)", borderRadius: "100px", padding: "4px", gap: "4px" }}>
          {[['all', 'All'], ['rent', 'For Rent'], ['buy', 'For Sale']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val as any)} style={{ border: "none", borderRadius: "100px", padding: "8px 16px", fontSize: "13px", fontWeight: "500", cursor: "pointer", background: filter === val ? "#fff" : "transparent", color: filter === val ? "#1a3a2a" : "rgba(255,255,255,0.8)" }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#8a8a8a" }}>Loading...</div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#8a8a8a" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏘️</div>
            <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "6px" }}>No properties listed yet</div>
            <div style={{ fontSize: "14px", marginBottom: "16px" }}>Be the first to list a property in your area!</div>
            <button onClick={() => router.push('/post')} style={{ background: "#1a3a2a", color: "#fff", border: "none", borderRadius: "100px", padding: "10px 24px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>List a property</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {listings.map((item) => (
              <div key={item.id} onClick={() => router.push(`/listings/${item.id}`)} style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e8e4de", overflow: "hidden", cursor: "pointer" }}>
                <div style={{ width: "100%", aspectRatio: "16/9", background: "#e8f4f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" }}>
                  {item.image_url
                    ? <img src={item.image_url} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : '🏠'}
                </div>
                <div style={{ padding: "16px" }}>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: "700", marginBottom: "4px", color: "#1a3a2a" }}>
                    {item.price === 0 ? 'POA' : `$${item.price.toLocaleString()}`}
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: "600", marginBottom: "6px" }}>{item.title}</div>
                  {item.description && (
                    <div style={{ fontSize: "13px", color: "#8a8a8a", marginBottom: "10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.description}</div>
                  )}
                  <div style={{ fontSize: "12px", color: "#8a8a8a" }}>
                    📅 {new Date(item.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #e8e4de", display: "flex", justifyContent: "space-around", padding: "8px 0 12px" }}>
        {[["🏠", "Home", "/"], ["🔍", "Browse", "/browse"], ["➕", "Post", "/post"], ["💬", "Chat", "/messages"], ["👤", "Profile", "/profile"]].map(([icon, label, href]) => (
          <div key={label} onClick={() => router.push(href as string)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", cursor: "pointer", fontSize: "11px", color: "#8a8a8a" }}>
            <div style={{ fontSize: "22px" }}>{icon}</div>
            {label}
          </div>
        ))}
      </div>
    </main>
  )
}