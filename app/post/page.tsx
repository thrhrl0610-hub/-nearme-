'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function PostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [isFree, setIsFree] = useState(false)
  const [category, setCategory] = useState('Marketplace')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/auth')
    }
    checkUser()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handlePost = async () => {
    setLoading(true)
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject)
    }).catch(() => null)
    const lat = pos?.coords.latitude ?? null
    const lng = pos?.coords.longitude ?? null
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    let image_url = null
    if (image) {
      const fileExt = image.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('listings').upload(fileName, image)
      if (uploadError) { setMessage('Image upload failed'); setLoading(false); return }
      const { data: urlData } = supabase.storage.from('listings').getPublicUrl(fileName)
      image_url = urlData.publicUrl
    }

    const { error } = await supabase.from('listings').insert({
      user_id: user.id, title, description,
      price: isFree ? 0 : Number(price),
      category, image_url, latitude: lat, longitude: lng,
    })

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Posted successfully! ✅')
      setTimeout(() => router.push('/'), 1500)
    }
    setLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh', background: '#faf8f4', paddingBottom: '40px' }}>
      {/* NAV */}
      <nav style={{ background: '#1a3a2a', padding: '0 24px', height: '58px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '100px', padding: '7px 14px', color: '#fff', fontSize: '13px', cursor: 'pointer' }}>← Back</button>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#fff' }}>
          near<span style={{ color: '#7dcf9a', fontStyle: 'italic' }}>me</span>
        </div>
      </nav>

      <div style={{ padding: '24px', maxWidth: '480px', margin: '0 auto' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#1a3a2a', marginBottom: '4px' }}>Post a listing</div>
        <div style={{ fontSize: '14px', color: '#8a8a8a', marginBottom: '24px' }}>Share something with your neighbours</div>

        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8e4de', padding: '20px', marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a4a4a', display: 'block', marginBottom: '10px' }}>Category</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Marketplace', 'Jobs', 'Services', 'Events', 'Real Estate', 'Free'].map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)} style={{ border: category === cat ? 'none' : '1.5px solid #e8e4de', borderRadius: '100px', padding: '7px 16px', fontSize: '14px', background: category === cat ? '#1a3a2a' : '#fff', color: category === cat ? '#fff' : '#4a4a4a', cursor: 'pointer' }}>{cat}</button>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8e4de', padding: '20px', marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a4a4a', display: 'block', marginBottom: '10px' }}>Photo</label>
          <div onClick={() => document.getElementById('imageInput')?.click()} style={{ border: '2px dashed #e8e4de', borderRadius: '12px', padding: '20px', textAlign: 'center', cursor: 'pointer', background: imagePreview ? 'transparent' : '#faf8f4' }}>
            {imagePreview
              ? <img src={imagePreview} alt="preview" style={{ width: '100%', borderRadius: '8px', maxHeight: '200px', objectFit: 'cover' }} />
              : <div style={{ color: '#8a8a8a', fontSize: '14px' }}>📷 Tap to add photo</div>
            }
          </div>
          <input id="imageInput" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
        </div>

        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8e4de', padding: '20px', marginBottom: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a4a4a', display: 'block', marginBottom: '8px' }}>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What are you selling?" style={{ width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a4a4a', display: 'block', marginBottom: '8px' }}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your item..." rows={3} style={{ width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8e4de', padding: '20px', marginBottom: '24px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a4a4a', display: 'block', marginBottom: '8px' }}>Price (NZD)</label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" type="number" disabled={isFree} style={{ flex: 1, border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', outline: 'none', opacity: isFree ? 0.4 : 1 }} />
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} />
              Free
            </label>
          </div>
        </div>

        {message && (
          <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#e8f5e8', borderRadius: '10px', fontSize: '14px', color: '#2d7a2d' }}>{message}</div>
        )}

        <button onClick={handlePost} disabled={loading} style={{ width: '100%', background: '#1a3a2a', color: '#fff', border: 'none', borderRadius: '100px', padding: '14px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
          {loading ? 'Posting...' : 'Post listing'}
        </button>
      </div>
    </main>
  )
}