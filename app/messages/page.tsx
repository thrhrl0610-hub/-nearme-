'use client'
import { Suspense } from 'react'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import BottomNav from '../../components/BottomNav'
import ReportModal from '../../components/ReportModal'

function MessagesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const listingId = searchParams.get('listing')
  const receiverId = searchParams.get('receiver')

  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [conversations, setConversations] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [newMessage, setNewMessage] = useState('')
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showBlockConfirm, setShowBlockConfirm] = useState(false)
  const [blockLoading, setBlockLoading] = useState(false)
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set())
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      setUser(user)

      // 내가 차단한 유저 목록
      const { data: blockedData } = await supabase.from('blocked_users').select('blocked_id').eq('blocker_id', user.id)
      const blockedSet = new Set((blockedData || []).map((b: any) => b.blocked_id))
      setBlockedIds(blockedSet)

      const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('read', false)
      setUnreadCount(count || 0)

      if (listingId) {
        const { data } = await supabase.from('listings').select('*').eq('id', listingId).single()
        if (data) setListing(data)
        await fetchMessages(user.id)
      } else {
        const { data } = await supabase.from('messages').select('*, listings(title, price)').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order('created_at', { ascending: false })
        if (data) {
          // 차단된 유저와의 대화 제외
          const filtered = data.filter((m: any) => {
            const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id
            return !blockedSet.has(otherId)
          })
          const seen = new Set()
          const unique = filtered.filter((m: any) => {
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
  }, [listingId, receiverId])

  const fetchMessages = async (userId: string) => {
    if (!listingId) return
    const { data } = await supabase.from('messages').select('*').eq('listing_id', listingId).or(`sender_id.eq.${userId},receiver_id.eq.${userId}`).order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB')
      return
    }
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSend = async () => {
    if ((!newMessage.trim() && !imageFile) || !user || !receiverId || !listingId) return

    setUploading(true)
    let imageUrl: string | null = null

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `messages/${user.id}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('listings')
        .upload(fileName, imageFile)

      if (uploadError) {
        alert('Failed to upload image: ' + uploadError.message)
        setUploading(false)
        return
      }

      const { data: urlData } = supabase.storage.from('listings').getPublicUrl(fileName)
      imageUrl = urlData.publicUrl
    }

    const { error } = await supabase.from('messages').insert({
      listing_id: listingId,
      sender_id: user.id,
      receiver_id: receiverId,
      content: newMessage.trim() || '',
      image_url: imageUrl
    })

    if (!error) {
      await supabase.from('notifications').insert({
        user_id: receiverId,
        type: 'message',
        message: imageUrl ? `You have a new photo about "${listing?.title || 'a listing'}"` : `You have a new message about "${listing?.title || 'a listing'}"`,
        listing_id: listingId
      })
      setNewMessage('')
      setImageFile(null)
      setImagePreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      await fetchMessages(user.id)
    }
    setUploading(false)
  }

  const handleBlock = async () => {
    if (!user || !receiverId) return
    setBlockLoading(true)
    await supabase.from('blocked_users').insert({ blocker_id: user.id, blocked_id: receiverId })
    setBlockLoading(false)
    setShowBlockConfirm(false)
    setShowMenu(false)
    router.push('/messages')
  }

  if (loading) return <div style={{ minHeight: '100vh', background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a8a8a' }}>Loading...</div>

  // 차단된 유저와의 채팅방이면 진입 차단
  if (receiverId && blockedIds.has(receiverId)) {
    return (
      <main style={{ minHeight: '100vh', background: '#faf8f4', display: 'flex', flexDirection: 'column' }}>
        <nav style={{ background: '#1a3a2a', padding: '0 24px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div onClick={() => router.push('/')} style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#fff', cursor: 'pointer' }}>
            near<span style={{ color: '#7dcf9a', fontStyle: 'italic' }}>me</span>
          </div>
          <button onClick={() => router.push('/messages')} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '100px', padding: '8px 18px', fontSize: '13px', cursor: 'pointer' }}>← Back</button>
        </nav>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚫</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>User blocked</div>
            <div style={{ fontSize: '14px', color: '#4a4a4a', lineHeight: '1.5' }}>You've blocked this user. To unblock, visit their profile.</div>
          </div>
        </div>
      </main>
    )
  }

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
              <div key={conv.id} onClick={() => router.push(`/messages?listing=${conv.listing_id}&receiver=${conv.sender_id === user?.id ? conv.receiver_id : conv.sender_id}`)} style={{ background: '#fff', border: '1px solid #e8e4de', borderRadius: '14px', padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#e8f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>💬</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '3px' }}>{conv.listings?.title || 'Listing'}</div>
                  <div style={{ fontSize: '13px', color: '#8a8a8a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.image_url ? '📷 Photo' : conv.content}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )

  // 채팅방 화면
  return (
    <main style={{ minHeight: '100vh', background: '#faf8f4', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: '#1a3a2a', padding: '0 24px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div onClick={() => router.push('/')} style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#fff', cursor: 'pointer' }}>
          near<span style={{ color: '#7dcf9a', fontStyle: 'italic' }}>me</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
          {receiverId && (
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ⋮
            </button>
          )}
          <button onClick={() => router.push('/messages')} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '100px', padding: '8px 18px', fontSize: '13px', cursor: 'pointer' }}>← Back</button>
          {showMenu && (
            <div style={{ position: 'absolute', top: '44px', right: '0', background: '#fff', border: '1px solid #e8e4de', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '6px', minWidth: '180px', zIndex: 100 }}>
              <div
                onClick={() => {
                  setShowMenu(false)
                  router.push(`/user/${receiverId}`)
                }}
                style={{ padding: '10px 14px', fontSize: '14px', color: '#1a3a2a', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                👤 View profile
              </div>
              <div
                onClick={() => {
                  setShowMenu(false)
                  setShowReportModal(true)
                }}
                style={{ padding: '10px 14px', fontSize: '14px', color: '#c0392b', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                🚩 Report user
              </div>
              <div
                onClick={() => {
                  setShowMenu(false)
                  setShowBlockConfirm(true)
                }}
                style={{ padding: '10px 14px', fontSize: '14px', color: '#c0392b', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                🚫 Block user
              </div>
            </div>
          )}
        </div>
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
              <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {msg.image_url && (
                  <img
                    src={msg.image_url}
                    alt="Message attachment"
                    onClick={() => window.open(msg.image_url, '_blank')}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '240px',
                      borderRadius: '14px',
                      cursor: 'pointer',
                      objectFit: 'cover',
                      border: msg.sender_id === user?.id ? 'none' : '1px solid #e8e4de'
                    }}
                  />
                )}
                {msg.content && (
                  <div style={{ padding: '10px 14px', borderRadius: '14px', fontSize: '14px', background: msg.sender_id === user?.id ? '#1a3a2a' : '#fff', color: msg.sender_id === user?.id ? '#fff' : '#1a1a1a', border: msg.sender_id === user?.id ? 'none' : '1px solid #e8e4de', wordBreak: 'break-word' }}>
                    {msg.content}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {imagePreview && (
        <div style={{ background: '#fff', borderTop: '1px solid #e8e4de', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={imagePreview} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
          <div style={{ flex: 1, fontSize: '13px', color: '#4a4a4a' }}>Photo ready to send</div>
          <button
            onClick={() => {
              setImageFile(null)
              setImagePreview(null)
              if (fileInputRef.current) fileInputRef.current.value = ''
            }}
            style={{ background: '#fde8e8', color: '#c0392b', border: 'none', borderRadius: '100px', padding: '6px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
          >Remove</button>
        </div>
      )}

      <div style={{ background: '#fff', borderTop: '1px solid #e8e4de', padding: '12px 24px', display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{ background: '#f0ede5', color: '#1a3a2a', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '20px', cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          📷
        </button>
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !uploading && handleSend()}
          placeholder={imagePreview ? "Add a caption (optional)..." : "Type a message..."}
          disabled={uploading}
          style={{ flex: 1, border: '1.5px solid #e8e4de', borderRadius: '100px', padding: '10px 18px', fontSize: '14px', outline: 'none' }}
        />
        <button
          onClick={handleSend}
          disabled={uploading || (!newMessage.trim() && !imageFile)}
          style={{ background: uploading || (!newMessage.trim() && !imageFile) ? '#8a8a8a' : '#1a3a2a', color: '#fff', border: 'none', borderRadius: '100px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: uploading ? 'not-allowed' : 'pointer', flexShrink: 0 }}
        >
          {uploading ? '...' : 'Send'}
        </button>
      </div>

      {/* 차단 확인 모달 */}
      {showBlockConfirm && (
        <div onClick={() => setShowBlockConfirm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: '20px', padding: '24px', maxWidth: '400px', width: '100%', fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>Block this user?</div>
            <div style={{ fontSize: '14px', color: '#4a4a4a', lineHeight: '1.5', marginBottom: '20px' }}>
              You won't see their listings, messages, or profile. They won't be notified. You can unblock them anytime from their profile.
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowBlockConfirm(false)}
                style={{ flex: 1, background: '#f0ede5', color: '#4a4a4a', border: 'none', borderRadius: '100px', padding: '14px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleBlock}
                disabled={blockLoading}
                style={{ flex: 1, background: '#c0392b', color: '#fff', border: 'none', borderRadius: '100px', padding: '14px', fontSize: '14px', fontWeight: '600', cursor: blockLoading ? 'not-allowed' : 'pointer' }}
              >
                {blockLoading ? 'Blocking...' : 'Block user'}
              </button>
            </div>
          </div>
        </div>
      )}

      {receiverId && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          contentType="user"
          contentId={receiverId}
          reportedUserId={receiverId}
          userId={user?.id || null}
        />
      )}
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