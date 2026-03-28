import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ── Default Fallback Data ────────────────────────────────────────
const DEFAULT_REVENUE = [
  { month: 'Oct', revenue: 85000,  bookings: 28,  occupancy: 62 },
  { month: 'Nov', revenue: 102000, bookings: 35,  occupancy: 70 },
  { month: 'Dec', revenue: 138000, bookings: 52,  occupancy: 85 },
  { month: 'Jan', revenue: 95000,  bookings: 31,  occupancy: 65 },
  { month: 'Feb', revenue: 187000, bookings: 68,  occupancy: 88 },
  { month: 'Mar', revenue: 324500, bookings: 124, occupancy: 95 },
];

const DEFAULT_ROOM_DATA = [
  { name: 'Standard', value: 35, color: '#60a5fa', bookings: 43,  revenue: 107500 },
  { name: 'Deluxe',   value: 45, color: '#e8b86d', bookings: 56,  revenue: 224000 },
  { name: 'Suite',    value: 20, color: '#22c55e', bookings: 25,  revenue: 187500 },
];

const DEFAULT_WEEKLY_DATA = [
  { day: 'Mon', checkins: 8,  checkouts: 5,  revenue: 32000,  isToday: false },
  { day: 'Tue', checkins: 12, checkouts: 9,  revenue: 48000,  isToday: false },
  { day: 'Wed', checkins: 6,  checkouts: 11, revenue: 24000,  isToday: false },
  { day: 'Thu', checkins: 15, checkouts: 8,  revenue: 60000,  isToday: false },
  { day: 'Fri', checkins: 22, checkouts: 14, revenue: 88000,  isToday: false },
  { day: 'Sat', checkins: 28, checkouts: 18, revenue: 112000, isToday: true  },
  { day: 'Sun', checkins: 19, checkouts: 22, revenue: 76000,  isToday: false },
];

const DEFAULT_TOP_GUESTS = [
  { name: 'Priya Sharma', visits: 4, spent: '₹32,000', spentNum: 32000, room: 'Deluxe'   },
  { name: 'Rahul Verma',  visits: 3, spent: '₹45,000', spentNum: 45000, room: 'Suite'    },
  { name: 'Anjali Singh', visits: 5, spent: '₹25,000', spentNum: 25000, room: 'Standard' },
  { name: 'Meera Joshi',  visits: 2, spent: '₹60,000', spentNum: 60000, room: 'Suite'    },
];

const avatarGradients = [
  ['#e8b86d','#c9973a'],
  ['#60a5fa','#3b82f6'],
  ['#22c55e','#16a34a'],
  ['#a78bfa','#7c3aed'],
];

// Period → how many months of data to show
const PERIOD_MONTHS = { '1W': 1, '1M': 1, '3M': 3, '6M': 6, '1Y': 6 };

// ── Custom tooltip ───────────────────────────────────────────────
function CustomTooltip({ active, payload, label, isDark }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: isDark ? 'rgba(10,10,20,0.97)' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`, borderRadius: '12px', padding: '12px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
      <p style={{ fontSize: '12px', fontWeight: '700', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', marginBottom: '6px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: '13px', fontWeight: '700', color: p.color, margin: '2px 0' }}>
          {p.name}: {p.name === 'Revenue' ? `₹${Number(p.value).toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
}

// ── Today-aware bar ──────────────────────────────────────────────
function TodayBar(props) {
  const { x, y, width, height, isToday, fill } = props;
  if (!height || height <= 0) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} rx={5} opacity={isToday ? 1 : 0.75} />
      {isToday && (
        <rect x={x} y={y} width={width} height={height} fill="none" stroke={fill} strokeWidth={2} rx={5}
          style={{ filter: `drop-shadow(0 0 6px ${fill})` }} />
      )}
    </g>
  );
}

