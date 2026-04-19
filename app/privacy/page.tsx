export default function PrivacyPolicyPage() {
    return (
      <main style={{ minHeight: '100vh', background: '#faf8f4', fontFamily: "'DM Sans', sans-serif", padding: '0 0 60px' }}>
        <nav style={{ background: '#1a3a2a', padding: '0 24px', height: '58px', display: 'flex', alignItems: 'center' }}>
          <a href="/" style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#fff', textDecoration: 'none' }}>
            near<span style={{ color: '#7dcf9a', fontStyle: 'italic' }}>me</span>
          </a>
        </nav>
  
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px', color: '#1a1a1a', lineHeight: 1.7, fontSize: '15px' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>Privacy Policy</h1>
          <div style={{ fontSize: '13px', color: '#8a8a8a', marginBottom: '32px' }}>Last updated: April 2026</div>
  
          <p>
            This Privacy Policy describes how nearme ("we", "us", or "our") collects, uses, and shares your personal information when you use the nearme mobile application and website (the "Service"). By using nearme, you agree to the terms of this Privacy Policy.
          </p>
  
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', marginTop: '32px', marginBottom: '12px' }}>1. Information We Collect</h2>
          <p>We collect the following categories of information:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li><strong>Account information:</strong> email address, name, password (encrypted), business name (if applicable), profile photo.</li>
            <li><strong>Location data:</strong> approximate geolocation used to show nearby listings, events, and businesses. You can disable location access in your device settings at any time.</li>
            <li><strong>User-generated content:</strong> listings, job postings, messages, reviews, photos you upload, and community posts.</li>
            <li><strong>Payment information:</strong> processed securely by Stripe. We do not store full card numbers.</li>
            <li><strong>Usage data:</strong> interactions with listings, ads clicked, search queries, device type, browser type, IP address.</li>
            <li><strong>Communications:</strong> messages exchanged with other users through the in-app messaging system.</li>
          </ul>
  
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', marginTop: '32px', marginBottom: '12px' }}>2. How We Use Your Information</h2>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li>Provide, operate, and maintain the Service</li>
            <li>Show you listings, jobs, events, and advertisements relevant to your location</li>
            <li>Enable communication between buyers, sellers, and businesses</li>
            <li>Process payments and subscriptions</li>
            <li>Send important notifications (messages, reviews, transactional updates)</li>
            <li>Detect and prevent fraud, abuse, and violations of our Terms of Service</li>
            <li>Respond to user reports and enforce our Community Guidelines</li>
            <li>Improve the Service and develop new features</li>
          </ul>
  
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', marginTop: '32px', marginBottom: '12px' }}>3. How We Share Your Information</h2>
          <p>We do not sell your personal information. We share information only in the following cases:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li><strong>With other users:</strong> your listings, profile name, photos, and messages are visible to other users as part of the Service.</li>
            <li><strong>Service providers:</strong> Supabase (database and authentication), Stripe (payments), Vercel (hosting), and Google/Apple (sign-in providers).</li>
            <li><strong>Legal compliance:</strong> when required by law, court order, or to protect the safety of users.</li>
            <li><strong>Business transfers:</strong> in the event of a merger, acquisition, or sale of assets.</li>
          </ul>
  
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', marginTop: '32px', marginBottom: '12px' }}>4. Data Retention</h2>
          <p>
            We retain your information for as long as your account is active. When you delete your account, your personal data is scheduled for permanent deletion within 30 days. Certain records (e.g. transaction history) may be retained longer where required by law.
          </p>
  
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', marginTop: '32px', marginBottom: '12px' }}>5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li>Access the personal information we hold about you</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account at any time via the profile settings or at <a href="/delete-account" style={{ color: '#4a8c5c' }}>nearmenow.co.nz/delete-account</a></li>
            <li>Withdraw consent to location tracking at any time</li>
            <li>Request a copy of your data</li>
            <li>Object to certain processing activities</li>
          </ul>
          <p>To exercise these rights, contact us at <a href="mailto:contact@nearmenow.co.nz" style={{ color: '#4a8c5c' }}>contact@nearmenow.co.nz</a>.</p>
  
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', marginTop: '32px', marginBottom: '12px' }}>6. Children's Privacy</h2>
          <p>
            nearme is not intended for children under 13. We do not knowingly collect information from children under 13. If we learn we have collected information from a child under 13, we will delete it promptly.
          </p>
  
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', marginTop: '32px', marginBottom: '12px' }}>7. Security</h2>
          <p>
            We use industry-standard security measures (encryption in transit and at rest, secure authentication, access controls) to protect your information. However, no method of transmission over the internet is 100% secure.
          </p>
  
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', marginTop: '32px', marginBottom: '12px' }}>8. International Users</h2>
          <p>
            nearme is operated from New Zealand. If you access the Service from outside New Zealand, you consent to your information being transferred to and processed in New Zealand.
          </p>
  
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', marginTop: '32px', marginBottom: '12px' }}>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Material changes will be notified to you via email or in-app notification. Continued use of the Service after changes means you accept the updated Policy.
          </p>
  
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', marginTop: '32px', marginBottom: '12px' }}>10. Contact Us</h2>
          <p>
            Email: <a href="mailto:contact@nearmenow.co.nz" style={{ color: '#4a8c5c' }}>contact@nearmenow.co.nz</a><br/>
            Website: <a href="https://www.nearmenow.co.nz" style={{ color: '#4a8c5c' }}>nearmenow.co.nz</a>
          </p>
  
          <div style={{ fontSize: '12px', color: '#8a8a8a', marginTop: '16px', lineHeight: 1.6 }}>
            nearme is a service operated by ViralX LTD, a company registered in New Zealand.
          </div>
  
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e8e4de', fontSize: '13px', color: '#8a8a8a' }}>
            <a href="/terms" style={{ color: '#4a8c5c', marginRight: '16px' }}>Terms of Service</a>
            <a href="/community-guidelines" style={{ color: '#4a8c5c', marginRight: '16px' }}>Community Guidelines</a>
            <a href="/delete-account" style={{ color: '#4a8c5c' }}>Delete Account</a>
          </div>
        </div>
      </main>
    )
  }