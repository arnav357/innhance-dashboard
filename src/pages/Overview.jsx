import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const activityFeed = [
  { icon: '✅', text: 'New booking confirmed — Priya Sharma', time: '2 min ago', color: '#22c55e' },
  { icon: '💰', text: 'Payment received — ₹15,000', time: '18 min ago', color: '#e8b86d' },
  { icon: '💬', text: 'New message from Rahul Verma', time: '34 min ago', color: '#60a5fa' },
  { icon: '🛏️', text: 'Suite room marked available', time: '1 hr ago', color: '#a78bfa' },
];

const quickActions = [
  { icon: '➕', label: 'Add Booking', color: '#e8b86d', bg: 'rgba(232,184,109,0.1)', border: 'rgba(232,184,109,0.25)', link: '/bookings' },
  { icon: '🛏️', label: 'Manage Rooms', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.25)', link: '/rooms' },
  { icon: '💬', label: 'View Chats', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', link: '/chats' },
  { icon: '📊', label: 'Analytics', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)', link: '/analytics' },
];

const statusConfig = {
  confirmed: { bg: 'rgba(34,197,94,0.1)', color: '#16a34a', border: 'rgba(34,197,94,0.25)', icon: '✓' },
  pending:   { bg: 'rgba(245,158,11,0.1)', color: '#d97706', border: 'rgba(245,158,11,0.25)', icon: '⏳' },
  cancelled: { bg: 'rgba(239,68,68,0.1)', color: '#dc2626', border: 'rgba(239,68,68,0.25)', icon: '✕' },
};

function Sparkline({ data, color }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const w = 70, h = 32;

  // FIXED: Added backticks around the template literal here
  const pts = data
    .map((v, i) => 
      `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4)}`
    )
    .join(' ');

  return (
    <svg width={w} height={h}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
    </svg>
  );
}

export default function Overview({ theme = 'dark' }) {

  const navigate = useNavigate();

  // ✅ ALL STATES (TOP PE — IMPORTANT FOR HOOK ERROR FIX)
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredAction, setHoveredAction] = useState(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1100);

  const hotelData = localStorage.getItem('hotel');
  const hotel = hotelData ? JSON.parse(hotelData) : {};

  // ✅ RESIZE EFFECT
  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth <= 1100);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ✅ FETCH BOOKINGS
  useEffect(() => {
    fetch("http://localhost:8080/booking/all")
      .then(res => res.json())
      .then(data => {
        setBookings(data.bookings || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching bookings:", err);
        setLoading(false);
      });
  }, []);

  // ✅ LOADING (HOOK ERROR FIX — AFTER ALL HOOKS)
  if (loading) {
    return <div style={{ color: "white", padding: "20px" }}>Loading...</div>;
  }

  // ✅ STATS (DYNAMIC)
  const totalBookings = bookings.length;

  const totalRevenue = bookings.reduce((sum, b) => {
    return sum + (b.totalAmount || 0);
  }, 0);

  const pending = bookings.filter(b => b.status === "pending").length;
  const confirmed = bookings.filter(b => b.status === "confirmed").length;
  const activeCustomers = new Set(bookings.map(b => b.phone)).size;

  // ✅ FORMAT FOR UI (IMPORTANT)
  const formattedBookings = bookings.map(b => ({
    id: b._id,
    name: b.guestName,
    phone: b.phone,
    room: b.roomType,
    checkIn: new Date(b.checkIn).toLocaleDateString(),
    checkOut: new Date(b.checkOut).toLocaleDateString(),
    status: b.status,
    amount: `₹${b.totalAmount}`
  }));

  // ✅ FILTER
  const filtered =
    statusFilter === 'all'
      ? formattedBookings
      : formattedBookings.filter(b => b.status === statusFilter);

  const stats = [
  {
    label: 'Revenue',
    value: `₹${totalRevenue}`,
    icon: '💰',
    color: '#22c55e',
    change: '+8%',
    trend: 'up',
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.15)',
    spark: [40, 55, 48, 62, 58, 72, 80],
    link: '/bookings',
  },
  {
    label: 'Total Bookings',
    value: totalBookings,
    icon: '📊',
    color: '#e8b86d',
    change: '+12%',
    trend: 'up',
    bg: 'rgba(232,184,109,0.08)',
    border: 'rgba(232,184,109,0.15)',
    spark: [30, 38, 35, 50, 45, 60, 62],
    link: '/bookings',
  },
  {
    label: 'Active Customers',
    value: activeCustomers,
    icon: '👤',
    color: '#60a5fa',
    change: '+5',
    trend: 'up',
    bg: 'rgba(96,165,250,0.08)',
    border: 'rgba(96,165,250,0.15)',
    spark: [50, 52, 48, 58, 60, 65, 67],
    link: '/chats',
  },
  {
    label: 'Pending',
    value: pending,
    icon: '⏳',
    color: '#f59e0b',
    change: '-2',
    trend: 'down',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.15)',
    spark: [10, 12, 9, 11, 8, 9, 7],
    link: '/bookings',
  },
];


  // ✅ COLORS / THEME (UNCHANGED)
  const isDark = theme === 'dark';
  const text        = isDark ? '#fff' : '#0f172a';
  const subtext     = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.55)';
  const cardBg      = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const cardBorder  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.1)';
  const rowHover    = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
  const tableBorder = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
  const tableHeader = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.55)';
  const insightBg   = isDark ? 'rgba(232,184,109,0.06)' : 'rgba(232,184,109,0.1)';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');

        @keyframes fadeInUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse     { 0%,100%{opacity:1;box-shadow:0 0 8px rgba(34,197,94,0.6);}50%{opacity:.5;box-shadow:0 0 16px rgba(34,197,94,0.9);} }
        @keyframes insightGlow {
          0%,100%{border-left-color:rgba(232,184,109,0.4);}
          50%{border-left-color:rgba(232,184,109,0.95);box-shadow:-4px 0 20px rgba(232,184,109,0.22);}
        }

        .ov-root { font-family:'DM Sans','Segoe UI',system-ui,sans-serif; }
        .ov-heading { font-family:'Playfair Display',serif; }

        .stat-card { transition:transform .22s ease,box-shadow .22s ease; cursor:pointer; }
        .stat-card:hover { transform:translateY(-5px); }

        .booking-row { transition:background .15s ease; cursor:pointer; }
        .view-btn { opacity:.5; transition:all .18s ease!important; }
        .view-btn:hover { opacity:1!important; background:rgba(232,184,109,0.12)!important; border-color:rgba(232,184,109,0.4)!important; color:#e8b86d!important; }

        .quick-btn { transition:all .22s ease!important; }
        .quick-btn:hover { transform:translateY(-3px)!important; box-shadow:0 10px 28px rgba(0,0,0,0.2)!important; }

        .insight-banner { animation:fadeInUp .5s ease .05s both, insightGlow 3s ease-in-out 1s infinite; }

        /* Mobile booking card */
        .booking-card {
          border-radius:12px;
          padding:14px;
          margin-bottom:10px;
          transition:transform .15s ease;
        }
        .booking-card:active { transform:scale(0.98); }
      `}</style>

      <div className="ov-root">

        {/* Header */}
        <div style={{ marginBottom: '18px', animation: 'fadeInUp 0.5s ease forwards' }}>
          <h1 className="ov-heading" style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '800', color: text, letterSpacing: '-0.5px', marginBottom: '4px' }}>
            {greeting}! 👋
          </h1>
          <p style={{ color: subtext, fontSize: '12px', lineHeight: '1.5' }}>
            {dateStr} · <span style={{ color: '#e8b86d', fontWeight: '700' }}>{hotel.name || 'Innhance Hotels'}</span>
          </p>
        </div>

        {/* AI Insight */}
        <div className="insight-banner" style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(232,184,109,0.07), rgba(96,165,250,0.03))'
            : 'linear-gradient(135deg, rgba(232,184,109,0.12), rgba(96,165,250,0.06))',
          border: '1px solid rgba(232,184,109,0.2)',
          borderLeftWidth: '3px', borderLeftColor: 'rgba(232,184,109,0.7)',
          borderRadius: '14px', padding: isMobile ? '11px 14px' : '13px 18px',
          marginBottom: '18px',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
            background: 'linear-gradient(135deg, #e8b86d, #c9973a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
            boxShadow: '0 4px 12px rgba(232,184,109,0.3)',
          }}>🤖</div>
          <div>
            <div style={{ fontSize: '10px', color: subtext, marginBottom: '2px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>AI Insight</div>
            <div style={{ fontSize: isMobile ? '12px' : '13px', color: text, fontWeight: '500' }}>
              Bookings up <span style={{ color: '#22c55e', fontWeight: '700' }}>+12%</span> this week · Suite rooms likely to sell out this weekend 🔥
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : isTablet ? 'repeat(2,1fr)' : 'repeat(4,1fr)',
          gap: isMobile ? '10px' : '14px',
          marginBottom: '18px',
        }}>
          {stats.map((stat, i) => (
            <div key={i} className="stat-card"
              onClick={() => navigate(stat.link)}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: isDark ? `linear-gradient(145deg, ${stat.bg}, rgba(0,0,0,0.15))` : '#fff',
                border: `1px solid ${hoveredCard === i ? stat.color + '55' : isDark ? stat.border : 'rgba(0,0,0,0.09)'}`,
                borderRadius: '14px',
                padding: isMobile ? '14px' : '18px 20px',
                boxShadow: hoveredCard === i
                  ? `0 16px 36px rgba(0,0,0,0.2),0 0 0 1px ${stat.color}25`
                  : isDark ? '0 4px 16px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.06)',
                animation: `fadeInUp 0.5s ease ${i * 0.07}s both`,
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <p style={{ fontSize: '9px', color: subtext, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
                <span style={{
                  fontSize: '15px', width: '28px', height: '28px', borderRadius: '7px',
                  background: `${stat.color}15`, border: `1px solid ${stat.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{stat.icon}</span>
              </div>
              <p style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '800', color: stat.color, marginBottom: '8px', letterSpacing: '-1px', lineHeight: 1 }}>
                {stat.value}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <span style={{
                    fontSize: '11px', fontWeight: '800',
                    color: stat.trend === 'up' ? '#16a34a' : '#dc2626',
                    background: stat.trend === 'up' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    padding: '2px 6px', borderRadius: '100px',
                    border: `1px solid ${stat.trend === 'up' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  }}>
                    {stat.trend === 'up' ? '↑' : '↓'} {stat.change}
                  </span>
                  <div style={{ fontSize: '10px', color: subtext, marginTop: '4px' }}>this month</div>
                </div>
                {!isMobile && <Sparkline data={stat.spark} color={stat.color} />}
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isTablet ? '1fr' : '1fr 320px',
          gap: '16px',
          marginBottom: '16px',
        }}>

          {/* Bookings */}
          <div style={{
            background: cardBg, border: `1px solid ${cardBorder}`,
            borderRadius: '18px', overflow: 'hidden',
            animation: 'fadeInUp 0.5s ease 0.3s both',
            boxShadow: isDark ? 'none' : '0 2px 16px rgba(0,0,0,0.06)',
          }}>
            <div style={{
              padding: isMobile ? '14px' : '16px 20px',
              borderBottom: `1px solid ${tableBorder}`,
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: '10px',
            }}>
              <div>
                <h2 style={{ fontSize: '14px', fontWeight: '700', color: text }}>Recent Bookings</h2>
                <p style={{ fontSize: '11px', color: subtext, marginTop: '2px' }}>Showing {filtered.length} booking{filtered.length !== 1 ? 's' : ''}</p>
              </div>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
                {['all', 'confirmed', 'pending', 'cancelled'].map(f => (
                  <button key={f} onClick={() => setStatusFilter(f)} style={{
                    padding: '4px 10px', borderRadius: '100px',
                    border: `1px solid ${statusFilter === f ? 'rgba(232,184,109,0.5)' : cardBorder}`,
                    background: statusFilter === f ? 'rgba(232,184,109,0.15)' : 'transparent',
                    color: statusFilter === f ? '#e8b86d' : subtext,
                    fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                    transition: 'all 0.18s', textTransform: 'capitalize',
                  }}>{f}</button>
                ))}
                <button onClick={() => navigate('/bookings')} style={{
                  padding: '4px 10px', borderRadius: '100px',
                  border: '1px solid rgba(232,184,109,0.3)',
                  background: 'rgba(232,184,109,0.08)',
                  color: '#e8b86d', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                }}>View all →</button>
              </div>
            </div>

            {isMobile ? (
              <div style={{ padding: '12px' }}>
                {filtered.map(b => (
                  <div key={b.id} className="booking-card" style={{
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${cardBorder}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <span style={{
                          fontSize: '10px', fontFamily: 'monospace', fontWeight: '700',
                          color: subtext, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                          padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginBottom: '4px',
                        }}>#BK00{b.id}</span>
                        <div style={{ fontWeight: '700', color: text, fontSize: '14px' }}>{b.name}</div>
                        <div style={{ fontSize: '11px', color: subtext, marginTop: '2px' }}>{b.phone}</div>
                      </div>
                      <span style={{
                        padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '700',
                        background: statusConfig[b.status]?.bg, color: statusConfig[b.status]?.color,
                        border: `1px solid ${statusConfig[b.status]?.border}`,
                        whiteSpace: 'nowrap',
                      }}>
                        {statusConfig[b.status]?.icon} {b.status}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                      {[
                        { label: 'Room', value: b.room },
                        { label: 'Check In', value: b.checkIn },
                        { label: 'Check Out', value: b.checkOut },
                      ].map(item => (
                        <div key={item.label}>
                          <div style={{ fontSize: '10px', color: subtext, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px' }}>{item.label}</div>
                          <div style={{ fontSize: '12px', color: text, fontWeight: '600' }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: isDark ? '#e8b86d' : '#b45309' }}>{b.amount}</span>
                      <button onClick={() => navigate('/bookings')} style={{
                        padding: '6px 14px', borderRadius: '8px',
                        background: 'rgba(232,184,109,0.1)', border: '1px solid rgba(232,184,109,0.3)',
                        color: '#e8b86d', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                      }}>View →</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${tableBorder}`, background: isDark ? 'transparent' : 'rgba(0,0,0,0.02)' }}>
                      {['#ID', 'Guest', 'Room', 'Check In', 'Check Out', 'Amount', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{
                          textAlign: 'left', padding: '10px 16px',
                          fontSize: '10px', color: tableHeader,
                          textTransform: 'uppercase', letterSpacing: '0.5px',
                          fontWeight: '700', whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(b => (
                      <tr key={b.id} className="booking-row"
                        onMouseEnter={() => setHoveredRow(b.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        style={{ borderBottom: `1px solid ${tableBorder}`, background: hoveredRow === b.id ? rowHover : 'transparent' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            fontSize: '11px', fontWeight: '700', color: subtext,
                            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                            padding: '2px 7px', borderRadius: '5px', fontFamily: 'monospace',
                          }}>#BK00{b.id}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: '700', color: text, fontSize: '13px' }}>{b.name}</div>
                          <div style={{ fontSize: '11px', color: subtext, marginTop: '2px' }}>{b.phone}</div>
                        </td>
                        <td style={{ padding: '12px 16px', color: subtext, fontSize: '13px', fontWeight: '500' }}>{b.room}</td>
                        <td style={{ padding: '12px 16px', color: subtext, fontSize: '13px', whiteSpace: 'nowrap' }}>{b.checkIn}</td>
                        <td style={{ padding: '12px 16px', color: subtext, fontSize: '13px', whiteSpace: 'nowrap' }}>{b.checkOut}</td>
                        <td style={{ padding: '12px 16px', fontWeight: '700', color: isDark ? '#e8b86d' : '#b45309', fontSize: '13px' }}>{b.amount}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '700',
                            background: statusConfig[b.status]?.bg, color: statusConfig[b.status]?.color,
                            border: `1px solid ${statusConfig[b.status]?.border}`,
                            display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap',
                          }}>
                            {statusConfig[b.status]?.icon} {b.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button onClick={() => navigate('/bookings')} className="view-btn" style={{
                              padding: '4px 12px', borderRadius: '6px',
                              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                              border: `1px solid ${cardBorder}`, color: subtext,
                              fontSize: '11px', cursor: 'pointer', fontWeight: '600',
                            }}>View</button>
                            {b.status === 'pending' && (
                              <button style={{
                                padding: '4px 10px', borderRadius: '6px',
                                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
                                color: '#16a34a', fontSize: '11px', cursor: 'pointer', fontWeight: '700',
                              }}>✓</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Live Activity */}
          {!isMobile && (
            <div style={{
              background: cardBg, border: `1px solid ${cardBorder}`,
              borderRadius: '18px', overflow: 'hidden',
              animation: 'fadeInUp 0.5s ease 0.35s both',
              display: 'flex', flexDirection: 'column',
              boxShadow: isDark ? 'none' : '0 2px 16px rgba(0,0,0,0.06)',
            }}>
              <div style={{
                padding: '16px 18px', borderBottom: `1px solid ${tableBorder}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <h2 style={{ fontSize: '14px', fontWeight: '700', color: text }}>Live Activity</h2>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s ease-in-out infinite' }} />
              </div>
              <div style={{ padding: '8px', flex: 1 }}>
                {activityFeed.map((a, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: '10px', alignItems: 'flex-start',
                    padding: '11px 10px', borderRadius: '10px',
                    borderBottom: i < activityFeed.length - 1 ? `1px solid ${tableBorder}` : 'none',
                  }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                      background: `${a.color}18`, border: `1px solid ${a.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                    }}>{a.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', color: text, lineHeight: '1.4', marginBottom: '2px', fontWeight: '500' }}>{a.text}</div>
                      <div style={{ fontSize: '11px', color: subtext }}>{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ margin: '8px', borderRadius: '12px', padding: '14px', background: insightBg, border: '1px solid rgba(232,184,109,0.2)' }}>
                <div style={{ fontSize: '10px', color: subtext, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Today's Insights</div>
                {[
                  { label: 'Peak Booking Time', value: '6 PM - 9 PM' },
                  { label: 'Most Booked Room', value: 'Deluxe' },
                  { label: "Today's Revenue", value: '₹23,000' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: i < 2 ? '8px' : '0', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: subtext, fontWeight: '500' }}>{item.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: isDark ? '#e8b86d' : '#b45309', background: 'rgba(232,184,109,0.1)', padding: '2px 8px', borderRadius: '5px' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* On mobile: Live activity */}
        {isMobile && (
          <div style={{
            background: cardBg, border: `1px solid ${cardBorder}`,
            borderRadius: '16px', padding: '14px',
            marginBottom: '16px',
            animation: 'fadeInUp 0.5s ease 0.35s both',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '700', color: text }}>Live Activity</h2>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s ease-in-out infinite' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activityFeed.slice(0, 3).map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                    background: `${a.color}18`, border: `1px solid ${a.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px',
                  }}>{a.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', color: text, fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.text}</div>
                    <div style={{ fontSize: '10px', color: subtext }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={{
          background: cardBg, border: `1px solid ${cardBorder}`,
          borderRadius: '18px', padding: isMobile ? '14px' : '18px 20px',
          animation: 'fadeInUp 0.5s ease 0.4s both',
          boxShadow: isDark ? 'none' : '0 2px 16px rgba(0,0,0,0.06)',
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: '700', color: text, marginBottom: '12px' }}>Quick Actions</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(auto-fit, minmax(140px,1fr))',
            gap: '10px',
          }}>
            {quickActions.map((a, i) => (
              <button key={i} className="quick-btn"
                onClick={() => navigate(a.link)}
                onMouseEnter={() => setHoveredAction(i)}
                onMouseLeave={() => setHoveredAction(null)}
                style={{
                  padding: isMobile ? '12px' : '14px 16px',
                  borderRadius: '12px',
                  background: hoveredAction === i ? a.bg.replace('0.1', '0.18') : a.bg,
                  border: `1px solid ${hoveredAction === i ? a.color + '60' : a.border}`,
                  color: a.color, fontSize: '13px', fontWeight: '700',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  gap: '8px', justifyContent: 'center',
                  boxShadow: hoveredAction === i ? `0 8px 20px ${a.color}25` : 'none',
                }}>
                <span style={{ fontSize: '16px' }}>{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}