import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import "./Overview.css";

const statusConfig = {
  confirmed: {
    bg: "rgba(34,197,94,0.1)",
    color: "#16a34a",
    border: "rgba(34,197,94,0.25)",
    icon: "✓",
  },
  pending: {
    bg: "rgba(245,158,11,0.1)",
    color: "#d97706",
    border: "rgba(245,158,11,0.25)",
    icon: "⏳",
  },
  cancelled: {
    bg: "rgba(239,68,68,0.1)",
    color: "#dc2626",
    border: "rgba(239,68,68,0.25)",
    icon: "✕",
  },
};

function Sparkline({ data, color }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const w = 70,
    h = 32;

  const pts = data
    .map(
      (v, i) =>
        `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4)}`,
    )
    .join(" ");

  return (
    <svg width={w} height={h}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

const mockBookings = [
  {
    _id: "101",
    guestName: "Arun Kumar",
    phone: "+91 98765 43210",
    roomType: "Deluxe Suite",
    checkIn: "2023-11-15T14:00:00Z",
    checkOut: "2023-11-18T11:00:00Z",
    status: "confirmed",
    totalAmount: 15000,
  },
  {
    _id: "102",
    guestName: "Priya Sharma",
    phone: "+91 87654 32109",
    roomType: "Standard Room",
    checkIn: "2023-11-16T14:00:00Z",
    checkOut: "2023-11-17T11:00:00Z",
    status: "pending",
    totalAmount: 4500,
  },
  {
    _id: "103",
    guestName: "Rahul Verma",
    phone: "+91 76543 21098",
    roomType: "Premium Suite",
    checkIn: "2023-11-20T14:00:00Z",
    checkOut: "2023-11-25T11:00:00Z",
    status: "confirmed",
    totalAmount: 35000,
  },
  {
    _id: "104",
    guestName: "Neha Gupta",
    phone: "+91 65432 10987",
    roomType: "Deluxe Suite",
    checkIn: "2023-11-10T14:00:00Z",
    checkOut: "2023-11-12T11:00:00Z",
    status: "cancelled",
    totalAmount: 12000,
  },
];

export default function Overview({ theme = "dark" }) {
  const navigate = useNavigate();
  const container = useRef();

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // ✅ ALL STATES
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useGSAP(
    () => {
      if (!loading) {
        const tl = gsap.timeline();
        tl.from(".ov-heading-container", {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "expo.out",
        })
          .from(
            ".stat-card",
            {
              y: 20,
              opacity: 0,
              duration: 0.7,
              stagger: 0.1,
              ease: "expo.out",
            },
            "-=0.5",
          )
          .from(
            ".main-grid-item",
            {
              y: 20,
              opacity: 0,
              duration: 0.7,
              stagger: 0.15,
              ease: "expo.out",
            },
            "-=0.4",
          );
      }
    },
    { scope: container, dependencies: [loading] },
  );

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1100);

  const hotelData = localStorage.getItem("hotel");
  const hotel = hotelData ? JSON.parse(hotelData) : {};

  // ✅ RESIZE EFFECT
  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth <= 1100);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ✅ FETCH BOOKINGS
  useEffect(() => {
    fetch(`${backendUrl}/booking/all`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setBookings(data.bookings || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err);
        setLoading(false);
      });
  }, [backendUrl]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const [typedGreeting, setTypedGreeting] = useState("");
  const [showTutorial, setShowTutorial] = useState(
    () => !localStorage.getItem("innhance_tutorial_seen"),
  );

  function dismissTutorial() {
    localStorage.setItem("innhance_tutorial_seen", "1");
    setShowTutorial(false);
  }

  useEffect(() => {
    let i = 0;
    setTypedGreeting("");
    const interval = setInterval(() => {
      setTypedGreeting(greeting.slice(0, i + 1));
      i++;
      if (i >= greeting.length) clearInterval(interval);
    }, 80);
    return () => clearInterval(interval);
  }, [greeting]);

  // ✅ LOADING
  if (loading) {
    return <div style={{ color: "white", padding: "20px" }}>Loading...</div>;
  }

  // ✅ STATS (DYNAMIC)
  const totalBookings = bookings.length;

  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === "verified" && b.status !== "cancelled")
    .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);

  const pending = bookings.filter((b) => b.status === "pending").length;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const activeCustomers = new Set(bookings.map((b) => b.phone)).size;

  // ✅ FORMAT FOR UI
  const formattedBookings = bookings.map((b) => ({
    id: b._id,
    name: b.guestName,
    phone: b.phone,
    room: b.roomType,
    checkIn: new Date(b.checkIn).toLocaleDateString(),
    checkOut: new Date(b.checkOut).toLocaleDateString(),
    status: b.status,
    amount: `₹${b.totalAmount}`,
  }));

  // ✅ COLORS / THEME
  const isDark = theme === "dark";
  const text = isDark ? "#fff" : "#1E1E2F";
  const subtext = isDark ? "rgba(255,255,255,0.45)" : "#6B6B7A";
  const cardBg = isDark ? "rgba(255,255,255,0.03)" : "#FDFAF4";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(47,62,52,0.13)";
  const rowHover = isDark ? "rgba(255,255,255,0.03)" : "rgba(47,62,52,0.05)";
  const tableBorder = isDark ? "rgba(255,255,255,0.05)" : "rgba(47,62,52,0.1)";
  const tableHeader = isDark ? "rgba(255,255,255,0.3)" : "#6B6B7A";
  const insightBg = isDark ? "rgba(232,184,109,0.06)" : "rgba(184,149,91,0.1)";

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const lastMonth = lastMonthDate.getMonth();
  const lastMonthYear = lastMonthDate.getFullYear();

  const currentMonthRevenue = bookings
    .filter((b) => {
      const d = new Date(b.createdAt || b.checkIn);
      return (
        b.paymentStatus === "verified" &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);
  const lastMonthRevenue = bookings
    .filter((b) => {
      const d = new Date(b.createdAt || b.checkIn);
      return (
        b.paymentStatus === "verified" &&
        d.getMonth() === lastMonthDate.getMonth() &&
        d.getFullYear() === lastMonthDate.getFullYear()
      );
    })
    .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);
  const revenueGrowth =
    lastMonthRevenue === 0
      ? 100
      : ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
  const revenueTrend = revenueGrowth >= 0 ? "up" : "down";

  // for total bookings growth percentage
  const currentMonthBookings = bookings.filter((b) => {
    const d = new Date(b.createdAt || b.checkIn);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const lastMonthBookings = bookings.filter((b) => {
    const d = new Date(b.createdAt || b.checkIn);
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
  }).length;

  const bookingsGrowth =
    lastMonthBookings === 0
      ? 100
      : ((currentMonthBookings - lastMonthBookings) / lastMonthBookings) * 100;

  const bookingsTrend = bookingsGrowth >= 0 ? "up" : "down";

  //for customers growth percentage
  const currentMonthCustomers = new Set(
    bookings
      .filter((b) => {
        const d = new Date(b.createdAt || b.checkIn);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .map((b) => b.phone),
  ).size;

  const lastMonthCustomers = new Set(
    bookings
      .filter((b) => {
        const d = new Date(b.createdAt || b.checkIn);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
      })
      .map((b) => b.phone),
  ).size;

  const customersGrowth =
    lastMonthCustomers === 0
      ? 100
      : ((currentMonthCustomers - lastMonthCustomers) / lastMonthCustomers) *
        100;

  const customersTrend = customersGrowth >= 0 ? "up" : "down";

  const stats = [
    {
      label: "Revenue",
      value: `₹${totalRevenue}`,
      icon: "💰",
      color: isDark ? "#e8b86d" : "#2568b9",
      change: "+8%",
      trend: "up",
      bg: isDark ? "rgba(232,184,109,0.08)" : "rgba(37,104,185,0.08)",
      border: isDark ? "rgba(232,184,109,0.15)" : "rgba(37,104,185,0.15)",
      spark: [40, 55, 48, 62, 58, 72, 80],
      link: "/bookings",
    },
    {
      label: "Total Bookings",
      value: totalBookings,
      icon: "📊",
      color: isDark ? "#e8b86d" : "#2568b9",
      change: "+12%",
      trend: "up",
      bg: isDark ? "rgba(232,184,109,0.08)" : "rgba(37,104,185,0.08)",
      border: isDark ? "rgba(232,184,109,0.15)" : "rgba(37,104,185,0.15)",
      spark: [30, 38, 35, 50, 45, 60, 62],
      link: "/bookings",
    },
    {
      label: "Active Customers",
      value: activeCustomers,
      icon: "👤",
      color: isDark ? "#e8b86d" : "#2568b9",
      change: "+5",
      trend: "up",
      bg: isDark ? "rgba(232,184,109,0.08)" : "rgba(37,104,185,0.08)",
      border: isDark ? "rgba(232,184,109,0.15)" : "rgba(37,104,185,0.15)",
      spark: [50, 52, 48, 58, 60, 65, 67],
      link: "/chats",
    },
    {
      label: "Pending",
      value: pending,
      icon: "⏳",
      color: isDark ? "#e8b86d" : "#2568b9",
      change: "-2",
      trend: "down",
      bg: isDark ? "rgba(232,184,109,0.08)" : "rgba(37,104,185,0.08)",
      border: isDark ? "rgba(232,184,109,0.15)" : "rgba(37,104,185,0.15)",
      spark: [10, 12, 9, 11, 8, 9, 7],
      link: "/bookings",
    },
  ];

  const dateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div
        className={`ov-root ${isDark ? "dark" : "light"}`}
        ref={container}
        style={{
          "--text": text,
          "--subtext": subtext,
          "--cardBg": cardBg,
          "--cardBorder": cardBorder,
          "--rowHover": rowHover,
          "--tableBorder": tableBorder,
          "--tableHeader": tableHeader,
          "--insightBg": insightBg,
        }}
      >
        {/* Header */}
        <div className="ov-heading-container">
          <h1 className="ov-heading">
            {typedGreeting}! <span className="waving-hand">👋</span>
          </h1>
          <p className="ov-date-str">
            {dateStr} ·{" "}
            <span className="ov-hotel-name">
              {hotel.name || "Innhance Hotels"}
            </span>
          </p>
        </div>

        {/* Tutorial Banner - shows only once on first login */}
        {showTutorial && (
          <div className={`tutorial-banner ${isDark ? "dark" : "light"}`}>
            <div className="tutorial-banner-top">
              <div className="tutorial-banner-title">
                <span className="tutorial-sparkle">✨</span>
                Welcome to Innhance! Here's a quick guide to get you started.
              </div>
              <button
                className="tutorial-dismiss-btn"
                onClick={dismissTutorial}
              >
                Got it ✓
              </button>
            </div>
            <div className="tutorial-items">
              <div className="tutorial-item">
                <span className="tutorial-item-icon">📊</span>
                <div>
                  <div className="tutorial-item-title">Overview</div>
                  <div className="tutorial-item-desc">
                    Your daily actions, smart alerts & recent bookings at a
                    glance.
                  </div>
                </div>
              </div>
              <div className="tutorial-item">
                <span className="tutorial-item-icon">📅</span>
                <div>
                  <div className="tutorial-item-title">Bookings</div>
                  <div className="tutorial-item-desc">
                    Add, view, filter and manage all guest reservations.
                  </div>
                </div>
              </div>
              <div className="tutorial-item">
                <span className="tutorial-item-icon">🛏️</span>
                <div>
                  <div className="tutorial-item-title">Rooms</div>
                  <div className="tutorial-item-desc">
                    Manage room types, pricing, availability and inventory.
                  </div>
                </div>
              </div>
              <div className="tutorial-item">
                <span className="tutorial-item-icon">💬</span>
                <div>
                  <div className="tutorial-item-title">Chats</div>
                  <div className="tutorial-item-desc">
                    Talk to guests, respond to inquiries and handle requests.
                  </div>
                </div>
              </div>
              <div className="tutorial-item">
                <span className="tutorial-item-icon">📈</span>
                <div>
                  <div className="tutorial-item-title">Analytics</div>
                  <div className="tutorial-item-desc">
                    Track revenue, occupancy trends and your top guests.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid-container">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`stat-card ${isDark ? "dark" : "light"}`}
              onClick={() => navigate(stat.link)}
              style={{
                "--stat-bg": stat.bg,
                "--stat-border": stat.border,
                "--stat-color": stat.color,
                "--stat-icon-bg": `${stat.color}15`,
                "--stat-icon-border": `${stat.color}20`,
                "--stat-hover-border": `${stat.color}55`,
                "--stat-hover-shadow": `${stat.color}25`,
              }}
            >
              <div className="stat-card-header">
                <p className="stat-card-title">{stat.label}</p>
                <span className="stat-card-icon">{stat.icon}</span>
              </div>
              <p className="stat-card-value">{stat.value}</p>
              <div className="stat-card-footer">
                <div>
                  <span
                    className={`stat-trend ${stat.trend === "up" ? "up" : "down"}`}
                  >
                    {stat.trend === "up" ? "↑" : "↓"} {stat.change}
                  </span>
                  <div className="stat-trend-text">this month</div>
                </div>
                {!isMobile && (
                  <Sparkline data={stat.spark} color={stat.color} />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div
          className="main-grid"
          style={{
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: "20px",
          }}
        >
          {/* Today's Actions */}
          <div className={`main-grid-item ${isDark ? "dark" : "light"}`}>
            <div className="grid-item-header">
              <h2 className="grid-item-title">Today's Actions</h2>
            </div>
            <div className="simple-list">
              <div className="list-item">
                <span className="list-item-icon">📈</span>
                <div className="list-item-content">
                  <div className="list-item-title">Increase Suite price</div>
                  <div className="list-item-desc">
                    High demand detected for this weekend
                  </div>
                </div>
              </div>
              <div className="list-item">
                <span className="list-item-icon">📞</span>
                <div className="list-item-content">
                  <div className="list-item-title">
                    Follow up with hot leads
                  </div>
                  <div className="list-item-desc">
                    3 inquiries pending response
                  </div>
                </div>
              </div>
              <div className="list-item">
                <span className="list-item-icon">⚠️</span>
                <div className="list-item-content">
                  <div className="list-item-title">Weekend occupancy alert</div>
                  <div className="list-item-desc">
                    Only 2 standard rooms left
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Alerts */}
          <div className={`main-grid-item ${isDark ? "dark" : "light"}`}>
            <div className="grid-item-header">
              <h2 className="grid-item-title">Smart Alerts</h2>
            </div>
            <div className="simple-list">
              <div className="list-item">
                <span className="list-item-icon">😴</span>
                <div className="list-item-content">
                  <div className="list-item-title">
                    High intent lead inactive
                  </div>
                  <div className="list-item-desc">
                    Guest looking at Deluxe Suite left chat
                  </div>
                </div>
              </div>
              <div className="list-item">
                <span className="list-item-icon">💳</span>
                <div className="list-item-content">
                  <div className="list-item-title">Payment pending</div>
                  <div className="list-item-desc">
                    Booking #BK00102 waiting for payment
                  </div>
                </div>
              </div>
              <div className="list-item">
                <span className="list-item-icon">📉</span>
                <div className="list-item-content">
                  <div className="list-item-title">Drop-off after pricing</div>
                  <div className="list-item-desc">
                    3 guests dropped off after seeing suite price
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Bookings (Simplified) */}
          <div className={`main-grid-item ${isDark ? "dark" : "light"}`}>
            <div className="grid-item-header">
              <h2 className="grid-item-title">Recent Bookings</h2>
              <button
                onClick={() => navigate("/bookings")}
                className="view-all-btn"
              >
                View all →
              </button>
            </div>
            <div className="simple-list">
              {formattedBookings.slice(0, 3).map((b) => (
                <div key={b.id} className="list-item booking-simple">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div className="booking-simple-avatar">
                      {b.name.charAt(0)}
                    </div>
                    <div className="list-item-content">
                      <div className="list-item-title">{b.name}</div>
                      <div className="list-item-desc">{b.room}</div>
                    </div>
                  </div>
                  <div
                    className={`booking-simple-amount ${isDark ? "dark" : "light"}`}
                  >
                    {b.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
