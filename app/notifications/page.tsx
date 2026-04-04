'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      if (data) setNotifications(data)

      // Mark all as read
      await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)

      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <div style={{ minHeight: '100vh', background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a8a8a' }}>Loading...</div>

  return (
    <main style={{ minHeight: '100vh', background: '#faf8f4', paddingBottom: '80px' }}>
      <nav style={{ background: '#1a3a2a', padding: '0 24px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={() => router.push('/')} style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#fff', cursor: 'pointer' }}>
          near<span style={{ color: '#7dcf9a', fontStyle: 'italic' }}>me</span>
        </div>
        <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '100px', padding: '8px 18px', fontSize: '13px', cursor: 'pointer' }}>← Back</button>
      </nav>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', marginBottom: '20px' }}>Notifications</div>

        {notifications.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8e4de', padding: '60px', textAlign: 'center', color: '#8a8a8a' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔔</div>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>No notifications yet</div>
            <div style={{ fontSize: '14px' }}>We'll let you know when something happens!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.map((notif) => (
              <div key={notif.id} onClick={() => notif.listing_id && router.push(`/listings/${notif.listing_id}`)} style={{ background: notif.read ? '#fff' : '#e8f4f0', borderRadius: '14px', border: '1px solid #e8e4de', padding: '16px', cursor: notif.listing_id ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>
                  {notif.type === 'message' ? '💬' : notif.type === 'review' ? '⭐' : '🔔'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: notif.read ? '400' : '600' }}>{notif.message}</div>
                  <div style={{ fontSize: '12px', color: '#8a8a8a', marginTop: '4px' }}>
                    {new Date(notif.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {!notif.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e85d2f', flexShrink: 0 }} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #e8e4de', display: 'flex', justifyContent: 'space-around', padding: '8px 0 12px' }}>
        {[['🏠', 'Home', '/'], ['🔍', 'Browse', '/browse'], ['➕', 'Post', '/post'], ['💬', 'Chat', '/messages'], ['👤', 'Profile', '/profile']].map(([icon, label, href]) => (
          <div key={label} onClick={() => router.push(href as string)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', cursor: 'pointer', fontSize: '11px', color: '#8a8a8a' }}>
            <div style={{ fontSize: '22px' }}>{icon}</div>
            {label}
          </div>
        ))}
      </div>
    </main>
  )
}