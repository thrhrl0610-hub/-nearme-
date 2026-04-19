'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function DeleteAccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [pendingDeletion, setPendingDeletion] = useState<any>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase.from('account_deletion_requests').select('*').eq('user_id', user.id).eq('status', 'pending').maybeSingle()
        if (data) setPendingDeletion(data)
      }
      setLoading(false)
    }
    init()
  }, [])

  const handleRequestDeletion = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm')
      return
    }
    setDeleteLoading(true)
    setDeleteError('')

    const { error } = await supabase.from('account_deletion_requests').insert({
      user_id: user.id,
      email: user.email,
      status: 'pending',
    })

    if (error) {
      setDeleteError('Failed to submit deletion request. Please try again or contact support.')
      setDeleteLoading(false)
      return
    }

    setSubmitted(true)
    setDeleteLoading(false)
  }

  if (loading) return <div style={{ minHeight: '100vh', background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a8a8a' }}>Loading...</div>

  return (
    <main style={{ minHeight: '100vh', background: '#faf8f4', fontFamily: "'DM Sans', sans-serif", padding: '40px 24px' }}>
      <nav style={{ background: '#1a3a2a', padding: '0 24px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <div onClick={() => router.push('/')} style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#fff', cursor: 'pointer' }}>
          near<span style={{ color: '#7dcf9a', fontStyle: 'italic' }}>me</span>
        </div>
      </nav>

      <div style={{ maxWidth: '560px', margin: '80px auto 0', background: '#fff', borderRadius: '16px', border: '1px solid #e8e4de', padding: '32px' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '700', marginBottom: '12px' }}>Delete your account</div>
        <div style={{ fontSize: '14px', color: '#4a4a4a', lineHeight: '1.6', marginBottom: '24px' }}>
          Request permanent deletion of your nearme account and all associated data. Once submitted, your account will be scheduled for deletion in 30 days.
        </div>

        {!user ? (
          <div>
            <div style={{ background: '#fdf6e8', border: '1px solid #f0e4c0', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', color: '#4a4a4a', lineHeight: '1.5' }}>
                You must be signed in to delete your account. Please sign in first.
              </div>
            </div>
            <button
              onClick={() => router.push('/auth?redirect=/delete-account')}
              style={{ width: '100%', background: '#1a3a2a', color: '#fff', border: 'none', borderRadius: '100px', padding: '14px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
            >
              Sign in to continue
            </button>
          </div>
        ) : submitted ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✓</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '600', marginBottom: '10px' }}>Request submitted</div>
            <div style={{ fontSize: '14px', color: '#4a4a4a', lineHeight: '1.6', marginBottom: '20px' }}>
              Your account ({user.email}) has been scheduled for deletion in 30 days. You'll receive a confirmation email. To cancel, sign in and go to your profile within the next 30 days.
            </div>
            <button
              onClick={() => router.push('/')}
              style={{ background: '#1a3a2a', color: '#fff', border: 'none', borderRadius: '100px', padding: '12px 32px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
            >
              Return home
            </button>
          </div>
        ) : pendingDeletion ? (
          <div>
            <div style={{ background: '#fde8e8', border: '1.5px solid #c0392b', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#c0392b', marginBottom: '8px' }}>⚠️ Deletion already scheduled</div>
              <div style={{ fontSize: '13px', color: '#4a4a4a', lineHeight: '1.5' }}>
                Your account will be permanently deleted on <strong>{new Date(pendingDeletion.scheduled_deletion_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
              </div>
            </div>
            <div style={{ fontSize: '13px', color: '#4a4a4a', marginBottom: '12px' }}>
              To cancel this deletion, sign in and go to your profile page.
            </div>
            <button
              onClick={() => router.push('/profile')}
              style={{ width: '100%', background: '#1a3a2a', color: '#fff', border: 'none', borderRadius: '100px', padding: '14px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
            >
              Go to profile
            </button>
          </div>
        ) : (
          <>
            <div style={{ background: '#fde8e8', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#c0392b', marginBottom: '8px' }}>What will be deleted:</div>
              <div style={{ fontSize: '13px', color: '#4a4a4a', lineHeight: '1.7' }}>
                • All your listings<br/>
                • All your job postings<br/>
                • All messages sent and received<br/>
                • Your profile, reviews, and saved items<br/>
                • Your notification preferences<br/>
                • All data associated with your account
              </div>
            </div>

            <div style={{ fontSize: '13px', color: '#4a4a4a', marginBottom: '16px', lineHeight: '1.6' }}>
              Signed in as: <strong>{user.email}</strong>
            </div>

            <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
              Type <span style={{ color: '#c0392b', fontWeight: '700' }}>DELETE</span> to confirm:
            </div>
            <input
              value={deleteConfirmText}
              onChange={(e) => { setDeleteConfirmText(e.target.value); setDeleteError('') }}
              placeholder="Type DELETE"
              style={{ width: '100%', border: '1.5px solid #e8e4de', borderRadius: '10px', padding: '12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '8px', fontFamily: "'DM Sans', sans-serif" }}
            />

            {deleteError && <div style={{ fontSize: '13px', color: '#c0392b', marginBottom: '12px' }}>{deleteError}</div>}

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button
                onClick={() => router.push('/')}
                style={{ flex: 1, background: '#f0ede5', color: '#4a4a4a', border: 'none', borderRadius: '100px', padding: '14px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleRequestDeletion}
                disabled={deleteLoading || deleteConfirmText !== 'DELETE'}
                style={{ flex: 1, background: deleteConfirmText !== 'DELETE' ? '#8a8a8a' : '#c0392b', color: '#fff', border: 'none', borderRadius: '100px', padding: '14px', fontSize: '14px', fontWeight: '600', cursor: deleteLoading || deleteConfirmText !== 'DELETE' ? 'not-allowed' : 'pointer' }}
              >
                {deleteLoading ? 'Processing...' : 'Delete account'}
              </button>
            </div>

            <div style={{ fontSize: '12px', color: '#8a8a8a', textAlign: 'center', marginTop: '20px', lineHeight: '1.5' }}>
              Need help? Contact us at <a href="mailto:contact@nearmenow.co.nz" style={{ color: '#4a8c5c' }}>contact@nearmenow.co.nz</a>
            </div>
          </>
        )}
      </div>
    </main>
  )
}