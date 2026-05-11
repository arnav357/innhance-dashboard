import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import "./Bookings.css";

const DEFAULT_BOOKINGS = [
  {
    id: 1,
    name: "Priya Sharma",
    phone: "+91 98765 43210",
    room: "Deluxe",
    guests: 2,
    checkIn: "22 Mar 2026",
    checkOut: "24 Mar 2026",
    status: "confirmed",
    amount: "₹8,000",
    source: "whatsapp",
    nights: 2,
  },
  {
    id: 2,
    name: "Rahul Verma",
    phone: "+91 87654 32109",
    room: "Suite",
    guests: 3,
    checkIn: "23 Mar 2026",
    checkOut: "25 Mar 2026",
    status: "pending",
    amount: "₹15,000",
    source: "whatsapp",
    nights: 2,
  },
  {
    id: 3,
    name: "Anjali Singh",
    phone: "+91 76543 21098",
    room: "Standard",
    guests: 1,
    checkIn: "24 Mar 2026",
    checkOut: "26 Mar 2026",
    status: "confirmed",
    amount: "₹5,000",
    source: "whatsapp",
    nights: 2,
  },
  {
    id: 4,
    name: "Vikram Patel",
    phone: "+91 65432 10987",
    room: "Deluxe",
    guests: 2,
    checkIn: "25 Mar 2026",
    checkOut: "27 Mar 2026",
    status: "cancelled",
    amount: "₹8,000",
    source: "direct",
    nights: 2,
  },
  {
    id: 5,
    name: "Meera Joshi",
    phone: "+91 54321 09876",
    room: "Suite",
    guests: 4,
    checkIn: "26 Mar 2026",
    checkOut: "30 Mar 2026",
    status: "pending",
    amount: "₹30,000",
    source: "whatsapp",
    nights: 4,
  },
];

const statusConfig = {
  confirmed: {
    bg: "rgba(34,197,94,0.1)",
    color: "#16a34a",
    border: "rgba(34,197,94,0.25)",
    dot: "#22c55e",
  },
  pending: {
    bg: "rgba(245,158,11,0.1)",
    color: "#d97706",
    border: "rgba(245,158,11,0.25)",
    dot: "#f59e0b",
  },
  cancelled: {
    bg: "rgba(239,68,68,0.1)",
    color: "#dc2626",
    border: "rgba(239,68,68,0.25)",
    dot: "#ef4444",
  },
  completed: {
    bg: "rgba(96,165,250,0.1)",
    color: "#2563eb",
    border: "rgba(96,165,250,0.25)",
    dot: "#60a5fa",
  },
};

const sourceConfig = {
  whatsapp: {
    color: "#22c55e",
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.2)",
    icon: "💬",
    label: "WhatsApp",
  },
  direct: {
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.1)",
    border: "rgba(96,165,250,0.2)",
    icon: "🌐",
    label: "Direct",
  },
};

