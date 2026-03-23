import { useState, useEffect, useRef } from 'react';

const ALL_AMENITIES = [
  'Free WiFi', 'Breakfast', 'AC', 'TV', 'Mini Bar',
  'City View', 'Living Room', 'Jacuzzi', 'Parking',
  'Gym Access', 'Pool Access', 'Room Service', 'Balcony',
  'King Bed', 'Bathtub', 'Work Desk',
];

// Default rooms now include roomNumbers array
const DEFAULT_ROOMS = [
  {
    id: 1, type: 'Standard Room', emoji: '🛏️',
    price: 2500, total: 10, available: 7,
    amenities: ['Free WiFi', 'Breakfast', 'AC', 'TV'],
    description: 'Comfortable room perfect for solo travelers or couples',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600',
    // roomNumbers: each entry { num: '101', booked: false }
    roomNumbers: [
      { num: '101', booked: false }, { num: '102', booked: false },
      { num: '103', booked: true  }, { num: '104', booked: false },
      { num: '105', booked: false }, { num: '106', booked: true  },
      { num: '107', booked: true  }, { num: '108', booked: false },
      { num: '109', booked: false }, { num: '110', booked: false },
    ],
  },
  {
    id: 2, type: 'Deluxe Room', emoji: '🌟',
    price: 4000, total: 8, available: 5,
    amenities: ['Free WiFi', 'Breakfast', 'AC', 'TV', 'Mini Bar', 'City View'],
    description: 'Spacious room with beautiful city views and premium amenities',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600',
    roomNumbers: [
      { num: '201', booked: false }, { num: '202', booked: true  },
      { num: '203', booked: false }, { num: '204', booked: true  },
      { num: '205', booked: false }, { num: '206', booked: true  },
      { num: '207', booked: false }, { num: '208', booked: false },
    ],
  },
  {
    id: 3, type: 'Suite', emoji: '👑',
    price: 7500, total: 4, available: 2,
    amenities: ['Free WiFi', 'Breakfast', 'AC', 'TV', 'Mini Bar', 'Living Room', 'Jacuzzi'],
    description: 'Ultimate luxury experience with premium facilities',
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600',
    roomNumbers: [
      { num: 'P1', booked: true  }, { num: 'P2', booked: false },
      { num: 'P3', booked: true  }, { num: 'P4', booked: false },
    ],
  },
];

// ── helpers ─────────────────────────────────────────────────────
function deriveAvailable(roomNumbers) {
  return roomNumbers.filter(r => !r.booked).length;
}

// ── Confirm dialog ───────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel, isDark }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={onCancel} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'relative', background: isDark ? '#0f0f1e' : '#fff',
        border: '1px solid rgba(239,68,68,0.3)', borderRadius: '18px',
        padding: '28px 24px', maxWidth: '380px', width: '100%',
        animation: 'modalIn 0.22s ease forwards',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        <div style={{ fontSize: '32px', textAlign: 'center', marginBottom: '12px' }}>🗑️</div>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: isDark ? '#fff' : '#0f172a', textAlign: 'center', marginBottom: '8px' }}>Delete Room Type?</h3>
        <p style={{ fontSize: '13px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', textAlign: 'center', marginBottom: '22px', lineHeight: '1.5' }}>{message}</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '11px', borderRadius: '10px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '11px', borderRadius: '10px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#dc2626', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Real Room Grid (Option C) ────────────────────────────────────
