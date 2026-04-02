export default function Home() {
  return (
    <main style={{
      fontFamily: "'DM Sans', sans-serif",
      background: "#faf8f4",
      minHeight: "100vh",
      paddingBottom: "80px"
    }}>
      {/* NAV */}
      <nav style={{
        background: "#1a3a2a",
        padding: "0 24px",
        height: "58px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{
          fontFamily: "Georgia, serif",
          fontSize: "22px",
          color: "#fff"
        }}>
          near<span style={{color: "#7dcf9a", fontStyle: "italic"}}>me</span>
        </div>
        <div style={{display: "flex", alignItems: "center", gap: "12px"}}>
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "rgba(255,255,255,0.15)", borderRadius: "100px",
            padding: "6px 12px", color: "#fff", fontSize: "13px"
          }}>
            <div style={{width: "7px", height: "7px", background: "#7dcf9a", borderRadius: "50%"}}></div>
            Silverdale
          </div>
          <button style={{
            background: "#e85d2f", color: "#fff", border: "none",
            borderRadius: "100px", padding: "8px 18px",
            fontSize: "13px", fontWeight: "600", cursor: "pointer"
          }}>+ Post</button>
        </div>
      </nav>

      {/* LOCATION BAR */}
      <div style={{
        background: "#2d5a3d", padding: "10px 24px",
        display: "flex", alignItems: "center", gap: "8px",
        color: "rgba(255,255,255,0.85)", fontSize: "13px"
      }}>
        📍 Showing listings within <strong style={{color: "#fff"}}>&nbsp;10 km&nbsp;</strong> of you
        <div style={{marginLeft: "auto", display: "flex", gap: "4px"}}>
          {["5km", "10km", "20km", "50km"].map((r) => (
            <button key={r} style={{
              background: r === "10km" ? "#fff" : "rgba(255,255,255,0.12)",
              border: "none", borderRadius: "100px",
              color: r === "10km" ? "#1a3a2a" : "rgba(255,255,255,0.7)",
              fontSize: "12px", padding: "4px 10px", cursor: "pointer",
              fontWeight: r === "10km" ? "600" : "400"
            }}>{r}</button>
          ))}
        </div>
      </div>

      {/* SPONSORED STRIP */}
      <div style={{
        background: "#fdf6e8", borderBottom: "1px solid #f0e4c0",
        padding: "10px 24px", display: "flex", alignItems: "center",
        gap: "14px", overflowX: "auto"
      }}>
        <div style={{fontSize: "10px", fontWeight: "600", color: "#c8952a",
          textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap"}}>
          📣 Sponsored
        </div>
        {[
          {emoji: "🍜", name: "Pho Silverdale", desc: "Lunch special $14.90", dist: "0.8 km"},
          {emoji: "🏡", name: "Ray White Hibiscus", desc: "3 new listings", dist: "1.2 km"},
          {emoji: "🧘", name: "Northshore Yoga", desc: "Free first class", dist: "2.4 km"},
          {emoji: "🍕", name: "Flames Wood Fired", desc: "Party pizza deals", dist: "3.1 km"},
        ].map((ad) => (
          <div key={ad.name} style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: "#fff", border: "1px solid #f0e4c0",
            borderRadius: "8px", padding: "8px 14px", flexShrink: 0, cursor: "pointer"
          }}>
            <div style={{fontSize: "24px"}}>{ad.emoji}</div>
            <div>
              <div style={{fontSize: "13px", fontWeight: "600"}}>{ad.name}</div>
              <div style={{fontSize: "11px", color: "#8a8a8a"}}>{ad.desc}</div>
              <div style={{fontSize: "11px", color: "#4a8c5c", fontWeight: "500"}}>{ad.dist} away</div>
            </div>
          </div>
        ))}
      </div>

      {/* CATEGORIES */}
      <div style={{padding: "16px 24px 0", display: "flex", gap: "8px", overflowX: "auto"}}>
        {["🏠 All", "📦 Marketplace", "📣 Businesses", "💼 Jobs", "🎉 Events", "🏘️ Real Estate"].map((cat, i) => (
          <button key={cat} style={{
            display: "flex", alignItems: "center", gap: "6px",
            border: i === 0 ? "none" : "1.5px solid #e8e4de",
            borderRadius: "100px", padding: "7px 14px", fontSize: "13px",
            background: i === 0 ? "#1a3a2a" : "#fff",
            color: i === 0 ? "#fff" : "#4a4a4a",
            cursor: "pointer", whiteSpace: "nowrap"
          }}>{cat}</button>
        ))}
      </div>

      {/* MAIN */}
      <div style={{padding: "20px 24px", maxWidth: "1100px", margin: "0 auto"}}>

        {/* FEATURED AD */}
        <div style={{
          borderRadius: "14px", background: "linear-gradient(135deg, #1a3a2a, #4a8c5c)",
          padding: "28px 32px", marginBottom: "32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer"
        }}>
          <div>
            <div style={{fontSize: "10px", color: "rgba(255,255,255,0.6)",
              textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px"}}>
              Promoted Business
            </div>
            <h2 style={{fontFamily: "Georgia, serif", fontSize: "24px",
              color: "#fff", marginBottom: "6px"}}>
              Albany Farmers Market<br/>this Saturday
            </h2>
            <p style={{fontSize: "14px", color: "rgba(255,255,255,0.75)", marginBottom: "16px"}}>
              Fresh local produce, artisan bread, and live music — 8am to 1pm
            </p>
            <button style={{
              background: "#fff", color: "#1a3a2a", border: "none",
              borderRadius: "100px", padding: "10px 22px",
              fontWeight: "700", fontSize: "14px", cursor: "pointer"
            }}>Get directions →</button>
          </div>
          <div style={{fontSize: "64px"}}>🥦</div>
        </div>

        {/* LISTINGS */}
        <div style={{display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "14px"}}>
          <div style={{fontFamily: "Georgia, serif", fontSize: "20px"}}>Near you</div>
          <div style={{fontSize: "13px", color: "#4a8c5c", cursor: "pointer", textDecoration: "underline"}}>See all →</div>
        </div>

        <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px", marginBottom: "36px"}}>
          {[
            {emoji: "🚲", price: "$280", title: "Trek mountain bike — barely used", dist: "0.4 km", time: "2 hrs ago"},
            {emoji: "🛋️", price: "$150", title: "3-seater couch, grey fabric", dist: "1.8 km", time: "5 hrs ago"},
            {emoji: "📱", price: "$620", title: "iPhone 14 Pro 256GB Space Black", dist: "3.2 km", time: "Yesterday"},
            {emoji: "🌿", price: "Free", title: "Potted succulents — pick up today", dist: "0.7 km", time: "3 hrs ago"},
            {emoji: "🪑", price: "$45", title: "IKEA desk chair, good cond.", dist: "2.1 km", time: "1 day ago"},
          ].map((item) => (
            <div key={item.title} style={{
              background: "#fff", borderRadius: "14px",
              border: "1px solid #e8e4de", overflow: "hidden", cursor: "pointer"
            }}>
              <div style={{
                width: "100%", aspectRatio: "4/3", background: "#e8f4f0",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px"
              }}>{item.emoji}</div>
              <div style={{padding: "12px 14px"}}>
                <div style={{fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: "700", marginBottom: "2px"}}>{item.price}</div>
                <div style={{fontSize: "14px", color: "#4a4a4a", marginBottom: "8px",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{item.title}</div>
                <div style={{display: "flex", justifyContent: "space-between"}}>
                  <div style={{fontSize: "12px", color: "#4a8c5c", fontWeight: "500"}}>📍 {item.dist}</div>
                  <div style={{fontSize: "12px", color: "#8a8a8a"}}>{item.time}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* JOBS */}
        <div style={{display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "14px"}}>
          <div style={{fontFamily: "Georgia, serif", fontSize: "20px"}}>Hiring today</div>
          <div style={{fontSize: "13px", color: "#4a8c5c", cursor: "pointer", textDecoration: "underline"}}>See all jobs →</div>
        </div>

        <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px"}}>
          {[
            {emoji: "🏗️", title: "Labourer — concrete pour", company: "Northland Build Co · Silverdale", pay: "$28/hr", tags: ["Urgent", "Cash daily"]},
            {emoji: "🧹", title: "House cleaner wanted", company: "Private · Albany", pay: "$30/hr", tags: ["Today only", "3 hrs"]},
            {emoji: "🍔", title: "Kitchen hand — dinner shift", company: "The Orchard Bar · Millwater", pay: "$23/hr", tags: ["Tonight", "Tips"]},
            {emoji: "🌳", title: "Garden tidy — weekend", company: "Private · Orewa", pay: "$25/hr", tags: ["Cash", "Sat–Sun"]},
          ].map((job) => (
            <div key={job.title} style={{
              background: "#fff", border: "1px solid #e8e4de",
              borderRadius: "14px", padding: "16px 18px",
              display: "flex", alignItems: "center", gap: "14px", cursor: "pointer"
            }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "10px",
                background: "#e8f4f0", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "22px", flexShrink: 0
              }}>{job.emoji}</div>
              <div style={{flex: 1}}>
                <div style={{fontSize: "14px", fontWeight: "600", marginBottom: "3px"}}>{job.title}</div>
                <div style={{fontSize: "12px", color: "#8a8a8a", marginBottom: "4px"}}>{job.company}</div>
                <div style={{display: "flex", gap: "5px"}}>
                  {job.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: "11px", borderRadius: "4px", padding: "2px 7px",
                      fontWeight: "500", background: "#e8f5e8", color: "#2d7a2d"
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
              <div style={{fontSize: "15px", fontWeight: "700"}}>{job.pay}</div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#fff", borderTop: "1px solid #e8e4de",
        display: "flex", justifyContent: "space-around", padding: "8px 0 12px"
      }}>
        {[["🏠", "Home"], ["🔍", "Browse"], ["➕", "Post"], ["💬", "Chat"], ["👤", "Profile"]].map(([icon, label]) => (
          <div key={label} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: "3px", cursor: "pointer", fontSize: "11px",
            color: label === "Home" ? "#1a3a2a" : "#8a8a8a"
          }}>
            <div style={{fontSize: "22px"}}>{icon}</div>
            {label}
          </div>
        ))}
      </div>
    </main>
  );
}