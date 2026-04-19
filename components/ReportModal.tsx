'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  contentType: 'listing' | 'job' | 'user' | 'message' | 'community_post'
  contentId: string
  reportedUserId?: string
  userId: string | null
}

const CATEGORIES = [
  { value: 'spam', label: 'Spam or misleading' },
  { value: 'scam', label: 'Scam or fraud' },
  { value: 'inappropriate', label: 'Inappropriate or offensive content' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'hate_speech', label: 'Hate speech or discrimination' },
  { value: 'violence', label: 'Violence or dangerous content' },
  { value: 'sexual_content', label: 'Sexual or adult content' },
  { value: 'illegal', label: 'Illegal activity or goods' },
  { value: 'impersonation', label: 'Impersonation' },
  { value: 'intellectual_property', label: 'Intellectual property violation' },
  { value: 'other', label: 'Other' },
]

export default function ReportModal({ isOpen, onClose, contentType, contentId, reportedUserId, userId }: ReportModalProps) {
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!userId) {
      setError('You must be logged in to report.')
      return
    }
    if (!category) {
      setError('Please select a reason.')
      return
    }

    setSubmitting(true)
    setError('')

    const reportData: any = {
      reporter_id: userId,
      content_type: contentType,
      content_id: contentId,
      category,
      description: description.trim() || null,
      status: 'pending',
    }

    if (contentType === 'listing') reportData.listing_id = contentId
    if (reportedUserId) reportData.reported_user_id = reportedUserId

    const selectedLabel = CATEGORIES.find(c => c.value === category)?.label || category
    reportData.reason = selectedLabel

    const { error: insertError } = await supabase.from('reports').insert(reportData)

    if (insertError) {
      setError('Failed to submit report. Please try again.')
      setSubmitting(false)
      return
    }

    setSubmitted(true)
    setSubmitting(false)
  }

  const handleClose = () => {
    setCategory('')
    setDescription('')
    setSubmitted(false)
    setError('')
    onClose()
  }

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: '520px',
          padding: '24px', maxHeight: '90vh', overflowY: 'auto',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✓</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
              Report submitted
            </div>
            <div style={{ fontSize: '14px', color: '#4a4a4a', lineHeight: '1.5', marginBottom: '20px' }}>
              Thanks for helping keep nearme safe. Our team reviews all reports within 24 hours and will take appropriate action.
            </div>
            <button
              onClick={handleClose}
              style={{
                background: '#1a3a2a', color: '#fff', border: 'none', borderRadius: '100px',
                padding: '12px 32px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '600' }}>
                Report {contentType === 'user' ? 'user' : contentType === 'message' ? 'message' : contentType}
              </div>
              <button
                onClick={handleClose}
                style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#8a8a8a' }}
              >
                ×
              </button>
            </div>

            <div style={{ fontSize: '13px', color: '#4a4a4a', marginBottom: '16px', lineHeight: '1.5' }}>
              Your report is confidential. We review all reports within 24 hours and take action on violations of our Community Guidelines.
            </div>

            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>
              Why are you reporting this?
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  style={{
                    padding: '12px 14px', borderRadius: '10px', fontSize: '14px', cursor: 'pointer',
                    background: category === cat.value ? '#e8f4f0' : '#faf8f4',
                    color: category === cat.value ? '#1a3a2a' : '#4a4a4a',
                    border: '1.5px solid ' + (category === cat.value ? '#4a8c5c' : 'transparent'),
                    fontWeight: category === cat.value ? '600' : '400',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}
                >
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    border: '2px solid ' + (category === cat.value ? '#4a8c5c' : '#c0c0c0'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {category === cat.value && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4a8c5c' }} />}
                  </div>
                  {cat.label}
                </div>
              ))}
            </div>

            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              Additional details (optional)
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details to help us investigate..."
              rows={3}
              maxLength={500}
              style={{
                width: '100%', border: '1.5px solid #e8e4de', borderRadius: '10px',
                padding: '12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                resize: 'vertical', fontFamily: "'DM Sans', sans-serif", marginBottom: '6px',
              }}
            />
            <div style={{ fontSize: '11px', color: '#8a8a8a', textAlign: 'right', marginBottom: '16px' }}>
              {description.length}/500
            </div>

            {error && (
              <div style={{ fontSize: '13px', color: '#c0392b', marginBottom: '12px' }}>{error}</div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleClose}
                style={{
                  flex: 1, background: '#f0ede5', color: '#4a4a4a', border: 'none',
                  borderRadius: '100px', padding: '14px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !category}
                style={{
                  flex: 1, background: !category ? '#8a8a8a' : '#c0392b', color: '#fff', border: 'none',
                  borderRadius: '100px', padding: '14px', fontSize: '14px', fontWeight: '600',
                  cursor: !category || submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Submitting...' : 'Submit report'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}