'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function AdvertiserDashboard() {
  const router = useRouter()
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create'>('dashboard')
  const [myAds, setMyAds] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({ clicks: 0, views: 0 })

  const [bizName, setBizName] = useState('')
  const [description, setDescription] = useState('')
  const [longDescription, setLongDescription] = useState('')
  const [category, setCategory] = useState('Food')
  const [locationName, setLocationName] = useState('')
  const [emoji, setEmoji] = useState('🏪')
  const [logoImage, setLogoImage] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [useImage, setUseImage] = useState(false)
  const [posterImage, setPosterImage] = useState<File | null>(null)
  const [posterPreview, setPosterPreview] = useState<string | null>(null)
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [mapsUrl, setMapsUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      setUser(user)

      const { data: profile } = await supabase.from('profiles').select('is_business, business_name, suburb').eq('id', user.id).single()
      if (!profile?.is_business) { router.push('/'); return }

      if (profile.business_name) setBizName(profile.business_name)
      if (profile.suburb) setLocationName(profile.suburb)

      const { data: adsData } = await supabase.from('ads').select('*').eq('user_id', user.id)
      if (adsData && adsData.length > 0) {
        setMyAds(adsData)
        const ad = adsData[0]
        if (ad.business_name) setBizName(ad.business_name)
        if (ad.description) setDescription(ad.description)
        if (ad.long_description) setLongDescription(ad.long_description)
        if (ad.category) setCategory(ad.category)
        if (ad.location_name) setLocationName(ad.location_name)
        if (ad.emoji) setEmoji(ad.emoji)
        if (ad.image_url) { setLogoPreview(ad.image_url); setUseImage(true) }
        if (ad.poster_url) setPosterPreview(ad.poster_url)
        if (ad.website_url) setWebsiteUrl(ad.website_url)
        if (ad.maps_url) setMapsUrl(ad.maps_url)

        const adIds = adsData.map((a: any) => a.id)
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        const [{ count: clickCount }, { count: viewCount }] = await Promise.all([
          supabase.from('ad_clicks').select('*', { count: 'exact', head: true }).in('ad_id', adIds).gte('clicked_at', oneWeekAgo.toISOString()),
          supabase.from('ad_views').select('*', { count: 'exact', head: true }).in('ad_id', adIds).gte('viewed_at', oneWeekAgo.toISOString()),
        ])
        setStats({ clicks: clickCount || 0, views: viewCount || 0 })
      }

      setLoading(false)
    }
    checkUser()
    if (window.location.search.includes('success=true')) setSuccess(true)
  }, [])

  const handlePlanClick = async (planName: string) => {
    const res = await fetch('/api/create-ad-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planName })
    })
    const { url } = await res.json()
    window.location.href = url
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setLogoImage(file); setLogoPreview(URL.createObjectURL(file)); setUseImage(true) }
  }

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setPosterImage(file); setPosterPreview(URL.createObjectURL(file)) }
  }

  const uploadFile = async (file: File, prefix: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${prefix}-${user.id}-${Date.now()}.${fileExt}`
    const { error } = await supabase.storage.from('listings').upload(fileName, file)
    if (error) return null
    const { data } = supabase.storage.from('listings').getPublicUrl(fileName)
    return data.publicUrl
  }

  const getLocation = (): Promise<{lat: number, lng: number} | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { resolve(null); return }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null)
      )
    })
  }

  const handleCreateAd = async () => {
    if (!bizName || !description || !locationName) { setSaveMsg('Please fill in all fields'); return }
    setSaving(true)
    setSaveMsg('')

    let image_url = useImage && logoPreview && !logoImage ? logoPreview : null
    let poster_url = posterPreview && !posterImage ? posterPreview : null

    if (logoImage && useImage) {
      const url = await uploadFile(logoImage, 'ad-logo')
      if (url) image_url = url
    }
    if (posterImage) {
      const url = await uploadFile(posterImage, 'ad-poster')
      if (url) poster_url = url
    }

    const loc = await getLocation()

    const adData: any = {
      business_name: bizName,
      description,
      long_description: longDescription,
      category,
      location_name: locationName,
      emoji: useImage ? null : emoji,
      image_url: useImage ? image_url : null,
      poster_url,
      website_url: websiteUrl || null,
      maps_url: mapsUrl || null,
      user_id: user.id,
      is_active: false,
      status: 'pending',
    }

    if (loc) {
      adData.latitude = loc.lat
      adData.longitude = loc.lng
    }

    if (myAds.length > 0) {
      const { error } = await supabase.from('ads').update(adData).eq('user_id', user.id)
      if (!error) setSaveMsg('Ad updated! ✅')
      else setSaveMsg('Error: ' + error.message)
    } else {
      const { error } = await supabase.from('ads').insert({ ...adData, radius_km: 10 })
      if (!error) {
        setSaveMsg('Ad created! ✅')
        const { data: adsData } = await supabase.from('ads').select('*').eq('user_id', user.id)
        if (adsData) setMyAds(adsData)
      } else {
        setSaveMsg('Error: ' + error.message)
      }
    }
    setSaving(false)
  }

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('Delete this ad?')) return
    await supabase.from('ads').delete().eq('id', adId)
    setMyAds(myAds.filter(a => a.id !== adId))
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ color: '#8a8a8a' }}>Loading...</div>
    </div>
  )

  const previewIcon = useImage && logoPreview
    ? <img src={logoPreview} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
    : <span style={{ fontSize: '32px' }}>{emoji || '🏪'}</span>

  const clickRate = stats.views > 0 ? ((stats.clicks / stats.views) * 100).toFixed(1) + '%' : '—'
  const adStatus = myAds[0]?.status

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", background: '#faf8f4' }}>
      <style>{`
        @media (min-width: 768px) {
          .adv-sidebar { display: flex !important; }
          .adv-main { margin-left: 240px !important; }
          .adv-mobile-nav { display: none !important; }
        }
        @media (max-width: 767px) {
          .adv-sidebar { display: none !important; }
          .adv-main { margin-left: 0 !important; }
        }
      `}</style>

      <aside className="adv-sidebar" style={{ width: '240px', background: '#1a3a2a', minHeight: '100vh', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, display: 'none' }}>
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#fff' }}>
            near<span style={{ color: '#7dcf9a', fontStyle: 'italic' }}>me</span>
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Business Dashboard</div>
        </div>
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {[{ label: 'Dashboard', emoji: '📊', tab: 'dashboard' }, { label: 'Create Ad', emoji: '➕', tab: 'create' }].map((item) => (
            <div key={item.label} onClick={() => setActiveTab(item.tab as any)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', color: activeTab === item.tab ? '#fff' : 'rgba(255,255,255,0.65)', fontSize: '14px', cursor: 'pointer', marginBottom: '2px', background: activeTab === item.tab ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
              <span>{item.emoji}</span>{item.label}
            </div>
          ))}
        </nav>
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', cursor: 'pointer' }} onClick={() => router.push('/')}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#7dcf9a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🏠</div>
            <div>
              <div style={{ fontSize: '13px', color: '#fff', fontWeight: '500' }}>Back to app</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>nearme home</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="adv-main" style={{ marginLeft: '0' }}>
        <div style={{ background: '#1a3a2a', padding: '0 24px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#fff' }}>
            near<span style={{ color: '#7dcf9a', fontStyle: 'italic' }}>me</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginLeft: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Business</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {myAds.length > 0 && (
              <span style={{ background: adStatus === 'active' ? '#eaf5ec' : '#fdf6e8', color: adStatus === 'active' ? '#2d7a3a' : '#c8952a', fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '100px' }}>
                {adStatus === 'active' ? '● Live' : '⏳ Pending'}
              </span>
            )}
            <button onClick={() => router.push('/')} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '100px', padding: '7px 14px', fontSize: '12px', cursor: 'pointer' }}>← Home</button>
          </div>
        </div>

        <div className="adv-mobile-nav" style={{ background: '#fff', borderBottom: '1px solid #e8e4de', display: 'flex', padding: '8px 16px', gap: '8px' }}>
          {[{ label: '📊 Dashboard', tab: 'dashboard' }, { label: '➕ Create Ad', tab: 'create' }].map((item) => (
            <button key={item.tab} onClick={() => setActiveTab(item.tab as any)} style={{ flex: 1, border: 'none', borderRadius: '100px', padding: '9px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', background: activeTab === item.tab ? '#1a3a2a' : '#f0f0f0', color: activeTab === item.tab ? '#fff' : '#4a4a4a' }}>{item.label}</button>
          ))}
        </div>

        <div style={{ padding: '20px 24px 60px', maxWidth: '900px', margin: '0 auto' }}>
          {success && (
            <div style={{ background: '#eaf5ec', border: '1px solid #b7e4c7', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', fontSize: '14px', color: '#2d7a3a', fontWeight: '600' }}>
              🎉 Payment successful! Your plan is now active.
            </div>
          )}

          {activeTab === 'dashboard' && (
            <>
              {adStatus === 'pending' && (
                <div style={{ background: '#fdf6e8', border: '1px solid #f0e4c0', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', fontSize: '14px', color: '#c8952a', fontWeight: '500' }}>
                  ⏳ Your ad is pending approval. We'll review it shortly and notify you once it's live!
                </div>
              )}
              {adStatus === 'rejected' && (
                <div style={{ background: '#fde8e8', border: '1px solid #f0c0c0', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', fontSize: '14px', color: '#c0392b', fontWeight: '500' }}>
                  ❌ Your ad was not approved. Please edit and resubmit.
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {[
                  { label: 'Views this week', value: stats.views.toLocaleString(), sub: 'Business page visits', up: stats.views > 0 },
                  { label: 'Clicks this week', value: stats.clicks.toLocaleString(), sub: 'Sponsored strip clicks', up: stats.clicks > 0 },
                  { label: 'Click rate', value: clickRate, sub: 'Clicks ÷ views', up: true },
                  { label: 'Ad status', value: adStatus === 'active' ? '● Live' : adStatus === 'pending' ? '⏳ Pending' : adStatus === 'rejected' ? '❌ Rejected' : '—', sub: adStatus === 'active' ? 'Visible to locals' : adStatus === 'pending' ? 'Awaiting approval' : '—', up: adStatus === 'active' },
                ].map((stat) => (
                  <div key={stat.label} style={{ background: '#fff', border: '1px solid #e8e4de', borderRadius: '14px', padding: '16px 18px' }}>
                    <div style={{ fontSize: '11px', color: '#8a8a8a', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', marginBottom: '4px' }}>{stat.value}</div>
                    <div style={{ fontSize: '12px', color: stat.up ? '#2d7a3a' : '#8a8a8a' }}>{stat.sub}</div>
                  </div>
                ))}
              </div>

              {myAds.length > 0 ? (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '18px', marginBottom: '14px' }}>My Ads</div>
                  {myAds.map((ad) => (
                    <div key={ad.id} style={{ background: '#fff', border: '1px solid #e8e4de', borderRadius: '14px', overflow: 'hidden', marginBottom: '10px' }}>
                      {ad.poster_url && <img src={ad.poster_url} alt="poster" style={{ width: '100%', objectFit: 'cover', display: 'block', borderRadius: '14px 14px 0 0' }} />}
                      <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8f4f0', flexShrink: 0 }}>
                          {ad.image_url ? <img src={ad.image_url} alt={ad.business_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '28px' }}>{ad.emoji}</span>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>{ad.business_name}</div>
                          <div style={{ fontSize: '13px', color: '#8a8a8a', marginBottom: '6px' }}>{ad.description}</div>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', background: '#e8f5e8', color: '#2d7a2d', padding: '2px 8px', borderRadius: '100px' }}>{ad.category}</span>
                            <span style={{ fontSize: '11px', background: '#e8f4f0', color: '#1a3a2a', padding: '2px 8px', borderRadius: '100px' }}>📍 {ad.location_name}</span>
                            <span style={{ fontSize: '11px', background: ad.status === 'active' ? '#eaf5ec' : '#fdf6e8', color: ad.status === 'active' ? '#2d7a3a' : '#c8952a', padding: '2px 8px', borderRadius: '100px' }}>
                              {ad.status === 'active' ? '● Live' : '⏳ Pending'}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <button onClick={() => setActiveTab('create')} style={{ background: '#fdf6e8', color: '#c8952a', border: 'none', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => handleDeleteAd(ad.id)} style={{ background: '#fde8e8', color: '#c0392b', border: 'none', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: '#fff', border: '1.5px dashed #e8e4de', borderRadius: '14px', padding: '32px', textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>📣</div>
                  <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>No ads yet</div>
                  <div style={{ fontSize: '13px', color: '#8a8a8a', marginBottom: '14px' }}>Create your first ad to reach locals!</div>
                  <button onClick={() => setActiveTab('create')} style={{ background: '#1a3a2a', color: '#fff', border: 'none', borderRadius: '100px', padding: '10px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Create Ad →</button>
                </div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '18px', marginBottom: '4px' }}>Ad plans</div>
                <div style={{ fontSize: '13px', color: '#8a8a8a' }}>Simple, local pricing — no algorithm tax.</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {[
                  { name: 'Starter', price: '$49', desc: 'Perfect for testing the waters', features: ['Sponsored Strip slot', 'Up to 5 km radius', '~1,200 local users/mo', 'Basic analytics'], popular: false },
                  { name: 'Growth', price: '$199', desc: 'For businesses ready to grow', features: ['Strip + Feed Ad placements', 'Up to 20 km radius', '~8,000 local users/mo', 'Full analytics + CTR', 'Priority placement'], popular: true },
                  { name: 'Premier', price: '$499', desc: 'Maximum local visibility', features: ['All placements incl. Banner', 'Up to 50 km radius', '~25,000 local users/mo', 'Advanced analytics', 'Dedicated support'], popular: false },
                ].map((plan) => (
                  <div key={plan.name} style={{ background: '#fff', border: `1.5px solid ${plan.popular ? '#1a3a2a' : '#e8e4de'}`, borderRadius: '14px', padding: '20px', position: 'relative' }}>
                    {plan.popular && <div style={{ position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)', background: '#1a3a2a', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '3px 12px', borderRadius: '0 0 8px 8px' }}>Most popular</div>}
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#8a8a8a', marginBottom: '6px', textTransform: 'uppercase' }}>{plan.name}</div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '28px', marginBottom: '4px' }}>{plan.price} <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#8a8a8a' }}>/mo</span></div>
                    <div style={{ fontSize: '13px', color: '#8a8a8a', marginBottom: '12px' }}>{plan.desc}</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {plan.features.map(f => (
                        <li key={f} style={{ fontSize: '13px', color: '#4a4a4a', display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <span style={{ color: '#4a8c5c', fontWeight: '700' }}>✓</span>{f}
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => handlePlanClick(plan.name)} style={{ width: '100%', borderRadius: '100px', padding: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', border: plan.popular ? 'none' : '1.5px solid #e8e4de', background: plan.popular ? '#1a3a2a' : 'transparent', color: plan.popular ? '#fff' : '#1a1a1a' }}>
                      {plan.popular ? 'Subscribe now' : 'Get started'}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'create' && (
            <div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', marginBottom: '6px' }}>
                {myAds.length > 0 ? 'Edit your ad' : 'Create your ad'}
              </div>
              <div style={{ fontSize: '14px', color: '#8a8a8a', marginBottom: '24px' }}>
                This is what locals will see in the Sponsored strip and feed.
              </div>

              {/* PREVIEW - 흰 배경 */}
              <div style={{ background: '#fff', border: '1px solid #e8e4de', borderRadius: '14px', overflow: 'hidden', marginBottom: '20px' }}>
                {posterPreview && <img src={posterPreview} alt="poster preview" style={{ width: '100%', display: 'block' }} />}
                <div style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8f4f0', flexShrink: 0 }}>
                      {previewIcon}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '600' }}>{bizName || 'Your Business Name'}</div>
                      <div style={{ fontSize: '13px', color: '#8a8a8a' }}>{description || 'Your tagline here'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ background: '#e8f4f0', borderRadius: '100px', padding: '3px 10px', color: '#1a3a2a', fontSize: '11px' }}>📍 {locationName || 'Your suburb'}</span>
                    {category && <span style={{ background: '#e8f4f0', borderRadius: '100px', padding: '3px 10px', color: '#1a3a2a', fontSize: '11px' }}>{category}</span>}
                    <span style={{ background: '#fdf6e8', borderRadius: '100px', padding: '3px 10px', color: '#c8952a', fontSize: '11px' }}>📣 Sponsored</span>
                  </div>
                </div>
                <div style={{ padding: '6px 18px 12px', fontSize: '10px', color: '#c8c8c8', textTransform: 'uppercase', letterSpacing: '1px' }}>Preview</div>
              </div>

              {/* BRAND ICON */}
              <div style={{ marginBottom: '20px', background: '#fff', border: '1px solid #e8e4de', borderRadius: '12px', padding: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a4a4a', display: 'block', marginBottom: '12px' }}>Brand icon</label>
                <div style={{ display: 'flex', background: '#f0f0f0', borderRadius: '100px', padding: '3px', marginBottom: '14px', gap: '3px' }}>
                  <button onClick={() => setUseImage(false)} style={{ flex: 1, border: 'none', borderRadius: '100px', padding: '7px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', background: !useImage ? '#fff' : 'transparent', color: !useImage ? '#1a1a1a' : '#8a8a8a' }}>😊 Emoji</button>
                  <button onClick={() => setUseImage(true)} style={{ flex: 1, border: 'none', borderRadius: '100px', padding: '7px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', background: useImage ? '#fff' : 'transparent', color: useImage ? '#1a1a1a' : '#8a8a8a' }}>🖼️ Logo image</button>
                </div>
                {!useImage ? (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['🏪', '🍜', '🍕', '☕', '🏠', '💆', '🛒', '💇', '🏋️', '🐾', '🌿', '🔧', '📚', '🎨', '🧁', '🍣'].map((e) => (
                      <button key={e} onClick={() => setEmoji(e)} style={{ fontSize: '22px', width: '40px', height: '40px', borderRadius: '8px', border: emoji === e ? '2px solid #1a3a2a' : '1.5px solid #e8e4de', background: emoji === e ? '#e8f4f0' : '#fff', cursor: 'pointer' }}>{e}</button>
                    ))}
                  </div>
                ) : (
                  <div>
                    <div onClick={() => document.getElementById('logoInput')?.click()} style={{ border: '2px dashed #e8e4de', borderRadius: '10px', padding: '20px', textAlign: 'center', cursor: 'pointer', background: '#faf8f4' }}>
                      {logoPreview
                        ? <img src={logoPreview} alt="logo" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', margin: '0 auto', display: 'block' }} />
                        : <div><div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div><div style={{ fontSize: '13px', color: '#8a8a8a' }}>Tap to upload your logo</div></div>
                      }
                    </div>
                    <input id="logoInput" type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
                    {logoPreview && <button onClick={() => { setLogoPreview(null); setLogoImage(null); setUseImage(false) }} style={{ marginTop: '8px', background: 'transparent', border: 'none', fontSize: '12px', color: '#c0392b', cursor: 'pointer', textDecoration: 'underline' }}>Remove</button>}
                  </div>
                )}
              </div>

              {/* POSTER */}
              <div style={{ marginBottom: '20px', background: '#fff', border: '1px solid #e8e4de', borderRadius: '12px', padding: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a4a4a', display: 'block', marginBottom: '4px' }}>📸 Business poster <span style={{ fontWeight: '400', color: '#8a8a8a' }}>(optional)</span></label>
                <div style={{ fontSize: '12px', color: '#8a8a8a', marginBottom: '12px' }}>Shown full-width on your business page. Use a banner, menu, or promo image.</div>
                <div onClick={() => document.getElementById('posterInput')?.click()} style={{ border: '2px dashed #e8e4de', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', background: '#faf8f4' }}>
                  {posterPreview
                    ? <img src={posterPreview} alt="poster" style={{ width: '100%', objectFit: 'cover', display: 'block' }} />
                    : <div style={{ padding: '28px', textAlign: 'center' }}>
                        <div style={{ fontSize: '36px', marginBottom: '8px' }}>🖼️</div>
                        <div style={{ fontSize: '13px', color: '#8a8a8a' }}>Tap to upload a poster or banner</div>
                        <div style={{ fontSize: '11px', color: '#c8c8c8', marginTop: '4px' }}>Recommended: 1200×600px</div>
                      </div>
                  }
                </div>
                <input id="posterInput" type="file" accept="image/*" onChange={handlePosterChange} style={{ display: 'none' }} />
                {posterPreview && <button onClick={() => { setPosterPreview(null); setPosterImage(null) }} style={{ marginTop: '8px', background: 'transparent', border: 'none', fontSize: '12px', color: '#c0392b', cursor: 'pointer', textDecoration: 'underline' }}>Remove poster</button>}
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#4a4a4a', display: 'block', marginBottom: '6px' }}>Business name</label>
                <input value={bizName} onChange={e => setBizName(e.target.value)} placeholder="e.g. Pho Silverdale" style={{ width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#4a4a4a', display: 'block', marginBottom: '6px' }}>Tagline / description</label>
                <input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Lunch special $14.90" style={{ width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#4a4a4a', display: 'block', marginBottom: '6px' }}>Category</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Food', 'Retail', 'Wellness', 'Real Estate', 'Services', 'Other'].map((cat) => (
                    <button key={cat} onClick={() => setCategory(cat)} style={{ border: category === cat ? 'none' : '1.5px solid #e8e4de', borderRadius: '100px', padding: '6px 14px', fontSize: '13px', background: category === cat ? '#1a3a2a' : '#fff', color: category === cat ? '#fff' : '#4a4a4a', cursor: 'pointer' }}>{cat}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#4a4a4a', display: 'block', marginBottom: '6px' }}>Suburb / location</label>
                <input value={locationName} onChange={e => setLocationName(e.target.value)} placeholder="e.g. Silverdale" style={{ width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#4a4a4a', display: 'block', marginBottom: '6px' }}>
                  About your business <span style={{ color: '#8a8a8a', fontWeight: '400' }}>(optional)</span>
                </label>
                <textarea value={longDescription} onChange={e => setLongDescription(e.target.value)} placeholder="Tell locals about your business — hours, specialties, story..." rows={4} style={{ width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: "'DM Sans', sans-serif" }} />
              </div>

              <div style={{ marginBottom: '24px', background: '#fff', border: '1px solid #e8e4de', borderRadius: '12px', padding: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a4a4a', display: 'block', marginBottom: '4px' }}>🔗 Links <span style={{ fontWeight: '400', color: '#8a8a8a' }}>(optional)</span></label>
                <div style={{ fontSize: '12px', color: '#8a8a8a', marginBottom: '14px' }}>Add your website or Google Maps link — locals can tap to visit.</div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#4a4a4a', display: 'block', marginBottom: '6px' }}>🌐 Website URL</label>
                  <input value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="e.g. https://victoriasushi.co.nz" style={{ width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#4a4a4a', display: 'block', marginBottom: '6px' }}>📍 Google Maps URL</label>
                  <input value={mapsUrl} onChange={e => setMapsUrl(e.target.value)} placeholder="e.g. https://maps.google.com/..." style={{ width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              {saveMsg && (
                <div style={{ marginBottom: '14px', padding: '10px 14px', background: saveMsg.includes('Error') ? '#fde8e8' : '#e8f5e8', borderRadius: '8px', fontSize: '13px', color: saveMsg.includes('Error') ? '#c0392b' : '#2d7a2d' }}>{saveMsg}</div>
              )}

              <button onClick={handleCreateAd} disabled={saving} style={{ width: '100%', background: '#1a3a2a', color: '#fff', border: 'none', borderRadius: '100px', padding: '13px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                {saving ? 'Saving...' : myAds.length > 0 ? 'Update ad' : 'Create ad'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}