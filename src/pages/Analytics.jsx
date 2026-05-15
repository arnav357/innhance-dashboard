import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./Analytics.css";

// ── Default Fallback Data ────────────────────────────────────────
const DEFAULT_REVENUE = [
  { month: "Oct", revenue: 85000, bookings: 28, occupancy: 62 },
  { month: "Nov", revenue: 102000, bookings: 35, occupancy: 70 },
  { month: "Dec", revenue: 138000, bookings: 52, occupancy: 85 },
  { month: "Jan", revenue: 95000, bookings: 31, occupancy: 65 },
  { month: "Feb", revenue: 187000, bookings: 68, occupancy: 88 },
  { month: "Mar", revenue: 324500, bookings: 124, occupancy: 95 },
];

const DEFAULT_ROOM_DATA = [
  {
    name: "Standard",
    value: 35,
    color: "#60a5fa",
    bookings: 43,
    revenue: 107500,
  },
  {
    name: "Deluxe",
    value: 45,
    color: "#e8b86d",
    bookings: 56,
    revenue: 224000,
  },
  { name: "Suite", value: 20, color: "#22c55e", bookings: 25, revenue: 187500 },
];

const DEFAULT_WEEKLY_DATA = [
  { day: "Mon", checkins: 8, checkouts: 5, revenue: 32000, isToday: false },
  { day: "Tue", checkins: 12, checkouts: 9, revenue: 48000, isToday: false },
  { day: "Wed", checkins: 6, checkouts: 11, revenue: 24000, isToday: false },
  { day: "Thu", checkins: 15, checkouts: 8, revenue: 60000, isToday: false },
  { day: "Fri", checkins: 22, checkouts: 14, revenue: 88000, isToday: false },
  { day: "Sat", checkins: 28, checkouts: 18, revenue: 112000, isToday: true },
  { day: "Sun", checkins: 19, checkouts: 22, revenue: 76000, isToday: false },
];

const DEFAULT_TOP_GUESTS = [
  {
    name: "Priya Sharma",
    visits: 4,
    spent: "₹32,000",
    spentNum: 32000,
    room: "Deluxe",
  },
  {
    name: "Rahul Verma",
    visits: 3,
    spent: "₹45,000",
    spentNum: 45000,
    room: "Suite",
  },
  {
    name: "Anjali Singh",
    visits: 5,
    spent: "₹25,000",
    spentNum: 25000,
    room: "Standard",
  },
  {
    name: "Meera Joshi",
    visits: 2,
    spent: "₹60,000",
    spentNum: 60000,
    room: "Suite",
  },
];

const avatarGradients = [
  ["#e8b86d", "#c9973a"],
  ["#60a5fa", "#3b82f6"],
  ["#22c55e", "#16a34a"],
  ["#a78bfa", "#7c3aed"],
];

// Period → how many months of data to show
// const PERIOD_MONTHS = { "1W": 1, "1M": 1, "3M": 3, "6M": 6, "1Y": 6 };

// ── Custom tooltip ───────────────────────────────────────────────
function CustomTooltip({ active, payload, label, isDark }) {
  if (!active || !payload?.length) return null;

  return (
    <div className={`an-tooltip ${isDark ? "dark" : "light"}`}>
      <p className="an-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="an-tooltip-item" style={{ color: p.color }}>
          {p.name}:{" "}
          {p.name === "Revenue"
            ? `₹${Number(p.value).toLocaleString()}`
            : p.value}
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
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        rx={5}
        opacity={isToday ? 1 : 0.75}
      />
      {isToday && (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="none"
          stroke={fill}
          strokeWidth={2}
          rx={5}
          style={{ filter: `drop-shadow(0 0 6px ${fill})` }}
        />
      )}
    </g>
  );
}

