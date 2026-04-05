'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const ADMIN_EMAIL = 'thrhrl0610@gmail.com'

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'reports' | 'listings' | 'users'>('reports')
  const [reports, setReports] = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [stats, setStats] = useState({ listings: 0, users: 0, reports: 0, ads: 0 })

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/')
        return
      }
      await fetchAll()
      setLoading(false)
    }
    checkAdmin()
  }, [])

  const fetchAll = async () => {
    const [
      { data: reportsData },
      { data: listingsData },
      { data: usersData },
      { count: listingCount },
      { count: userCount },
      { count: reportCount },
      { count: adCount },
    ] = await Promise.all([
      supabase.from('reports').select('*, listings(title)').order('created_at', { ascending: false }).limit(50),
      supabase.from('listings').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('listings').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('reports').select('*', { count: 'exact', head: true }),
      supabase.from('ads').select('*', { count: 'exact', head: true }),
    ])
    if (reportsData) setReports(reportsData)
    if (listingsData) setListings(listingsData)
    if (usersData) setUsers(usersData)
    setStats({ listings: listingCount || 0, users: userCount || 0, reports: reportCount || 0, ads: adCount || 0 })
  }

  const handleDeleteListing = async (id: string) => {
    if (!confirm('Delete this listing?')) return
    await supabase.from('listings').delete().eq('id', id)
    setListings(listings.filter(l => l.id !== id))
  }

  const handleVerifyUser = async (userId: string, current: boolean) => {
    await supabase.from('profiles').update({ is_verified: !current, verified_at: !current ? new Date().toISOString() : null }).eq('id', userId)
    setUsers(users.map(u => u.id === userId ? { ...u, is_verified: !current } : u))
  }

  const handleDismissReport = async (id: string) => {
    await supabase.from('reports').delete().eq('id', id)
    setReports(reports.filter(r => r.id !== id))
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ color: '#8a8a8a' }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", background: '#faf8f4' }}>
      {/* HEADER */}
      <div style={{ background: '#1a3a2a', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#fff' }}>
            near<span style={{ color: '#7dcf9a', fontStyle: 'italic' }}>me</span>
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Admin</div>
        </div>
        <button onClick={() => router.push('/')} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '100px', padding: '8px 18px', fontSize: '13px', cursor: 'pointer' }}>← Back to app</button>
      </div>

      <div style={{ padding: '28px 32px', maxWidth: '1100px', margin: '0 auto' }}>
        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
          {[
            { label: 'Total listings', value: stats.listings, emoji: '📦' },
            { label: 'Total users', value: stats.users, emoji: '👤' },
            { label: 'Active ads', value: stats.ads, emoji: '📣' },
            { label: 'Reports', value: stats.reports, emoji: '🚩', alert: stats.reports > 0 },
          ].map((stat) => (
            <div key={stat.label} style={{ background: '#fff', border: `1px solid ${stat.alert ? '#f0d0d0' : '#e8e4de'}`, borderRadius: '14px', padding: '20px 22px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.emoji}</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '28px', marginBottom: '4px', color: stat.alert ? '#c0392b' : '#1a1a1a' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: '#8a8a8a' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', background: '#e8e4de', borderRadius: '100px', padding: '4px', marginBottom: '24px', gap: '4px', width: 'fit-content' }}>
          {[
            { label: `🚩 Reports (${reports.length})`, value: 'reports' },
            { label: `📦 Listings (${listings.length})`, value: 'listings' },
            { label: `👤 Users (${users.length})`, value: 'users' },
          ].map((tab) => (
            <button key={tab.value} onClick={() => setActiveTab(tab.value as any)} style={{ border: 'none', borderRadius: '100px', padding: '10px 20px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', background: activeTab === tab.value ? '#fff' : 'transparent', color: activeTab === tab.value ? '#1a1a1a' : '#8a8a8a' }}>{tab.label}</button>
          ))}
        </div>

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reports.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8e4de', padding: '40px', textAlign: 'center', color: '#8a8a8a' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                No reports — all clear!
              </div>
            ) : reports.map((report) => (
              <div key={report.id} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #f0d0d0', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '24px' }}>🚩</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{report.listings?.title || 'Unknown listing'}</div>
                  <div style={{ fontSize: '13px', color: '#c0392b', marginBottom: '4px' }}>Reason: {report.reason}</div>
                  <div style={{ fontSize: '12px', color: '#8a8a8a' }}>{new Date(report.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => report.listing_id && router.push(`/listings/${report.listing_id}`)} style={{ background: '#e8f4f0', color: '#1a3a2a', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>View</button>
                  <button onClick={() => report.listing_id && handleDeleteListing(report.listing_id)} style={{ background: '#fde8e8', color: '#c0392b', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Delete listing</button>
                  <button onClick={() => handleDismissReport(report.id)} style={{ background: '#f5f5f5', color: '#8a8a8a', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LISTINGS TAB */}
        {activeTab === 'listings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {listings.map((item) => (
              <div key={item.id} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8e4de', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#e8f4f0', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  {item.image_url ? <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '3px' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: '#8a8a8a' }}>{item.category} · {item.price === 0 ? 'Free' : `$${item.price}`} · {new Date(item.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })}</div>
                </div>
                {item.is_boosted && <span style={{ background: '#fde8e8', color: '#e85d2f', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '100px' }}>🚀 Boosted</span>}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => router.push(`/listings/${item.id}`)} style={{ background: '#e8f4f0', color: '#1a3a2a', border: 'none', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>View</button>
                  <button onClick={() => handleDeleteListing(item.id)} style={{ background: '#fde8e8', color: '#c0392b', border: 'none', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {users.map((u) => (
              <div key={u.id} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8e4de', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1a3a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#fff', fontWeight: '700', flexShrink: 0 }}>
                  {u.email?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '3px' }}>{u.full_name || u.email}</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {u.is_verified && <span style={{ background: '#e8f5e8', color: '#2d7a2d', fontSize: '11px', padding: '2px 8px', borderRadius: '100px' }}>✅ Verified</span>}
                    {u.is_business && <span style={{ background: '#fdf6e8', color: '#c8952a', fontSize: '11px', padding: '2px 8px', borderRadius: '100px' }}>📣 Business</span>}
                    <span style={{ fontSize: '11px', color: '#8a8a8a' }}>{new Date(u.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
                <button onClick={() => handleVerifyUser(u.id, u.is_verified)} style={{ background: u.is_verified ? '#fde8e8' : '#e8f5e8', color: u.is_verified ? '#c0392b' : '#2d7a2d', border: 'none', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                  {u.is_verified ? 'Unverify' : 'Verify'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}