'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import BottomNav from '../../components/BottomNav'

export default function CommunityPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('General')
  const [suburb, setSuburb] = useState('')
  const [posting, setPosting] = useState(false)
  const [postMsg, setPostMsg] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    fetchPosts()
  }, [activeCategory])

  const fetchPosts = async () => {
    setLoading(true)
    let query = supabase.from('community_posts').select('*').order('created_at', { ascending: false }).limit(30)
    if (activeCategory !== 'All') query = query.eq('category', activeCategory)
    const { data } = await query
    if (data) setPosts(data)
    setLoading(false)
  }

  const handlePost = async () => {
    if (!user) { router.push('/auth'); return }
    if (!title.trim()) { setPostMsg('Please add a title'); return }
    setPosting(true)

    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject)
    }).catch(() => null)

    const { error } = await supabase.from('community_posts').insert({
      user_id: user.id,
      title: title.trim(),
      content: content.trim(),
      category,
      suburb: suburb.trim() || null,
      latitude: pos?.coords.latitude ?? null,
      longitude: pos?.coords.longitude ?? null,
    })

    if (!error) {
      setTitle('')
      setContent('')
      setSuburb('')
      setCategory('General')
      setShowForm(false)
      setPostMsg('')
      fetchPosts()
    } else {
      setPostMsg('Error posting. Try again.')
    }
    setPosting(false)
  }

  const handleLike = async (post: any) => {
    await supabase.from('community_posts').update({ likes: (post.likes || 0) + 1 }).eq('id', post.id)
    setPosts(posts.map(p => p.id === post.id ? { ...p, likes: (p.likes || 0) + 1 } : p))
  }

  const categories = ['All', 'General', 'Lost & Found', 'For Free', 'Events', 'Safety', 'Help Needed', 'Recommendations']

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#faf8f4", minHeight: "100vh", paddingBottom: "80px" }}>
      <nav style={{ background: "#1a3a2a", padding: "0 24px", height: "58px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div onClick={() => router.push('/')} style={{ fontFamily: "Georgia, serif", fontSize: "22px", color: "#fff", cursor: "pointer" }}>
          near<span style={{ color: "#7dcf9a", fontStyle: "italic" }}>me</span>
        </div>
        <button onClick={() => user ? setShowForm(!showForm) : router.push('/auth')} style={{ background: "#e85d2f", color: "#fff", border: "none", borderRadius: "100px", padding: "8px 18px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
          + Post
        </button>
      </nav>

      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg, #1a3a2a, #2d5a3d)", padding: "24px", textAlign: "center" }}>
        <div style={{ fontSize: "32px", marginBottom: "8px" }}>🏘️</div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "24px", color: "#fff", marginBottom: "6px" }}>Community</h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>What's happening in your neighbourhood?</p>
      </div>

      {/* POST FORM */}
      {showForm && (
        <div style={{ background: "#fff", borderBottom: "1px solid #e8e4de", padding: "20px 24px" }}>
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Share with your neighbours</div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
              {['General', 'Lost & Found', 'For Free', 'Events', 'Safety', 'Help Needed', 'Recommendations'].map((cat) => (
                <button key={cat} onClick={() => setCategory(cat)} style={{ border: category === cat ? 'none' : '1.5px solid #e8e4de', borderRadius: "100px", padding: "5px 12px", fontSize: "12px", background: category === cat ? '#1a3a2a' : '#fff', color: category === cat ? '#fff' : '#4a4a4a', cursor: "pointer" }}>{cat}</button>
              ))}
            </div>

            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (e.g. Lost cat in Silverdale)" style={{ width: "100%", border: "1.5px solid #e8e4de", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", outline: "none", boxSizing: "border-box", marginBottom: "10px" }} />

            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Tell your neighbours more... (optional)" rows={3} style={{ width: "100%", border: "1.5px solid #e8e4de", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", outline: "none", boxSizing: "border-box", resize: "vertical", marginBottom: "10px" }} />

            <input value={suburb} onChange={e => setSuburb(e.target.value)} placeholder="Your suburb (optional)" style={{ width: "100%", border: "1.5px solid #e8e4de", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", outline: "none", boxSizing: "border-box", marginBottom: "14px" }} />

            {postMsg && <div style={{ fontSize: "13px", color: "#c0392b", marginBottom: "10px" }}>{postMsg}</div>}

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handlePost} disabled={posting} style={{ flex: 1, background: "#1a3a2a", color: "#fff", border: "none", borderRadius: "100px", padding: "11px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
                {posting ? 'Posting...' : 'Post to community'}
              </button>
              <button onClick={() => setShowForm(false)} style={{ background: "transparent", color: "#8a8a8a", border: "1.5px solid #e8e4de", borderRadius: "100px", padding: "11px 20px", fontSize: "14px", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORIES */}
      <div style={{ padding: "12px 24px", display: "flex", gap: "8px", overflowX: "auto", scrollbarWidth: "none" }}>
        {categories.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{ border: activeCategory === cat ? "none" : "1.5px solid #e8e4de", borderRadius: "100px", padding: "6px 14px", fontSize: "12px", background: activeCategory === cat ? "#1a3a2a" : "#fff", color: activeCategory === cat ? "#fff" : "#4a4a4a", cursor: "pointer", whiteSpace: "nowrap" }}>{cat}</button>
        ))}
      </div>

      {/* POSTS */}
      <div style={{ padding: "0 24px 20px", maxWidth: "700px", margin: "0 auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#8a8a8a" }}>Loading...</div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#8a8a8a" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏘️</div>
            <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "6px" }}>No posts yet</div>
            <div style={{ fontSize: "14px", marginBottom: "16px" }}>Be the first to post in your community!</div>
            <button onClick={() => user ? setShowForm(true) : router.push('/auth')} style={{ background: "#1a3a2a", color: "#fff", border: "none", borderRadius: "100px", padding: "10px 24px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Post something</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {posts.map((post) => {
              const categoryEmoji: any = {
                'General': '💬', 'Lost & Found': '🔍', 'For Free': '🎁',
                'Events': '🎉', 'Safety': '⚠️', 'Help Needed': '🙋', 'Recommendations': '⭐'
              }
              return (
                <div key={post.id} style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e8e4de", padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <span style={{ fontSize: "18px" }}>{categoryEmoji[post.category] || '💬'}</span>
                    <span style={{ fontSize: "11px", background: "#e8f4f0", color: "#1a3a2a", padding: "2px 8px", borderRadius: "100px", fontWeight: "500" }}>{post.category}</span>
                    {post.suburb && <span style={{ fontSize: "11px", color: "#8a8a8a" }}>📍 {post.suburb}</span>}
                    <span style={{ fontSize: "11px", color: "#8a8a8a", marginLeft: "auto" }}>{new Date(post.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: "600", marginBottom: post.content ? "8px" : "0" }}>{post.title}</div>
                  {post.content && <div style={{ fontSize: "13px", color: "#4a4a4a", lineHeight: "1.6", marginBottom: "12px" }}>{post.content}</div>}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button onClick={() => handleLike(post)} style={{ background: "none", border: "none", fontSize: "13px", color: "#8a8a8a", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                      👍 {post.likes || 0}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}