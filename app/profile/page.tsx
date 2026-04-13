'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import BottomNav from '../../components/BottomNav'

const BoxIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4a8c5c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)

const BriefcaseIcon = ({ color = "#4a8c5c" }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
)

const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a4a4a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)

const ChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
)

const HeartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#e85d2f" stroke="#e85d2f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [listings, setListings] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [savedListings, setSavedListings] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'my' | 'jobs' | 'saved'>('my')
  const [loading, setLoading] = useState(true)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/auth'); return }
        setUser(user)
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (profileData) setProfile(profileData)
        const { data: listingsData } = await supabase.from('listings').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
        if (listingsData) setListings(listingsData)
        const { data: jobsData } = await supabase.from('jobs').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
        if (jobsData) setJobs(jobsData)
        const { data: savesData } = await supabase.from('saves').select('*, listings(*)').eq('user_id', user.id).order('created_at', { ascending: false })
        if (savesData) setSavedListings(savesData.map((s: any) => s.listings).filter(Boolean))
        try {
          if ('serviceWorker' in navigator && 'PushManager' in window) {
            const reg = await navigator.serviceWorker.getRegistration()
            if (reg) { const sub = await reg.pushManager.getSubscription(); if (sub) setPushEnabled(true) }
          }
        } catch (e) { console.log('Push check failed:', e) }
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  const handlePushToggle = async () => {
    setPushLoading(true)
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      await Promise.race([navigator.serviceWorker.ready, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))])
      if (pushEnabled) {
        const sub = await reg.pushManager.getSubscription()
        if (sub) { await sub.unsubscribe(); await supabase.from('push_subscriptions').delete().eq('user_id', user.id); setPushEnabled(false) }
      } else {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') { setPushLoading(false); return }
        const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY })
        await supabase.from('push_subscriptions').upsert({ user_id: user.id, subscription: sub.toJSON() })
        setPushEnabled(true)
      }
    } catch (err) { console.error(err) }
    setPushLoading(false)
  }

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push('/') }
  const handleDeleteListing = async (id: string) => {
    if (!confirm('Delete this listing?')) return
    await supabase.from('listings').delete().eq('id', id)
    setListings(listings.filter(l => l.id !== id))
  }
  const handleDeleteJob = async (id: string) => {
    if (!confirm('Delete this job?')) return
    await supabase.from('jobs').delete().eq('id', id)
    setJobs(jobs.filter(j => j.id !== id))
  }

  if (loading) return <div style={{ minHeight: '100vh', background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a8a8a' }}>Loading...</div>

  return (
    <main style={{ minHeight: '100vh', background: '#faf8f4', paddingBottom: '80px', fontFamily: "'DM Sans', sans-serif" }}>
      <nav style={{ background: '#1a3a2a', padding: '0 24px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={() => router.push('/')} style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#fff', cursor: 'pointer' }}>
          near<span style={{ color: '#7dcf9a', fontStyle: 'italic' }}>me</span>
        </div>
        <button onClick={handleSignOut} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '100px', padding: '8px 18px', fontSize: '13px', cursor: 'pointer' }}>Sign out</button>
      </nav>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8e4de', padding: '24px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#1a3a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', color: '#fff', fontWeight: '700', flexShrink: 0 }}>
              {user?.email?.[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>{profile?.full_name || user?.email}</div>
                {profile?.is_verified && (
                  <span style={{ background: '#e8f4f0', color: '#1a3a2a', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '100px' }}>Verified</span>
                )}
              </div>
              <div style={{ fontSize: '13px', color: '#8a8a8a' }}>{listings.length} listing{listings.length !== 1 ? 's' : ''} · {jobs.length} job{jobs.length !== 1 ? 's' : ''} posted</div>
              {profile?.is_business && (
                <div style={{ fontSize: '12px', color: '#c8952a', fontWeight: '500', marginTop: '2px' }}>Business account</div>
              )}
            </div>
            <button onClick={() => router.push('/post')} style={{ background: '#e85d2f', color: '#fff', border: 'none', borderRadius: '100px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>+ Post</button>
          </div>

          <div style={{ marginTop: '16px', background: '#f5f5f5', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BellIcon />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '2px' }}>Push notifications</div>
              <div style={{ fontSize: '12px', color: '#8a8a8a' }}>{pushEnabled ? 'You will receive notifications' : 'Get notified about messages & activity'}</div>
            </div>
            <button onClick={handlePushToggle} disabled={pushLoading} style={{ background: pushEnabled ? '#fde8e8' : '#1a3a2a', color: pushEnabled ? '#c0392b' : '#fff', border: 'none', borderRadius: '100px', padding: '7px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {pushLoading ? '...' : pushEnabled ? 'Turn off' : 'Turn on'}
            </button>
          </div>

          {!profile?.is_verified && (
            <div style={{ marginTop: '12px', background: '#fdf6e8', border: '1px solid #f0e4c0', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#c8952a', marginBottom: '2px' }}>Get verified</div>
                <div style={{ fontSize: '12px', color: '#8a8a8a' }}>Verified users get more trust and visibility</div>
              </div>
              <button onClick={async () => {
                await supabase.from('profiles').update({ is_verified: true, verified_at: new Date().toISOString() }).eq('id', user.id)
                setProfile({ ...profile, is_verified: true })
              }} style={{ background: '#c8952a', color: '#fff', border: 'none', borderRadius: '100px', padding: '7px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Verify now
              </button>
            </div>
          )}

          {profile?.is_business && (
            <div style={{ marginTop: '12px' }}>
              <button onClick={() => router.push('/advertiser')} style={{ width: '100%', background: '#1a3a2a', color: '#fff', border: 'none', borderRadius: '100px', padding: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <ChartIcon /> Go to Business Dashboard →
              </button>
            </div>
          )}
        </div>

        {/* 탭 */}
        <div style={{ display: 'flex', background: '#e8e4de', borderRadius: '100px', padding: '4px', marginBottom: '20px', gap: '4px' }}>
          {[['my', `Listings (${listings.length})`], ['jobs', `Jobs (${jobs.length})`], ['saved', `Saved (${savedListings.length})`]].map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} style={{ flex: 1, border: 'none', borderRadius: '100px', padding: '10px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', background: activeTab === tab ? '#fff' : 'transparent', color: activeTab === tab ? '#1a1a1a' : '#8a8a8a' }}>{label}</button>
          ))}
        </div>

        {/* MY LISTINGS */}
        {activeTab === 'my' && (
          listings.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8e4de', padding: '40px', textAlign: 'center', color: '#8a8a8a', fontSize: '14px' }}>
              No listings yet. <span onClick={() => router.push('/post')} style={{ color: '#4a8c5c', cursor: 'pointer', textDecoration: 'underline' }}>Post your first one →</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {listings.map((item) => (
                <div key={item.id} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8e4de', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '10px', background: '#e8f4f0', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.image_url ? <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <BoxIcon />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                    <div style={{ fontSize: '13px', color: '#4a8c5c', fontWeight: '500' }}>{item.price === 0 ? 'Free' : `$${item.price}`}</div>
                    <div style={{ fontSize: '12px', color: '#8a8a8a' }}>{new Date(item.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button onClick={() => router.push(`/listings/${item.id}`)} style={{ background: '#e8f4f0', color: '#1a3a2a', border: 'none', borderRadius: '8px', padding: '7px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>View</button>
                    <button onClick={() => router.push(`/listings/edit?id=${item.id}`)} style={{ background: '#fdf6e8', color: '#c8952a', border: 'none', borderRadius: '8px', padding: '7px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDeleteListing(item.id)} style={{ background: '#fde8e8', color: '#c0392b', border: 'none', borderRadius: '8px', padding: '7px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* MY JOBS */}
        {activeTab === 'jobs' && (
          jobs.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8e4de', padding: '40px', textAlign: 'center', color: '#8a8a8a', fontSize: '14px' }}>
              No jobs posted yet. <span onClick={() => router.push('/post')} style={{ color: '#4a8c5c', cursor: 'pointer', textDecoration: 'underline' }}>Post a job →</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {jobs.map((job) => (
                <div key={job.id} style={{ background: '#fff', borderRadius: '14px', border: `1px solid ${job.is_urgent ? '#e85d2f' : '#e8e4de'}`, padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
                  {job.is_urgent && (
                    <div style={{ position: 'absolute', top: '-1px', left: '12px', background: '#e85d2f', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '0 0 6px 6px' }}>URGENT</div>
                  )}
                  <div style={{ width: '56px', height: '56px', borderRadius: '10px', background: job.is_urgent ? '#fde8e8' : '#e8f4f0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: job.is_urgent ? '10px' : '0' }}>
                    <BriefcaseIcon color={job.is_urgent ? '#c0392b' : '#4a8c5c'} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0, marginTop: job.is_urgent ? '10px' : '0' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.title}</div>
                    <div style={{ fontSize: '13px', color: '#4a8c5c', fontWeight: '500' }}>{job.pay_rate}</div>
                    <div style={{ fontSize: '12px', color: '#8a8a8a' }}>{job.job_type} · {new Date(job.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0, marginTop: job.is_urgent ? '10px' : '0' }}>
                    <button onClick={() => router.push(`/jobs/${job.id}`)} style={{ background: '#e8f4f0', color: '#1a3a2a', border: 'none', borderRadius: '8px', padding: '7px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>View</button>
                    <button onClick={() => handleDeleteJob(job.id)} style={{ background: '#fde8e8', color: '#c0392b', border: 'none', borderRadius: '8px', padding: '7px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* SAVED */}
        {activeTab === 'saved' && (
          savedListings.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8e4de', padding: '40px', textAlign: 'center', color: '#8a8a8a', fontSize: '14px' }}>
              No saved listings yet. <span onClick={() => router.push('/browse')} style={{ color: '#4a8c5c', cursor: 'pointer', textDecoration: 'underline' }}>Browse listings →</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {savedListings.map((item) => (
                <div key={item.id} onClick={() => router.push(`/listings/${item.id}`)} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8e4de', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '10px', background: '#e8f4f0', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.image_url ? <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <BoxIcon />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '3px' }}>{item.title}</div>
                    <div style={{ fontSize: '13px', color: '#4a8c5c', fontWeight: '500' }}>{item.price === 0 ? 'Free' : `$${item.price}`}</div>
                    <div style={{ fontSize: '12px', color: '#8a8a8a' }}>{item.category}</div>
                  </div>
                  <HeartIcon />
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <BottomNav />
    </main>
  )
}