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
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isBusiness, setIsBusiness] = useState(false)

  // Jobs 전용 필드
  const [company, setCompany] = useState('')
  const [payRate, setPayRate] = useState('')
  const [jobType, setJobType] = useState('Part-time')
  const [isUrgent, setIsUrgent] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      const { data: profile } = await supabase.from('profiles').select('is_business').eq('id', user.id).single()
      if (profile?.is_business) setIsBusiness(true)
    }
    checkUser()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    const remaining = 5 - images.length
    const toAdd = files.slice(0, remaining)
    setImages(prev => [...prev, ...toAdd])
    setImagePreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))])
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handlePost = async () => {
    if (!title) { setMessage('Please add a title'); return }
    setLoading(true)
    setMessage('')

    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject)
    }).catch(() => null)
    const lat = pos?.coords.latitude ?? null
    const lng = pos?.coords.longitude ?? null

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    if (category === 'Jobs') {
      const { error } = await supabase.from('jobs').insert({
        user_id: user.id,
        title,
        description,
        company: company || 'Private',
        pay_rate: payRate || 'Negotiable',
        job_type: jobType,
        is_urgent: isBusiness ? isUrgent : false,
        location_name: null,
        lat,
        lng,
      })
      if (error) setMessage('Error: ' + error.message)
      else { setMessage('Job posted! ✅'); setTimeout(() => router.push('/'), 1500) }
    } else {
      const imageUrls: string[] = []
      for (const image of images) {
        const fileExt = image.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('listings').upload(fileName, image)
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('listings').getPublicUrl(fileName)
          imageUrls.push(urlData.publicUrl)
        }
      }
      const { error } = await supabase.from('listings').insert({
        user_id: user.id,
        title,
        description,
        price: isFree ? 0 : Number(price),
        category,
        image_url: imageUrls[0] || null,
        extra_images: imageUrls.slice(1),
        latitude: lat,
        longitude: lng,
      })
      if (error) setMessage('Error: ' + error.message)
      else { setMessage('Posted successfully! ✅'); setTimeout(() => router.push('/'), 1500) }
    }
    setLoading(false)
  }

  const isJob = category === 'Jobs'

  return (
    <main style={{ minHeight: '100vh', background: '#faf8f4', paddingBottom: '40px', fontFamily: "'DM Sans', sans-serif" }}>
      <nav style={{ background: '#1a3a2a', padding: '0 24px', height: '58px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '100px', padding: '7px 14px', color: '#fff', fontSize: '13px', cursor: 'pointer' }}>← Back</button>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#fff' }}>
          near<span style={{ color: '#7dcf9a', fontStyle: 'italic' }}>me</span>
        </div>
      </nav>

      <div style={{ padding: '24px', maxWidth: '480px', margin: '0 auto' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#1a3a2a', marginBottom: '4px' }}>
          {isJob ? 'Post a job' : 'Post a listing'}
        </div>
        <div style={{ fontSize: '14px', color: '#8a8a8a', marginBottom: '24px' }}>
          {isJob ? 'Find someone local for the job' : 'Share something with your neighbours'}
        </div>

        {/* CATEGORY */}
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8e4de', padding: '20px', marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a4a4a', display: 'block', marginBottom: '10px' }}>Category</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Marketplace', 'Jobs', 'Services', 'Events', 'Real Estate', 'Free'].map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)} style={{ border: category === cat ? 'none' : '1.5px solid #e8e4de', borderRadius: '100px', padding: '7px 16px', fontSize: '14px', background: category === cat ? '#1a3a2a' : '#fff', color: category === cat ? '#fff' : '#4a4a4a', cursor: 'pointer' }}>{cat}</button>
            ))}
          </div>
        </div>

        {/* JOBS 전용 폼 */}
        {isJob && (
          <>
            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8e4de', padding: '20px', marginBottom: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a4a4a', display: 'block', marginBottom: '8px' }}>Job title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Kitchen hand needed" style={{ width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a4a4a', display: 'block', marginBottom: '8px' }}>
                  Company / Name <span style={{ fontWeight: '400', color: '#8a8a8a' }}>(optional)</span>
                </label>
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. The Orchard Bar or Private" style={{ width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a4a4a', display: 'block', marginBottom: '8px' }}>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What does the job involve? Hours, requirements..." rows={4} style={{ width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: "'DM Sans', sans-serif" }} />
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8e4de', padding: '20px', marginBottom: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a4a4a', display: 'block', marginBottom: '8px' }}>
                  Pay rate <span style={{ fontWeight: '400', color: '#8a8a8a' }}>(optional)</span>
                </label>
                <input value={payRate} onChange={e => setPayRate(e.target.value)} placeholder="e.g. $25/hr or $200/day or Negotiable" style={{ width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: isBusiness ? '16px' : '0' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a4a4a', display: 'block', marginBottom: '10px' }}>Job type</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Part-time', 'Full-time', 'Help needed'].map((type) => (
                    <button key={type} onClick={() => setJobType(type)} style={{ border: jobType === type ? 'none' : '1.5px solid #e8e4de', borderRadius: '100px', padding: '7px 16px', fontSize: '13px', background: jobType === type ? '#1a3a2a' : '#fff', color: jobType === type ? '#fff' : '#4a4a4a', cursor: 'pointer' }}>{type}</button>
                  ))}
                </div>
              </div>

              {/* Urgent - 비즈니스만 */}
              {isBusiness && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fde8e8', borderRadius: '10px', padding: '12px 16px', cursor: 'pointer', marginTop: '16px' }} onClick={() => setIsUrgent(!isUrgent)}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: `2px solid ${isUrgent ? '#c0392b' : '#e8e4de'}`, background: isUrgent ? '#c0392b' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {isUrgent && <span style={{ color: '#fff', fontSize: '12px' }}>✓</span>}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#c0392b' }}>🔴 Mark as Urgent</div>
                    <div style={{ fontSize: '12px', color: '#8a8a8a' }}>Need someone ASAP? Get priority placement</div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* 일반 리스팅 폼 */}
        {!isJob && (
          <>
            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8e4de', padding: '20px', marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a4a4a', display: 'block', marginBottom: '4px' }}>Photos <span style={{ fontWeight: '400', color: '#8a8a8a' }}>(up to 5)</span></label>
              <div style={{ fontSize: '12px', color: '#8a8a8a', marginBottom: '12px' }}>First photo is the cover image</div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {imagePreviews.map((preview, index) => (
                  <div key={index} style={{ position: 'relative', width: '80px', height: '80px' }}>
                    <img src={preview} alt={`preview ${index}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', border: index === 0 ? '2px solid #1a3a2a' : '1.5px solid #e8e4de' }} />
                    {index === 0 && <div style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', background: '#1a3a2a', color: '#fff', fontSize: '9px', padding: '1px 6px', borderRadius: '100px', whiteSpace: 'nowrap' }}>Cover</div>}
                    <button onClick={() => removeImage(index)} style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: '#c0392b', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>×</button>
                  </div>
                ))}
                {images.length < 5 && (
                  <div onClick={() => document.getElementById('imageInput')?.click()} style={{ width: '80px', height: '80px', border: '2px dashed #e8e4de', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#faf8f4', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '24px' }}>📷</div>
                    <div style={{ fontSize: '10px', color: '#8a8a8a' }}>Add</div>
                  </div>
                )}
              </div>
              <input id="imageInput" type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: 'none' }} />
            </div>

            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8e4de', padding: '20px', marginBottom: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a4a4a', display: 'block', marginBottom: '8px' }}>Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="What are you selling?" style={{ width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a4a4a', display: 'block', marginBottom: '8px' }}>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your item..." rows={3} style={{ width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: "'DM Sans', sans-serif" }} />
              </div>
            </div>

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
          </>
        )}

        {message && (
          <div style={{ marginBottom: '16px', padding: '12px 16px', background: message.includes('Error') ? '#fde8e8' : '#e8f5e8', borderRadius: '10px', fontSize: '14px', color: message.includes('Error') ? '#c0392b' : '#2d7a2d' }}>{message}</div>
        )}

        <button onClick={handlePost} disabled={loading} style={{ width: '100%', background: '#1a3a2a', color: '#fff', border: 'none', borderRadius: '100px', padding: '14px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
          {loading ? 'Posting...' : isJob ? 'Post job' : 'Post listing'}
        </button>
      </div>
    </main>
  )
}