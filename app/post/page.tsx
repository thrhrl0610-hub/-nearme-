'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function PostPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('Marketplace')
  const [isFree, setIsFree] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const categories = ['Marketplace', 'Jobs', 'Services', 'Events', 'Real Estate', 'Free']

  const handlePost = async () => {
    setLoading(true)
    setMessage('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setMessage('Please sign in first')
      setLoading(false)
      return
    }
    const { error } = await supabase.from('listings').insert({
      user_id: user.id,
      title,
      description,
      price: isFree ? 0 : parseFloat(price),
      category,
      is_free: isFree,
      location_name: 'Silverdale, Auckland',
      lat: -36.6167,
      lng: 174.6667,
    })
    if (error) setMessage(error.message)
    else setMessage('Posted successfully! ✅')
    setLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh', background: '#faf8f4', paddingBottom: '40px' }}>
      <nav style={{
        background: '#1a3a2a', padding: '0 24px', height: '58px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <a href="/" style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#fff', textDecoration: 'none' }}>
          near<span style={{ color: '#7dcf9a', fontStyle: 'italic' }}>me</span>
        </a>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Post a listing</div>
      </nav>

      <div style={{ maxWidth: '600px', margin: '32px auto', padding: '0 24px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', marginBottom: '24px' }}>
          What are you posting?
        </h1>

        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8e4de', padding: '28px' }}>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a4a4a', display: 'block', marginBottom: '8px' }}>Category</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)} style={{
                  padding: '7px 14px', borderRadius: '100px', fontSize: '13px',
                  border: '1.5px solid', cursor: 'pointer',
                  borderColor: category === cat ? '#1a3a2a' : '#e8e4de',
                  background: category === cat ? '#1a3a2a' : '#fff',
                  color: category === cat ? '#fff' : '#4a4a4a',
                }}>{cat}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a4a4a', display: 'block', marginBottom: '8px' }}>Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Trek mountain bike — barely used"
              style={{
                width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px',
                padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a4a4a', display: 'block', marginBottom: '8px' }}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your item..."
              rows={4}
              style={{
                width: '100%', border: '1.5px solid #e8e4de', borderRadius: '8px',
                padding: '10px 14px', fontSize: '14px', outline: 'none',
                boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a4a4a', display: 'block', marginBottom: '8px' }}>Price (NZD)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0.00"
                disabled={isFree}
                type="number"
                style={{
                  flex: 1, border: '1.5px solid #e8e4de', borderRadius: '8px',
                  padding: '10px 14px', fontSize: '14px', outline: 'none',
                  boxSizing: 'border-box', opacity: isFree ? 0.5 : 1
                }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                <input type="checkbox" checked={isFree} onChange={e => setIsFree(e.target.checked)} />
                Free
              </label>
            </div>
          </div>

          {message && (
            <div style={{
              marginBottom: '16px', padding: '10px 14px',
              background: message.includes('✅') ? '#e8f5e8' : '#fde8e8',
              borderRadius: '8px', fontSize: '13px',
              color: message.includes('✅') ? '#2d7a2d' : '#b03030'
            }}>{message}</div>
          )}

          <button
            onClick={handlePost}
            disabled={loading || !title}
            style={{
              width: '100%', background: '#1a3a2a', color: '#fff',
              border: 'none', borderRadius: '100px', padding: '14px',
              fontSize: '15px', fontWeight: '600', cursor: 'pointer',
              opacity: !title ? 0.5 : 1
            }}
          >
            {loading ? 'Posting...' : 'Post listing'}
          </button>
        </div>
      </div>
    </main>
  )
}