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
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) { router.push('/profile'); return }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      setUser(user)
      const { data } = await supabase.from('listings').select('*').eq('id', id).eq('user_id', user.id).single()
      if (!data) { router.push('/profile'); return }
      setTitle(data.title || '')
      setDescription(data.description || '')
      setPrice(data.price?.toString() || '')
      setIsFree(data.price === 0)
      setCategory(data.category || 'Marketplace')
      const imgs = [data.image_url, ...(data.extra_images || [])].filter(Boolean)
      setExistingImages(imgs)
      setLoading(false)
    }
    fetchListing()
  }, [])

  const handleNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remaining = 5 - existingImages.length - newImages.length
    const toAdd = files.slice(0, remaining)
    setNewImages(prev => [...prev, ...toAdd])
    setNewImagePreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))])
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!title) { setMessage('Please add a title'); return }
    setSaving(true)
    setMessage('')

    const uploadedUrls: string[] = []
    for (const image of newImages) {
      const fileExt = image.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
      const { error } = await supabase.storage.from('listings').upload(fileName, image)
      if (!error) {
        const { data } = supabase.storage.from('listings').getPublicUrl(fileName)
        uploadedUrls.push(data.publicUrl)
      }
    }

    const allImages = [...existingImages, ...uploadedUrls]

    const { error } = await supabase.from('listings').update({
      title,
      description,
      price: isFree ? 0 : Number(price),
      category,
      image_url: allImages[0] || null,
      extra_images: allImages.slice(1),
    }).eq('id', id)

    if (error) setMessage('Error: ' + error.message)
    else { setMessage('Saved! ✅'); setTimeout(() => router.push('/profile'), 1000) }
    setSaving(false)
  }

  const totalImages = existingImages.length + newImages.length

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>Loading...</div>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#faf8f4', paddingBottom: '80px', fontFamily: "'DM Sans', sans-serif" }}>
      <nav style={{ background: '#1a3a2a', padding: '0 24px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#fff' }}>
          near<span style={{ color: '#7dcf9a', fontStyle: 'italic' }}>me</span>
        </div>
        <button onClick={() => router.push('/profile')} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '100px', padding: '8px 18px', fontSize: '13px', cursor: 'pointer' }}>← Back</button>
      </nav>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', marginBottom: '4px' }}>Edit listing</div>
        <div style={{ fontSize: '14px', color: '#8a8a8a', marginBottom: '24px' }}>Update your listing details</div>

        {/* CATEGORY */}
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8e4de', padding: '20px', marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a4a4a', display: 'block', marginBottom: '10px' }}>Category</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Marketplace', 'Jobs', 'Services', 'Events', 'Real Estate', 'Free'].map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)} style={{ border: category === cat ? 'none' : '1.5px solid #e8e4de', borderRadius: '100px', padding: '7px 16px', fontSize: '14px', background: category === cat ? '#1a3a2a' : '#fff', color: category === cat ? '#fff' : '#4a4a4a', cursor: 'pointer' }}>{cat}</button>
            ))}
          </div>
        </div>

        {/* PHOTOS */}
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8e4de', padding: '20px', marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a4a4a', display: 'block', marginBottom: '4px' }}>Photos <span style={{ fontWeight: '400', color: '#8a8a8a' }}>(up to 5)</span></label>
          <div style={{ fontSize: '12px', color: '#8a8a8a', marginBottom: '12px' }}>First photo is the cover image</div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {existingImages.map((img, index) => (
              <div key={`existing-${index}`} style={{ position: 'relative', width: '80px', height: '80px' }}>
                <img src={img} alt={`existing ${index}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', border: index === 0 ? '2px solid #1a3a2a' : '1.5px solid #e8e4de' }} />
                {index === 0 && (
                  <div style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', background: '#1a3a2a', color: '#fff', fontSize: '9px', padding: '1px 6px', borderRadius: '100px', whiteSpace: 'nowrap' }}>Cover</div>
                )}
                <button onClick={() => removeExistingImage(index)} style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: '#c0392b', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>×</button>
              </div>
            ))}
            {newImagePreviews.map((preview, index) => (
              <div key={`new-${index}`} style={{ position: 'relative', width: '80px', height: '80px' }}>
                <img src={preview} alt={`new ${index}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', border: '1.5px solid #7dcf9a' }} />
                <div style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', background: '#4a8c5c', color: '#fff', fontSize: '9px', padding: '1px 6px', borderRadius: '100px', whiteSpace: 'nowrap' }}>New</div>
                <button onClick={() => removeNewImage(index)} style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: '#c0392b', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>×</button>
              </div>
            ))}
            {totalImages < 5 && (
              <div onClick={() => document.getElementById('newImageInput')?.click()} style={{ width: '80px', height: '80px', border: '2px dashed #e8e4de', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#faf8f4', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '24px' }}>📷</div>
                <div style={{ fontSize: '10px', color: '#8a8a8a' }}>Add</div>
              </div>
            )}
          </div>
          <input id="newImageInput" type="file" accept="image/*" multiple onChange={handleNewImages} style={{ display: 'none' }} />
        </div>

        {/* TITLE + DESCRIPTION */}
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8e4de', padding: '20px', marginBottom: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a4a4a', display: 'block', marginBottom: '8px' }}>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a4a4a', display: 'block', marginBottom: '8px' }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: "'DM Sans', sans-serif" }} />
          </div>
        </div>

        {/* PRICE */}
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8e4de', padding: '20px', marginBottom: '24px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a4a4a', display: 'block', marginBottom: '8px' }}>Price (NZD)</label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" type="number" disabled={isFree} style={{ flex: 1, border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', outline: 'none', opacity: isFree ? 0.4 : 1 }} />
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <input type="checkbox" checked={isFree} onChange={e => setIsFree(e.target.checked)} />
              Free
            </label>
          </div>
        </div>

        {message && (
          <div style={{ marginBottom: '16px', padding: '12px 16px', background: message.includes('Error') ? '#fde8e8' : '#e8f5e8', borderRadius: '10px', fontSize: '14px', color: message.includes('Error') ? '#c0392b' : '#2d7a2d' }}>{message}</div>
        )}

        <button onClick={handleSave} disabled={saving} style={{ width: '100%', background: '#1a3a2a', color: '#fff', border: 'none', borderRadius: '100px', padding: '14px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
          {saving ? 'Saving...' : 'Save changes'}
        </button>
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