// Shows actual room numbers entered by staff. Click to toggle booked/available.
function RoomGrid({ room, onToggle, isDark, subtext }) {
  const [tooltip, setTooltip] = useState(null); // { num, booked }

  if (!room.roomNumbers || room.roomNumbers.length === 0) {
    return (
      <div style={{ marginBottom: '12px', padding: '12px', borderRadius: '10px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px dashed ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, textAlign: 'center' }}>
        <div style={{ fontSize: '11px', color: subtext }}>No room numbers added yet</div>
        <div style={{ fontSize: '10px', color: subtext, opacity: 0.6, marginTop: '3px' }}>Edit this room type to add room numbers</div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ fontSize: '10px', color: subtext, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
        Room Grid <span style={{ fontSize: '9px', fontWeight: '500', opacity: 0.6 }}>— tap to toggle</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {room.roomNumbers.map((r, i) => (
          <div
            key={i}
            title={`Room ${r.num} — ${r.booked ? 'Booked' : 'Available'} (click to toggle)`}
            onClick={() => onToggle(room.id, i)}
            onMouseEnter={() => setTooltip({ num: r.num, booked: r.booked })}
            onMouseLeave={() => setTooltip(null)}
            style={{
              minWidth: '32px', height: '32px', borderRadius: '7px', padding: '0 5px',
              background: r.booked ? 'rgba(239,68,68,0.18)' : 'rgba(34,197,94,0.15)',
              border: `1.5px solid ${r.booked ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '9px', fontWeight: '800',
              color: r.booked ? '#ef4444' : '#22c55e',
              cursor: 'pointer',
              transition: 'transform 0.12s, background 0.15s, border-color 0.15s',
              userSelect: 'none',
              boxShadow: r.booked ? '0 1px 4px rgba(239,68,68,0.15)' : '0 1px 4px rgba(34,197,94,0.12)',
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1.1)'}
          >
            {r.num}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: '14px', marginTop: '8px' }}>
        <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'rgba(34,197,94,0.4)', display: 'inline-block' }} /> Available
        </span>
        <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'rgba(239,68,68,0.4)', display: 'inline-block' }} /> Booked
        </span>
      </div>
    </div>
  );
}

// ── Room Number Input (inside form) ─────────────────────────────
// Staff types comma-separated room numbers e.g. "101, 102, A3, P1"
// Existing booked status is preserved when editing
function RoomNumberInput({ roomNumbers, onChange, isDark }) {
  const border = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)';
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const subtext = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)';
  const text = isDark ? '#fff' : '#0f172a';

  // Convert roomNumbers array → comma string for display
  const [inputVal, setInputVal] = useState(
    roomNumbers.map(r => r.num).join(', ')
  );

  function handleChange(val) {
    setInputVal(val);
    // Parse into roomNumbers array, preserving booked status for existing rooms
    const nums = val.split(',').map(s => s.trim()).filter(Boolean);
    const existingMap = Object.fromEntries(roomNumbers.map(r => [r.num, r.booked]));
    const newRooms = nums.map(n => ({ num: n, booked: existingMap[n] ?? false }));
    onChange(newRooms);
  }

  return (
    <div>
      <div style={{ fontSize: '11px', fontWeight: '700', color: subtext, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
        Room Numbers *
      </div>
      <input
        value={inputVal}
        onChange={e => handleChange(e.target.value)}
        placeholder="e.g. 101, 102, 103, A1, B2, P1"
        style={{
          width: '100%', padding: '10px 14px', borderRadius: '10px',
          border: `1px solid ${border}`, background: inputBg,
          color: text, fontSize: '13px', fontFamily: 'inherit',
          outline: 'none', boxSizing: 'border-box',
          colorScheme: isDark ? 'dark' : 'light',
        }}
      />
      <div style={{ fontSize: '11px', color: subtext, marginTop: '5px', lineHeight: '1.5' }}>
        Enter your hotel's actual room numbers separated by commas.
        These will appear in the room grid. You can use any format: <span style={{ color: isDark ? '#e8b86d' : '#b45309', fontWeight: '600' }}>101, 102, A1, P1, GF-1</span>
      </div>
      {/* Live preview */}
      {roomNumbers.length > 0 && (
        <div style={{ marginTop: '10px', padding: '10px 12px', borderRadius: '10px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${border}` }}>
          <div style={{ fontSize: '10px', color: subtext, fontWeight: '600', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Preview — {roomNumbers.length} room{roomNumbers.length !== 1 ? 's' : ''}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {roomNumbers.map((r, i) => (
              <span key={i} style={{
                minWidth: '30px', height: '28px', borderRadius: '6px', padding: '0 5px',
                background: r.booked ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.12)',
                border: `1px solid ${r.booked ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '9px', fontWeight: '800',
                color: r.booked ? '#ef4444' : '#22c55e',
              }}>{r.num}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Amenity selector ─────────────────────────────────────────────
function AmenitySelector({ selected, onChange, isDark }) {
  const [customInput, setCustomInput] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const border = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)';
  const inactiveBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
  const inactiveColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';

  function toggleAmenity(a) {
    onChange(selected.includes(a) ? selected.filter(x => x !== a) : [...selected, a]);
  }
  function addCustom() {
    const val = customInput.trim();
    if (val && !selected.includes(val)) onChange([...selected, val]);
    setCustomInput(''); setShowCustom(false);
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
      {ALL_AMENITIES.map(a => (
        <button key={a} type="button" onClick={() => toggleAmenity(a)} style={{
          padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '600',
          cursor: 'pointer', fontFamily: 'inherit',
          border: selected.includes(a) ? '1px solid rgba(232,184,109,0.6)' : `1px solid ${border}`,
          background: selected.includes(a) ? 'rgba(232,184,109,0.18)' : inactiveBg,
          color: selected.includes(a) ? '#e8b86d' : inactiveColor, transition: 'all 0.15s',
        }}>{selected.includes(a) ? '✓ ' : ''}{a}</button>
      ))}
      {selected.filter(a => !ALL_AMENITIES.includes(a)).map(a => (
        <button key={a} type="button" onClick={() => toggleAmenity(a)} style={{
          padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '600',
          cursor: 'pointer', fontFamily: 'inherit',
          border: '1px solid rgba(167,139,250,0.5)', background: 'rgba(167,139,250,0.15)', color: '#a78bfa', transition: 'all 0.15s',
        }}>✓ {a} ×</button>
      ))}
      {showCustom ? (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <input value={customInput} onChange={e => setCustomInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustom()} placeholder="Type amenity..." autoFocus
            style={{ padding: '6px 12px', borderRadius: '100px', fontSize: '12px', border: '1px solid rgba(167,139,250,0.5)', background: 'rgba(167,139,250,0.1)', color: isDark ? '#fff' : '#0f172a', outline: 'none', fontFamily: 'inherit', width: '130px' }} />
          <button type="button" onClick={addCustom} style={{ padding: '6px 12px', borderRadius: '100px', fontSize: '12px', background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.4)', color: '#a78bfa', cursor: 'pointer', fontWeight: '600', fontFamily: 'inherit' }}>Add</button>
          <button type="button" onClick={() => setShowCustom(false)} style={{ padding: '6px 10px', borderRadius: '100px', fontSize: '12px', background: 'transparent', border: `1px solid ${border}`, color: inactiveColor, cursor: 'pointer', fontFamily: 'inherit' }}>×</button>
        </div>
      ) : (
        <button type="button" onClick={() => setShowCustom(true)} style={{ padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', border: '1px dashed rgba(167,139,250,0.4)', background: 'rgba(167,139,250,0.06)', color: '#a78bfa', transition: 'all 0.15s' }}>+ Other</button>
      )}
    </div>
  );
}

// ── Image uploader ───────────────────────────────────────────────
function ImageUploader({ image, onChange }) {
  const fileRef = useRef();
  const [hovered, setHovered] = useState(false);
  function handleFile(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onChange(ev.target.result);
    reader.readAsDataURL(file);
  }
  return (
    <div>
      <div onClick={() => fileRef.current.click()} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{ width: '100%', height: '140px', borderRadius: '12px', overflow: 'hidden', position: 'relative', cursor: 'pointer', border: `2px dashed ${hovered ? 'rgba(232,184,109,0.6)' : 'rgba(232,184,109,0.3)'}`, background: 'rgba(232,184,109,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
        {image ? (
          <>
            <img src={image} alt="Room" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: hovered ? 1 : 0, transition: 'opacity 0.2s' }}>
              <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>📷 Change Image</span>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>📷</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>Click to upload room image</div>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      {image && (
        <button type="button" onClick={() => onChange('')} style={{ marginTop: '6px', padding: '5px 12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600' }}>Remove Image</button>
      )}
    </div>
  );
}

// ── Room form ────────────────────────────────────────────────────
function RoomForm({ initial, onSave, onCancel, title, isDark, isMobile }) {
  const [form, setForm] = useState({
    type: '', price: '', description: '',
    amenities: [], image: '', emoji: '🛏️',
    roomNumbers: [], // ← real room numbers
    ...initial,
  });

  const text    = isDark ? '#fff' : '#0f172a';
  const subtext = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)';
  const border  = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)';
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: `1px solid ${border}`, background: inputBg,
    color: text, fontSize: '14px', fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box',
    colorScheme: isDark ? 'dark' : 'light',
  };
  const labelStyle = {
    fontSize: '11px', fontWeight: '700', color: subtext,
    textTransform: 'uppercase', letterSpacing: '0.5px',
    display: 'block', marginBottom: '6px',
  };

  return (
    <div style={{
      background: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
      border: isDark ? '1px solid rgba(232,184,109,0.3)' : '1px solid rgba(232,184,109,0.4)',
      borderRadius: '18px', padding: isMobile ? '16px' : '24px', marginBottom: '20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      animation: 'slideDown 0.25s ease forwards',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: text }}>{title}</h3>
        <button type="button" onClick={onCancel} style={{ background: 'none', border: 'none', color: subtext, cursor: 'pointer', fontSize: '22px', lineHeight: 1 }}>×</button>
      </div>

      {/* Image */}
      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Room Image</label>
        <ImageUploader image={form.image} onChange={v => setForm(p => ({ ...p, image: v }))} />
      </div>

      {/* Name + Price */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={labelStyle}>Room Type Name *</label>
          <input type="text" value={form.type} placeholder="e.g. Deluxe Room"
            onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Price / Night (₹) *</label>
          <input type="number" value={form.price} placeholder="e.g. 4000"
            onChange={e => setForm(p => ({ ...p, price: e.target.value === '' ? '' : Number(e.target.value) }))} style={inputStyle} />
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Description</label>
        <input type="text" value={form.description} placeholder="Brief description of this room type"
          onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={inputStyle} />
      </div>

      {/* ── Room Numbers (Option C) ── */}
      <div style={{ marginBottom: '16px' }}>
        <RoomNumberInput
          roomNumbers={form.roomNumbers}
          onChange={nums => setForm(p => ({ ...p, roomNumbers: nums }))}
          isDark={isDark}
        />
      </div>

      {/* Amenities */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ ...labelStyle, marginBottom: '10px' }}>Amenities</label>
        <AmenitySelector selected={form.amenities} onChange={v => setForm(p => ({ ...p, amenities: v }))} isDark={isDark} />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="button" onClick={() => onSave(form)} style={{ padding: '11px 24px', borderRadius: '10px', background: 'linear-gradient(135deg, #e8b86d, #c9973a)', border: 'none', color: '#1a0f00', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(232,184,109,0.25)' }}>Save Room Type</button>
        <button type="button" onClick={onCancel} style={{ padding: '11px 20px', borderRadius: '10px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: `1px solid ${border}`, color: subtext, fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
      </div>
    </div>
  );
}

// ── Main Rooms component ─────────────────────────────────────────
export default function Rooms({ theme = 'dark' }) {
  const [rooms, setRooms] = useState(() => {
    try {
      const s = localStorage.getItem('innhance_rooms');
      return s ? JSON.parse(s) : DEFAULT_ROOMS;
    } catch { return DEFAULT_ROOMS; }
  });

  const [showAdd, setShowAdd]           = useState(false);
  const [editingId, setEditingId]       = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isMobile, setIsMobile]         = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet]         = useState(window.innerWidth <= 1100);

  useEffect(() => {
    function onResize() { setIsMobile(window.innerWidth <= 768); setIsTablet(window.innerWidth <= 1100); }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try { localStorage.setItem('innhance_rooms', JSON.stringify(rooms)); }
    catch {}
  }, [rooms]);

  const isDark     = theme === 'dark';
  const text       = isDark ? '#fff' : '#0f172a';
  const subtext    = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.55)';
  const cardBg     = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
  const tagBg      = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';

  function saveRoom(form) {
    const roomNumbers = form.roomNumbers || [];
    const total       = roomNumbers.length;
    const available   = deriveAvailable(roomNumbers);

    const updated = {
      type:        form.type || 'Unnamed Room',
      price:       Number(form.price) || 0,
      total,
      available,
      description: form.description || '',
      amenities:   form.amenities || [],
      image:       form.image || '',
      emoji:       form.emoji || '🛏️',
      roomNumbers,
    };

    if (editingId) {
      setRooms(prev => prev.map(r => r.id === editingId ? { ...updated, id: r.id } : r));
      setEditingId(null);
    } else {
      setRooms(prev => [...prev, { ...updated, id: Date.now() }]);
      setShowAdd(false);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Toggle individual room booked status from the grid
  function toggleRoomBooked(roomId, roomIndex) {
    setRooms(prev => prev.map(r => {
      if (r.id !== roomId) return r;
      const newNums = r.roomNumbers.map((rn, i) =>
        i === roomIndex ? { ...rn, booked: !rn.booked } : rn
      );
      return { ...r, roomNumbers: newNums, available: deriveAvailable(newNums) };
    }));
  }

  function confirmDelete(id) { setDeleteTarget(id); }
  function doDelete() {
    setRooms(prev => prev.filter(r => r.id !== deleteTarget));
    if (editingId === deleteTarget) setEditingId(null);
    setDeleteTarget(null);
  }

  function handleEditClick(room) {
    setEditingId(room.id); setShowAdd(false);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  }

  const editingRoom = rooms.find(r => r.id === editingId);
  const totalRooms  = rooms.reduce((s, r) => s + (r.total || 0), 0);
  const totalAvail  = rooms.reduce((s, r) => s + (r.available || 0), 0);
  const overallOcc  = totalRooms > 0 ? Math.round(((totalRooms - totalAvail) / totalRooms) * 100) : 0;
  const cols        = isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)';

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeInUp  { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)} }
        @keyframes modalIn   { from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)} }
        .rooms-root { font-family:'DM Sans','Segoe UI',system-ui,sans-serif; }
        .room-card  { transition:transform 0.22s ease,box-shadow 0.22s ease; }
        .room-card:hover { transform:translateY(-4px); }
        .avail-btn  { transition:all 0.18s ease; }
        .avail-btn:hover:not(:disabled) { transform:scale(1.03); }
        .add-room-btn:hover { background:rgba(232,184,109,0.9)!important; transform:translateY(-1px); box-shadow:0 8px 24px rgba(232,184,109,0.35)!important; }
      `}</style>

      <div className="rooms-root">

        {/* Confirm delete */}
        {deleteTarget && (
          <ConfirmDialog
            message={`This will permanently remove "${rooms.find(r => r.id === deleteTarget)?.type}" and all its room data.`}
            onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} isDark={isDark}
          />
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '20px', animation: 'fadeInUp 0.5s ease forwards', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '800', color: text, letterSpacing: '-0.5px', marginBottom: '4px' }}>Room Management</h1>
            <p style={{ color: subtext, fontSize: '13px' }}>
              {rooms.length} room type{rooms.length !== 1 ? 's' : ''} ·{' '}
              <span style={{ color: '#22c55e', fontWeight: '700' }}>{totalAvail} available</span> tonight ·{' '}
              <span style={{ color: overallOcc > 70 ? '#f59e0b' : '#60a5fa', fontWeight: '700' }}>{overallOcc}% occupied</span>
            </p>
          </div>
          <button className="add-room-btn" onClick={() => { setShowAdd(!showAdd); setEditingId(null); }} style={{
            padding: '10px 18px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #e8b86d, #c9973a)',
            border: 'none', color: '#1a0f00', fontSize: '13px', fontWeight: '700',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px',
            boxShadow: '0 4px 16px rgba(232,184,109,0.25)',
            fontFamily: 'inherit', flexShrink: 0, transition: 'all 0.22s',
          }}>➕ {!isMobile && 'Add Room Type'}</button>
        </div>

        {/* Summary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '20px', animation: 'fadeInUp 0.5s ease 0.05s both' }}>
          {[
            { label: 'Total Rooms', value: totalRooms,       color: '#e8b86d', bg: 'rgba(232,184,109,0.08)', border: 'rgba(232,184,109,0.15)' },
            { label: 'Available',   value: totalAvail,       color: '#22c55e', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.15)'   },
            { label: 'Occupancy',   value: `${overallOcc}%`, color: overallOcc > 70 ? '#f59e0b' : '#60a5fa', bg: overallOcc > 70 ? 'rgba(245,158,11,0.08)' : 'rgba(96,165,250,0.08)', border: overallOcc > 70 ? 'rgba(245,158,11,0.15)' : 'rgba(96,165,250,0.15)' },
          ].map((s, i) => (
            <div key={i} style={{
              background: isDark ? `linear-gradient(145deg, ${s.bg}, rgba(0,0,0,0.1))` : '#fff',
              border: `1px solid ${isDark ? s.border : 'rgba(0,0,0,0.09)'}`,
              borderRadius: '14px', padding: isMobile ? '12px' : '14px 18px',
              boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.06)', textAlign: 'center',
            }}>
              <div style={{ fontSize: '9px', color: subtext, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '800', color: s.color, letterSpacing: '-0.5px' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Add form */}
        {showAdd && !editingId && (
          <RoomForm key="add-form" title="➕ Add New Room Type"
            initial={{ type: '', price: '', description: '', amenities: [], image: '', emoji: '🛏️', roomNumbers: [] }}
            onSave={saveRoom} onCancel={() => setShowAdd(false)} isDark={isDark} isMobile={isMobile} />
        )}

        {/* Edit form */}
        {editingId && editingRoom && (
          <RoomForm key={`edit-${editingId}`} title={`✏️ Editing — ${editingRoom.type}`}
            initial={{
              type: editingRoom.type || '', price: editingRoom.price || '',
              description: editingRoom.description || '',
              amenities: editingRoom.amenities || [], image: editingRoom.image || '',
              emoji: editingRoom.emoji || '🛏️', roomNumbers: editingRoom.roomNumbers || [],
            }}
            onSave={saveRoom} onCancel={() => setEditingId(null)} isDark={isDark} isMobile={isMobile} />
        )}

        {/* Rooms grid */}
        <div style={{ display: 'grid', gridTemplateColumns: cols, gap: '16px', animation: 'fadeInUp 0.5s ease 0.1s both' }}>
          {rooms.map(room => {
            const availPercent = room.total > 0 ? (room.available / room.total) * 100 : 0;
            const occPercent   = room.total > 0 ? Math.round(((room.total - room.available) / room.total) * 100) : 0;
            const isLow  = room.available > 0 && room.available <= 2;
            const isFull = room.available === 0;
            const barColor = isFull ? '#ef4444' : isLow ? '#f59e0b' : availPercent > 60 ? '#22c55e' : '#60a5fa';

            return (
              <div key={room.id} className="room-card" style={{
                background: cardBg,
                border: `1px solid ${isFull ? 'rgba(239,68,68,0.3)' : isLow ? 'rgba(245,158,11,0.3)' : editingId === room.id ? 'rgba(232,184,109,0.45)' : cardBorder}`,
                borderRadius: '18px', overflow: 'hidden',
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 16px rgba(0,0,0,0.07)',
              }}>

                {/* Image */}
                <div style={{ height: isMobile ? '130px' : '150px', position: 'relative', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                  {room.image ? (
                    <img src={room.image} alt={room.type} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '28px' }}>{room.emoji}</span>
                      <span style={{ fontSize: '12px', color: subtext }}>No image</span>
                    </div>
                  )}
                  {room.image && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)' }} />}
                  {room.image && (
                    <div style={{ position: 'absolute', bottom: '10px', left: '12px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>{room.type}</div>
                    </div>
                  )}
                  {/* Status badge */}
                  <div style={{ position: 'absolute', top: '10px', right: '10px', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '700', background: isFull ? 'rgba(239,68,68,0.9)' : isLow ? 'rgba(245,158,11,0.9)' : 'rgba(34,197,94,0.9)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                    {isFull ? '🔴 Full' : isLow ? `⚠️ ${room.available} left` : `✅ ${room.available} left`}
                  </div>
                  {/* Edit button */}
                  <button onClick={() => handleEditClick(room)} style={{ position: 'absolute', top: '10px', left: '10px', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', background: editingId === room.id ? 'rgba(232,184,109,0.9)' : 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', color: editingId === room.id ? '#1a0f00' : '#fff', cursor: 'pointer', fontWeight: '700', fontFamily: 'inherit', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s' }}>
                    {editingId === room.id ? '✏️ Editing…' : '✏️ Edit'}
                  </button>
                </div>

                <div style={{ padding: isMobile ? '13px' : '16px' }}>
                  {!room.image && <h3 style={{ fontSize: '15px', fontWeight: '700', color: text, marginBottom: '6px' }}>{room.type}</h3>}
                  {room.description && <p style={{ fontSize: '12px', color: subtext, marginBottom: '10px', lineHeight: '1.5' }}>{room.description}</p>}

                  {/* Price + Occupancy strip */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 13px', borderRadius: '12px', marginBottom: '12px', background: isDark ? 'rgba(232,184,109,0.06)' : 'rgba(232,184,109,0.08)', border: '1px solid rgba(232,184,109,0.15)' }}>
                    <div>
                      <div style={{ fontSize: '9px', color: subtext, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price / night</div>
                      <div style={{ fontSize: isMobile ? '17px' : '19px', fontWeight: '800', color: isDark ? '#e8b86d' : '#b45309', letterSpacing: '-0.5px' }}>₹{room.price.toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '9px', color: subtext, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Occupancy</div>
                      <div style={{ fontSize: isMobile ? '17px' : '19px', fontWeight: '800', color: occPercent >= 75 ? '#ef4444' : occPercent >= 50 ? '#f59e0b' : '#22c55e', letterSpacing: '-0.5px' }}>{occPercent}%</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '9px', color: subtext, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</div>
                      <div style={{ fontSize: isMobile ? '17px' : '19px', fontWeight: '800', color: text }}>{room.total}</div>
                    </div>
                  </div>

                  {/* Availability bar */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: subtext, fontWeight: '600' }}>Availability</span>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: text }}>{room.available}/{room.total}</span>
                    </div>
                    <div style={{ height: '8px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderRadius: '100px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '100px', width: `${availPercent}%`, background: barColor, transition: 'width 0.4s ease', boxShadow: `0 0 8px ${barColor}60` }} />
                    </div>
                  </div>

                  {/* ── Real Room Grid (Option C) ── */}
                  <RoomGrid
                    room={room}
                    onToggle={toggleRoomBooked}
                    isDark={isDark}
                    subtext={subtext}
                  />

                  {/* Amenities */}
                  {room.amenities?.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '10px', color: subtext, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '7px' }}>Amenities</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {room.amenities.map(a => (
                          <span key={a} style={{ padding: '4px 9px', borderRadius: '100px', background: !ALL_AMENITIES.includes(a) ? 'rgba(167,139,250,0.12)' : tagBg, border: !ALL_AMENITIES.includes(a) ? '1px solid rgba(167,139,250,0.25)' : `1px solid ${cardBorder}`, fontSize: '11px', color: !ALL_AMENITIES.includes(a) ? '#a78bfa' : subtext, fontWeight: '500' }}>{a}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Delete */}
                  <button onClick={() => confirmDelete(room.id)}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(239,68,68,0.5)'; e.currentTarget.style.borderColor = isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.2)'; }}
                    style={{ width: '100%', padding: '8px', borderRadius: '10px', background: 'transparent', border: `1px solid ${isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.2)'}`, color: 'rgba(239,68,68,0.5)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                    🗑️ Delete Room Type
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add placeholder card */}
          <div
            onClick={() => { setShowAdd(true); setEditingId(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,184,109,0.5)'; e.currentTarget.style.background = 'rgba(232,184,109,0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'; e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'; }}
            style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: `2px dashed ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'}`, borderRadius: '18px', padding: '40px 20px', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', gap: '12px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(232,184,109,0.1)', border: '1px solid rgba(232,184,109,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>➕</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: text, marginBottom: '4px' }}>Add Room Type</div>
              <div style={{ fontSize: '12px', color: subtext }}>Click to add a new room category</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}