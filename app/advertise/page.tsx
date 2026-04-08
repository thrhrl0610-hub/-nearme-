'use client'
import { useRouter } from 'next/navigation'

export default function AdvertisePage() {
  const router = useRouter()

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#faf8f4", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
      <div style={{ maxWidth: "420px", width: "100%", textAlign: "center" }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "28px", marginBottom: "8px" }}>
          Reach locals with <span style={{ color: "#1a3a2a" }}>near</span><span style={{ color: "#4a8c5c", fontStyle: "italic" }}>me</span>
        </div>
        <div style={{ fontSize: "16px", color: "#4a4a4a", marginBottom: "28px", lineHeight: "1.6" }}>
        Are you a business owner? Advertise your business to people in your neighbourhood.
        </div>

        <div style={{ background: "#fff", border: "1px solid #e8e4de", borderRadius: "16px", padding: "20px 24px", marginBottom: "24px", textAlign: "left" }}>
          {[
            { icon: "📍", text: "Show up when locals are looking" },
            { icon: "💼", text: "Choose your radius — 5km to 50km" },
            { icon: "📊", text: "See real clicks and views" },
          ].map((item) => (
            <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <span style={{ fontSize: "20px" }}>{item.icon}</span>
              <span style={{ fontSize: "15px", color: "#2a2a2a" }}>{item.text}</span>
            </div>
          ))}
        </div>

        <button onClick={() => router.push('/auth?mode=business')} style={{ width: "100%", background: "#1a3a2a", color: "#fff", border: "none", borderRadius: "100px", padding: "14px", fontSize: "16px", fontWeight: "600", cursor: "pointer", marginBottom: "14px" }}>
          Start advertising →
        </button>

        <div style={{ fontSize: "14px", color: "#8a8a8a" }}>
          Already have a business account?{" "}
          <span onClick={() => router.push('/auth')} style={{ color: "#1a3a2a", fontWeight: "600", cursor: "pointer", textDecoration: "underline" }}>Sign in</span>
        </div>

        <div style={{ marginTop: "24px" }}>
          <span onClick={() => router.back()} style={{ fontSize: "13px", color: "#8a8a8a", cursor: "pointer" }}>← Back</span>
        </div>
      </div>
    </main>
  )
}