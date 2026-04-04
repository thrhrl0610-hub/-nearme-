'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function Browse() {
  const [listings, setListings] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true)
      let query = supabase.from('listings').select('*').order('created_at', { ascending: false })

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`)
      }

      if (activeCategory !== 'All') query = query.eq('category', activeCategory)
      const { data, error } = await query
      if (!error && data) setListings(data)
      setLoading(false)
    }
    fetchListings()
  }, [activeCategory, search])

  const isExpired = (item: any) => {
    if (!item.expires_at) return false
    return new Date(item.expires_at) < new Date()
  }

  const daysLeft = (item: any) => {
    if (!item.expires_at) return null
    const diff = new Date(item.expires_at).getTime() - new Date().getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#faf8f4", minHeight: "100vh", paddingBottom: "80px" }}>
      {/* NAV */}
      <nav style={{ background: "#1a3a2a", padding: "0 24px", height: "58px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "22px", color: "#fff" }}>
          near<span style={{ color: "#7dcf9a", fontStyle: "italic" }}>me</span>
        </div>
        <button onClick={() => router.push('/post')} style={{ background: "#e85d2f", color: "#fff", border: "none", borderRadius: "100px", padding: "8px 18px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>+ Post</button>
      </nav>

      {/* SEARCH */}
      <div style={{ background: "#1a3a2a", padding: "10px 24px" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search listings, categories, descriptions..." style={{ width: "100%", border: "none", borderRadius: "100px", padding: "10px 18px", fontSize: "14px", outline: "none", boxSizing: "border-box", background: "rgba(255,255,255,0.15)", color: "#fff" }} />
      </div>

      {search && (
        <div style={{ padding: "10px 24px", fontSize: "13px", color: "#8a8a8a" }}>
          {loading ? 'Searching...' : `${listings.length} result${listings.length !== 1 ? 's' : ''} for "${search}"`}
        </div>
      )}

      {/* CATEGORIES */}
      <div style={{ position: "relative" }}>
        <div style={{ padding: "16px 24px", display: "flex", gap: "8px", overflowX: "auto", scrollbarWidth: "none" }}>
          {[
            { label: "🏠 All", value: "All" },
            { label: "📦 Marketplace", value: "Marketplace" },
            { label: "💼 Jobs", value: "Jobs" },
            { label: "🎉 Events", value: "Events" },
            { label: "🏘️ Real Estate", value: "Real Estate" },
            { label: "🛠️ Services", value: "Services" },
            { label: "🆓 Free", value: "Free" },
          ].map((cat) => (
            <button key={cat.value} onClick={() => setActiveCategory(cat.value)} style={{ display: "flex", alignItems: "center", gap: "6px", border: activeCategory === cat.value ? "none" : "1.5px solid #e8e4de", borderRadius: "100px", padding: "7px 14px", fontSize: "13px", background: activeCategory === cat.value ? "#1a3a2a" : "#fff", color: activeCategory === cat.value ? "#fff" : "#4a4a4a", cursor: "pointer", whiteSpace: "nowrap" }}>{cat.label}</button>
          ))}
        </div>
        <div style={{ position: "absolute", right: 0, top: 0, height: "100%", width: "48px", background: "linear-gradient(to left, #faf8f4, transparent)", pointerEvents: "none" }} />
      </div>

      {/* LISTINGS */}
      <div style={{ padding: "0 24px 20px", maxWidth: "1100px", margin: "0 auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#8a8a8a" }}>Loading...</div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#8a8a8a" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
            <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "6px" }}>No listings found</div>
            <div style={{ fontSize: "14px" }}>Try a different search or category</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
            {listings.map((item) => {
              const expired = isExpired(item)
              const days = daysLeft(item)
              return (
                <div key={item.id} onClick={() => !expired && router.push(`/listings/${item.id}`)} style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${expired ? '#f0d0d0' : '#e8e4de'}`, overflow: "hidden", cursor: expired ? "default" : "pointer", opacity: expired ? 0.7 : 1, position: "relative" }}>
                  {expired && (
                    <div style={{ position: "absolute", top: "8px", left: "8px", background: "#c0392b", color: "#fff", fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "100px", zIndex: 1 }}>Expired</div>
                  )}
                  {!expired && days !== null && days <= 3 && (
                    <div style={{ position: "absolute", top: "8px", left: "8px", background: "#c8952a", color: "#fff", fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "100px", zIndex: 1 }}>Expires in {days}d</div>
                  )}
                  <div style={{ width: "100%", aspectRatio: "4/3", background: "#e8f4f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.image_url
                      ? <img src={item.image_url} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                          <span style={{ fontSize: "28px" }}>📦</span>
                          <span style={{ fontSize: "12px", color: "#4a8c5c" }}>{item.category}</span>
                        </div>
                    }
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: "700", marginBottom: "2px" }}>
                      {item.price === 0 || item.price === null ? "Free" : `$${item.price}`}
                    </div>
                    <div style={{ fontSize: "14px", color: "#4a4a4a", marginBottom: "8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontSize: "12px", color: "#4a8c5c", fontWeight: "500" }}>📦 {item.category}</div>
                      <div style={{ fontSize: "12px", color: "#8a8a8a" }}>{new Date(item.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #e8e4de", display: "flex", justifyContent: "space-around", padding: "8px 0 12px" }}>
        {[["🏠", "Home", "/"], ["🔍", "Browse", "/browse"], ["➕", "Post", "/post"], ["💬", "Chat", "/messages"], ["👤", "Profile", "/profile"]].map(([icon, label, href]) => (
          <div key={label} onClick={() => router.push(href as string)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", cursor: "pointer", fontSize: "11px", color: label === "Browse" ? "#1a3a2a" : "#8a8a8a" }}>
            <div style={{ fontSize: "22px" }}>{icon}</div>
            {label}
          </div>
        ))}
      </div>
    </main>
  )
}