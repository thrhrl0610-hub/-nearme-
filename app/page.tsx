'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'

export default function Home() {
  const [ads, setAds] = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeJobTab, setActiveJobTab] = useState('All')
  const [search, setSearch] = useState('')
  const [radius, setRadius] = useState(20)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [suburb, setSuburb] = useState('Locating...')
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
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
        const now = new Date()
        const processed = data.map(item => ({
          ...item,
          is_boosted: item.is_boosted && item.boosted_until && new Date(item.boosted_until) > now
        }))
        const sorted = [
          ...processed.filter(i => i.is_boosted),
          ...processed.filter(i => !i.is_boosted)
        ]
        if (userLocation) {
          const filtered = sorted.filter((item) => {
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
          setListings(sorted)
        }
      }

      const { data: jobsData } = await supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(20)
      if (jobsData) setJobs(jobsData)

      const { data: adsData } = await supabase.from('ads').select('*').eq('status', 'active')
      if (adsData) {
        if (userLocation) {
          const filteredAds = adsData.filter((ad) => {
            if (!ad.latitude || !ad.longitude) return true
            const R = 6371
            const dLat = (ad.latitude - userLocation.lat) * Math.PI / 180
            const dLng = (ad.longitude - userLocation.lng) * Math.PI / 180
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(ad.latitude * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
            const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
            return dist <= (ad.radius_km || 10)
          })
          // Premier Plus 먼저, 나머지는 랜덤
          const premierPlus = filteredAds.filter(a => a.plan === 'PremierPlus')
          const others = filteredAds.filter(a => a.plan !== 'PremierPlus').sort(() => Math.random() - 0.5)
          setAds([...premierPlus, ...others])
        } else {
          const premierPlus = adsData.filter(a => a.plan === 'PremierPlus')
          const others = adsData.filter(a => a.plan !== 'PremierPlus').sort(() => Math.random() - 0.5)
          setAds([...premierPlus, ...others])
        }
      }

      setLoading(false)
    }
    fetchData()
  }, [activeCategory, search, radius, userLocation])

  // 자동 슬라이드
  useEffect(() => {
    if (ads.length <= 1) return
    const timer = setInterval(() => {
      setCurrentAdIndex(prev => (prev + 1) % ads.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [ads.length])

  const handleAdClick = async (adId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('ad_clicks').insert({ ad_id: adId, user_id: user?.id || null })
    router.push(`/business/${adId}`)
  }

  const handleAdvertiseClick = () => {
    if (currentUser) router.push('/advertiser')
    else router.push('/auth')
  }

  const AdIcon = ({ ad, size = 28 }: { ad: any, size?: number }) => {
    if (ad.image_url) {
      return <img src={ad.image_url} alt={ad.business_name} style={{ width: size, height: size, borderRadius: '6px', objectFit: 'cover' }} />
    }
    return <span style={{ fontSize: size }}>{ad.emoji}</span>
  }

  const jobTabs = [
    { label: '📋 All', value: 'All' },
    { label: '🔴 Urgent', value: 'Urgent' },
    { label: '⏰ Part-time', value: 'Part-time' },
    { label: '💼 Full-time', value: 'Full-time' },
  ]

  const filteredJobs = jobs.filter(job => {
    if (activeJobTab === 'Urgent') return job.is_urgent === true
    if (activeJobTab === 'All') return true
    return job.job_type === activeJobTab
  }).slice(0, 6)

  const currentAd = ads[currentAdIndex]

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#faf8f4", minHeight: "100vh", paddingBottom: "90px" }}>
      <nav style={{ background: "#1a3a2a", padding: "0 20px", height: "62px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "24px", color: "#fff" }}>
          near<span style={{ color: "#7dcf9a", fontStyle: "italic" }}>me</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.15)", borderRadius: "100px", padding: "7px 14px", color: "#fff", fontSize: "14px" }}>
            <div style={{ width: "8px", height: "8px", background: "#7dcf9a", borderRadius: "50%" }}></div>
            {suburb}
          </div>
          <button onClick={() => router.push('/post')} style={{ background: "#e85d2f", color: "#fff", border: "none", borderRadius: "100px", padding: "9px 20px", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}>+ Post</button>
        </div>
      </nav>

      <div style={{ background: "#1a3a2a", padding: "10px 20px 14px" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search listings..." style={{ width: "100%", border: "none", borderRadius: "100px", padding: "12px 20px", fontSize: "15px", outline: "none", boxSizing: "border-box", background: "rgba(255,255,255,0.15)", color: "#fff" }} />
      </div>

      <div style={{ background: "#2d5a3d", padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.85)", fontSize: "14px" }}>
        📍 <span style={{ whiteSpace: "nowrap" }}>Within <strong style={{ color: "#fff" }}>{radius} km</strong></span>
        <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
          {[5, 10, 20, 50].map((r) => (
            <button key={r} onClick={() => setRadius(r)} style={{ background: radius === r ? "#fff" : "rgba(255,255,255,0.12)", border: "none", borderRadius: "100px", color: radius === r ? "#1a3a2a" : "rgba(255,255,255,0.7)", fontSize: "13px", padding: "5px 12px", cursor: "pointer", fontWeight: radius === r ? "600" : "400" }}>{r}km</button>
          ))}
        </div>
      </div>

      {/* SPONSORED CAROUSEL */}
      {ads.length > 0 && (
        <div style={{ background: "#fdf6e8", borderBottom: "1px solid #f0e4c0", padding: "12px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#c8952a", textTransform: "uppercase", letterSpacing: "0.08em" }}>📣 Sponsored</div>
            <div style={{ display: "flex", gap: "4px" }}>
              {ads.map((_, i) => (
                <div key={i} onClick={() => setCurrentAdIndex(i)} style={{ width: i === currentAdIndex ? "16px" : "6px", height: "6px", borderRadius: "100px", background: i === currentAdIndex ? "#c8952a" : "#e0d0b0", cursor: "pointer", transition: "all 0.3s ease" }} />
              ))}
            </div>
          </div>

          {currentAd && (
            <div onClick={() => handleAdClick(currentAd.id)} style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fff", border: `1.5px solid ${currentAd.plan === 'PremierPlus' ? '#c8952a' : '#f0e4c0'}`, borderRadius: "12px", padding: "12px 16px", cursor: "pointer", position: "relative", transition: "all 0.3s ease" }}>
              {currentAd.plan === 'PremierPlus' && (
                <div style={{ position: "absolute", top: "-1px", right: "12px", background: "#c8952a", color: "#fff", fontSize: "9px", fontWeight: "700", padding: "2px 8px", borderRadius: "0 0 6px 6px", letterSpacing: "0.05em" }}>⭐ FEATURED</div>
              )}
              <div style={{ width: "48px", height: "48px", borderRadius: "10px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "#e8f4f0" }}>
                <AdIcon ad={currentAd} size={48} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "2px" }}>{currentAd.business_name}</div>
                <div style={{ fontSize: "13px", color: "#8a8a8a", marginBottom: "3px" }}>{currentAd.description}</div>
                <div style={{ fontSize: "12px", color: "#4a8c5c", fontWeight: "500" }}>📍 {currentAd.location_name}</div>
              </div>
              <div style={{ fontSize: "20px", color: "#c8952a" }}>›</div>
            </div>
          )}

          <div style={{ marginTop: "10px", textAlign: "center" }}>
            <span onClick={handleAdvertiseClick} style={{ fontSize: "12px", color: "#c8952a", cursor: "pointer", textDecoration: "underline" }}>➕ Advertise here</span>
          </div>
        </div>
      )}

      {/* CATEGORIES */}
      <div style={{ position: "relative" }}>
        <div style={{ padding: "16px 20px 4px", display: "flex", gap: "10px", overflowX: "auto", scrollbarWidth: "none" }}>
          {[
            { label: "🏠 All", value: "All" },
            { label: "📦 Marketplace", value: "Marketplace" },
            { label: "💼 Jobs", value: "Jobs" },
            { label: "🎉 Events", value: "Events" },
            { label: "🏘️ Real Estate", value: "Real Estate" },
            { label: "🛠️ Services", value: "Services" },
            { label: "👥 Community", value: "Community" },
          ].map((cat) => (
            <button key={cat.value} onClick={() => {
              if (cat.value === 'Jobs') router.push('/browse?category=Jobs')
              else if (cat.value === 'Events') router.push('/events')
              else if (cat.value === 'Real Estate') router.push('/realestate')
              else if (cat.value === 'Community') router.push('/community')
              else setActiveCategory(cat.value)
            }} style={{ display: "flex", alignItems: "center", gap: "6px", border: activeCategory === cat.value ? "none" : "1.5px solid #e8e4de", borderRadius: "100px", padding: "10px 18px", fontSize: "15px", background: activeCategory === cat.value ? "#1a3a2a" : "#fff", color: activeCategory === cat.value ? "#fff" : "#4a4a4a", cursor: "pointer", whiteSpace: "nowrap", fontWeight: activeCategory === cat.value ? "600" : "400" }}>{cat.label}</button>
          ))}
        </div>
        <div style={{ position: "absolute", right: 0, top: 0, height: "100%", width: "48px", background: "linear-gradient(to left, #faf8f4, transparent)", pointerEvents: "none" }} />
      </div>

      <div style={{ padding: "16px 20px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "14px" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: "22px" }}>Near you</div>
          <div onClick={() => router.push('/browse')} style={{ fontSize: "15px", color: "#4a8c5c", cursor: "pointer", textDecoration: "underline" }}>See all →</div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#8a8a8a", fontSize: "15px" }}>Loading listings...</div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#8a8a8a", fontSize: "15px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
            No listings nearby. Be the first to post!
            <div style={{ marginTop: "16px" }}>
              <button onClick={() => router.push('/post')} style={{ background: "#1a3a2a", color: "#fff", border: "none", borderRadius: "100px", padding: "12px 24px", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}>+ Post something</button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "36px" }}>
            {listings.map((item) => (
              <div key={item.id} onClick={() => router.push(`/listings/${item.id}`)} style={{ background: "#fff", borderRadius: "16px", border: `1px solid ${item.is_boosted ? '#e85d2f' : '#e8e4de'}`, display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", cursor: "pointer", position: "relative" }}>
                {item.is_boosted && (
                  <div style={{ position: "absolute", top: "-1px", left: "12px", background: "#e85d2f", color: "#fff", fontSize: "11px", fontWeight: "700", padding: "2px 10px", borderRadius: "0 0 6px 6px" }}>🚀 Boosted</div>
                )}
                <div style={{ width: "70px", height: "70px", borderRadius: "12px", background: "#e8f4f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", marginTop: item.is_boosted ? "10px" : "0" }}>
                  {item.image_url
                    ? <img src={item.image_url} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: "30px" }}>📦</span>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0, marginTop: item.is_boosted ? "10px" : "0" }}>
                  <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
                  <div style={{ fontSize: "13px", color: "#4a8c5c", fontWeight: "500", marginBottom: "3px" }}>📦 {item.category}</div>
                  <div style={{ fontSize: "13px", color: "#8a8a8a" }}>{new Date(item.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })}</div>
                </div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: "700", flexShrink: 0, marginTop: item.is_boosted ? "10px" : "0" }}>
                  {item.price === 0 || item.price === null ? "Free" : `$${item.price}`}
                </div>
              </div>
            ))}
          </div>
        )}

        {jobs.length > 0 && (
          <>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: "22px" }}>Hiring today</div>
              <div onClick={() => router.push('/browse?category=Jobs')} style={{ fontSize: "15px", color: "#4a8c5c", cursor: "pointer", textDecoration: "underline" }}>See all →</div>
            </div>

            <div style={{ display: "flex", gap: "8px", overflowX: "auto", scrollbarWidth: "none", marginBottom: "14px", paddingBottom: "2px" }}>
              {jobTabs.map((tab) => (
                <button key={tab.value} onClick={() => setActiveJobTab(tab.value)} style={{
                  border: "none",
                  borderRadius: "100px",
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: activeJobTab === tab.value ? "600" : "400",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  background: activeJobTab === tab.value
                    ? tab.value === 'Urgent' ? '#e85d2f' : '#1a3a2a'
                    : '#fff',
                  color: activeJobTab === tab.value ? '#fff' : '#4a4a4a',
                  boxShadow: activeJobTab === tab.value ? 'none' : '0 0 0 1.5px #e8e4de inset',
                }}>{tab.label}</button>
              ))}
            </div>

            {filteredJobs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px", color: "#8a8a8a", fontSize: "14px", background: "#fff", borderRadius: "14px", border: "1px solid #e8e4de" }}>
                No {activeJobTab === 'Urgent' ? 'urgent' : activeJobTab.toLowerCase()} jobs right now
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filteredJobs.map((job) => (
                  <div key={job.id} onClick={() => router.push(`/jobs/${job.id}`)} style={{ background: "#fff", border: `1px solid ${job.is_urgent ? '#e85d2f' : '#e8e4de'}`, borderRadius: "16px", padding: "16px 18px", display: "flex", alignItems: "center", gap: "14px", cursor: "pointer", position: "relative" }}>
                    {job.is_urgent && (
                      <div style={{ position: "absolute", top: "-1px", left: "12px", background: "#e85d2f", color: "#fff", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "0 0 6px 6px" }}>🔴 URGENT</div>
                    )}
                    <div style={{ width: "50px", height: "50px", borderRadius: "12px", background: job.is_urgent ? "#fde8e8" : "#e8f4f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0, marginTop: job.is_urgent ? "10px" : "0" }}>💼</div>
                    <div style={{ flex: 1, marginTop: job.is_urgent ? "10px" : "0" }}>
                      <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "3px" }}>{job.title}</div>
                      <div style={{ fontSize: "14px", color: "#8a8a8a", marginBottom: "4px" }}>{job.company}{job.location_name ? ` · ${job.location_name}` : ''}</div>
                      <span style={{ fontSize: "13px", borderRadius: "6px", padding: "3px 8px", fontWeight: "500", background: job.is_urgent ? "#fde8e8" : "#e8f5e8", color: job.is_urgent ? "#c0392b" : "#2d7a2d" }}>{job.job_type}</span>
                    </div>
                    <div style={{ fontSize: "17px", fontWeight: "700", flexShrink: 0, marginTop: job.is_urgent ? "10px" : "0" }}>{job.pay_rate}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </main>
  )
}