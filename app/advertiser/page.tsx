'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function AdvertiserDashboard() {
  const router = useRouter()
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_business')
        .eq('id', user.id)
        .single()

      if (!profile?.is_business) {
        router.push('/')
        return
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

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ color: '#8a8a8a' }}>Loading...</div>
    </div>
  )

  return (
    <div style={{display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", background: '#faf8f4'}}>
      {/* SIDEBAR */}
      <aside style={{width: '240px', background: '#1a3a2a', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0}}>
        <div style={{padding: '28px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
          <div style={{fontFamily: 'Georgia, serif', fontSize: '22px', color: '#fff'}}>
            near<span style={{color: '#7dcf9a', fontStyle: 'italic'}}>me</span>
          </div>
          <div style={{fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.06em'}}>Business Dashboard</div>
        </div>
        <nav style={{padding: '16px 12px', flex: 1}}>
          {[
            {label: 'Dashboard', emoji: '📊'},
            {label: 'Analytics', emoji: '📈'},
            {label: 'Campaigns', emoji: '⚡'},
            {label: 'Create Ad', emoji: '➕'},
            {label: 'Billing', emoji: '💳'},
            {label: 'Settings', emoji: '⚙️'},
          ].map((item) => (
            <div key={item.label} style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', color: 'rgba(255,255,255,0.65)', fontSize: '14px', cursor: 'pointer', marginBottom: '2px'}}>
              <span>{item.emoji}</span>{item.label}
            </div>
          ))}
        </nav>
        <div style={{padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', cursor: 'pointer'}} onClick={() => router.push('/')}>
            <div style={{width: '34px', height: '34px', borderRadius: '8px', background: '#7dcf9a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'}}>🏠</div>
            <div>
              <div style={{fontSize: '13px', color: '#fff', fontWeight: '500'}}>Back to app</div>
              <div style={{fontSize: '11px', color: 'rgba(255,255,255,0.45)'}}>nearme home</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{marginLeft: '240px', flex: 1}}>
        <div style={{background: '#fff', borderBottom: '1px solid #e8e4de', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10}}>
          <div style={{fontFamily: 'Georgia, serif', fontSize: '20px'}}>Dashboard</div>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <span style={{background: '#eaf5ec', color: '#2d7a3a', fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '100px'}}>● Live — 1 campaign running</span>
            <button style={{background: '#e85d2f', color: '#fff', border: 'none', borderRadius: '100px', padding: '9px 20px', fontWeight: '600', fontSize: '13px', cursor: 'pointer'}}>+ New Campaign</button>
          </div>
        </div>

        <div style={{padding: '28px 32px 60px'}}>
          {success && (
            <div style={{background: '#eaf5ec', border: '1px solid #b7e4c7', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', fontSize: '14px', color: '#2d7a3a', fontWeight: '600'}}>
              🎉 Payment successful! Your plan is now active.
            </div>
          )}

          {/* STATS */}
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px'}}>
            {[
              {label: 'Reach this week', value: '4,280', sub: '↑ 18% vs last week', up: true},
              {label: 'Clicks', value: '347', sub: '↑ 8.1% CTR', up: true},
              {label: 'Ad spend (NZD)', value: '$49', sub: '$199/mo plan', up: false},
              {label: 'Cost per click', value: '$0.14', sub: 'vs Meta avg $1.80', up: true},
            ].map((stat) => (
              <div key={stat.label} style={{background: '#fff', border: '1px solid #e8e4de', borderRadius: '14px', padding: '20px 22px'}}>
                <div style={{fontSize: '12px', color: '#8a8a8a', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em'}}>{stat.label}</div>
                <div style={{fontFamily: 'Georgia, serif', fontSize: '28px', marginBottom: '4px'}}>{stat.value}</div>
                <div style={{fontSize: '12px', color: stat.up ? '#2d7a3a' : '#8a8a8a'}}>{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* PLANS */}
          <div style={{marginBottom: '16px'}}>
            <div style={{fontFamily: 'Georgia, serif', fontSize: '20px', marginBottom: '4px'}}>Ad plans</div>
            <div style={{fontSize: '14px', color: '#8a8a8a'}}>Simple, local pricing — no algorithm tax.</div>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px'}}>
            {[
              {name: 'Starter', price: '$49', desc: 'Perfect for testing the waters', features: ['Sponsored Strip slot', 'Up to 5 km radius', '~1,200 local users/mo', 'Basic analytics'], popular: false},
              {name: 'Growth', price: '$199', desc: 'For businesses ready to grow', features: ['Strip + Feed Ad placements', 'Up to 20 km radius', '~8,000 local users/mo', 'Full analytics + CTR', 'Priority placement'], popular: true},
              {name: 'Premier', price: '$499', desc: 'Maximum local visibility', features: ['All placements incl. Banner', 'Up to 50 km radius', '~25,000 local users/mo', 'Advanced analytics', 'Dedicated support'], popular: false},
            ].map((plan) => (
              <div key={plan.name} style={{background: '#fff', border: `1.5px solid ${plan.popular ? '#1a3a2a' : '#e8e4de'}`, borderRadius: '14px', padding: '22px 20px', position: 'relative'}}>
                {plan.popular && <div style={{position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)', background: '#1a3a2a', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '3px 12px', borderRadius: '0 0 8px 8px'}}>Most popular</div>}
                <div style={{fontSize: '13px', fontWeight: '600', color: '#8a8a8a', marginBottom: '8px', textTransform: 'uppercase'}}>{plan.name}</div>
                <div style={{fontFamily: 'Georgia, serif', fontSize: '30px', marginBottom: '4px'}}>{plan.price} <span style={{fontFamily: 'DM Sans, sans-serif', fontSize: '14px', color: '#8a8a8a'}}>/mo</span></div>
                <div style={{fontSize: '13px', color: '#8a8a8a', marginBottom: '14px'}}>{plan.desc}</div>
                <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px'}}>
                  {plan.features.map(f => (
                    <li key={f} style={{fontSize: '13px', color: '#4a4a4a', display: 'flex', alignItems: 'center', gap: '7px'}}>
                      <span style={{color: '#4a8c5c', fontWeight: '700'}}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handlePlanClick(plan.name)} style={{width: '100%', marginTop: '18px', borderRadius: '100px', padding: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', border: plan.popular ? 'none' : '1.5px solid #e8e4de', background: plan.popular ? '#1a3a2a' : 'transparent', color: plan.popular ? '#fff' : '#1a1a1a'}}>
                  {plan.popular ? 'Subscribe now' : 'Get started'}
                </button>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{background: 'linear-gradient(135deg, #1a3a2a, #4a8c5c)', borderRadius: '14px', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div>
              <div style={{fontFamily: 'Georgia, serif', fontSize: '22px', color: '#fff', marginBottom: '8px'}}>Ready to reach more locals?</div>
              <div style={{fontSize: '14px', color: 'rgba(255,255,255,0.75)'}}>Start your first campaign today. Cancel anytime.</div>
            </div>
            <button onClick={() => handlePlanClick('Starter')} style={{background: '#fff', color: '#1a3a2a', border: 'none', borderRadius: '100px', padding: '12px 24px', fontWeight: '700', fontSize: '14px', cursor: 'pointer'}}>Get started →</button>
          </div>
        </div>
      </div>
    </div>
  )
}