function exportCSV(bookings) {
  const headers = [
    "ID",
    "Name",
    "Phone",
    "Room",
    "Guests",
    "Check In",
    "Check Out",
    "Nights",
    "Amount",
    "Status",
    "Source",
  ];
  const rows = bookings.map((b) => [
    `#BK00${b.id}`,
    b.name,
    b.phone,
    b.room,
    b.guests,
    b.checkIn,
    b.checkOut,
    b.nights,
    b.amount,
    b.status,
    b.source,
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bookings.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Bookings({ theme = "dark" }) {
  const container = useRef();

  const [bookings, setBookings] = useState([]);

  useGSAP(
    () => {
      if (bookings.length === 0) return;
      const tl = gsap.timeline();
      tl.fromTo(
        ".bk-header",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "expo.out" },
      )
        .fromTo(
          ".bk-stat-card",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: "expo.out" },
          "-=0.5",
        )
        .fromTo(
          ".bk-toolbar",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "expo.out" },
          "-=0.4",
        )
        .fromTo(
          ".booking-row, .booking-card",
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "expo.out" },
          "-=0.3",
        );
    },
    { scope: container, dependencies: [bookings] },
  );

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  async function fetchBookings() {
    try {
      const res = await fetch(`${backendUrl}/booking/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();

      const mapped = data.bookings.map((b) => ({
        id: b._id,
        name: b.guestName,
        phone: b.phone,
        room: b.roomType,
        guests: b.numberOfGuests,
        checkIn: new Date(b.checkIn).toLocaleDateString("en-IN"),
        checkOut: new Date(b.checkOut).toLocaleDateString("en-IN"),
        bookingStatus: b.status,
        paymentStatus: b.paymentStatus,
        amount: `₹${b.totalAmount}`,
        source: b.source || "whatsapp",
        nights: Math.max(
          1,
          Math.ceil((new Date(b.checkOut) - new Date(b.checkIn)) / 86400000),
        ),
      }));

      setBookings(mapped);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1100);
  const [rooms, setRooms] = useState([]);
  const [newBooking, setNewBooking] = useState({
    name: "",
    phone: "",
    room: "",
    plan: "",
    guests: 1,
    numberOfRooms: 1,
    checkIn: "",
    checkOut: "",
    source: "direct",
  });

  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth <= 1100);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [backendUrl]);

  useEffect(() => {
    fetch(`${backendUrl}/rooms/all`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setRooms(data.rooms || []);
      })
      .catch((err) => console.log(err));
  }, [backendUrl]);

  const isDark = theme === "dark";
  const text = isDark ? "#fff" : "#1E1E2F";
  const subtext = isDark ? "rgba(255,255,255,0.45)" : "#6B6B7A";
  const cardBg = isDark ? "rgba(255,255,255,0.03)" : "#FDFAF4";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(47,62,52,0.13)";
  const tableBorder = isDark ? "rgba(255,255,255,0.05)" : "rgba(47,62,52,0.1)";
  const tableHeader = isDark ? "rgba(255,255,255,0.3)" : "#6B6B7A";
  const rowHover = isDark ? "rgba(255,255,255,0.03)" : "rgba(47,62,52,0.04)";
  const inputBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(47,62,52,0.05)";
  const modalBg = isDark ? "#0f0f1e" : "#CFE1B9";

  // ── Counts & revenue ───────────────────────────────────────────
  const counts = {
    all: bookings.length,
    confirmed: bookings.filter((b) => b.bookingStatus === "confirmed").length,
    pending: bookings.filter((b) => b.paymentStatus !== "verified").length,
    cancelled: bookings.filter((b) => b.bookingStatus === "cancelled").length,
    completed: bookings.filter((b) => b.bookingStatus === "completed").length,
  };
  const totalRevenue = bookings
    .filter((b) => b.bookingStatus !== "cancelled")
    .reduce((s, b) => s + parseInt(b.amount.replace(/[₹,]/g, "")), 0);

  // ── Filter + search + sort ─────────────────────────────────────
  let filtered = bookings.filter((b) => {
    const mf = filter === "all" || b.bookingStatus === filter;
    const ms =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.phone.includes(search) ||
      b.room.toLowerCase().includes(search.toLowerCase());
    return mf && ms;
  });

  if (sortCol) {
    filtered = [...filtered].sort((a, b) => {
      let av = a[sortCol],
        bv = b[sortCol];
      if (sortCol === "amount") {
        av = parseInt(av.replace(/[₹,]/g, ""));
        bv = parseInt(bv.replace(/[₹,]/g, ""));
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }

  async function verifyPayment(id) {
    const res = await fetch(`${backendUrl}/booking/verify-payment/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    fetchBookings();
  }

  async function completeBooking(id) {
    const res = await fetch(`${backendUrl}/booking/complete/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    fetchBookings();
  }

  async function confirmBooking(id) {
    const res = await fetch(`${backendUrl}/booking/confirm/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    fetchBookings();
  }

  function toggleSort(col) {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
  }

  function updateStatus(id, status) {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, bookingStatus: status } : b)),
    );
    if (selectedBooking?.id === id)
      setSelectedBooking((prev) => ({ ...prev, bookingStatus: status }));
  }

  async function handleAddBooking() {
    try {
      const selectedRoom = rooms.find((room) => room.name === newBooking.room);

      if (!selectedRoom) {
        alert("Room not found");
        return;
      }

      const inDate = new Date(newBooking.checkIn);
      const outDate = new Date(newBooking.checkOut);

      const nights = Math.max(1, Math.ceil((outDate - inDate) / 86400000));

      const totalAmount = pricePerNight * nights;
      const res = await fetch(`${backendUrl}/booking/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          guestName: newBooking.name,
          phone: newBooking.phone,
          checkIn: newBooking.checkIn,
          checkOut: newBooking.checkOut,
          roomType: newBooking.room,
          planName: newBooking.plan,
          numberOfGuests: newBooking.guests,
          numberOfRooms: newBooking.numberOfRooms,
          totalAmount: totalAmount,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      alert("Booking created");

      setShowAddModal(false);

      fetchBookings();
    } catch (err) {
      console.error(err);
      alert("Booking failed");
    }
  }

  // ── Sortable header ────────────────────────────────────────────
  function SortTh({ col, label }) {
    const active = sortCol === col;
    return (
      <th
        onClick={() => toggleSort(col)}
        style={{
          textAlign: "left",
          padding: "11px 16px",
          fontSize: "12px",
          color: active ? "#e8b86d" : tableHeader,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          fontWeight: "700",
          whiteSpace: "nowrap",
          cursor: "pointer",
          userSelect: "none",
          transition: "color 0.15s",
        }}
      >
        {label}{" "}
        {active ? (
          sortDir === "asc" ? (
            "↑"
          ) : (
            "↓"
          )
        ) : (
          <span style={{ opacity: 0.3 }}>↕</span>
        )}
      </th>
    );
  }

  // ── Mobile booking card ────────────────────────────────────────
  function BookingCard({ b }) {
    const sc = statusConfig[b.bookingStatus];
    const src = sourceConfig[b.source];
    return (
      <div
        onClick={() =>
          setSelectedBooking(selectedBooking?.id === b.id ? null : b)
        }
        style={{
          background:
            selectedBooking?.id === b.id
              ? isDark
                ? "rgba(232,184,109,0.06)"
                : "rgba(232,184,109,0.08)"
              : isDark
                ? "rgba(255,255,255,0.025)"
                : "#fafafa",
          border: `1px solid ${selectedBooking?.id === b.id ? "rgba(232,184,109,0.35)" : cardBorder}`,
          borderRadius: "14px",
          padding: "14px",
          marginBottom: "10px",
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
      >
        {/* Top row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "10px",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "12px",
                fontFamily: "monospace",
                fontWeight: "700",
                color: subtext,
                background: isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.06)",
                padding: "2px 6px",
                borderRadius: "4px",
                display: "inline-block",
                marginBottom: "5px",
              }}
            >
              #BK{String(b.id).padStart(4, "0")}
            </span>
            <div style={{ fontWeight: "700", color: text, fontSize: "14px" }}>
              {b.name}
            </div>
            <div style={{ fontSize: "13px", color: subtext, marginTop: "2px" }}>
              {b.phone}
            </div>
          </div>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "100px",
              fontSize: "11px",
              fontWeight: "700",
              background: sc.bg,
              color: sc.color,
              border: `1px solid ${sc.border}`,
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <span
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: sc.dot,
                display: "inline-block",
              }}
            />
            {b.bookingStatus}
          </span>
        </div>

        {/* Mid row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          {[
            { label: "Room", value: b.room },
            { label: "Check In", value: b.checkIn },
            { label: "Check Out", value: b.checkOut },
          ].map((item) => (
            <div key={item.label}>
              <div
                style={{
                  fontSize: "11px",
                  color: subtext,
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                  marginBottom: "3px",
                }}
              >
                {item.label}
              </div>
              <div style={{ fontSize: "12px", color: text, fontWeight: "600" }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontSize: "13px",
                fontWeight: "800",
                color: isDark ? "#e8b86d" : "#b45309",
              }}
            >
              {b.amount}
            </span>
            <span
              style={{
                fontSize: "10px",
                fontWeight: "700",
                color: src.color,
                background: src.bg,
                border: `1px solid ${src.border}`,
                padding: "2px 7px",
                borderRadius: "100px",
              }}
            >
              {src.icon} {src.label}
            </span>
          </div>
          <div
            style={{ display: "flex", gap: "5px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {b.bookingStatus === "pending" && (
              <button
                onClick={() => confirmBooking(b.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "rgba(34,197,94,0.12)",
                  color: "#16a34a",
                  fontSize: "11px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                ✓ Confirm
              </button>
            )}
            {b.bookingStatus === "confirmed" && (
              <button
                onClick={() => completeBooking(b.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "rgba(96,165,250,0.12)",
                  color: "#2563eb",
                  fontSize: "11px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                ✓ Check-out
              </button>
            )}

            {["pending", "expired", "failed", "settled"].includes(
              b.paymentStatus,
            ) && (
              <button
                onClick={() => verifyPayment(b.id)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "8px",
                  border: "none",
                  background: "rgba(239,68,68,0.1)",
                  color: "#dc2626",
                  fontSize: "11px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Payment Done
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Label style helper ─────────────────────────────────────────
  const labelStyle = {
    fontSize: "13px",
    fontWeight: "700",
    color: subtext,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    display: "block",
    marginBottom: "6px",
  };
  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: `1px solid ${cardBorder}`,
    background: inputBg,
    color: text,
    fontSize: "13px",
    fontFamily: "inherit",
    boxSizing: "border-box",
    colorScheme: isDark ? "dark" : "light",
  };

  const selectedRoom = rooms.find((r) => r.name === newBooking.room);

  const selectedPlan = selectedRoom?.plans?.find(
    (p) => p.name === newBooking.plan,
  );

  const nights =
    newBooking.checkIn && newBooking.checkOut
      ? Math.max(
          1,
          Math.ceil(
            (new Date(newBooking.checkOut) - new Date(newBooking.checkIn)) /
              86400000,
          ),
        )
      : 1;

  const pricePerNight = selectedPlan?.price || selectedRoom?.price || 0;

  const estimatedTotal = pricePerNight * nights * newBooking.numberOfRooms;

  return (
    <div>
      <div className="bk-root" ref={container}>
        {/* ── Header ── */}
        <div
          className="bk-header"
          style={{
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: isMobile ? "24px" : "30px",
                fontWeight: "800",
                color: text,
                letterSpacing: "-0.5px",
                marginBottom: "4px",
              }}
            >
              Bookings
            </h1>
            <p style={{ color: subtext, fontSize: "14.5px" }}>
              Manage and track all hotel bookings ·{" "}
              <span style={{ color: "#f59e0b", fontWeight: "700" }}>
                {counts.pending} pending action{counts.pending !== 1 ? "s" : ""}
              </span>
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            <button
              className="export-btn"
              onClick={() => exportCSV(filtered)}
              style={{
                padding: "9px 14px",
                borderRadius: "10px",
                background: "transparent",
                border: `1px solid ${cardBorder}`,
                color: subtext,
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.18s",
                fontFamily: "inherit",
              }}
            >
              📥 {!isMobile && "Export CSV"}
            </button>
            <button
              className="add-btn"
              onClick={() => setShowAddModal(true)}
              style={{
                padding: "9px 16px",
                borderRadius: "10px",
                background: "#e8b86d",
                border: "none",
                color: "#1a1a2e",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.22s",
                fontFamily: "inherit",
                boxShadow: "0 4px 14px rgba(232,184,109,0.25)",
              }}
            >
              + {!isMobile && "New Booking"}
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          {[
            {
              label: "Total Bookings",
              value: counts.all,
              color: isDark ? "#e8b86d" : "#2568b9",
              icon: "📋",
              bg: isDark ? "rgba(232,184,109,0.08)" : "rgba(37,104,185,0.08)",
              border: isDark
                ? "rgba(232,184,109,0.15)"
                : "rgba(37,104,185,0.15)",
            },
            {
              label: "Confirmed",
              value: counts.confirmed,
              color: isDark ? "#e8b86d" : "#2568b9",
              icon: "✅",
              bg: isDark ? "rgba(232,184,109,0.08)" : "rgba(37,104,185,0.08)",
              border: isDark
                ? "rgba(232,184,109,0.15)"
                : "rgba(37,104,185,0.15)",
            },
            {
              label: "Pending",
              value: counts.pending,
              color: isDark ? "#e8b86d" : "#2568b9",
              icon: "⏳",
              bg: isDark ? "rgba(232,184,109,0.08)" : "rgba(37,104,185,0.08)",
              border: isDark
                ? "rgba(232,184,109,0.15)"
                : "rgba(37,104,185,0.15)",
            },
            {
              label: "Total Revenue",
              value: `₹${totalRevenue.toLocaleString()}`,
              color: isDark ? "#e8b86d" : "#2568b9",
              icon: "💰",
              bg: isDark ? "rgba(232,184,109,0.08)" : "rgba(37,104,185,0.08)",
              border: isDark
                ? "rgba(232,184,109,0.15)"
                : "rgba(37,104,185,0.15)",
            },
          ].map((s, i) => (
            <div
              className="bk-stat-card"
              key={i}
              style={{
                background: isDark
                  ? `linear-gradient(145deg, ${s.bg}, rgba(0,0,0,0.1))`
                  : "#fff",
                border: `1px solid ${isDark ? s.border : "rgba(0,0,0,0.09)"}`,
                borderRadius: "14px",
                padding: isMobile ? "14px" : "16px 18px",
                boxShadow: isDark ? "none" : "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: subtext,
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {s.label}
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    width: "30px",
                    height: "30px",
                    borderRadius: "8px",
                    background: `${s.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {s.icon}
                </span>
              </div>
              <div
                style={{
                  fontSize: isMobile ? "24px" : "28px",
                  fontWeight: "800",
                  color: s.color,
                  letterSpacing: "-0.5px",
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── Main grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              selectedBooking && !isMobile && !isTablet ? "1fr 300px" : "1fr",
            gap: "16px",
          }}
        >
          {/* ── Table card ── */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: "18px",
              overflow: "hidden",
              boxShadow: isDark ? "none" : "0 2px 16px rgba(0,0,0,0.06)",
            }}
          >
            {/* Filters + Search */}
            <div
              className="bk-toolbar"
              style={{
                padding: isMobile ? "12px 14px" : "14px 20px",
                borderBottom: `1px solid ${tableBorder}`,
              }}
            >
              {/* Search — full width */}
              <div style={{ position: "relative", marginBottom: "10px" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "13px",
                    opacity: 0.4,
                    pointerEvents: "none",
                  }}
                >
                  🔍
                </span>
                <input
                  className="search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search guest, phone, room..."
                  style={{
                    width: "100%",
                    padding: "9px 36px 9px 34px",
                    borderRadius: "10px",
                    border: `1px solid ${cardBorder}`,
                    background: inputBg,
                    color: text,
                    fontSize: "13px",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: subtext,
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
              {/* Filter pills — horizontally scrollable on mobile */}
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  overflowX: "auto",
                  paddingBottom: "2px",
                  scrollbarWidth: "none",
                }}
              >
                {["all", "confirmed", "pending", "cancelled", "completed"].map(
                  (f) => (
                    <button
                      key={f}
                      className="filter-btn"
                      onClick={() => setFilter(f)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: "100px",
                        flexShrink: 0,
                        border: `1px solid ${filter === f ? "rgba(232,184,109,0.5)" : cardBorder}`,
                        background:
                          filter === f
                            ? "rgba(232,184,109,0.15)"
                            : "transparent",
                        color: filter === f ? "#d97706" : subtext,
                        fontSize: "12px",
                        fontWeight: "600",
                        textTransform: "capitalize",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontFamily: "inherit",
                      }}
                    >
                      {f === "all"
                        ? "All"
                        : f.charAt(0).toUpperCase() + f.slice(1)}
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: "700",
                          padding: "1px 6px",
                          borderRadius: "100px",
                          background:
                            filter === f
                              ? "rgba(232,184,109,0.2)"
                              : isDark
                                ? "rgba(255,255,255,0.08)"
                                : "rgba(0,0,0,0.08)",
                          color: filter === f ? "#d97706" : subtext,
                        }}
                      >
                        {counts[f] || 0}
                      </span>
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* MOBILE: card list */}
            {isMobile ? (
              <div style={{ padding: "12px" }}>
                {filtered.length === 0 ? (
                  <div
                    style={{
                      padding: "48px",
                      textAlign: "center",
                      color: subtext,
                      fontSize: "14px",
                    }}
                  >
                    No bookings found 🔍
                  </div>
                ) : (
                  filtered.map((b) => <BookingCard key={b.id} b={b} />)
                )}
              </div>
            ) : (
              /* DESKTOP: table */
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: `1px solid ${tableBorder}`,
                        background: isDark ? "transparent" : "rgba(0,0,0,0.02)",
                      }}
                    >
                      {/* <th style={{ textAlign: 'left', padding: '11px 16px', fontSize: '10px', color: tableHeader, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700', whiteSpace: 'nowrap' }}>#ID</th> */}
                      <SortTh col="name" label="Guest" />
                      <th
                        style={{
                          textAlign: "left",
                          padding: "11px 16px",
                          fontSize: "12px",
                          color: tableHeader,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          fontWeight: "700",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Phone
                      </th>
                      <SortTh col="room" label="Room" />
                      <SortTh col="guests" label="Guests" />
                      <SortTh col="checkIn" label="Check In" />
                      <th
                        style={{
                          textAlign: "left",
                          padding: "11px 16px",
                          fontSize: "12px",
                          color: tableHeader,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          fontWeight: "700",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Nights
                      </th>
                      <SortTh col="amount" label="Amount" />
                      <th
                        onClick={() => toggleSort("bookingStatus")}
                        style={{
                          textAlign: "center",
                          padding: "11px 8px",
                          fontSize: "12px",
                          color:
                            sortCol === "bookingStatus"
                              ? "#e8b86d"
                              : tableHeader,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          fontWeight: "700",
                          whiteSpace: "nowrap",
                          cursor: "pointer",
                          userSelect: "none",
                          width: "120px",
                          maxWidth: "120px",
                        }}
                      >
                        Booking Status{" "}
                        {sortCol === "bookingStatus"
                          ? sortDir === "asc"
                            ? "↑"
                            : "↓"
                          : "↕"}
                      </th>
                      <SortTh col="paymentStatus" label="Payment Status" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td
                          colSpan={10}
                          style={{
                            padding: "48px",
                            textAlign: "center",
                            color: subtext,
                            fontSize: "14px",
                          }}
                        >
                          No bookings found 🔍
                        </td>
                      </tr>
                    ) : (
                      filtered.map((b) => {
                        const sc = statusConfig[b.bookingStatus];
                        const src = sourceConfig[b.source];
                        const isSelected = selectedBooking?.id === b.id;
                        return (
                          <tr
                            key={b.id}
                            className={`booking-row ${isDark ? "dark" : "light"}`}
                            onMouseEnter={() => setHoveredRow(b.id)}
                            onMouseLeave={() => setHoveredRow(null)}
                            onClick={() =>
                              setSelectedBooking(isSelected ? null : b)
                            }
                            style={{
                              borderBottom: `1px solid ${tableBorder}`,
                              background: isSelected
                                ? isDark
                                  ? "rgba(232,184,109,0.05)"
                                  : "rgba(232,184,109,0.06)"
                                : "transparent",
                              borderLeft: isSelected
                                ? "3px solid #e8b86d"
                                : "3px solid transparent",
                            }}
                          >
                            {/* <td style={{ padding: '13px 16px' }}>
                            <span style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: '700', color: subtext, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', padding: '2px 7px', borderRadius: '14px' }}>
                              #BK{String(b.id).padStart(4,'0')}
                            </span>
                          </td> */}
                            <td style={{ padding: "13px 16px" }}>
                              <div
                                style={{
                                  fontWeight: "700",
                                  color: text,
                                  fontSize: "13px",
                                }}
                              >
                                {b.name}
                              </div>
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  color: src.color,
                                  background: src.bg,
                                  border: `1px solid ${src.border}`,
                                  padding: "1px 6px",
                                  borderRadius: "100px",
                                  display: "inline-block",
                                  marginTop: "3px",
                                }}
                              >
                                {src.icon} {src.label}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "13px 16px",
                                color: subtext,
                                fontSize: "14px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {b.phone}
                            </td>
                            <td
                              style={{
                                padding: "13px 16px",
                                color: text,
                                fontSize: "14px",
                                fontWeight: "500",
                              }}
                            >
                              {b.room}
                            </td>
                            <td
                              style={{
                                padding: "13px 16px",
                                color: subtext,
                                fontSize: "14px",
                                textAlign: "center",
                              }}
                            >
                              {b.guests}
                            </td>
                            <td
                              style={{
                                padding: "13px 16px",
                                color: subtext,
                                fontSize: "13px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {b.checkIn}
                            </td>
                            <td style={{ padding: "13px 16px" }}>
                              <span
                                style={{
                                  fontSize: "13px",
                                  fontWeight: "700",
                                  background: isDark
                                    ? "rgba(255,255,255,0.06)"
                                    : "rgba(0,0,0,0.06)",
                                  color: subtext,
                                  padding: "2px 8px",
                                  borderRadius: "6px",
                                }}
                              >
                                {b.nights}n
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "13px 16px",
                                fontWeight: "800",
                                color: isDark ? "#e8b86d" : "#b45309",
                                fontSize: "13px",
                              }}
                            >
                              {b.amount}
                            </td>
                            <td
                              style={{
                                padding: "13px 16px",
                                textAlign: "center",
                                width: "120px",
                                maxWidth: "120px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "5px",
                                }}
                              >
                                <div
                                  style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    background: sc.dot,
                                    flexShrink: 0,
                                  }}
                                />
                                <span
                                  style={{
                                    padding: "4px 9px",
                                    borderRadius: "100px",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    background: sc.bg,
                                    color: sc.color,
                                    border: `1px solid ${sc.border}`,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {b.bookingStatus}
                                </span>
                              </div>
                            </td>
                            <td
                              style={{
                                padding: "13px 16px",
                                textAlign: "center",
                              }}
                            >
                              <span
                                style={{
                                  display: "inline-block",
                                  minWidth: "85px",
                                  padding: "4px 10px",
                                  borderRadius: "100px",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  whiteSpace: "nowrap",

                                  background:
                                    b.paymentStatus === "verified"
                                      ? "rgba(34,197,94,0.1)"
                                      : b.paymentStatus === "pending"
                                        ? "rgba(245,158,11,0.1)"
                                        : b.paymentStatus === "settled"
                                          ? "rgba(59,130,246,0.1)"
                                          : "rgba(239,68,68,0.1)",

                                  color:
                                    b.paymentStatus === "verified"
                                      ? "#16a34a"
                                      : b.paymentStatus === "pending"
                                        ? "#d97706"
                                        : b.paymentStatus === "settled"
                                          ? "#2563eb"
                                          : "#dc2626",

                                  border:
                                    b.paymentStatus === "verified"
                                      ? "1px solid rgba(34,197,94,0.25)"
                                      : b.paymentStatus === "pending"
                                        ? "1px solid rgba(245,158,11,0.25)"
                                        : b.paymentStatus === "settled"
                                          ? "1px solid rgba(59,130,246,0.25)"
                                          : "1px solid rgba(239,68,68,0.25)",
                                }}
                              >
                                {b.paymentStatus}
                              </span>
                            </td>

                            <td
                              style={{ padding: "13px 16px" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div style={{ display: "flex", gap: "5px" }}>
                                {b.bookingStatus === "pending" && (
                                  <button
                                    className="action-btn"
                                    onClick={() => confirmBooking(b.id)}
                                    style={{
                                      padding: "5px 10px",
                                      borderRadius: "7px",
                                      background: "rgba(34,197,94,0.1)",
                                      border: "1px solid rgba(34,197,94,0.25)",
                                      color: "#16a34a",
                                      fontSize: "11px",
                                      fontWeight: "700",
                                      fontFamily: "inherit",
                                    }}
                                  >
                                    ✓ Confirm
                                  </button>
                                )}
                                {b.bookingStatus === "confirmed" && (
                                  <button
                                    className="action-btn"
                                    onClick={() => completeBooking(b.id)}
                                    style={{
                                      padding: "5px 10px",
                                      borderRadius: "7px",
                                      background: "rgba(96,165,250,0.1)",
                                      border: "1px solid rgba(96,165,250,0.25)",
                                      color: "#2563eb",
                                      fontSize: "11px",
                                      fontWeight: "700",
                                      fontFamily: "inherit",
                                    }}
                                  >
                                    ✓ Check-out
                                  </button>
                                )}
                                {[
                                  "pending",
                                  "expired",
                                  "failed",
                                  "settled",
                                ].includes(b.paymentStatus) &&
                                  b.bookingStatus === "confirmed" && (
                                    <button
                                      className="action-btn"
                                      onClick={() => verifyPayment(b.id)}
                                      style={{
                                        padding: "5px 8px",
                                        borderRadius: "7px",
                                        background: "rgba(59,130,246,0.10)",
                                        border:
                                          "1px solid rgba(59,130,246,0.25)",
                                        color: "#60a5fa",
                                        fontSize: "11px",
                                        fontWeight: "700",
                                        fontFamily: "inherit",
                                      }}
                                    >
                                      Payment Done
                                    </button>
                                  )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer */}
            <div
              style={{
                padding: "11px 18px",
                borderTop: `1px solid ${tableBorder}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "6px",
              }}
            >
              <span style={{ fontSize: "14px", color: subtext }}>
                Showing{" "}
                <strong style={{ color: text }}>{filtered.length}</strong> of{" "}
                <strong style={{ color: text }}>{bookings.length}</strong>{" "}
                bookings
              </span>
              {!isMobile && (
                <span style={{ fontSize: "13px", color: subtext }}>
                  💡 Click a row to view details
                </span>
              )}
            </div>
          </div>

          {/* ── Detail panel (desktop only) ── */}
          {selectedBooking && !isMobile && !isTablet && (
            <div
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: "18px",
                overflow: "hidden",
                animation: "slideIn 0.25s ease forwards",
                boxShadow: isDark ? "none" : "0 2px 16px rgba(0,0,0,0.06)",
                alignSelf: "start",
                position: "sticky",
                top: "20px",
              }}
            >
              <div
                style={{
                  padding: "14px 18px",
                  borderBottom: `1px solid ${tableBorder}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3
                  style={{ fontSize: "14px", fontWeight: "700", color: text }}
                >
                  Booking Details
                </h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: subtext,
                    cursor: "pointer",
                    fontSize: "20px",
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
              <div style={{ padding: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "14px",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      flexShrink: 0,
                      background:
                        "linear-gradient(135deg, rgba(232,184,109,0.2), rgba(232,184,109,0.08))",
                      border: "1px solid rgba(232,184,109,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      fontWeight: "800",
                      color: "#e8b86d",
                    }}
                  >
                    {selectedBooking.name[0]}
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: "700",
                        color: text,
                        fontSize: "14px",
                      }}
                    >
                      {selectedBooking.name}
                    </div>
                    <div
                      style={{
                        fontSize: "13.5px",
                        color: subtext,
                        marginTop: "2px",
                      }}
                    >
                      {selectedBooking.phone}
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: "14px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "5px 12px",
                      borderRadius: "100px",
                      background:
                        statusConfig[selectedBooking.bookingStatus]?.bg,
                      border: `1px solid ${statusConfig[selectedBooking.bookingStatus]?.border}`,
                      color: statusConfig[selectedBooking.bookingStatus]?.color,
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background:
                          statusConfig[selectedBooking.bookingStatus]?.dot,
                        display: "inline-block",
                      }}
                    />
                    {selectedBooking.bookingStatus.toUpperCase()}
                  </span>
                </div>
                {[
                  { label: "Room Type", value: selectedBooking.room },
                  {
                    label: "Guests",
                    value: `${selectedBooking.guests} guest${selectedBooking.guests > 1 ? "s" : ""}`,
                  },
                  { label: "Check In", value: selectedBooking.checkIn },
                  { label: "Check Out", value: selectedBooking.checkOut },
                  {
                    label: "Duration",
                    value: `${selectedBooking.nights} night${selectedBooking.nights > 1 ? "s" : ""}`,
                  },
                  {
                    label: "Total Amount",
                    value: selectedBooking.amount,
                    highlight: true,
                  },
                  {
                    label: "Source",
                    value:
                      sourceConfig[selectedBooking.source].icon +
                      " " +
                      sourceConfig[selectedBooking.source].label,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "9px 0",
                      borderBottom: i < 6 ? `1px solid ${tableBorder}` : "none",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13.5px",
                        color: subtext,
                        fontWeight: "500",
                      }}
                    >
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: item.highlight ? "800" : "600",
                        color: item.highlight
                          ? isDark
                            ? "#e8b86d"
                            : "#b45309"
                          : text,
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    marginTop: "14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "7px",
                  }}
                >
                  {selectedBooking.bookingStatus === "pending" && (
                    <button
                      onClick={() => confirmBooking(selectedBooking.id)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "10px",
                        background: "rgba(34,197,94,0.1)",
                        border: "1px solid rgba(34,197,94,0.25)",
                        color: "#16a34a",
                        fontSize: "13px",
                        fontWeight: "700",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      ✓ Confirm Booking
                    </button>
                  )}
                  {selectedBooking.bookingStatus === "confirmed" && (
                    <button
                      onClick={() => completeBooking(selectedBooking.id)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "10px",
                        background: "rgba(96,165,250,0.1)",
                        border: "1px solid rgba(96,165,250,0.25)",
                        color: "#2563eb",
                        fontSize: "13px",
                        fontWeight: "700",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      ✓ Mark Completed
                    </button>
                  )}
                  {selectedBooking.bookingStatus !== "cancelled" &&
                    selectedBooking.bookingStatus !== "completed" && (
                      <button
                        onClick={() =>
                          updateStatus(selectedBooking.id, "cancelled")
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "10px",
                          background: "rgba(239,68,68,0.08)",
                          border: "1px solid rgba(239,68,68,0.2)",
                          color: "#dc2626",
                          fontSize: "13px",
                          fontWeight: "700",
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        ✕ Cancel Booking
                      </button>
                    )}
                  <button
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "10px",
                      background: isDark
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.05)",
                      border: `1px solid ${cardBorder}`,
                      color: subtext,
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    💬 Message Guest
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Mobile detail bottom sheet ── */}
        {selectedBooking && isMobile && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1100,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            }}
          >
            <div
              onClick={() => setSelectedBooking(null)}
              style={{
                flex: 1,
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(3px)",
              }}
            />
            <div
              style={{
                background: modalBg,
                borderRadius: "20px 20px 0 0",
                border: `1px solid ${cardBorder}`,
                padding: "0 0 32px",
                animation: "sheetIn 0.28s ease forwards",
                maxHeight: "82vh",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  padding: "14px 18px",
                  borderBottom: `1px solid ${tableBorder}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3
                  style={{ fontSize: "13px", fontWeight: "700", color: text }}
                >
                  Booking Details
                </h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: subtext,
                    cursor: "pointer",
                    fontSize: "22px",
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
              <div style={{ padding: "16px 18px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "14px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: "700",
                        color: text,
                        fontSize: "14px",
                      }}
                    >
                      {selectedBooking.name}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: subtext,
                        marginTop: "2px",
                      }}
                    >
                      {selectedBooking.phone}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "5px 12px",
                      borderRadius: "100px",
                      fontSize: "12px",
                      fontWeight: "700",
                      background:
                        statusConfig[selectedBooking.bookingStatus]?.bg,
                      color: statusConfig[selectedBooking.bookingStatus]?.color,
                      border: `1px solid ${statusConfig[selectedBooking.bookingStatus]?.border}`,
                    }}
                  >
                    {selectedBooking.bookingStatus}
                  </span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    marginBottom: "14px",
                  }}
                >
                  {[
                    { label: "Room", value: selectedBooking.room },
                    { label: "Guests", value: `${selectedBooking.guests}` },
                    { label: "Check In", value: selectedBooking.checkIn },
                    { label: "Check Out", value: selectedBooking.checkOut },
                    {
                      label: "Duration",
                      value: `${selectedBooking.nights} nights`,
                    },
                    {
                      label: "Amount",
                      value: selectedBooking.amount,
                      highlight: true,
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        background: isDark
                          ? "rgba(255,255,255,0.03)"
                          : "rgba(0,0,0,0.03)",
                        borderRadius: "10px",
                        padding: "10px 12px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "10px",
                          color: subtext,
                          fontWeight: "600",
                          textTransform: "uppercase",
                          letterSpacing: "0.4px",
                          marginBottom: "4px",
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "700",
                          color: item.highlight
                            ? isDark
                              ? "#e8b86d"
                              : "#b45309"
                            : text,
                        }}
                      >
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {selectedBooking.bookingStatus === "pending" && (
                    <button
                      onClick={() => {
                        updateStatus(selectedBooking.id, "confirmed");
                        setSelectedBooking(null);
                      }}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "11px",
                        background: "rgba(34,197,94,0.12)",
                        border: "1px solid rgba(34,197,94,0.25)",
                        color: "#16a34a",
                        fontSize: "14px",
                        fontWeight: "700",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      ✓ Confirm Booking
                    </button>
                  )}
                  {selectedBooking.bookingStatus === "confirmed" && (
                    <button
                      onClick={() => {
                        updateStatus(selectedBooking.id, "completed");
                        setSelectedBooking(null);
                      }}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "11px",
                        background: "rgba(96,165,250,0.12)",
                        border: "1px solid rgba(96,165,250,0.25)",
                        color: "#2563eb",
                        fontSize: "14px",
                        fontWeight: "700",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      ✓ Mark as Completed
                    </button>
                  )}
                  {selectedBooking.bookingStatus !== "cancelled" &&
                    selectedBooking.bookingStatus !== "completed" && (
                      <button
                        onClick={() => {
                          updateStatus(selectedBooking.id, "cancelled");
                          setSelectedBooking(null);
                        }}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "11px",
                          background: "rgba(239,68,68,0.09)",
                          border: "1px solid rgba(239,68,68,0.2)",
                          color: "#dc2626",
                          fontSize: "14px",
                          fontWeight: "700",
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        ✕ Cancel Booking
                      </button>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Add Booking Modal ── */}
        {showAddModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1200,
              display: "flex",
              alignItems: isMobile ? "flex-end" : "center",
              justifyContent: "center",
              padding: isMobile ? "0" : "20px",
            }}
          >
            <div
              onClick={() => setShowAddModal(false)}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(4px)",
              }}
            />
            <div
              style={{
                position: "relative",
                background: modalBg,
                borderRadius: isMobile ? "20px 20px 0 0" : "20px",
                border: `1px solid ${cardBorder}`,
                padding: "0",
                width: "100%",
                maxWidth: "420px",
                animation: isMobile
                  ? "sheetIn 0.28s ease forwards"
                  : "modalIn 0.25s ease forwards",
                maxHeight: isMobile ? "92vh" : "88vh",
                overflowY: "auto",
              }}
            >
              {/* Sticky header */}
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: `1px solid ${tableBorder}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  position: "sticky",
                  top: 0,
                  background: modalBg,
                  zIndex: 1,
                }}
              >
                <h3
                  style={{ fontSize: "13px", fontWeight: "700", color: text }}
                >
                  New Booking
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: subtext,
                    cursor: "pointer",
                    fontSize: "22px",
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>

              <div
                style={{
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {/* Guest name */}
                <div>
                  <label style={labelStyle}>Guest Name *</label>
                  <input
                    className="modal-input"
                    type="text"
                    placeholder="Full name"
                    value={newBooking.name}
                    onChange={(e) =>
                      setNewBooking((p) => ({ ...p, name: e.target.value }))
                    }
                    style={inputStyle}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input
                    className="modal-input"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={newBooking.phone}
                    onChange={(e) =>
                      setNewBooking((p) => ({ ...p, phone: e.target.value }))
                    }
                    style={inputStyle}
                  />
                </div>

                {/* Dates side by side */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Check In *</label>
                    <input
                      className="modal-input"
                      type="date"
                      value={newBooking.checkIn}
                      onChange={(e) =>
                        setNewBooking((p) => ({
                          ...p,
                          checkIn: e.target.value,
                        }))
                      }
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Check Out *</label>
                    <input
                      className="modal-input"
                      type="date"
                      value={newBooking.checkOut}
                      onChange={(e) =>
                        setNewBooking((p) => ({
                          ...p,
                          checkOut: e.target.value,
                        }))
                      }
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Room type */}
                <div>
                  <label style={labelStyle}>Room Type</label>

                  <select
                    value={newBooking.room}
                    onChange={(e) => {
                      const room = rooms.find((r) => r.name === e.target.value);

                      setNewBooking((p) => ({
                        ...p,
                        room: e.target.value,
                        plan: room?.plans?.[0]?.name || "",
                      }));
                    }}
                    style={{
                      ...inputStyle,
                      backgroundColor: isDark ? "#1a1a2e" : "#ffffff",
                    }}
                  >
                    <option value="">Select Room</option>

                    {rooms.map((room) => (
                      <option key={room._id} value={room.name}>
                        {room.name}
                        {" • "}
                        {room.availableRooms || 0} rooms
                        {" • "}
                        {room.maximumGuests || 0} guests
                      </option>
                    ))}
                  </select>
                </div>

                {selectedRoom?.plans?.length > 0 && (
                  <div>
                    <label style={labelStyle}>Meal Plan</label>

                    <select
                      value={newBooking.plan}
                      onChange={(e) =>
                        setNewBooking((p) => ({
                          ...p,
                          plan: e.target.value,
                        }))
                      }
                      style={{
                        ...inputStyle,
                        backgroundColor: isDark ? "#1a1a2e" : "#ffffff",
                      }}
                    >
                      {selectedRoom.plans.map((plan) => (
                        <option key={plan.name} value={plan.name}>
                          {plan.name} — ₹{plan.price}/night
                        </option>
                      ))}
                    </select>

                    {selectedPlan?.description && (
                      <div
                        style={{
                          marginTop: "8px",
                          fontSize: "12px",
                          color: subtext,
                          lineHeight: "1.5",
                        }}
                      >
                        {selectedPlan.description}
                      </div>
                    )}
                  </div>
                )}

                {/* Guests */}
                {/* Guests */}
                <div>
                  <label style={labelStyle}>Number of Guests</label>

                  <input
                    type="number"
                    min="1"
                    max={selectedRoom?.maximumGuests || 10}
                    value={newBooking.guests}
                    onChange={(e) =>
                      setNewBooking((p) => ({
                        ...p,
                        guests: Number(e.target.value),
                      }))
                    }
                    style={inputStyle}
                  />

                  {selectedRoom &&
                    newBooking.guests > selectedRoom.maximumGuests && (
                      <div
                        style={{
                          marginTop: "6px",
                          fontSize: "12px",
                          color: "#ef4444",
                          fontWeight: "600",
                        }}
                      >
                        Maximum {selectedRoom.maximumGuests} guests allowed in
                        this room
                      </div>
                    )}
                </div>

                {/* Number of Rooms */}
                <div>
                  <label style={labelStyle}>Number of Rooms</label>

                  <input
                    type="number"
                    min="1"
                    value={newBooking.numberOfRooms}
                    onChange={(e) =>
                      setNewBooking((p) => ({
                        ...p,
                        numberOfRooms: Number(e.target.value),
                      }))
                    }
                    style={inputStyle}
                  />
                </div>

                {/* Source */}
                <div>
                  <label style={labelStyle}>Booking Source</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {["whatsapp", "direct"].map((s) => (
                      <button
                        key={s}
                        onClick={() =>
                          setNewBooking((p) => ({ ...p, source: s }))
                        }
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: "10px",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          border: `1px solid ${newBooking.source === s ? sourceConfig[s].border : cardBorder}`,
                          background:
                            newBooking.source === s
                              ? sourceConfig[s].bg
                              : "transparent",
                          color:
                            newBooking.source === s
                              ? sourceConfig[s].color
                              : subtext,
                          fontSize: "12px",
                          fontWeight: "700",
                          transition: "all 0.15s",
                        }}
                      >
                        {sourceConfig[s].icon} {sourceConfig[s].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount preview */}
                {/* Booking Summary */}
                <div
                  style={{
                    background: isDark
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(0,0,0,0.03)",

                    border: `1px solid ${cardBorder}`,
                    borderRadius: "14px",
                    padding: "14px",
                    marginTop: "4px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: text,
                      marginBottom: "10px",
                    }}
                  >
                    Booking Summary
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      color: subtext,
                      fontSize: "13px",
                      marginBottom: "6px",
                    }}
                  >
                    <span>Room</span>
                    <span>{newBooking.room || "-"}</span>
                  </div>

                  {newBooking.plan && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: subtext,
                        fontSize: "13px",
                        marginBottom: "6px",
                      }}
                    >
                      <span>Plan</span>
                      <span>{newBooking.plan}</span>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      color: subtext,
                      fontSize: "13px",
                      marginBottom: "6px",
                    }}
                  >
                    <span>Price/Night</span>
                    <span>₹{pricePerNight}</span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      color: subtext,
                      fontSize: "13px",
                      marginBottom: "6px",
                    }}
                  >
                    <span>Nights</span>
                    <span>{nights}</span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      color: subtext,
                      fontSize: "13px",
                      marginBottom: "6px",
                    }}
                  >
                    <span>Guests</span>
                    <span>{newBooking.guests}</span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "12px",
                      fontSize: "16px",
                      fontWeight: "800",
                      color: isDark ? "#e8b86d" : "#b45309",
                    }}
                  >
                    <span>Total</span>
                    <span>₹{estimatedTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={handleAddBooking}
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: "11px",
                    background:
                      newBooking.name &&
                      newBooking.checkIn &&
                      newBooking.checkOut
                        ? "#e8b86d"
                        : isDark
                          ? "rgba(255,255,255,0.07)"
                          : "rgba(0,0,0,0.07)",
                    border: "none",
                    color:
                      newBooking.name &&
                      newBooking.checkIn &&
                      newBooking.checkOut
                        ? "#1a1a2e"
                        : subtext,
                    fontSize: "14px",
                    fontWeight: "800",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    marginTop: "4px",
                    boxShadow:
                      newBooking.name &&
                      newBooking.checkIn &&
                      newBooking.checkOut
                        ? "0 4px 16px rgba(232,184,109,0.3)"
                        : "none",
                    transition: "all 0.2s",
                  }}
                >
                  + Add Booking
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