// ── Export helper (Updated to take dynamic data) ─────────────────
function exportReport(revenueData, roomData, topGuests) {
  const lines = [
    'Innhance Hotels — Analytics Report',
    `Generated: ${new Date().toLocaleDateString('en-IN')}`,
    '',
    'Month,Revenue,Bookings,Occupancy %',
    ...revenueData.map(r => `${r.month},${r.revenue},${r.bookings},${r.occupancy}%`),
    '',
    'Room Type,Share %,Bookings,Revenue',
    ...roomData.map(r => `${r.name},${r.value}%,${r.bookings},${r.revenue}`),
    '',
    'Top Guests',
    'Name,Visits,Room,Spent',
    ...topGuests.map(g => `${g.name},${g.visits},${g.room},${g.spent}`),
  ].join('\n');
  const blob = new Blob([lines], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a'); a.href = url; a.download = 'innhance-analytics.csv'; a.click();
  URL.revokeObjectURL(url);
}

// ── Main component ───────────────────────────────────────────────
export default function Analytics({ theme = 'dark' }) {
  // ── ✅ Backend States ──────────────────────────────────────────
  const [allRevenue, setAllRevenue] = useState(DEFAULT_REVENUE);
  const [roomStats, setRoomStats]   = useState(DEFAULT_ROOM_DATA);
  const [weekStats, setWeekStats]   = useState(DEFAULT_WEEKLY_DATA);
  const [guestsList, setGuestsList] = useState(DEFAULT_TOP_GUESTS);
  
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState(null);

  const [period, setPeriod]   = useState('6M');
  const [isMobile, setMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setTablet] = useState(window.innerWidth <= 1100);

  // ── ✅ Fetch Data from Backend (Port 8080) ─────────────────────
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:8080/api/analytics');
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const data = await response.json();
        
        // Ensure data exists before setting, otherwise fallback to defaults
        setAllRevenue(data.revenueData || DEFAULT_REVENUE);
        setRoomStats(data.roomData || DEFAULT_ROOM_DATA);
        setWeekStats(data.weeklyData || DEFAULT_WEEKLY_DATA);
        setGuestsList(data.topGuests || DEFAULT_TOP_GUESTS);
        
      } catch (err) {
        console.error('Error fetching analytics from backend, using fallback data:', err);
        setError(err.message);
        // Fallback is already handled by default state, but we ensure it here
        setAllRevenue(DEFAULT_REVENUE);
        setRoomStats(DEFAULT_ROOM_DATA);
        setWeekStats(DEFAULT_WEEKLY_DATA);
        setGuestsList(DEFAULT_TOP_GUESTS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  useEffect(() => {
    function onResize() { setMobile(window.innerWidth <= 768); setTablet(window.innerWidth <= 1100); }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isDark      = theme === 'dark';
  const text        = isDark ? '#fff'                   : '#0f172a';
  const subtext     = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
  const cardBg      = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const cardBorder  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.09)';
  const gridColor   = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const axisColor   = isDark ? 'rgba(255,255,255,0.3)'  : 'rgba(0,0,0,0.4)';

  // Slice data based on selected period
  const months      = PERIOD_MONTHS[period] || 6;
  const revenueData = allRevenue.slice(-months);

  // Derived KPI values from current period
  const totalRevenue = revenueData.reduce((s, r) => s + r.revenue, 0);
  const totalBookings= revenueData.reduce((s, r) => s + r.bookings, 0);
  const avgOccupancy = Math.round(revenueData.reduce((s, r) => s + r.occupancy, 0) / revenueData.length) || 0;
  const totalGuest   = guestsList.reduce((s, g) => s + g.spentNum, 0);

  const kpis = [
    { label: 'Total Revenue',   value: `₹${totalRevenue.toLocaleString()}`, change: '+28%', trend: 'up', color: '#22c55e', icon: '💰', sub: `Last ${period}` },
    { label: 'Total Bookings',  value: `${totalBookings}`,                  change: '+18%', trend: 'up', color: '#e8b86d', icon: '📅', sub: `Last ${period}` },
    { label: 'Avg Occupancy',   value: `${avgOccupancy}%`,                  change: '+12%', trend: 'up', color: '#60a5fa', icon: '🏨', sub: 'Across all rooms' },
    { label: 'Avg Stay',        value: '2.4 nights',                        change: '+0.3', trend: 'up', color: '#a78bfa', icon: '🌙', sub: 'Per booking' },
    { label: 'Top Room',        value: 'Deluxe',                            change: '45% share', trend: 'up', color: '#f59e0b', icon: '🌟', sub: 'Most booked' },
    { label: 'Repeat Guests',   value: '34%',                               change: '+8%',  trend: 'up', color: '#ec4899', icon: '🔁', sub: 'Return rate' },
  ];

  // Grid columns
  const kpiCols    = isMobile ? 'repeat(2,1fr)' : isTablet ? 'repeat(3,1fr)' : 'repeat(6,1fr)';
  const chartRow1  = isMobile || isTablet ? '1fr' : '2fr 1fr';
  const chartRow2  = isMobile ? '1fr' : '1fr 1fr';
  const chartH1    = isMobile ? 180 : 220;
  const chartH2    = isMobile ? 160 : 200;
  const pieOuter   = isMobile ? 80 : 90;
  const pieInner   = isMobile ? 50 : 58;
  const pieH       = isMobile ? 160 : 190;

  if (isLoading) {
    return (
      <div style={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: subtext, fontFamily: "'DM Sans', sans-serif" }}>
        Loading Analytics Data...
      </div>
    );
  }

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeInUp { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
        .an-root { font-family:'DM Sans','Segoe UI',system-ui,sans-serif; }
        .kpi-card { transition:transform 0.2s ease,box-shadow 0.2s ease; }
        .kpi-card:hover { transform:translateY(-3px)!important; }
        .period-btn { transition:all 0.18s ease; cursor:pointer; }
        .export-btn:hover { background:rgba(232,184,109,0.15)!important; color:#e8b86d!important; border-color:rgba(232,184,109,0.4)!important; }
        .guest-row { transition:background 0.15s; }
        .guest-row:hover { background:${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}!important; }
      `}</style>

      <div className="an-root">

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '20px', animation: 'fadeInUp 0.5s ease forwards', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '800', color: text, letterSpacing: '-0.5px', marginBottom: '4px' }}>Analytics</h1>
            <p style={{ color: subtext, fontSize: '13px' }}>Track your hotel performance and trends</p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Period selector */}
            <div style={{ display: 'flex', gap: '4px', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', borderRadius: '12px', padding: '4px' }}>
              {['1W','1M','3M','6M','1Y'].map(p => (
                <button key={p} className="period-btn" onClick={() => setPeriod(p)} style={{
                  padding: isMobile ? '5px 10px' : '6px 14px', borderRadius: '8px',
                  fontSize: '12px', fontWeight: '700', border: 'none', fontFamily: 'inherit',
                  background: period === p ? isDark ? 'rgba(232,184,109,0.2)' : 'rgba(232,184,109,0.25)' : 'transparent',
                  color: period === p ? '#e8b86d' : subtext,
                  boxShadow: period === p ? '0 2px 8px rgba(232,184,109,0.15)' : 'none',
                }}>{p}</button>
              ))}
            </div>

            {/* Export button */}
            <button className="export-btn" onClick={() => exportReport(revenueData, roomStats, guestsList)} style={{
              padding: isMobile ? '7px 10px' : '8px 14px', borderRadius: '10px',
              background: 'transparent', border: `1px solid ${cardBorder}`,
              color: subtext, fontSize: '12px', fontWeight: '600',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s',
              display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap',
            }}>
              📥 {!isMobile && 'Export'}
            </button>
          </div>
        </div>

        {/* ── KPI Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: kpiCols, gap: '12px', marginBottom: '20px', animation: 'fadeInUp 0.5s ease 0.05s both' }}>
          {kpis.map((k, i) => (
            <div key={i} className="kpi-card" style={{
              background: isDark ? `linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.1))` : '#fff',
              border: `1px solid ${cardBorder}`, borderRadius: '16px',
              padding: isMobile ? '14px' : '16px 18px',
              boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.06)',
              animation: `fadeInUp 0.5s ease ${i * 0.05}s both`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '9px', color: subtext, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: '1.4' }}>{k.label}</span>
                <span style={{ fontSize: '17px', width: '28px', height: '28px', borderRadius: '7px', background: `${k.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{k.icon}</span>
              </div>
              <div style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '800', color: k.color, letterSpacing: '-0.5px', marginBottom: '6px', lineHeight: 1 }}>{k.value}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: k.trend === 'up' ? '#22c55e' : '#ef4444', background: k.trend === 'up' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', padding: '1px 6px', borderRadius: '100px', border: `1px solid ${k.trend === 'up' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                  {k.trend === 'up' ? '↑' : '↓'} {k.change}
                </span>
                <span style={{ fontSize: '10px', color: subtext }}>{k.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Revenue chart + Donut ── */}
        <div style={{ display: 'grid', gridTemplateColumns: chartRow1, gap: '16px', marginBottom: '16px', animation: 'fadeInUp 0.5s ease 0.1s both' }}>

          {/* Revenue Area Chart */}
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '18px', padding: isMobile ? '16px' : '20px', boxShadow: isDark ? 'none' : '0 2px 16px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: '700', color: text, marginBottom: '2px' }}>Revenue Overview</h2>
                <p style={{ fontSize: '12px', color: subtext }}>Monthly revenue trend</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {[{ c: '#e8b86d', l: 'Revenue' }, { c: '#60a5fa', l: 'Occupancy %' }].map((x, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: x.c }} />
                    <span style={{ fontSize: '11px', color: subtext }}>{x.l}</span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={chartH1}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#e8b86d" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e8b86d" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left"  tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`} width={isMobile ? 42 : 55} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} width={30} />
                <Tooltip content={<CustomTooltip isDark={isDark} />} />
                <Area yAxisId="left"  type="monotone" dataKey="revenue"   name="Revenue"    stroke="#e8b86d" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: '#e8b86d', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Area yAxisId="right" type="monotone" dataKey="occupancy" name="Occupancy %" stroke="#60a5fa" strokeWidth={2}   fill="url(#occGrad)" strokeDasharray="5 3" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Room Distribution Donut */}
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '18px', padding: isMobile ? '16px' : '20px', boxShadow: isDark ? 'none' : '0 2px 16px rgba(0,0,0,0.06)' }}>
            <div style={{ marginBottom: '12px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '700', color: text, marginBottom: '2px' }}>Room Distribution</h2>
              <p style={{ fontSize: '12px', color: subtext }}>Bookings by room type</p>
            </div>

            {/* Bigger donut */}
            <ResponsiveContainer width="100%" height={pieH}>
              <PieChart>
                <Pie data={roomStats} cx="50%" cy="50%" innerRadius={pieInner} outerRadius={pieOuter} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {roomStats.map((entry, i) => <Cell key={i} fill={entry.color} opacity={0.9} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v}%`, n]} contentStyle={{ background: isDark ? 'rgba(10,10,20,0.97)' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`, borderRadius: '10px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {roomStats.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '10px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${cardBorder}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: r.color, flexShrink: 0, boxShadow: `0 0 6px ${r.color}60` }} />
                    <span style={{ fontSize: '12px', color: subtext, fontWeight: '500' }}>{r.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', color: text, fontWeight: '700' }}>{r.value}%</span>
                    <span style={{ fontSize: '11px', color: subtext }}>{r.bookings} bk</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Weekly + Top Guests ── */}
        <div style={{ display: 'grid', gridTemplateColumns: chartRow2, gap: '16px', animation: 'fadeInUp 0.5s ease 0.15s both' }}>

          {/* Weekly Bar Chart with today highlighted */}
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '18px', padding: isMobile ? '16px' : '20px', boxShadow: isDark ? 'none' : '0 2px 16px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: '700', color: text, marginBottom: '2px' }}>This Week</h2>
                <p style={{ fontSize: '12px', color: subtext }}>Daily check-ins vs check-outs</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                {[{ c: '#e8b86d', l: 'Check-ins' }, { c: '#60a5fa', l: 'Check-outs' }].map((l, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: l.c }} />
                    <span style={{ fontSize: '11px', color: subtext }}>{l.l}</span>
                  </div>
                ))}
                {/* Today indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.6)' }} />
                  <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: '600' }}>Today</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={chartH2}>
              <BarChart data={weekStats} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="day" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(val, idx) => weekStats[idx]?.isToday ? `${val} ●` : val}
                />
                <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} width={25} />
                <Tooltip content={<CustomTooltip isDark={isDark} />} />
                <Bar dataKey="checkins" name="Check-ins"
                  shape={(props) => <TodayBar {...props} isToday={weekStats[props.index]?.isToday} fill="#e8b86d" />}
                />
                <Bar dataKey="checkouts" name="Check-outs"
                  shape={(props) => <TodayBar {...props} isToday={weekStats[props.index]?.isToday} fill="#60a5fa" />}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Guests */}
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '18px', padding: isMobile ? '16px' : '20px', boxShadow: isDark ? 'none' : '0 2px 16px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: '700', color: text, marginBottom: '2px' }}>Top Guests</h2>
                <p style={{ fontSize: '12px', color: subtext }}>By total spending</p>
              </div>
              <span style={{ fontSize: '11px', color: '#e8b86d', fontWeight: '700', cursor: 'pointer', padding: '4px 10px', borderRadius: '100px', background: 'rgba(232,184,109,0.1)', border: '1px solid rgba(232,184,109,0.2)' }}>View all →</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {guestsList.map((g, i) => {
                const [g1, g2] = avatarGradients[i % avatarGradients.length];
                const rankIcon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`;
                return (
                  <div key={i} className="guest-row" style={{
                    display: 'flex', alignItems: 'center', gap: '11px',
                    padding: '10px 12px', borderRadius: '12px',
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${cardBorder}`,
                  }}>
                    {/* Rank medal */}
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0, background: i < 3 ? `${avatarGradients[i][0]}20` : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: `1px solid ${i < 3 ? avatarGradients[i][0] + '35' : cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: i < 3 ? '14px' : '11px', fontWeight: '800', color: i < 3 ? avatarGradients[i][0] : subtext }}>
                      {rankIcon}
                    </div>

                    {/* Avatar */}
                    <div style={{ width: '32px', height: '32px', borderRadius: '9px', flexShrink: 0, background: `linear-gradient(135deg, ${g1}33, ${g2}22)`, border: `1.5px solid ${g1}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800', color: g1 }}>
                      {g.name[0]}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</div>
                      <div style={{ fontSize: '11px', color: subtext, marginTop: '1px' }}>{g.visits} visit{g.visits > 1 ? 's' : ''} · {g.room}</div>
                    </div>

                    {/* Spend + bar */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: isDark ? '#e8b86d' : '#b45309' }}>{g.spent}</div>
                      {/* Mini spend bar */}
                      <div style={{ width: '50px', height: '3px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderRadius: '100px', marginTop: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.round((g.spentNum / Math.max(...guestsList.map(x => x.spentNum))) * 100)}%`, background: '#e8b86d', borderRadius: '100px' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div style={{ marginTop: '12px', padding: '12px 14px', borderRadius: '12px', background: isDark ? 'rgba(232,184,109,0.06)' : 'rgba(232,184,109,0.08)', border: '1px solid rgba(232,184,109,0.18)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: subtext, fontWeight: '500' }}>Total from top guests</span>
                <span style={{ fontSize: '15px', fontWeight: '800', color: isDark ? '#e8b86d' : '#b45309' }}>₹{totalGuest.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}