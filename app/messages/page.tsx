'use client'
import { Suspense } from 'react'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

function MessagesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const listingId = searchParams.get('listing')
  const receiverId = searchParams.get('receiver')

  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [conversations, setConversations] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      setUser(user)

      if (listingId) {
        const { data } = await supabase.from('listings').select('*').eq('id', listingId).single()
        if (data) setListing(data)
        await fetchMessages(user.id)
      } else {
        // 채팅 목록 가져오기
        const { data } = await supabase
          .from('messages')
          .select('*, listings(title, price)')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
        if (data) {
          // 중복 제거 - listing_id 기준
          const seen = new Set()
          const unique = data.filter((m: any) => {
            if (seen.has(m.listing_id)) return false
            seen.add(m.listing_id)
            return true
          })
          setConversations(unique)
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const fetchMessages = async (userId: string) => {
    if (!listingId) return
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('listing_id', listingId)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !receiverId || !listingId) return
    const { error } = await supabase.from('messages').insert({
      listing_id: listingId,
      sender_id: user.id,
      receiver_id: receiverId,
      content: newMessage.trim()
    })
    if (!error) {
      setNewMessage('')
      await fetchMessages(user.id)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a8a8a' }}>Loading...</div>
  )

  // 채팅 목록 화면
  if (!listingId) return (
    <main style={{ minHeight: '100vh', background: '#faf8f4', paddingBottom: '80px' }}>
      <nav style={{ background: '#1a3a2a', padding: '0 24px', height: '58px', display: 'flex', alignItems: 'center' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#fff' }}>
          near<span style={{ color: '#7dcf9a', fontStyle: 'italic' }}>me</span>
        </div>
      </nav>

      <div style={{ padding: '20px 24px' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', marginBottom: '16px' }}>Messages</div>

        {conversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8a8a8a' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>No messages yet</div>
            <div style={{ fontSize: '14px' }}>Browse listings and message a seller to get started!</div>
            <button onClick={() => router.push('/browse')} style={{ marginTop: '16px', background: '#1a3a2a', color: '#fff', border: 'none', borderRadius: '100px', padding: '10px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Browse listings</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {conversations.map((conv) => (
              <div key={conv.id} onClick={() => router.push(`/messages?listing=${conv.listing_id}&receiver=${conv.sender_id === user?.id ? conv.receiver_id : conv.sender_id}`)}
                style={{ background: '#fff', border: '1px solid #e8e4de', borderRadius: '14px', padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#e8f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>💬</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '3px' }}>{conv.listings?.title || 'Listing'}</div>
                  <div style={{ fontSize: '13px', color: '#8a8a8a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.content}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #e8e4de', display: 'flex', justifyContent: 'space-around', padding: '8px 0 12px' }}>
        {[['🏠', 'Home', '/'], ['🔍', 'Browse', '/browse'], ['➕', 'Post', '/post'], ['💬', 'Chat', '/messages'], ['👤', 'Profile', '/profile']].map(([icon, label, href]) => (
          <div key={label} onClick={() => router.push(href as string)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', cursor: 'pointer', fontSize: '11px', color: label === 'Chat' ? '#1a3a2a' : '#8a8a8a' }}>
            <div style={{ fontSize: '22px' }}>{icon}</div>
            {label}
          </div>
        ))}
      </div>
    </main>
  )

  // 채팅방 화면
  return (
    <main style={{ minHeight: '100vh', background: '#faf8f4', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: '#1a3a2a', padding: '0 24px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div onClick={() => router.push('/')} style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#fff', cursor: 'pointer' }}>
          near<span style={{ color: '#7dcf9a', fontStyle: 'italic' }}>me</span>
        </div>
        <button onClick={() => router.push('/messages')} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '100px', padding: '8px 18px', fontSize: '13px', cursor: 'pointer' }}>← Back</button>
      </nav>

      {listing && (
        <div style={{ background: '#fff', borderBottom: '1px solid #e8e4de', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#e8f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', overflow: 'hidden', flexShrink: 0 }}>
            {listing.image_url ? <img src={listing.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>{listing.title}</div>
            <div style={{ fontSize: '13px', color: '#4a8c5c' }}>{listing.price === 0 ? 'Free' : `$${listing.price}`}</div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#8a8a8a', fontSize: '14px', marginTop: '40px' }}>No messages yet. Say hello! 👋</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender_id === user?.id ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: '14px', fontSize: '14px', background: msg.sender_id === user?.id ? '#1a3a2a' : '#fff', color: msg.sender_id === user?.id ? '#fff' : '#1a1a1a', border: msg.sender_id === user?.id ? 'none' : '1px solid #e8e4de' }}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ background: '#fff', borderTop: '1px solid #e8e4de', padding: '12px 24px', display: 'flex', gap: '10px', flexShrink: 0 }}>
        <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Type a message..." style={{ flex: 1, border: '1.5px solid #e8e4de', borderRadius: '100px', padding: '10px 18px', fontSize: '14px', outline: 'none' }} />
        <button onClick={handleSend} style={{ background: '#1a3a2a', color: '#fff', border: 'none', borderRadius: '100px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Send</button>
      </div>
    </main>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a8a8a' }}>Loading...</div>}>
      <MessagesContent />
    </Suspense>
  )
}