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

  const [bizName, setBizName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Food')
  const [locationName, setLocationName] = useState('')
  const [emoji, setEmoji] = useState('🏪')
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
      if (adsData) setMyAds(adsData)

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

  const handleCreateAd = async () => {
    if (!bizName || !description || !locationName) { setSaveMsg('Please fill in all fields'); return }
    setSaving(true)
    setSaveMsg('')

    if (myAds.length > 0) {
      const { error } = await supabase.from('ads').update({
        business_name: bizName, description, category,
        location_name: locationName, emoji, user_id: user.id, is_active: true,
      }).eq('user_id', user.id)
      if (!error) setSaveMsg('Ad updated! ✅')
      else setSaveMsg('Error: ' + error.message)
    } else {
      const { error } = await supabase.from('ads').insert({
        business_name: bizName, description, category,
        location_name: locationName, emoji, user_id: user.id, is_active: true, radius_km: 10,
      })
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

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", background: '#faf8f4' }}>
      <style>{`
        @media (min-width: 768px) {
          .adv-layout { display: flex !important; }
          .adv-sidebar { display: flex !important; }
          .adv-main { margin-left: 240px !important; }
          .adv-mobile-nav { display: none !important; }
        }
        @media (max-width: 767px) {
          .adv-sidebar { display: none !important; }
          .adv-main { margin-left: 0 !important; }
        }
      `}</style>

      {/* SIDEBAR - 데스크탑만 */}
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

      {/* MAIN */}
      <div className="adv-main" style={{ marginLeft: '0' }}>
        {/* 헤더 */}
        <div style={{ background: '#1a3a2a', padding: '0 24px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#fff' }}>
            near<span style={{ color: '#7dcf9a', fontStyle: 'italic' }}>me</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginLeft: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Business</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {myAds.length > 0 && (
              <span style={{ background: '#eaf5ec', color: '#2d7a3a', fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '100px' }}>● {myAds.length} live</span>
            )}
            <button onClick={() => router.push('/')} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '100px', padding: '7px 14px', fontSize: '12px', cursor: 'pointer' }}>← Home</button>
          </div>
        </div>

        {/* 모바일 탭 */}
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

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {[
                  { label: 'Reach this week', value: '4,280', sub: '↑ 18% vs last week', up: true },
                  { label: 'Clicks', value: '347', sub: '↑ 8.1% CTR', up: true },
                  { label: 'Ad spend (NZD)', value: '$49', sub: '$199/mo plan', up: false },
                  { label: 'Cost per click', value: '$0.14', sub: 'vs Meta avg $1.80', up: true },
                ].map((stat) => (
                  <div key={stat.label} style={{ background: '#fff', border: '1px solid #e8e4de', borderRadius: '14px', padding: '16px 18px' }}>
                    <div style={{ fontSize: '11px', color: '#8a8a8a', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '24px', marginBottom: '4px' }}>{stat.value}</div>
                    <div style={{ fontSize: '12px', color: stat.up ? '#2d7a3a' : '#8a8a8a' }}>{stat.sub}</div>
                  </div>
                ))}
              </div>

              {myAds.length > 0 ? (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '18px', marginBottom: '14px' }}>My Ads</div>
                  {myAds.map((ad) => (
                    <div key={ad.id} style={{ background: '#fff', border: '1px solid #e8e4de', borderRadius: '14px', padding: '16px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ fontSize: '32px' }}>{ad.emoji}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>{ad.business_name}</div>
                        <div style={{ fontSize: '13px', color: '#8a8a8a', marginBottom: '6px' }}>{ad.description}</div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', background: '#e8f5e8', color: '#2d7a2d', padding: '2px 8px', borderRadius: '100px' }}>{ad.category}</span>
                          <span style={{ fontSize: '11px', background: '#e8f4f0', color: '#1a3a2a', padding: '2px 8px', borderRadius: '100px' }}>📍 {ad.location_name}</span>
                          <span style={{ fontSize: '11px', background: '#eaf5ec', color: '#2d7a3a', padding: '2px 8px', borderRadius: '100px' }}>● Live</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <button onClick={() => setActiveTab('create')} style={{ background: '#fdf6e8', color: '#c8952a', border: 'none', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => handleDeleteAd(ad.id)} style={{ background: '#fde8e8', color: '#c0392b', border: 'none', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Delete</button>
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

          {/* CREATE AD TAB */}
          {activeTab === 'create' && (
            <div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', marginBottom: '6px' }}>
                {myAds.length > 0 ? 'Edit your ad' : 'Create your ad'}
              </div>
              <div style={{ fontSize: '14px', color: '#8a8a8a', marginBottom: '24px' }}>
                This is what locals will see in the Sponsored strip and feed.
              </div>

              <div style={{ background: '#fdf6e8', border: '1px solid #f0e4c0', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '32px' }}>{emoji || '🏪'}</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>{bizName || 'Your Business Name'}</div>
                  <div style={{ fontSize: '11px', color: '#8a8a8a' }}>{description || 'Your tagline here'}</div>
                  <div style={{ fontSize: '11px', color: '#4a8c5c', fontWeight: '500' }}>{locationName || 'Your suburb'}</div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '10px', color: '#c8952a', fontWeight: '600', textTransform: 'uppercase' }}>Preview</div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#4a4a4a', display: 'block', marginBottom: '8px' }}>Pick an emoji</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['🏪', '🍜', '🍕', '☕', '🏠', '💆', '🛒', '💇', '🏋️', '🐾', '🌿', '🔧', '📚', '🎨', '🧁', '🍣'].map((e) => (
                    <button key={e} onClick={() => setEmoji(e)} style={{ fontSize: '22px', width: '40px', height: '40px', borderRadius: '8px', border: emoji === e ? '2px solid #1a3a2a' : '1.5px solid #e8e4de', background: emoji === e ? '#e8f4f0' : '#fff', cursor: 'pointer' }}>{e}</button>
                  ))}
                </div>
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

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#4a4a4a', display: 'block', marginBottom: '6px' }}>Suburb / location</label>
                <input value={locationName} onChange={e => setLocationName(e.target.value)} placeholder="e.g. Silverdale" style={{ width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
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