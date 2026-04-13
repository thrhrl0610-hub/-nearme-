'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import BottomNav from '../../components/BottomNav'

const CategoryIcons: Record<string, JSX.Element> = {
  All: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  Marketplace: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  Jobs: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
  Events: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  'Real Estate': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Services: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  Free: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
}

const BoxIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4a8c5c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)

export default function Browse() {
  const [listings, setListings] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest')
  const [showFilters, setShowFilters] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true)
      let query = supabase.from('listings').select('*')
      if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`)
      if (activeCategory !== 'All') {
        if (activeCategory === 'Free') query = query.eq('price', 0)
        else query = query.eq('category', activeCategory)
      }
      if (minPrice !== '') query = query.gte('price', Number(minPrice))
      if (maxPrice !== '') query = query.lte('price', Number(maxPrice))
      if (sortBy === 'newest') query = query.order('created_at', { ascending: false })
      else if (sortBy === 'price_low') query = query.order('price', { ascending: true })
      else if (sortBy === 'price_high') query = query.order('price', { ascending: false })
      const { data, error } = await query
      if (!error && data) setListings(data)
      setLoading(false)
    }
    fetchListings()
  }, [activeCategory, search, minPrice, maxPrice, sortBy])

  const isExpired = (item: any) => item.expires_at && new Date(item.expires_at) < new Date()
  const daysLeft = (item: any) => {
    if (!item.expires_at) return null
    return Math.ceil((new Date(item.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }

  const activeFilterCount = [minPrice, maxPrice].filter(Boolean).length + (sortBy !== 'newest' ? 1 : 0)

  const categories = [
    { label: "All", value: "All" },
    { label: "Marketplace", value: "Marketplace" },
    { label: "Jobs", value: "Jobs" },
    { label: "Events", value: "Events" },
    { label: "Real Estate", value: "Real Estate" },
    { label: "Services", value: "Services" },
    { label: "Free", value: "Free" },
  ]

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#faf8f4", minHeight: "100vh", paddingBottom: "80px" }}>
      <nav style={{ background: "#1a3a2a", padding: "0 24px", height: "58px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "100px", padding: "7px 14px", color: "#fff", fontSize: "13px", cursor: "pointer" }}>← Back</button>
          <div onClick={() => router.push('/')} style={{ fontFamily: "Georgia, serif", fontSize: "22px", color: "#fff", cursor: "pointer" }}>
            near<span style={{ color: "#7dcf9a", fontStyle: "italic" }}>me</span>
          </div>
        </div>
        <button onClick={() => router.push('/post')} style={{ background: "#e85d2f", color: "#fff", border: "none", borderRadius: "100px", padding: "8px 18px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>+ Post</button>
      </nav>

      <div style={{ background: "#1a3a2a", padding: "10px 24px 12px" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search listings..." style={{ flex: 1, border: "none", borderRadius: "100px", padding: "10px 18px", fontSize: "14px", outline: "none", background: "rgba(255,255,255,0.15)", color: "#fff" }} />
          <button onClick={() => setShowFilters(!showFilters)} style={{ background: showFilters ? "#fff" : "rgba(255,255,255,0.15)", color: showFilters ? "#1a3a2a" : "#fff", border: "none", borderRadius: "100px", padding: "10px 16px", fontSize: "13px", fontWeight: "500", cursor: "pointer", whiteSpace: "nowrap", position: "relative" }}>
            Filter {activeFilterCount > 0 && <span style={{ background: "#e85d2f", color: "#fff", borderRadius: "50%", fontSize: "10px", padding: "1px 5px", marginLeft: "4px" }}>{activeFilterCount}</span>}
          </button>
        </div>
        {showFilters && (
          <div style={{ marginTop: "12px", background: "rgba(255,255,255,0.1)", borderRadius: "12px", padding: "14px 16px" }}>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
              <div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>Min price (NZD)</div>
                <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="0" style={{ width: "90px", border: "none", borderRadius: "8px", padding: "8px 10px", fontSize: "13px", outline: "none", background: "rgba(255,255,255,0.9)", color: "#1a1a1a" }} />
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>Max price (NZD)</div>
                <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Any" style={{ width: "90px", border: "none", borderRadius: "8px", padding: "8px 10px", fontSize: "13px", outline: "none", background: "rgba(255,255,255,0.9)", color: "#1a1a1a" }} />
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>Sort by</div>
                <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={{ border: "none", borderRadius: "8px", padding: "8px 10px", fontSize: "13px", outline: "none", background: "rgba(255,255,255,0.9)", color: "#1a1a1a", cursor: "pointer" }}>
                  <option value="newest">Newest first</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>
              {activeFilterCount > 0 && (
                <button onClick={() => { setMinPrice(''); setMaxPrice(''); setSortBy('newest') }} style={{ background: "#e85d2f", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", cursor: "pointer" }}>Clear</button>
              )}
            </div>
          </div>
        )}
      </div>

      {search && (
        <div style={{ padding: "10px 24px", fontSize: "13px", color: "#8a8a8a" }}>
          {loading ? 'Searching...' : `${listings.length} result${listings.length !== 1 ? 's' : ''} for "${search}"`}
        </div>
      )}

      <div style={{ position: "relative" }}>
        <div style={{ padding: "16px 24px", display: "flex", gap: "8px", overflowX: "auto", scrollbarWidth: "none" }}>
          {categories.map((cat) => {
            const active = activeCategory === cat.value
            return (
              <button key={cat.value} onClick={() => setActiveCategory(cat.value)} style={{ display: "flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "100px", padding: "8px 16px", fontSize: "13px", background: active ? "#1a3a2a" : "#fff", color: active ? "#fff" : "#4a4a4a", cursor: "pointer", whiteSpace: "nowrap", fontWeight: active ? "600" : "400", boxShadow: active ? 'none' : '0 0 0 1.5px #e8e4de inset' }}>
                <span style={{ color: active ? "#fff" : "#4a4a4a", display: "flex" }}>{CategoryIcons[cat.value]}</span>
                {cat.label}
              </button>
            )
          })}
        </div>
        <div style={{ position: "absolute", right: 0, top: 0, height: "100%", width: "48px", background: "linear-gradient(to left, #faf8f4, transparent)", pointerEvents: "none" }} />
      </div>

      <div style={{ padding: "0 24px 20px", maxWidth: "1100px", margin: "0 auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#8a8a8a" }}>Loading...</div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#8a8a8a" }}>
            <div style={{ marginBottom: "12px", display: "flex", justifyContent: "center" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e8e4de" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "6px" }}>No listings found</div>
            <div style={{ fontSize: "14px" }}>Try a different search or category</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {listings.map((item) => {
              const expired = isExpired(item)
              const days = daysLeft(item)
              return (
                <div key={item.id} onClick={() => !expired && router.push(`/listings/${item.id}`)} style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${expired ? '#f0d0d0' : '#e8e4de'}`, display: "flex", alignItems: "center", gap: "14px", padding: "12px 16px", cursor: expired ? "default" : "pointer", opacity: expired ? 0.7 : 1, position: "relative" }}>
                  {expired && (
                    <div style={{ position: "absolute", top: "8px", left: "8px", background: "#c0392b", color: "#fff", fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "100px", zIndex: 1 }}>Expired</div>
                  )}
                  {!expired && days !== null && days <= 3 && (
                    <div style={{ position: "absolute", top: "8px", left: "8px", background: "#c8952a", color: "#fff", fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "100px", zIndex: 1 }}>Expires in {days}d</div>
                  )}
                  <div style={{ width: "64px", height: "64px", borderRadius: "10px", background: "#e8f4f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                    {item.image_url
                      ? <img src={item.image_url} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <BoxIcon />
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
                    <div style={{ fontSize: "12px", color: "#4a8c5c", fontWeight: "500", marginBottom: "3px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ display: "flex" }}>{CategoryIcons[item.category] || CategoryIcons['Marketplace']}</span>
                      {item.category}
                    </div>
                    <div style={{ fontSize: "12px", color: "#8a8a8a" }}>{new Date(item.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })}</div>
                  </div>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: "700", flexShrink: 0 }}>
                    {item.price === 0 || item.price === null ? "Free" : `$${item.price}`}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}