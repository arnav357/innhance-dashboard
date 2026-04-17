import { useState, useEffect, useRef } from "react";

// ── Default fallback data ────────────────────────────────────────
const DEFAULT_CUSTOMERS = [
  {
    id: 1,
    name: "Priya Sharma",
    phone: "+91 98765 43210",
    lastMessage: "Thank you for the booking!",
    time: "2 min ago",
    unread: 2,
    status: "booked",
    avatar: "P",
    messages: [
      { role: "user", content: "Hi, I want to book a room", time: "10:00 AM" },
      {
        role: "assistant",
        content:
          "Hi there! 😊 Welcome to Innhance Hotels! I'd be happy to help you book a room. Could I get your name first?",
        time: "10:00 AM",
      },
      { role: "user", content: "My name is Priya Sharma", time: "10:01 AM" },
      {
        role: "assistant",
        content:
          "Lovely name, Priya! 🌟 What dates are you looking at for check-in and check-out?",
        time: "10:01 AM",
      },
      { role: "user", content: "22nd March to 24th March", time: "10:02 AM" },
      {
        role: "assistant",
        content:
          "Perfect! March 22-24 it is. Which room type would you prefer? We have Standard (₹2,500/night), Deluxe (₹4,000/night), or Suite (₹7,500/night) 🏨",
        time: "10:02 AM",
      },
      { role: "user", content: "Deluxe please", time: "10:03 AM" },
      {
        role: "assistant",
        content: "Great choice! 😊 And how many guests will be staying?",
        time: "10:03 AM",
      },
      { role: "user", content: "2 guests", time: "10:04 AM" },
      {
        role: "assistant",
        content:
          "Perfect! Here's your booking summary:\n✅ Name: Priya Sharma\n📅 Check-in: 22 March\n📅 Check-out: 24 March\n🛏️ Room: Deluxe\n👥 Guests: 2\n💰 Total: ₹8,000\n\nYour booking is confirmed! 🎉",
        time: "10:04 AM",
      },
      { role: "user", content: "Thank you for the booking!", time: "10:05 AM" },
      {
        role: "assistant",
        content:
          "You're welcome Priya! 🌟 We look forward to hosting you. See you on 22nd March! 🏨",
        time: "10:05 AM",
      },
    ],
  },
  {
    id: 2,
    name: "Rahul Verma",
    phone: "+91 87654 32109",
    lastMessage: "What is the check-in time?",
    time: "15 min ago",
    unread: 0,
    status: "inquiry",
    avatar: "R",
    messages: [
      {
        role: "user",
        content: "Hello, what is the check-in time?",
        time: "9:45 AM",
      },
      {
        role: "assistant",
        content:
          "Hi! Check-in is at 2:00 PM 🕑 Early check-in is available on request. Is there anything else I can help you with?",
        time: "9:45 AM",
      },
      { role: "user", content: "What is the check-in time?", time: "9:46 AM" },
    ],
  },
  {
    id: 3,
    name: "Anjali Singh",
    phone: "+91 76543 21098",
    lastMessage: "Is the pool open on weekends?",
    time: "1 hr ago",
    unread: 1,
    status: "inquiry",
    avatar: "A",
    messages: [
      {
        role: "user",
        content: "Is the pool open on weekends?",
        time: "8:30 AM",
      },
      {
        role: "assistant",
        content:
          "Yes! Our swimming pool is open every day from 6 AM to 10 PM 🏊 including weekends. Feel free to enjoy it during your stay!",
        time: "8:30 AM",
      },
    ],
  },
  {
    id: 4,
    name: "Vikram Patel",
    phone: "+91 65432 10987",
    lastMessage: "I want to cancel my booking.",
    time: "3 hr ago",
    unread: 0,
    status: "cancelled",
    avatar: "V",
    messages: [
      {
        role: "user",
        content: "I want to cancel my booking.",
        time: "7:00 AM",
      },
      {
        role: "assistant",
        content:
          "I'm sorry to hear that, Vikram. 😔 You can cancel free of charge if it's more than 48 hours before check-in. Shall I proceed with the cancellation?",
        time: "7:00 AM",
      },
      { role: "user", content: "Yes please cancel it", time: "7:01 AM" },
      {
        role: "assistant",
        content:
          "Done! Your booking has been cancelled. 🙏 A refund will be processed within 3-5 business days. We hope to see you again!",
        time: "7:01 AM",
      },
    ],
  },
];

