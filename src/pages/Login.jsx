import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    navigate("/");
  }
}, [navigate]);
    
  async function handleLogin(e) {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const res = await fetch("https://innhance-bot-production.up.railway.app/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    // ✅ save token
    localStorage.setItem("token", data.token);
    localStorage.setItem("hotel", JSON.stringify(data.hotel));

    // ✅ redirect
    navigate("/");

  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}
  

  const features = [
    { icon: '🤖', label: 'AI Automation' },
    { icon: '📊', label: 'Live Insights' },
    { icon: '💬', label: 'WhatsApp Booking' },
    { icon: '💳', label: 'Auto Payments' },
  ];

  return (
    <>
      <style>{`
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #root {
          height: 100%;
          background: #080812;
          font-family: 'Segoe UI', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        #root { display: flex; flex-direction: column; }

        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blob {
          0%, 100% { transform: scale(1) translate(0,0); }
          33% { transform: scale(1.06) translate(18px,-12px); }
          66% { transform: scale(0.96) translate(-12px,8px); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 6px rgba(34,197,94,0.6); }
          50% { opacity: 0.5; box-shadow: 0 0 14px rgba(34,197,94,0.9); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .login-page {
          flex: 1;
          display: flex;
          background: #080812;
          position: relative;
          overflow: hidden;
          min-height: 100vh;
        }
        .login-wrapper {
          display: flex;
          width: 100%;
          min-height: 100vh;
        }
        .login-left {
          flex: 1.15;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 52px 60px;
          position: relative;
          overflow: hidden;
          animation: fadeInLeft 0.8s ease forwards;
        }
        .login-right {
          width: 460px;
          min-width: 460px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 44px;
          position: relative;
          z-index: 2;
          background: rgba(8,8,18,0.94);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-left: 1px solid rgba(255,255,255,0.06);
          box-sizing: border-box;
          animation: fadeInRight 0.8s ease forwards;
        }
        .login-input {
          width: 100%;
          padding: 13px 16px;
          border-radius: 11px;
          border: 1.5px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: #fff;
          font-size: 15px;
          outline: none;
          box-sizing: border-box;
          transition: all 0.22s ease;
          font-family: inherit;
        }
        .login-input::placeholder { color: rgba(255,255,255,0.2); }
        .login-input:focus {
          border-color: rgba(232,184,109,0.55);
          background: rgba(232,184,109,0.04);
          box-shadow: 0 0 0 4px rgba(232,184,109,0.07);
        }
        .stat-item { transition: transform 0.22s ease; cursor: default; }
        .stat-item:hover { transform: translateY(-3px); }
        .feature-pill {
          transition: all 0.22s ease;
          cursor: default;
        }
        .feature-pill:hover {
          background: rgba(232,184,109,0.12) !important;
          border-color: rgba(232,184,109,0.25) !important;
          transform: translateY(-2px);
          color: rgba(255,255,255,0.8) !important;
        }
        @media (max-width: 960px) {
          .login-left { display: none !important; }
          .login-right {
            width: 100% !important;
            min-width: unset !important;
            padding: 40px 24px !important;
            border-left: none !important;
            background: #080812 !important;
          }
        }
        @media (max-width: 480px) {
          .login-right { padding: 32px 16px !important; }
        }
      `}</style>

      <div className="login-page">

        {/* Background blobs */}
        {[
          { w: 750, h: 750, top: -280, left: -280, c: 'rgba(232,184,109,0.06)', d: '9s' },
          { w: 650, h: 650, bottom: -220, right: -180, c: 'rgba(15,52,96,0.38)', d: '12s' },
          { w: 500, h: 500, top: '30%', left: '20%', c: 'rgba(22,33,62,0.28)', d: '15s' },
        ].map((b, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: b.w, height: b.h,
            top: b.top, left: b.left, bottom: b.bottom, right: b.right,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${b.c} 0%, transparent 70%)`,
            animation: `blob ${b.d} ease-in-out infinite`,
            animationDelay: `${i * 2.5}s`,
            pointerEvents: 'none',
          }} />
        ))}

        <div className="login-wrapper">

          {/* ===== LEFT SIDE ===== */}
          <div className="login-left">

            {/* Hotel bg image */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'url(https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1400&q=85)',
              backgroundSize: 'cover', backgroundPosition: 'center',
              opacity: 0.28,
            }} />

            {/* Vignette */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `
                radial-gradient(ellipse at 30% 50%, rgba(8,8,18,0.2) 0%, rgba(8,8,18,0.82) 100%),
                linear-gradient(to right, rgba(8,8,18,0.1) 0%, rgba(8,8,18,0.65) 100%)
              `,
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>

              {/* Logo */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                marginBottom: '40px',
                animation: 'fadeInUp 0.7s ease 0.1s both',
              }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '11px',
                  overflow: 'hidden', flexShrink: 0,
                  boxShadow: '0 4px 16px rgba(232,184,109,0.2)'
                }}>
                  <img src="/logo.jpeg" alt="Innhance"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => {
                      e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;background:linear-gradient(135deg,#1a1a2e,#0f3460);display:flex;align-items:center;justify-content:center;font-size:20px">🏨</div>';
                    }}
                  />
                </div>
                <span style={{ fontSize: '20px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' }}>Innhance</span>
              </div>

              {/* Floating card */}
              <div style={{
                background: 'rgba(255,255,255,0.07)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '14px', padding: '13px 16px',
                marginBottom: '28px',
                display: 'inline-flex', alignItems: 'center', gap: '12px',
                animation: 'floatSlow 6s ease-in-out infinite',
                maxWidth: '340px',
              }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                  background: 'linear-gradient(135deg, #e8b86d, #c9973a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px'
                }}>✅</div>
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)', marginBottom: '2px' }}>Just now — New booking confirmed</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>Deluxe Room · ₹4,000/night · 2 guests</div>
                </div>
                <div style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: '#22c55e', flexShrink: 0,
                  animation: 'pulse 2s ease-in-out infinite',
                }} />
              </div>

              {/* Headline */}
              <h2 style={{
                fontSize: 'clamp(30px, 3.2vw, 46px)',
                fontWeight: '800', color: '#fff',
                lineHeight: '1.12', marginBottom: '14px',
                letterSpacing: '-1.5px',
                animation: 'fadeInUp 0.7s ease 0.2s both',
              }}>
                Your hotel,<br />
                <span style={{
                  background: 'linear-gradient(135deg, #e8b86d 0%, #f5d08a 50%, #e8b86d 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  animation: 'shimmer 4s linear infinite',
                }}>fully automated.</span>
              </h2>

              {/* Description */}
              <p style={{
                color: 'rgba(255,255,255,0.42)', fontSize: '15px',
                lineHeight: '1.7', marginBottom: '32px', maxWidth: '380px',
                animation: 'fadeInUp 0.7s ease 0.3s both',
              }}>
                Manage bookings, track revenue, and delight your guests — all from one powerful AI-powered dashboard.
              </p>

              {/* Stats */}
              <div style={{
                display: 'flex', gap: '36px', marginBottom: '28px',
                animation: 'fadeInUp 0.7s ease 0.4s both',
              }}>
                {[
                  { value: '98%', label: 'Booking Rate' },
                  { value: '24/7', label: 'AI Support' },
                  { value: '40+', label: 'Languages' },
                ].map((s, i) => (
                  <div key={i} className="stat-item">
                    <div style={{
                      fontSize: '28px', fontWeight: '800', lineHeight: 1,
                      background: 'linear-gradient(135deg, #e8b86d, #f5d08a)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>{s.value}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '5px', fontWeight: '500' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Feature pills */}
              <div style={{
                display: 'flex', gap: '8px', flexWrap: 'wrap',
                animation: 'fadeInUp 0.7s ease 0.5s both',
              }}>
                {features.map((f, i) => (
                  <div key={i} className="feature-pill" style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '7px 13px', borderRadius: '100px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    fontSize: '12px', color: 'rgba(255,255,255,0.55)',
                    fontWeight: '500',
                  }}>
                    <span style={{ fontSize: '13px' }}>{f.icon}</span>
                    {f.label}
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* ===== RIGHT SIDE ===== */}
          <div className="login-right">
            <div style={{ width: '100%', maxWidth: '380px' }}>

              {/* Header */}
              <div style={{
                textAlign: 'center', marginBottom: '32px',
                animation: 'fadeInUp 0.6s ease 0.1s both',
              }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '18px',
                  overflow: 'hidden', margin: '0 auto 18px',
                  boxShadow: '0 8px 32px rgba(232,184,109,0.18)',
                  animation: 'floatSlow 5s ease-in-out infinite',
                }}>
                  <img src="/logo.jpeg" alt="Innhance"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => {
                      e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;background:linear-gradient(135deg,#1a1a2e,#0f3460);display:flex;align-items:center;justify-content:center;font-size:28px">🏨</div>';
                    }}
                  />
                </div>
                <h1 style={{
                  fontSize: '24px', fontWeight: '800', color: '#fff',
                  letterSpacing: '-0.5px', marginBottom: '6px'
                }}>Welcome back</h1>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
                  Sign in to manage your hotel
                </p>
              </div>

              {/* Form Card */}
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                padding: '30px',
                boxShadow: '0 24px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)',
                animation: 'fadeInUp 0.6s ease 0.2s both',
              }}>
                <form onSubmit={handleLogin}>

                  {/* Email */}
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{
                      fontSize: '11px', fontWeight: '700',
                      color: 'rgba(255,255,255,0.45)',
                      display: 'block', marginBottom: '7px',
                      letterSpacing: '0.6px', textTransform: 'uppercase'
                    }}>Email Address</label>
                    <input
                      className="login-input"
                      type="email" value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="hotel@example.com"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{
                      fontSize: '11px', fontWeight: '700',
                      color: 'rgba(255,255,255,0.45)',
                      display: 'block', marginBottom: '7px',
                      letterSpacing: '0.6px', textTransform: 'uppercase'
                    }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="login-input"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        style={{ paddingRight: '46px' }}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute', right: '13px', top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none', border: 'none',
                          color: 'rgba(255,255,255,0.25)', cursor: 'pointer',
                          fontSize: '15px', padding: '4px', lineHeight: 1,
                          transition: 'color 0.2s'
                        }}>
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div style={{
                      background: 'rgba(239,68,68,0.09)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: '10px', padding: '11px 14px',
                      marginBottom: '18px', color: '#fca5a5', fontSize: '13px',
                      display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                      ❌ {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    onMouseEnter={() => setBtnHovered(true)}
                    onMouseLeave={() => setBtnHovered(false)}
                    style={{
                      width: '100%', padding: '15px',
                      background: loading
                        ? 'rgba(232,184,109,0.45)'
                        : 'linear-gradient(135deg, #e8b86d, #c9973a)',
                      color: '#1a0f00',
                      border: 'none', borderRadius: '11px',
                      fontSize: '15px', fontWeight: '700',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.22s ease',
                      transform: btnHovered && !loading ? 'translateY(-2px) scale(1.01)' : 'none',
                      boxShadow: btnHovered && !loading
                        ? '0 14px 36px rgba(232,184,109,0.38)'
                        : '0 6px 20px rgba(232,184,109,0.18)',
                      letterSpacing: '0.3px',
                    }}>
                    {loading ? '⏳ Signing in...' : 'Sign In →'}
                  </button>

                </form>
              </div>

              {/* Trust badges */}
              <div style={{
                marginTop: '20px',
                animation: 'fadeInUp 0.6s ease 0.3s both',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '20px', marginBottom: '14px'
                }}>
                  {['🔒 Secure', '🇮🇳 Made in India', '⚡ Fast'].map((b, i) => (
                    <span key={i} style={{
                      fontSize: '11px', color: 'rgba(255,255,255,0.18)', fontWeight: '500'
                    }}>{b}</span>
                  ))}
                </div>
                <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.18)' }}>
                  Need access?{' '}
                  <a href="mailto:hello@innhance.in"
                    style={{ color: '#e8b86d', textDecoration: 'none', fontWeight: '600' }}>
                    Contact us
                  </a>
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}