// ── Export helper ────────────────────────────────────────────────
function exportReport(revenueData, roomData, topGuests) {
  const lines = [
    "Innhance Hotels — Analytics Report",
    `Generated: ${new Date().toLocaleDateString("en-IN")}`,
    "",
    "Month,Revenue,Bookings,Occupancy %",
    ...revenueData.map(
      (r) => `${r.month},${r.revenue},${r.bookings},${r.occupancy}%`,
    ),
    "",
    "Room Type,Share %,Bookings,Revenue",
    ...roomData.map((r) => `${r.name},${r.value}%,${r.bookings},${r.revenue}`),
    "",
    "Top Guests",
    "Name,Visits,Room,Spent",
    ...topGuests.map((g) => `${g.name},${g.visits},${g.room},${g.spent}`),
  ].join("\n");

  const blob = new Blob([lines], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "innhance-analytics.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main component ───────────────────────────────────────────────
export default function Analytics({ theme = "dark" }) {
  const container = useRef();

  const [allRevenue, setAllRevenue] = useState(DEFAULT_REVENUE);
  const [roomStats, setRoomStats] = useState(DEFAULT_ROOM_DATA);
  const [weekStats, setWeekStats] = useState(DEFAULT_WEEKLY_DATA);
  const [guestsList, setGuestsList] = useState(DEFAULT_TOP_GUESTS);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    avgStay: 0,
    avgOccupancy: 0,
    topRoom: "N/A",
    topRoomShare: 0,
    repeatGuestPercentage: 0,
  });
  const currentDayIndex = new Date().getDay();
  const weeklyMap = {
    Mon: {
      day: "Mon",
      checkins: 0,
      checkouts: 0,
      revenue: 0,
      isToday: currentDayIndex === 1,
    },
    Tue: {
      day: "Tue",
      checkins: 0,
      checkouts: 0,
      revenue: 0,
      isToday: currentDayIndex === 2,
    },
    Wed: {
      day: "Wed",
      checkins: 0,
      checkouts: 0,
      revenue: 0,
      isToday: currentDayIndex === 3,
    },
    Thu: {
      day: "Thu",
      checkins: 0,
      checkouts: 0,
      revenue: 0,
      isToday: currentDayIndex === 4,
    },
    Fri: {
      day: "Fri",
      checkins: 0,
      checkouts: 0,
      revenue: 0,
      isToday: currentDayIndex === 5,
    },
    Sat: {
      day: "Sat",
      checkins: 0,
      checkouts: 0,
      revenue: 0,
      isToday: currentDayIndex === 6,
    },
    Sun: {
      day: "Sun",
      checkins: 0,
      checkouts: 0,
      revenue: 0,
      isToday: currentDayIndex === 0,
    },
  };
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("6M");
  const [isMobile, setMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setTablet] = useState(window.innerWidth <= 1100);

  useGSAP(
    () => {
      if (isLoading) return;

      const tl = gsap.timeline();
      tl.from(".an-header", {
        y: 30,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
      })
        .from(
          ".kpi-card",
          { y: 20, opacity: 0, duration: 1, stagger: 0.05, ease: "power4.out" },
          "-=1",
        )
        .from(
          ".an-chart-card",
          { y: 20, opacity: 0, duration: 1, stagger: 0.1, ease: "power4.out" },
          "-=0.8",
        );
    },
    { scope: container, dependencies: [isLoading] },
  );

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${backendUrl}/api/analytics?period=${period}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }

        const data = await response.json();

        setAllRevenue(data.revenueData || []);
        setRoomStats(data.roomData || []);
        setWeekStats(data.weeklyData || []);
        setGuestsList(data.topGuests || []);

        setAnalytics({
          totalRevenue: data.totalRevenue || 0,
          totalBookings: data.totalBookings || 0,
          avgStay: data.avgStay || 0,
          avgOccupancy: data.avgOccupancy || 0,
          topRoom: data.topRoom || "N/A",
          topRoomShare: data.topRoomShare || 0,
          repeatGuestPercentage: data.repeatGuestPercentage || 0,
        });
      } catch (err) {
        console.error(
          "Error fetching analytics from backend, using fallback data:",
          err,
        );
        setError(err.message);
        setAllRevenue(DEFAULT_REVENUE);
        setRoomStats(DEFAULT_ROOM_DATA);
        setWeekStats(DEFAULT_WEEKLY_DATA);
        setGuestsList(DEFAULT_TOP_GUESTS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [backendUrl, period]);

  useEffect(() => {
    const onResize = () => {
      setMobile(window.innerWidth <= 768);
      setTablet(window.innerWidth <= 1100);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isDark = theme === "dark";
  const text = isDark ? "#fff" : "#1E1E2F";
  const subtext = isDark ? "rgba(255,255,255,0.45)" : "#6B6B7A";
  const cardBg = isDark ? "rgba(255,255,255,0.03)" : "#FDFAF4";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(47,62,52,0.13)";
  const gridColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(47,62,52,0.1)";
  const axisColor = isDark ? "rgba(255,255,255,0.3)" : "#6B6B7A";

  const revenueData = allRevenue;

  const totalGuest = guestsList.reduce((s, g) => s + g.spentNum, 0);

  const kpis = [
    {
      label: "Total Revenue",
      value: `₹${analytics.totalRevenue.toLocaleString()}`,
      change: "+28%",
      trend: "up",
      color: isDark ? "#e8b86d" : "#2568b9",
      icon: "💰",
      sub: `Last ${period}`,
    },
    {
      label: "Total Bookings",
      value: `${analytics.totalBookings}`,
      change: "+18%",
      trend: "up",
      color: isDark ? "#e8b86d" : "#2568b9",
      icon: "📅",
      sub: `Last ${period}`,
    },
    {
      label: "Avg Occupancy",
      value: `${analytics.avgOccupancy}%`,
      change: "+12%",
      trend: "up",
      color: isDark ? "#e8b86d" : "#2568b9",
      icon: "🏨",
      sub: "Across all rooms",
    },
    {
      label: "Avg Stay",
      value: `${analytics.avgStay} nights`,
      change: "+0.3",
      trend: "up",
      color: isDark ? "#e8b86d" : "#2568b9",
      icon: "🌙",
      sub: "Per booking",
    },
    {
      label: "Top Room",
      value: analytics.topRoom,
      change: `${analytics.topRoomShare}% share`,
      trend: "up",
      color: isDark ? "#e8b86d" : "#2568b9",
      icon: "🌟",
      sub: "Most booked",
    },
    {
      label: "Repeat Guests",
      value: `${analytics.repeatGuestPercentage}%`,
      change: "+8%",
      trend: "up",
      color: isDark ? "#e8b86d" : "#2568b9",
      icon: "🔁",
      sub: "Return rate",
    },
  ];

  const kpiCols = isMobile
    ? "repeat(2, 1fr)"
    : isTablet
      ? "repeat(3, 1fr)"
      : "repeat(6, 1fr)";
  const chartRow1 = isMobile || isTablet ? "1fr" : "2fr 1fr";
  const chartRow2 = isMobile ? "1fr" : "1fr 1fr";
  const chartH1 = isMobile ? 180 : 220;
  const chartH2 = isMobile ? 160 : 200;
  const pieOuter = isMobile ? 80 : 90;
  const pieInner = isMobile ? 50 : 58;
  const pieH = isMobile ? 160 : 190;

  if (isLoading) {
    return <div className="an-loading">Loading Analytics Data...</div>;
  }

  return (
    <div>
      <div
        className={`an-root ${isDark ? "dark" : "light"} ${isMobile ? "is-mobile" : ""} ${isTablet ? "is-tablet" : ""}`}
        ref={container}
        style={{
          "--an-text": text,
          "--an-subtext": subtext,
          "--an-card-bg": cardBg,
          "--an-card-border": cardBorder,
          "--an-grid-color": gridColor,
          "--an-axis-color": axisColor,
          "--an-kpi-columns": kpiCols,
          "--an-chart-row-1": chartRow1,
          "--an-chart-row-2": chartRow2,
          "--an-page-title-size": isMobile ? "24px" : "30px",
          "--an-card-padding": isMobile ? "16px" : "20px",
          "--an-kpi-padding": isMobile ? "14px" : "18px 20px",
          "--an-kpi-value-size": isMobile ? "22px" : "26px",
          "--an-period-padding": isMobile ? "5px 10px" : "6px 14px",
          "--an-export-padding": isMobile ? "7px 10px" : "8px 14px",
          "--an-header-align": isMobile ? "flex-start" : "center",
          "--an-header-title-gap": isMobile ? "12px" : "16px",
        }}
      >
        <div className="an-header">
          <div>
            <h1 className="an-page-title">Analytics</h1>
            <p className="an-page-subtitle">
              Track your hotel performance and trends
            </p>
          </div>

          <div className="an-header-actions">
            <div className="an-period-selector">
              {["1W", "1M", "3M", "6M", "1Y"].map((p) => (
                <button
                  key={p}
                  className={`period-btn ${period === p ? "active" : ""}`}
                  onClick={() => setPeriod(p)}
                  type="button"
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              className="export-btn"
              onClick={() => exportReport(revenueData, roomStats, guestsList)}
              type="button"
            >
              <span>📥</span>
              {!isMobile && <span>Export</span>}
            </button>
          </div>
        </div>

        {error && (
          <div className="an-error-banner">
            Using fallback analytics data: {error}
          </div>
        )}

        <div className="an-kpi-grid">
          {kpis.map((k, i) => (
            <div
              key={i}
              className="kpi-card"
              style={{
                "--kpi-color": k.color,
                "--kpi-badge-bg": `${k.color}18`,
              }}
            >
              <div className="kpi-card-head">
                <span className="kpi-label">{k.label}</span>
                <span className="kpi-icon">{k.icon}</span>
              </div>

              <div className="kpi-value">{k.value}</div>

              <div className="kpi-foot">
                <span
                  className={`kpi-trend ${k.trend === "up" ? "up" : "down"}`}
                >
                  {k.trend === "up" ? "↑" : "↓"} {k.change}
                </span>
                <span className="kpi-subtext">{k.sub}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="an-grid an-grid-primary">
          <div className="an-chart-card">
            <div className="an-card-head an-card-head-spread">
              <div>
                <h2 className="an-card-title">Revenue Overview</h2>
                <p className="an-card-subtitle">Monthly revenue trend</p>
              </div>

              <div className="an-legend an-legend-wide">
                {[{ c: "#e8b86d", l: "Revenue", shape: "dot" }].map((x, i) => (
                  <div key={i} className="an-legend-item">
                    <div
                      className={`an-legend-mark ${x.shape}`}
                      style={{ "--legend-color": x.c }}
                    />
                    <span className="an-legend-label">{x.l}</span>
                  </div>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={chartH1}>
              <AreaChart
                data={revenueData}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e8b86d" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e8b86d" stopOpacity={0} />
                  </linearGradient>
                  {/* <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient> */}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: axisColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: axisColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`
                  }
                  width={isMobile ? 42 : 55}
                />
                {/* <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: axisColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                  width={30}
                /> */}
                <Tooltip content={<CustomTooltip isDark={isDark} />} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#e8b86d"
                  strokeWidth={2.5}
                  fill="url(#revGrad)"
                  dot={{ fill: "#e8b86d", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
                {/* <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="occupancy"
                  name="Occupancy %"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  fill="url(#occGrad)"
                  strokeDasharray="5 3"
                  dot={false}
                /> */}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="an-chart-card">
            <div className="an-card-head">
              <h2 className="an-card-title">Room Distribution</h2>
              <p className="an-card-subtitle">Bookings by room type</p>
            </div>

            <ResponsiveContainer width="100%" height={pieH}>
              <PieChart>
                <Pie
                  data={roomStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={pieInner}
                  outerRadius={pieOuter}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {roomStats.map((entry, i) => (
                    <Cell key={i} fill={entry.color} opacity={0.9} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip isDark={isDark} />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="an-room-list">
              {roomStats.map((r, i) => (
                <div key={i} className="an-room-row">
                  <div className="an-room-meta">
                    <div
                      className="an-room-swatch"
                      style={{
                        "--room-color": r.color,
                        "--room-glow": `${r.color}60`,
                      }}
                    />
                    <span className="an-room-name">{r.name}</span>
                  </div>
                  <div className="an-room-stats">
                    <span className="an-room-share">{r.value}%</span>
                    <span className="an-room-bookings">{r.bookings} bk</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="an-grid an-grid-secondary">
          <div className="an-chart-card">
            <div className="an-card-head an-card-head-spread">
              <div>
                <h2 className="an-card-title">This Week</h2>
                <p className="an-card-subtitle">
                  Daily check-ins vs check-outs
                </p>
              </div>

              <div className="an-legend an-legend-wrap">
                {[
                  { c: "#e8b86d", l: "Check-ins", shape: "square" },
                  { c: "#60a5fa", l: "Check-outs", shape: "square" },
                ].map((item, i) => (
                  <div key={i} className="an-legend-item">
                    <div
                      className={`an-legend-mark ${item.shape}`}
                      style={{ "--legend-color": item.c }}
                    />
                    <span className="an-legend-label">{item.l}</span>
                  </div>
                ))}

                <div className="an-legend-item">
                  <div className="an-legend-mark today" />
                  <span className="an-legend-label an-today-text">Today</span>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={chartH2}>
              <BarChart
                data={weekStats}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                barGap={3}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={gridColor}
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fill: axisColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val, idx) =>
                    weekStats[idx]?.isToday ? `${val} ●` : val
                  }
                />
                <YAxis
                  tick={{ fill: axisColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={25}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip isDark={isDark} />} />
                <Bar
                  dataKey="checkins"
                  name="Check-ins"
                  shape={(props) => (
                    <TodayBar
                      {...props}
                      isToday={weekStats[props.index]?.isToday}
                      fill="#e8b86d"
                    />
                  )}
                />
                <Bar
                  dataKey="checkouts"
                  name="Check-outs"
                  shape={(props) => (
                    <TodayBar
                      {...props}
                      isToday={weekStats[props.index]?.isToday}
                      fill="#60a5fa"
                    />
                  )}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="an-chart-card">
            <div className="an-card-head an-card-head-spread an-card-head-center">
              <div>
                <h2 className="an-card-title">Top Guests</h2>
                <p className="an-card-subtitle">By total spending</p>
              </div>
              <span className="an-chip-link">View all →</span>
            </div>

            <div className="an-guest-list">
              {guestsList.map((g, i) => {
                const [g1, g2] = avatarGradients[i % avatarGradients.length];
                const rankIcon =
                  i === 0
                    ? "🥇"
                    : i === 1
                      ? "🥈"
                      : i === 2
                        ? "🥉"
                        : `#${i + 1}`;
                const highestSpend = Math.max(
                  ...guestsList.map((x) => x.spentNum),
                );
                const spendWidth = Math.round(
                  (g.spentNum / highestSpend) * 100,
                );

                return (
                  <div
                    key={i}
                    className={`guest-row ${isDark ? "dark" : "light"}`}
                  >
                    <div
                      className="an-rank-badge"
                      style={{
                        "--rank-bg":
                          i < 3
                            ? `${avatarGradients[i][0]}20`
                            : isDark
                              ? "rgba(255,255,255,0.06)"
                              : "rgba(0,0,0,0.05)",
                        "--rank-border":
                          i < 3 ? `${avatarGradients[i][0]}35` : cardBorder,
                        "--rank-color": i < 3 ? avatarGradients[i][0] : subtext,
                        "--rank-size": i < 3 ? "14px" : "11px",
                      }}
                    >
                      {rankIcon}
                    </div>

                    <div
                      className="an-avatar"
                      style={{
                        "--avatar-grad-start": `${g1}33`,
                        "--avatar-grad-end": `${g2}22`,
                        "--avatar-border": `${g1}55`,
                        "--avatar-text": g1,
                      }}
                    >
                      {g.name[0]}
                    </div>

                    <div className="an-guest-info">
                      <div className="an-guest-name">{g.name}</div>
                      <div className="an-guest-meta">
                        {g.visits} visit{g.visits > 1 ? "s" : ""} · {g.room}
                      </div>
                    </div>

                    <div className="an-guest-spend">
                      <div className="an-guest-spent-value">{g.spent}</div>
                      <div className="an-mini-bar-track">
                        <div
                          className="an-mini-bar-fill"
                          style={{ "--mini-bar-width": `${spendWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="an-total-box">
              <div className="an-total-row">
                <span className="an-total-label">Total from top guests</span>
                <span className="an-total-value">
                  ₹{totalGuest.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
