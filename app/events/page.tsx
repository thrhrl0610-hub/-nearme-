'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('category', 'Events')
        .order('created_at', { ascending: false })
      if (!error && data) setEvents(data)
      setLoading(false)
    }
    fetchEvents()
  }, [])

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#faf8f4", minHeight: "100vh", paddingBottom: "80px" }}>
      <nav style={{ background: "#1a3a2a", padding: "0 24px", height: "58px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div onClick={() => router.push('/')} style={{ fontFamily: "Georgia, serif", fontSize: "22px", color: "#fff", cursor: "pointer" }}>
          near<span style={{ color: "#7dcf9a", fontStyle: "italic" }}>me</span>
        </div>
        <button onClick={() => router.push('/post')} style={{ background: "#e85d2f", color: "#fff", border: "none", borderRadius: "100px", padding: "8px 18px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>+ Post Event</button>
      </nav>

      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg, #1a3a2a, #4a8c5c)", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎉</div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "28px", color: "#fff", marginBottom: "8px" }}>Local Events</h1>
        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.7)" }}>Discover what's happening near you</p>
      </div>

      <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#8a8a8a" }}>Loading...</div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#8a8a8a" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎉</div>
            <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "6px" }}>No events yet</div>
            <div style={{ fontSize: "14px", marginBottom: "16px" }}>Be the first to post an event in your area!</div>
            <button onClick={() => router.push('/post')} style={{ background: "#1a3a2a", color: "#fff", border: "none", borderRadius: "100px", padding: "10px 24px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Post an event</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {events.map((event) => (
              <div key={event.id} onClick={() => router.push(`/listings/${event.id}`)} style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e8e4de", overflow: "hidden", cursor: "pointer", display: "flex" }}>
                <div style={{ width: "120px", background: "#e8f4f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", flexShrink: 0 }}>
                  {event.image_url
                    ? <img src={event.image_url} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : '🎉'}
                </div>
                <div style={{ padding: "16px", flex: 1 }}>
                  <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "6px" }}>{event.title}</div>
                  {event.description && (
                    <div style={{ fontSize: "13px", color: "#8a8a8a", marginBottom: "8px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{event.description}</div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {event.price > 0 && (
                      <span style={{ fontSize: "14px", fontWeight: "700", color: "#1a3a2a" }}>${event.price}</span>
                    )}
                    {event.price === 0 && (
                      <span style={{ fontSize: "13px", background: "#e8f5e8", color: "#2d7a2d", padding: "2px 8px", borderRadius: "100px", fontWeight: "600" }}>Free</span>
                    )}
                    <span style={{ fontSize: "12px", color: "#8a8a8a" }}>{new Date(event.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
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