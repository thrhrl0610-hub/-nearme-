'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { Suspense } from 'react'

function EditListingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [isFree, setIsFree] = useState(false)
  const [category, setCategory] = useState('Marketplace')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) { router.push('/profile'); return }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      const { data } = await supabase.from('listings').select('*').eq('id', id).eq('user_id', user.id).single()
      if (!data) { router.push('/profile'); return }
      setTitle(data.title || '')
      setDescription(data.description || '')
      setPrice(data.price?.toString() || '')
      setIsFree(data.price === 0)
      setCategory(data.category || 'Marketplace')
      setLoading(false)
    }
    fetchListing()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('listings').update({
      title, description,
      price: isFree ? 0 : Number(price),
      category
    }).eq('id', id)
    if (error) setMessage('Error saving: ' + error.message)
    else { setMessage('Saved! ✅'); setTimeout(() => router.push('/profile'), 1000) }
    setSaving(false)
  }

  if (loading) return <div style={{ minHeight: '100vh', background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>

  return (
    <main style={{ minHeight: '100vh', background: '#faf8f4', paddingBottom: '80px' }}>
      <nav style={{ background: '#1a3a2a', padding: '0 24px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#fff' }}>
          near<span style={{ color: '#7dcf9a', fontStyle: 'italic' }}>me</span>
        </div>
        <button onClick={() => router.push('/profile')} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '100px', padding: '8px 18px', fontSize: '13px', cursor: 'pointer' }}>← Back</button>
      </nav>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', marginBottom: '24px' }}>Edit listing</div>

        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8e4de', padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#4a4a4a', display: 'block', marginBottom: '6px' }}>Category</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['Marketplace', 'Jobs', 'Services', 'Events', 'Real Estate', 'Free'].map((cat) => (
                <button key={cat} onClick={() => setCategory(cat)} style={{ border: category === cat ? 'none' : '1.5px solid #e8e4de', borderRadius: '100px', padding: '6px 14px', fontSize: '13px', background: category === cat ? '#1a3a2a' : '#fff', color: category === cat ? '#fff' : '#4a4a4a', cursor: 'pointer' }}>{cat}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#4a4a4a', display: 'block', marginBottom: '6px' }}>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#4a4a4a', display: 'block', marginBottom: '6px' }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#4a4a4a', display: 'block', marginBottom: '6px' }}>Price (NZD)</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" type="number" disabled={isFree} style={{ flex: 1, border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', opacity: isFree ? 0.4 : 1 }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                <input type="checkbox" checked={isFree} onChange={e => setIsFree(e.target.checked)} />
                Free
              </label>
            </div>
          </div>

          {message && <div style={{ marginBottom: '16px', padding: '10px 14px', background: '#e8f5e8', borderRadius: '8px', fontSize: '13px', color: '#2d7a2d' }}>{message}</div>}

          <button onClick={handleSave} disabled={saving} style={{ width: '100%', background: '#1a3a2a', color: '#fff', border: 'none', borderRadius: '100px', padding: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </main>
  )
}

export default function EditListingPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <EditListingContent />
    </Suspense>
  )
}