const statusConfig = {
  booked: {
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.25)",
    label: "Booked",
  },
  inquiry: {
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.12)",
    border: "rgba(96,165,250,0.25)",
    label: "Inquiry",
  },
  cancelled: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.25)",
    label: "Cancelled",
  },
};

const avatarGradients = [
  ["#e8b86d", "#c9973a"],
  ["#60a5fa", "#3b82f6"],
  ["#22c55e", "#16a34a"],
  ["#a78bfa", "#7c3aed"],
  ["#f59e0b", "#d97706"],
  ["#ec4899", "#db2777"],
];

// ── Avatar component ─────────────────────────────────────────────
function Avatar({ idx, letter, size = 28, radius = 8 }) {
  const [g1, g2] = avatarGradients[idx % avatarGradients.length];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        flexShrink: 0,
        background: `linear-gradient(135deg, ${g1}33, ${g2}22)`,
        border: `1.5px solid ${g1}55`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: "800",
        color: g1,
        boxShadow: `0 2px 8px ${g1}25`,
      }}
    >
      {letter}
    </div>
  );
}

export default function Chats({ theme = "dark" }) {
  // ── Backend States ─────────────────────────────────────────────
  const [allCustomers, setAllCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [mobileView, setMobileView] = useState("list"); // 'list' | 'chat'
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const messagesEndRef = useRef(null);
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const [replyText, setReplyText] = useState("");
  const [replyFile, setReplyFile] = useState(null);
  const fileInputRef = useRef(null);

  // ── Fetch Data from Backend (Port 8080) ────────────────────────
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${backendUrl}/api/chats`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ required
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch chat data");
        }

        const data = await response.json();
        setAllCustomers(data);

        if (data.length > 0) {
          setSelected(data[0]);
        }
      } catch (err) {
        console.error(
          "Error fetching chats from backend, using fallback data:",
          err,
        );
        setError(err.message);
        // Fallback to dummy data if backend fails
        setAllCustomers(DEFAULT_CUSTOMERS);
        setSelected(DEFAULT_CUSTOMERS[0]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, []);

  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Auto-scroll to bottom on conversation switch
  useEffect(() => {
    if (selected) {
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        80,
      );
    }
  }, [selected?.id]);

  const isDark = theme === "dark";
  const text = isDark ? "#fff" : "#0f172a";
  const subtext = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)";
  const cardBg = isDark ? "rgba(255,255,255,0.03)" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)";
  const sidebarBg = isDark ? "rgba(255,255,255,0.02)" : "#f8fafc";
  const hoverBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const activeBg = isDark ? "rgba(232,184,109,0.08)" : "rgba(232,184,109,0.1)";
  const msgBg = isDark ? "rgba(255,255,255,0.07)" : "#e2e8f0";
  const chatAreaBg = isDark ? "rgba(255,255,255,0.01)" : "#f0f4f8";
  const inputBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";

  const filtered = allCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search),
  );
  const totalUnread = allCustomers.reduce((s, c) => s + c.unread, 0);
  const selectedIdx = selected
    ? allCustomers.findIndex((c) => c.id === selected.id)
    : 0;

  async function handleSelectCustomer(c) {
    // Optimistic UI update
    const updated = { ...c, unread: 0 };
    setAllCustomers((prev) => prev.map((x) => (x.id === c.id ? updated : x)));
    setSelected(updated);
    setMobileView("chat");

    // Tell backend this chat was read
    try {
      await fetch(`${backendUrl}/api/chats/${c.id}/read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    } catch (err) {
      console.error("Failed to mark as read in backend", err);
    }
  }

  async function markAllRead() {
    // Optimistic UI update
    setAllCustomers((prev) => prev.map((c) => ({ ...c, unread: 0 })));
    if (selected) setSelected((prev) => ({ ...prev, unread: 0 }));

    // Tell backend to mark all as read
    try {
      await fetch(`${backendUrl}/api/chats/mark-all-read`, {
        method: "POST",
        headers:{
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`, 
        }
      });
    } catch (err) {
      console.error("Failed to mark all as read in backend", err);
    }
  }

  async function switchToHuman() {
    await fetch(`${backendUrl}/api/chats/${selected.id}/mode`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ mode: "human" }),
    });

    setSelected((prev) => ({ ...prev, mode: "human" }));
  }

  async function switchToBot() {
    await fetch(`${backendUrl}/api/chats/${selected.id}/mode`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ mode: "bot" }),
    });

    setSelected((prev) => ({ ...prev, mode: "bot" }));
  }

  async function sendManualReply() {
    if (!replyText.trim() && !replyFile) return;

    const formData = new FormData();
    formData.append("message", replyText);
    formData.append("chatId", selected.id);

    if (replyFile) {
      formData.append("file", replyFile);
    }

    const res = await fetch(`${backendUrl}/api/chats/manual-reply`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: formData,
    });

    const data = await res.json();

    setSelected((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          role: "assistant",
          content:
            replyText ||
            `[Sent ${replyFile.type.startsWith("image") ? "Image" : "Video"}]`,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
    }));

    setReplyText("");
    setReplyFile(null);
  }

  function openWhatsApp(phone) {
    const num = phone.replace(/\D/g, "");
    window.open(`https://wa.me/${num}`, "_blank");
  }

  // Grouping helpers
  function shouldShowAvatar(msgs, i) {
    return i === msgs.length - 1 || msgs[i + 1].role !== msgs[i].role;
  }
  function shouldShowTime(msgs, i) {
    return (
      i === msgs.length - 1 ||
      msgs[i + 1].time !== msgs[i].time ||
      msgs[i + 1].role !== msgs[i].role
    );
  }
  function isFirstInGroup(msgs, i) {
    return i === 0 || msgs[i - 1].role !== msgs[i].role;
  }
  function isLastInGroup(msgs, i) {
    return i === msgs.length - 1 || msgs[i + 1].role !== msgs[i].role;
  }

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        @keyframes fadeInUp  { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
        @keyframes botPulse  { 0%,100%{box-shadow:0 0 0 0 rgba(232,184,109,0.45)}60%{box-shadow:0 0 0 7px rgba(232,184,109,0)} }
        @keyframes unreadPop { 0%{transform:scale(0.5)}100%{transform:scale(1)} }

        .chats-root { font-family:'DM Sans','Segoe UI',system-ui,sans-serif; }

        .chats-container {
          display: flex;
          height: calc(100vh - 190px);
          min-height: 500px;
          background: ${cardBg};
          border: 1px solid ${cardBorder};
          border-radius: 20px;
          overflow: hidden;
          box-shadow: ${isDark ? "none" : "0 2px 20px rgba(0,0,0,0.07)"};
          animation: fadeInUp 0.5s ease 0.05s both;
        }

        .sidebar-panel { display:flex; width:300px; min-width:300px; flex-shrink:0; }
        .chat-panel    { display:flex; flex:1; min-width:0; }
        .mobile-back   { display:none !important; }

        .search-input { transition:all 0.2s; }
        .search-input::placeholder { color:${subtext}; }
        .search-input:focus { outline:none!important; border-color:rgba(232,184,109,0.5)!important; box-shadow:0 0 0 3px rgba(232,184,109,0.08)!important; }

        .conv-item { transition:all 0.15s ease; }
        .bot-icon  { animation:botPulse 2.8s ease-in-out infinite; }
        .unread-badge { animation:unreadPop 0.2s ease forwards; }

        .wa-btn:hover        { background:rgba(34,197,94,0.2)!important; border-color:rgba(34,197,94,0.4)!important; }
        .mark-read-btn:hover { background:rgba(232,184,109,0.12)!important; color:#e8b86d!important; border-color:rgba(232,184,109,0.3)!important; }

        .messages-area::-webkit-scrollbar       { width:4px; }
        .messages-area::-webkit-scrollbar-track { background:transparent; }
        .messages-area::-webkit-scrollbar-thumb { background:${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}; border-radius:2px; }

        /* ── Mobile ── */
        @media (max-width:768px) {
          .chats-container {
            height:calc(100vh - 148px)!important;
            border-radius:14px!important;
            min-height:400px!important;
          }
          .sidebar-panel {
            width:100%!important;
            min-width:unset!important;
            display:${mobileView === "list" ? "flex" : "none"}!important;
          }
          .chat-panel {
            display:${mobileView === "chat" ? "flex" : "none"}!important;
            width:100%!important;
          }
          .mobile-back { display:flex!important; }
        }

        /* ── Tablet ── */
        @media (min-width:769px) and (max-width:1024px) {
          .sidebar-panel { width:260px!important; min-width:260px!important; }
        }
      `}</style>

      <div className="chats-root">
        {/* ── Page header ── */}
        <div
          style={{
            marginBottom: "16px",
            animation: "fadeInUp 0.5s ease forwards",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "4px",
              }}
            >
              <h1
                style={{
                  fontSize: isMobile ? "20px" : "24px",
                  fontWeight: "800",
                  color: text,
                  letterSpacing: "-0.5px",
                }}
              >
                Customer Chats
              </h1>
              {totalUnread > 0 && (
                <span
                  className="unread-badge"
                  style={{
                    padding: "3px 10px",
                    borderRadius: "100px",
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    color: "#ef4444",
                    fontSize: "12px",
                    fontWeight: "700",
                  }}
                >
                  {totalUnread} unread
                </span>
              )}
            </div>
            <p style={{ color: subtext, fontSize: "13px" }}>
              View all WhatsApp conversations · Read-only mode
            </p>
          </div>
          {totalUnread > 0 && (
            <button
              className="mark-read-btn"
              onClick={markAllRead}
              style={{
                padding: "8px 14px",
                borderRadius: "10px",
                background: "transparent",
                border: `1px solid ${cardBorder}`,
                color: subtext,
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.18s",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                flexShrink: 0,
              }}
            >
              ✓ Mark all read
            </button>
          )}
        </div>

        {/* ── Main layout ── */}
        <div className="chats-container">
          {isLoading ? (
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: subtext,
              }}
            >
              Loading chats...
            </div>
          ) : (
            <>
              {/* ── LEFT: Sidebar ── */}
              <div className="sidebar-panel">
                <div
                  style={{
                    width: "100%",
                    background: sidebarBg,
                    borderRight: `1px solid ${cardBorder}`,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  {/* Sidebar header */}
                  <div
                    style={{
                      padding: "16px 14px 12px",
                      borderBottom: `1px solid ${cardBorder}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: "700",
                          color: text,
                        }}
                      >
                        Conversations
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          background: isDark
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(0,0,0,0.06)",
                          color: subtext,
                          padding: "2px 8px",
                          borderRadius: "100px",
                        }}
                      >
                        {allCustomers.length}
                      </span>
                    </div>
                    <div style={{ position: "relative" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: "12px",
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
                        placeholder="Search by name or phone..."
                        style={{
                          width: "100%",
                          padding: "8px 10px 8px 28px",
                          borderRadius: "10px",
                          border: `1px solid ${cardBorder}`,
                          background: inputBg,
                          color: text,
                          fontSize: "12px",
                          fontFamily: "inherit",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>

                  {/* Conversation list */}
                  <div style={{ flex: 1, overflowY: "auto" }}>
                    {filtered.length === 0 ? (
                      <div
                        style={{
                          padding: "32px 16px",
                          textAlign: "center",
                          color: subtext,
                          fontSize: "13px",
                        }}
                      >
                        No conversations found
                      </div>
                    ) : (
                      filtered.map((c, idx) => {
                        const isActive = selected?.id === c.id;
                        const [g1] =
                          avatarGradients[idx % avatarGradients.length];
                        return (
                          <div
                            key={c.id}
                            className="conv-item"
                            onClick={() => handleSelectCustomer(c)}
                            style={{
                              padding: "13px 14px",
                              cursor: "pointer",
                              background: isActive ? activeBg : "transparent",
                              borderLeft: isActive
                                ? "3px solid #e8b86d"
                                : "3px solid transparent",
                              borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`,
                            }}
                            onMouseEnter={(e) => {
                              if (!isActive)
                                e.currentTarget.style.background = hoverBg;
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive)
                                e.currentTarget.style.background =
                                  "transparent";
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                gap: "10px",
                                alignItems: "flex-start",
                              }}
                            >
                              {/* Avatar + unread badge */}
                              <div
                                style={{ position: "relative", flexShrink: 0 }}
                              >
                                <Avatar
                                  idx={idx}
                                  letter={c.avatar}
                                  size={40}
                                  radius={11}
                                />
                                {c.unread > 0 && (
                                  <div
                                    className="unread-badge"
                                    style={{
                                      position: "absolute",
                                      top: "-4px",
                                      right: "-4px",
                                      width: "17px",
                                      height: "17px",
                                      borderRadius: "50%",
                                      background: "#ef4444",
                                      border: `2px solid ${isDark ? "#0a0a14" : "#f8fafc"}`,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "9px",
                                      fontWeight: "800",
                                      color: "#fff",
                                    }}
                                  >
                                    {c.unread}
                                  </div>
                                )}
                              </div>

                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "2px",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: "13px",
                                      fontWeight: c.unread > 0 ? "700" : "600",
                                      color: text,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {c.name}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: "10px",
                                      color: subtext,
                                      flexShrink: 0,
                                      marginLeft: "6px",
                                    }}
                                  >
                                    {c.time}
                                  </span>
                                </div>
                                <div
                                  style={{
                                    fontSize: "11px",
                                    color: subtext,
                                    marginBottom: "5px",
                                  }}
                                >
                                  {c.phone}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "6px",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      color: c.unread > 0 ? text : subtext,
                                      fontWeight: c.unread > 0 ? "500" : "400",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      flex: 1,
                                    }}
                                  >
                                    {c.unread > 0 && (
                                      <span
                                        style={{
                                          color: g1,
                                          marginRight: "3px",
                                        }}
                                      >
                                        ●
                                      </span>
                                    )}
                                    {c.lastMessage}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: "700",
                                      flexShrink: 0,
                                      padding: "2px 7px",
                                      borderRadius: "100px",
                                      background: statusConfig[c.status]?.bg,
                                      border: `1px solid ${statusConfig[c.status]?.border}`,
                                      color: statusConfig[c.status]?.color,
                                    }}
                                  >
                                    {statusConfig[c.status]?.label}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* ── RIGHT: Chat window ── */}
              {selected ? (
                <div className="chat-panel">
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                      minWidth: 0,
                    }}
                  >
                    {/* Chat header */}
                    <div
                      style={{
                        padding: "12px 18px",
                        borderBottom: `1px solid ${cardBorder}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: isDark ? "rgba(255,255,255,0.02)" : "#fff",
                        flexShrink: 0,
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        {/* Mobile back */}
                        <button
                          className="mobile-back"
                          onClick={() => setMobileView("list")}
                          style={{
                            background: isDark
                              ? "rgba(255,255,255,0.06)"
                              : "rgba(0,0,0,0.06)",
                            border: `1px solid ${cardBorder}`,
                            borderRadius: "8px",
                            color: text,
                            cursor: "pointer",
                            fontSize: "14px",
                            padding: "6px 10px",
                            fontFamily: "inherit",
                            fontWeight: "600",
                            alignItems: "center",
                            transition: "all 0.15s",
                          }}
                        >
                          ← Back
                        </button>

                        <Avatar
                          idx={selectedIdx}
                          letter={selected.avatar}
                          size={42}
                          radius={12}
                        />
                        <div>
                          <div
                            style={{
                              fontWeight: "700",
                              color: text,
                              fontSize: "15px",
                              display: "flex",
                              alignItems: "center",
                              gap: "7px",
                              flexWrap: "wrap",
                            }}
                          >
                            {selected.name}
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: "700",
                                padding: "2px 8px",
                                borderRadius: "100px",
                                background: statusConfig[selected.status]?.bg,
                                border: `1px solid ${statusConfig[selected.status]?.border}`,
                                color: statusConfig[selected.status]?.color,
                              }}
                            >
                              {statusConfig[selected.status]?.label}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: subtext,
                              marginTop: "2px",
                            }}
                          >
                            {selected.phone}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "7px",
                        }}
                      >
                        <span
                          style={{
                            padding: "5px 10px",
                            borderRadius: "100px",
                            fontSize: "11px",
                            fontWeight: "600",
                            background: isDark
                              ? "rgba(255,255,255,0.06)"
                              : "rgba(0,0,0,0.05)",
                            border: `1px solid ${cardBorder}`,
                            color: subtext,
                          }}
                        >
                          {selected.messages.length} msgs
                        </span>
                        <button
                          className="wa-btn"
                          onClick={() => openWhatsApp(selected.phone)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "9px",
                            background: "rgba(34,197,94,0.1)",
                            border: "1px solid rgba(34,197,94,0.25)",
                            color: "#22c55e",
                            cursor: "pointer",
                            fontSize: "13px",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            transition: "all 0.18s",
                            fontFamily: "inherit",
                            fontWeight: "700",
                          }}
                        >
                          💬 {!isMobile && "WhatsApp"}
                        </button>
                      </div>
                    </div>

                    {/* Messages */}
                    <div
                      className="messages-area"
                      style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: isMobile ? "14px 12px" : "20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                        background: chatAreaBg,
                      }}
                    >
                      {/* Date separator */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          margin: "4px 0 14px",
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            height: "1px",
                            background: isDark
                              ? "rgba(255,255,255,0.07)"
                              : "rgba(0,0,0,0.07)",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "11px",
                            color: subtext,
                            fontWeight: "600",
                            padding: "3px 12px",
                            borderRadius: "100px",
                            background: isDark
                              ? "rgba(255,255,255,0.05)"
                              : "rgba(0,0,0,0.05)",
                            border: `1px solid ${cardBorder}`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Today
                        </span>
                        <div
                          style={{
                            flex: 1,
                            height: "1px",
                            background: isDark
                              ? "rgba(255,255,255,0.07)"
                              : "rgba(0,0,0,0.07)",
                          }}
                        />
                      </div>

                      {selected.messages.map((m, i) => {
                        const isUser = m.role === "user";
                        const showAv = shouldShowAvatar(selected.messages, i);
                        const showTime = shouldShowTime(selected.messages, i);
                        const first = isFirstInGroup(selected.messages, i);
                        const last = isLastInGroup(selected.messages, i);

                        // Bubble border radius — grouped corners
                        let radius;
                        if (isUser) {
                          if (first && last) radius = "16px 4px 16px 16px";
                          else if (first) radius = "16px 4px 4px 16px";
                          else if (last) radius = "16px 16px 4px 16px";
                          else radius = "16px 4px 4px 16px";
                        } else {
                          if (first && last) radius = "4px 16px 16px 16px";
                          else if (first) radius = "4px 16px 16px 4px";
                          else if (last) radius = "4px 16px 16px 16px";
                          else radius = "4px 16px 16px 4px";
                        }

                        return (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              justifyContent: isUser
                                ? "flex-end"
                                : "flex-start",
                              alignItems: "flex-end",
                              gap: "7px",
                              marginBottom: showTime ? "8px" : "2px",
                            }}
                          >
                            {/* Bot avatar */}
                            {!isUser && (
                              <div
                                style={{
                                  width: "28px",
                                  flexShrink: 0,
                                  display: "flex",
                                  alignItems: "flex-end",
                                }}
                              >
                                {showAv ? (
                                  <div
                                    className="bot-icon"
                                    style={{
                                      width: "28px",
                                      height: "28px",
                                      borderRadius: "8px",
                                      background:
                                        "linear-gradient(135deg, #e8b86d, #c9973a)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "13px",
                                      boxShadow:
                                        "0 2px 8px rgba(232,184,109,0.3)",
                                    }}
                                  >
                                    🤖
                                  </div>
                                ) : (
                                  <div style={{ width: "28px" }} />
                                )}
                              </div>
                            )}

                            <div
                              style={{
                                maxWidth: isMobile ? "82%" : "65%",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: isUser ? "flex-end" : "flex-start",
                              }}
                            >
                              <div
                                style={{
                                  padding: "10px 14px",
                                  borderRadius: radius,
                                  background: isUser
                                    ? `linear-gradient(135deg, ${isDark ? "#1a1a2e" : "#1e3a5f"}, #0f3460)`
                                    : msgBg,
                                  color: isUser ? "#fff" : text,
                                  fontSize: "13px",
                                  lineHeight: "1.6",
                                  border: !isUser
                                    ? `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`
                                    : "none",
                                  whiteSpace: "pre-line",
                                  boxShadow: isUser
                                    ? "0 2px 10px rgba(15,52,96,0.3)"
                                    : isDark
                                      ? "none"
                                      : "0 1px 3px rgba(0,0,0,0.06)",
                                }}
                              >
                                {m.content}
                              </div>

                              {/* Timestamp — only at end of group */}
                              {showTime && (
                                <div
                                  style={{
                                    fontSize: "10px",
                                    color: subtext,
                                    marginTop: "4px",
                                    paddingLeft: !isUser ? "2px" : "0",
                                    paddingRight: isUser ? "2px" : "0",
                                  }}
                                >
                                  {m.time}
                                </div>
                              )}
                            </div>

                            {/* User avatar */}
                            {isUser && (
                              <div
                                style={{
                                  width: "28px",
                                  flexShrink: 0,
                                  display: "flex",
                                  alignItems: "flex-end",
                                }}
                              >
                                {showAv ? (
                                  <Avatar
                                    idx={selectedIdx}
                                    letter={selected.avatar}
                                    size={28}
                                    radius={8}
                                  />
                                ) : (
                                  <div style={{ width: "28px" }} />
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Auto-scroll anchor */}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Read-only footer */}
                    {/* Smart Footer */}
                    <div
                      style={{
                        padding: "11px 18px",
                        borderTop: `1px solid ${cardBorder}`,
                        background:
                          selected?.mode === "human"
                            ? isDark
                              ? "rgba(34,197,94,0.05)"
                              : "rgba(34,197,94,0.08)"
                            : isDark
                              ? "rgba(232,184,109,0.04)"
                              : "rgba(232,184,109,0.06)",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        flexShrink: 0,
                      }}
                    >
                      {selected?.mode === "human" ? (
                        <>
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "9px",
                              background:
                                "linear-gradient(135deg,#22c55e,#16a34a)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "14px",
                            }}
                          >
                            👤
                          </div>

                          {/* Upload button */}
                          <button
                            onClick={() => fileInputRef.current.click()}
                            style={{
                              padding: "10px",
                              borderRadius: "10px",
                              border: `1px solid ${cardBorder}`,
                              background: inputBg,
                              cursor: "pointer",
                            }}
                          >
                            📎
                          </button>

                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            style={{ display: "none" }}
                            onChange={(e) => setReplyFile(e.target.files[0])}
                          />

                          <input
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={
                              replyFile
                                ? `Attached: ${replyFile.name}`
                                : "Type a reply..."
                            }
                            style={{
                              flex: 1,
                              padding: "10px 14px",
                              borderRadius: "10px",
                              border: `1px solid ${cardBorder}`,
                              background: inputBg,
                              color: text,
                              outline: "none",
                            }}
                          />

                          <button
                            onClick={sendManualReply}
                            style={{
                              padding: "10px 14px",
                              borderRadius: "10px",
                              background: "#22c55e",
                              color: "#fff",
                              border: "none",
                              fontWeight: "700",
                              cursor: "pointer",
                            }}
                          >
                            Send
                          </button>

                          <button
                            onClick={switchToBot}
                            style={{
                              padding: "10px",
                              borderRadius: "10px",
                              border: `1px solid ${cardBorder}`,
                              background: "transparent",
                              cursor: "pointer",
                            }}
                          >
                            🤖
                          </button>
                        </>
                      ) : (
                        <>
                          <div
                            className="bot-icon"
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "9px",
                              background:
                                "linear-gradient(135deg,#e8b86d,#c9973a)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "14px",
                            }}
                          >
                            🤖
                          </div>

                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: "12px",
                                fontWeight: "700",
                                color: "#e8b86d",
                              }}
                            >
                              AI Bot is handling replies
                            </div>
                            <div style={{ fontSize: "11px", color: subtext }}>
                              Automatic replies via WhatsApp
                            </div>
                          </div>

                          <button
                            onClick={switchToHuman}
                            style={{
                              padding: "8px 12px",
                              borderRadius: "8px",
                              background: "#22c55e",
                              color: "#fff",
                              border: "none",
                              fontWeight: "700",
                              cursor: "pointer",
                            }}
                          >
                            Take Over
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
