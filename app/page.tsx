'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [ads, setAds] = useState<any[]>([])
  const [featuredAd, setFeaturedAd] = useState<any>(null)
  const [listings, setListings] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [radius, setRadius] = useState(20)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [suburb, setSuburb] = useState('Locating...')
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user))
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setUserLocation({ lat, lng })
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
          const data = await res.json()
          const name = data.address?.suburb || data.address?.town || data.address?.city || data.address?.county || 'Near you'
          setSuburb(name)
        } catch {
          setSuburb('Near you')
        }
      },
      () => setSuburb('New Zealand')
    )
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      let query = supabase.from('listings').select('*').order('created_at', { ascending: false }).limit(20)
      if (search) query = query.ilike('title', `%${search}%`)
      if (activeCategory !== 'All') query = query.eq('category', activeCategory)
      const { data, error } = await query
      if (!error && data) {
        if (userLocation) {
          const filtered = data.filter((item) => {
            if (!item.latitude || !item.longitude) return true
            const R = 6371
            const dLat = (item.latitude - userLocation.lat) * Math.PI / 180
            const dLng = (item.longitude - userLocation.lng) * Math.PI / 180
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(item.latitude * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
            const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
            return dist <= radius
          })
          setListings(filtered)
        } else {
          setListings(data)
        }
      }

      const { data: jobsData } = await supabase.from('jobs').select('*').limit(6)
      if (jobsData) setJobs(jobsData)

      const { data: adsData } = await supabase.from('ads').select('*').limit(6)
      if (adsData) {
        setAds(adsData)
        if (adsData.length > 0) setFeaturedAd(adsData[0])
      }

      setLoading(false)
    }
    fetchData()
  }, [activeCategory, search, radius, userLocation])

  const handleAdClick = (adId: string) => {
    router.push(`/business/${adId}`)
  }

  const handleAdvertiseClick = () => {
    if (currentUser) {
      router.push('/advertiser')
    } else {
      router.push('/auth')
    }
  }

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#faf8f4", minHeight: "100vh", paddingBottom: "80px" }}>
      <nav style={{ background: "#1a3a2a", padding: "0 24px", height: "58px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "22px", color: "#fff" }}>
          near<span style={{ color: "#7dcf9a", fontStyle: "italic" }}>me</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.15)", borderRadius: "100px", padding: "6px 12px", color: "#fff", fontSize: "13px" }}>
            <div style={{ width: "7px", height: "7px", background: "#7dcf9a", borderRadius: "50%" }}></div>
            {suburb}
          </div>
          <button onClick={() => router.push('/post')} style={{ background: "#e85d2f", color: "#fff", border: "none", borderRadius: "100px", padding: "8px 18px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>+ Post</button>
        </div>
      </nav>

      <div style={{ background: "#1a3a2a", padding: "10px 24px" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search listings..." style={{ width: "100%", border: "none", borderRadius: "100px", padding: "10px 18px", fontSize: "14px", outline: "none", boxSizing: "border-box", background: "rgba(255,255,255,0.15)", color: "#fff" }} />
      </div>

      <div style={{ background: "#2d5a3d", padding: "10px 24px", display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.85)", fontSize: "13px" }}>
        📍 <span style={{ whiteSpace: "nowrap" }}>Showing listings within <strong style={{ color: "#fff" }}>&nbsp;{radius} km&nbsp;</strong> of you</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
          {[5, 10, 20, 50].map((r) => (
            <button key={r} onClick={() => setRadius(r)} style={{ background: radius === r ? "#fff" : "rgba(255,255,255,0.12)", border: "none", borderRadius: "100px", color: radius === r ? "#1a3a2a" : "rgba(255,255,255,0.7)", fontSize: "12px", padding: "4px 10px", cursor: "pointer", fontWeight: radius === r ? "600" : "400" }}>{r}km</button>
          ))}
        </div>
      </div>

      {/* SPONSORED STRIP */}
      <div style={{ background: "#fdf6e8", borderBottom: "1px solid #f0e4c0", padding: "10px 24px", display: "flex", alignItems: "center", gap: "14px", overflowX: "auto" }}>
        <div onClick={handleAdvertiseClick} style={{ fontSize: "10px", fontWeight: "600", color: "#c8952a", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap", cursor: "pointer" }}>📣 Sponsored</div>
        {ads.length === 0 ? (
          <div onClick={handleAdvertiseClick} style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fff", border: "1px dashed #f0e4c0", borderRadius: "8px", padding: "8px 14px", flexShrink: 0, cursor: "pointer" }}>
            <div style={{ fontSize: "13px", color: "#c8952a" }}>➕ Advertise your business here</div>
          </div>
        ) : (
          ads.map((ad) => (
            <div key={ad.id} onClick={() => handleAdClick(ad.id)} style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fff", border: "1px solid #f0e4c0", borderRadius: "8px", padding: "8px 14px", flexShrink: 0, cursor: "pointer" }}>
              <div style={{ fontSize: "24px" }}>{ad.emoji}</div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "600" }}>{ad.business_name}</div>
                <div style={{ fontSize: "11px", color: "#8a8a8a" }}>{ad.description}</div>
                <div style={{ fontSize: "11px", color: "#4a8c5c", fontWeight: "500" }}>{ad.location_name}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ position: "relative" }}>
        <div style={{ padding: "16px 24px 0", display: "flex", gap: "8px", overflowX: "auto", scrollbarWidth: "none" }}>
          {[
            { label: "🏠 All", value: "All" },
            { label: "📦 Marketplace", value: "Marketplace" },
            { label: "💼 Jobs", value: "Jobs" },
            { label: "🎉 Events", value: "Events" },
            { label: "🏘️ Real Estate", value: "Real Estate" },
            { label: "🛠️ Services", value: "Services" },
          ].map((cat) => (
            <button key={cat.value} onClick={() => {
              if (cat.value === 'Jobs') router.push('/browse?category=Jobs')
              else if (cat.value === 'Events') router.push('/events')
              else if (cat.value === 'Real Estate') router.push('/realestate')
              else setActiveCategory(cat.value)
            }} style={{ display: "flex", alignItems: "center", gap: "6px", border: activeCategory === cat.value ? "none" : "1.5px solid #e8e4de", borderRadius: "100px", padding: "7px 14px", fontSize: "13px", background: activeCategory === cat.value ? "#1a3a2a" : "#fff", color: activeCategory === cat.value ? "#fff" : "#4a4a4a", cursor: "pointer", whiteSpace: "nowrap" }}>{cat.label}</button>
          ))}
        </div>
        <div style={{ position: "absolute", right: 0, top: 0, height: "100%", width: "48px", background: "linear-gradient(to left, #faf8f4, transparent)", pointerEvents: "none" }} />
      </div>

      <div style={{ padding: "20px 24px", maxWidth: "1100px", margin: "0 auto" }}>
        {featuredAd ? (
          <div onClick={() => handleAdClick(featuredAd.id)} style={{ borderRadius: "14px", background: "linear-gradient(135deg, #1a3a2a, #4a8c5c)", padding: "28px 32px", marginBottom: "32px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
            <div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Promoted Business</div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "24px", color: "#fff", marginBottom: "6px" }}>{featuredAd.business_name}</h2>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)", marginBottom: "16px" }}>{featuredAd.description}</p>
              <button style={{ background: "#fff", color: "#1a3a2a", border: "none", borderRadius: "100px", padding: "10px 22px", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}>Learn more →</button>
            </div>
            <div style={{ fontSize: "64px" }}>{featuredAd.emoji}</div>
          </div>
        ) : (
          <div onClick={handleAdvertiseClick} style={{ borderRadius: "14px", background: "linear-gradient(135deg, #1a3a2a, #4a8c5c)", padding: "28px 32px", marginBottom: "32px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
            <div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Advertise here</div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "24px", color: "#fff", marginBottom: "6px" }}>Reach thousands of locals</h2>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)", marginBottom: "16px" }}>Promote your business to people near you. From NZ$49/mo.</p>
              <button style={{ background: "#fff", color: "#1a3a2a", border: "none", borderRadius: "100px", padding: "10px 22px", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}>Get started →</button>
            </div>
            <div style={{ fontSize: "64px" }}>📣</div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "14px" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: "20px" }}>Near you</div>
          <div onClick={() => router.push('/browse')} style={{ fontSize: "13px", color: "#4a8c5c", cursor: "pointer", textDecoration: "underline" }}>See all →</div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#8a8a8a", fontSize: "14px" }}>Loading listings...</div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#8a8a8a", fontSize: "14px" }}>No listings yet. Be the first to post!</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px", marginBottom: "36px" }}>
            {listings.map((item) => (
              <div key={item.id} onClick={() => router.push(`/listings/${item.id}`)} style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e8e4de", overflow: "hidden", cursor: "pointer" }}>
                <div style={{ width: "100%", aspectRatio: "4/3", background: "#e8f4f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px" }}>
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
            ))}
          </div>
        )}

        {jobs.length > 0 && (
          <>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "14px" }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: "20px" }}>Hiring today</div>
              <div onClick={() => router.push('/browse')} style={{ fontSize: "13px", color: "#4a8c5c", cursor: "pointer", textDecoration: "underline" }}>See all jobs →</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
              {jobs.map((job) => (
                <div key={job.id} onClick={() => router.push(`/jobs/${job.id}`)} style={{ background: "#fff", border: "1px solid #e8e4de", borderRadius: "14px", padding: "16px 18px", display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "#e8f4f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>💼</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "3px" }}>{job.title}</div>
                    <div style={{ fontSize: "12px", color: "#8a8a8a", marginBottom: "4px" }}>{job.company}</div>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <span style={{ fontSize: "11px", borderRadius: "4px", padding: "2px 7px", fontWeight: "500", background: "#e8f5e8", color: "#2d7a2d" }}>{job.job_type}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: "700" }}>{job.pay_rate}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #e8e4de", display: "flex", justifyContent: "space-around", padding: "8px 0 12px" }}>
        {[
          ["🏠", "Home", "/"],
          ["🔍", "Browse", "/browse"],
          ["➕", "Post", "/post"],
          ["💬", "Chat", "/messages"],
          ["👤", "Profile", "/profile"]
        ].map(([icon, label, href]) => (
          <div key={label} onClick={() => router.push(href as string)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", cursor: "pointer", fontSize: "11px", color: label === "Home" ? "#1a3a2a" : "#8a8a8a" }}>
            <div style={{ fontSize: "22px" }}>{icon}</div>
            {label}
          </div>
        ))}
      </div>
    </main>
  )
}