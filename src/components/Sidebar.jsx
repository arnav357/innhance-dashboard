import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, BedDouble,
  MessageCircle, BarChart3, LogOut,
  ChevronLeft, ChevronRight, Sun, Moon,
} from 'lucide-react';
const backendUrl = import.meta.env.VITE_BACKEND_URL;
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";


const navGroups = [
  {
    label: 'Core',
    links: [
      { to: '/', icon: LayoutDashboard, label: 'Overview' },
      { to: '/bookings', icon: CalendarDays, label: 'Bookings' },
      { to: '/rooms', icon: BedDouble, label: 'Rooms' },
    ],
  },
  {
    label: 'Communication',
    links: [{ to: '/chats', icon: MessageCircle, label: 'Chats' }],
  },
  {
    label: 'Insights',
    links: [{ to: '/analytics', icon: BarChart3, label: 'Analytics' }],
  },
];


export default function Sidebar({ theme, toggleTheme, onClose }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [hoveredLink, setHoveredLink] = useState(null);
  const hotelData = localStorage.getItem('user');
  const hotel = hotelData ? JSON.parse(hotelData) : {};
  const isDark = theme === 'dark';

  useEffect(() => {
  const socket = io(backendUrl);

  const token = localStorage.getItem("token");
  if (!token) return;
  const decoded = jwtDecode(token);
  const hotelId = decoded.hotelId;

  socket.on("connect", () => {
    socket.emit("join_hotel_room", hotelId);
    console.log("Connected to WebSocket, joined room:", hotelId);
  });

  socket.on("human_request", (data) => {
  alert(
`🔔 New Human Request

📞 Phone: ${data.phone}
💬 ${data.message}
⏰ ${new Date(data.time).toLocaleString()}`
  );

  console.log(data);
});

  return () => socket.disconnect();
}, []);


  useEffect(() => {
    function onResize() {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(false);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isCollapsed = isMobile ? false : collapsed;

  const bg = isDark
    ? 'linear-gradient(180deg, #0d0d1a 0%, #080812 100%)'
    : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)';
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.1)';
  const text = isDark ? '#fff' : '#1a1a2e';
  const subtext = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.45)';
  const linkColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
  const linkHoverBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('hotel');
    navigate('/login');
  }

  function handleNavClick() {
    if (onClose) onClose();
  }

  return (
    <div style={{
      width: isCollapsed ? '68px' : '240px',
      minWidth: isCollapsed ? '68px' : '240px',
      background: bg,
      borderRight: `1px solid ${border}`,
      display: 'flex', flexDirection: 'column',
      height: '100vh',
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      transition: 'width 0.3s ease, min-width 0.3s ease',
      overflow: 'hidden',
      boxShadow: isMobile
        ? '4px 0 32px rgba(0,0,0,0.5)'
        : isDark ? 'none' : '2px 0 12px rgba(0,0,0,0.06)',
    }}>

      {/* Logo + collapse/close */}
      <div style={{
        padding: isCollapsed ? '18px 0' : '18px 16px',
        borderBottom: `1px solid ${border}`,
        display: 'flex', alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between', gap: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '9px',
            overflow: 'hidden', flexShrink: 0,
            boxShadow: '0 4px 12px rgba(232,184,109,0.25)',
          }}>
            <img src="/logo.jpeg" alt="Innhance"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => {
                e.target.parentElement.innerHTML =
                  '<div style="width:100%;height:100%;background:linear-gradient(135deg,#1a1a2e,#0f3460);display:flex;align-items:center;justify-content:center;font-size:16px">🏨</div>';
              }}
            />
          </div>
          {!isCollapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontSize: '15px', fontWeight: '800', color: text,
                letterSpacing: '-0.3px', whiteSpace: 'nowrap',
                fontFamily: "'Playfair Display', serif",
              }}>Innhance</div>
              <div style={{ fontSize: '10px', color: subtext, marginTop: '1px' }}>Hotel Dashboard</div>
            </div>
          )}
        </div>

        {isMobile ? (
          <button onClick={onClose} style={{
            background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
            border: `1px solid ${border}`, borderRadius: '8px',
            color: subtext, cursor: 'pointer',
            width: '28px', height: '28px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: '700', flexShrink: 0,
          }}>✕</button>
        ) : (
          <button onClick={() => setCollapsed(c => !c)} style={{
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            border: `1px solid ${border}`, borderRadius: '8px',
            color: subtext, cursor: 'pointer',
            padding: '5px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s',
            marginTop: isCollapsed ? '8px' : '0',
          }}>
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      {/* Hotel info */}
      {!isCollapsed && (
        <div style={{ padding: '13px 16px', borderBottom: `1px solid ${border}` }}>
          <div style={{ fontSize: '10px', color: subtext, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px', fontWeight: '600' }}>
            Logged in as
          </div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#e8b86d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {hotel.name || 'Hotel Name'}
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            marginTop: '6px', padding: '3px 8px', borderRadius: '100px',
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
          }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.8)' }} />
            <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: '700' }}>Active</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: isCollapsed ? '10px 8px' : '10px 10px', overflowY: 'auto' }}>
        {navGroups.map((group, gi) => (
          <div key={gi} style={{ marginBottom: '6px' }}>
            {!isCollapsed && (
              <div style={{
                fontSize: '10px', color: subtext, textTransform: 'uppercase',
                letterSpacing: '1.2px', padding: '8px 10px 4px', fontWeight: '700',
              }}>{group.label}</div>
            )}
            {group.links.map(link => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to} to={link.to} end={link.to === '/'}
                  onClick={handleNavClick}
                  onMouseEnter={() => setHoveredLink(link.to)}
                  onMouseLeave={() => setHoveredLink(null)}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center',
                    gap: isCollapsed ? '0' : '10px',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    padding: isCollapsed ? '11px 0' : '11px 13px',
                    borderRadius: '10px', textDecoration: 'none', marginBottom: '2px',
                    fontSize: '13.5px', fontWeight: isActive ? '700' : '500',
                    background: isActive
                      ? isDark
                        ? 'linear-gradient(135deg, rgba(232,184,109,0.14), rgba(232,184,109,0.05))'
                        : 'linear-gradient(135deg, rgba(232,184,109,0.18), rgba(232,184,109,0.07))'
                      : hoveredLink === link.to ? linkHoverBg : 'transparent',
                    color: isActive ? '#e8b86d' : hoveredLink === link.to ? text : linkColor,
                    borderLeft: !isCollapsed && isActive ? '2.5px solid #e8b86d' : !isCollapsed ? '2.5px solid transparent' : 'none',
                    transition: 'all 0.18s ease',
                    transform: hoveredLink === link.to && !isActive ? 'translateX(2px)' : 'none',
                  })}
                >
                  <Icon size={17} strokeWidth={2} style={{ flexShrink: 0 }} />
                  {!isCollapsed && <span>{link.label}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      {!isCollapsed ? (
        <div style={{ padding: '0 10px 16px' }}>
          <button onClick={toggleTheme} style={{
            width: '100%', padding: '10px 13px', borderRadius: '10px',
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            border: `1px solid ${border}`,
            color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)',
            fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isDark ? <Moon size={14} /> : <Sun size={14} />}
              <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <div style={{
              width: '36px', height: '20px', borderRadius: '100px',
              background: isDark ? 'rgba(232,184,109,0.3)' : 'rgba(232,184,109,0.8)',
              position: 'relative', border: '1px solid rgba(232,184,109,0.4)', flexShrink: 0,
            }}>
              <div style={{
                width: '14px', height: '14px', borderRadius: '50%', background: '#e8b86d',
                position: 'absolute', top: '2px', left: isDark ? '2px' : '18px',
                transition: 'left 0.3s ease', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }} />
            </div>
          </button>

          <div style={{
            padding: '12px 13px', borderRadius: '12px', marginBottom: '8px',
            background: isDark
              ? 'linear-gradient(135deg, rgba(232,184,109,0.08), rgba(201,151,58,0.04))'
              : 'linear-gradient(135deg, rgba(232,184,109,0.15), rgba(201,151,58,0.08))',
            border: '1px solid rgba(232,184,109,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', color: subtext, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Plan</span>
              <span style={{ fontSize: '10px', fontWeight: '700', color: '#e8b86d', background: 'rgba(232,184,109,0.15)', padding: '2px 8px', borderRadius: '100px', border: '1px solid rgba(232,184,109,0.25)' }}>PRO ✨</span>
            </div>
            <div style={{ fontSize: '11px', color: subtext, fontWeight: '500' }}>
              Expires: {hotel.subscriptionExpiry || 'Jun 20, 2026'}
            </div>
          </div>

          <button onClick={handleLogout}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#fca5a5'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.color = isDark ? 'rgba(252,165,165,0.7)' : 'rgba(220,38,38,0.7)'; }}
            style={{
              width: '100%', padding: '10px', borderRadius: '10px',
              background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
              color: isDark ? 'rgba(252,165,165,0.7)' : 'rgba(220,38,38,0.7)',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            }}>
            <LogOut size={14} strokeWidth={2} /> Logout
          </button>
        </div>
      ) : (
        <div style={{ padding: '0 8px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <button onClick={toggleTheme} style={{
            width: '44px', height: '44px', borderRadius: '10px',
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            border: `1px solid ${border}`, color: subtext,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isDark ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button onClick={handleLogout} style={{
            width: '44px', height: '44px', borderRadius: '10px',
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
            color: isDark ? 'rgba(252,165,165,0.7)' : 'rgba(220,38,38,0.7)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <LogOut size={16} />
          </button>
        </div>
      )}
    </div>
  );
}