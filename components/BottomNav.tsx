'use client'
import { useRouter, usePathname } from 'next/navigation'

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  const tabs = [
    { icon: "🏠", label: "Home", href: "/" },
    { icon: "🔍", label: "Browse", href: "/browse" },
    { icon: "➕", label: "Post", href: "/post" },
    { icon: "💬", label: "Chat", href: "/messages" },
    { icon: "🏘️", label: "Community", href: "/community" },
    { icon: "👤", label: "Profile", href: "/profile" },
  ]

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #e8e4de", display: "flex", justifyContent: "space-around", padding: "8px 0 12px", zIndex: 100 }}>
      {tabs.map(({ icon, label, href }) => (
        <div key={label} onClick={() => router.push(href)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", cursor: "pointer", fontSize: "10px", color: pathname === href ? "#1a3a2a" : "#8a8a8a" }}>
          <div style={{ fontSize: "20px" }}>{icon}</div>
          {label}
        </div>
      ))}
    </div>
  )
}