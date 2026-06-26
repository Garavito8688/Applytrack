import { useState, useMemo } from "react";

const CATEGORIES = [
  { id: "college", label: "College Applications", color: "#6366f1", emoji: "🎓" },
  { id: "scholarship", label: "Scholarships", color: "#f59e0b", emoji: "💰" },
  { id: "internship", label: "Internships", color: "#10b981", emoji: "💼" },
  { id: "volunteer", label: "Volunteering", color: "#ec4899", emoji: "🤝" },
  { id: "program", label: "Programs", color: "#3b82f6", emoji: "📋" },
];

const STATUS_OPTIONS = ["Not Started", "In Progress", "Submitted", "Accepted", "Rejected", "Waitlisted"];

const STATUS_COLORS = {
  "Not Started": "#94a3b8",
  "In Progress": "#f59e0b",
  "Submitted": "#6366f1",
  "Accepted": "#10b981",
  "Rejected": "#ef4444",
  "Waitlisted": "#f97316",
};

const EMPTY_FORM = {
  name: "",
  category: "college",
  deadline: "",
  status: "Not Started",
  notes: "",
  link: "",
};

const sampleData = [
  { id: 1, name: "University of Michigan", category: "college", deadline: "2026-01-01", status: "Submitted", notes: "Common App submitted", link: "" },
  { id: 2, name: "Gates Scholarship", category: "scholarship", deadline: "2026-09-15", status: "In Progress", notes: "Need 2 more essays", link: "" },
  { id: 3, name: "Google STEP Internship", category: "internship", deadline: "2026-10-01", status: "Not Started", notes: "", link: "" },
  { id: 4, name: "Local Food Bank", category: "volunteer", deadline: "2026-07-01", status: "Accepted", notes: "Every Saturday 9am", link: "" },
  { id: 5, name: "MIT Summer Program", category: "program", deadline: "2026-02-15", status: "Accepted", notes: "Accepted! Starts June 10", link: "" },
];

export default function StudentTracker() {
  const [entries, setEntries] = useState(sampleData);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("deadline");

  const filtered = useMemo(() => {
    let list = entries;
    if (activeCategory !== "all") list = list.filter(e => e.category === activeCategory);
    if (searchText) list = list.filter(e => e.name.toLowerCase().includes(searchText.toLowerCase()) || e.notes.toLowerCase().includes(searchText.toLowerCase()));
    if (sortBy === "deadline") list = [...list].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    if (sortBy === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "status") list = [...list].sort((a, b) => a.status.localeCompare(b.status));
    return list;
  }, [entries, activeCategory, searchText, sortBy]);

  const stats = useMemo(() => {
    const total = entries.length;
    const accepted = entries.filter(e => e.status === "Accepted").length;
    const upcoming = entries.filter(e => e.deadline && new Date(e.deadline) > new Date() && e.status !== "Submitted" && e.status !== "Accepted").length;
    const inProgress = entries.filter(e => e.status === "In Progress").length;
    return { total, accepted, upcoming, inProgress };
  }, [entries]);

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editingId !== null) {
      setEntries(entries.map(e => e.id === editingId ? { ...form, id: editingId } : e));
      setEditingId(null);
    } else {
      setEntries([...entries, { ...form, id: Date.now() }]);
    }
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const handleEdit = (entry) => {
    setForm({ ...entry });
    setEditingId(entry.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const getCat = (id) => CATEGORIES.find(c => c.id === id);

  const isUrgent = (deadline) => {
    if (!deadline) return false;
    const days = (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 14;
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh", background: "#0f1117", color: "#e2e8f0" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #0f1117 60%)", borderBottom: "1px solid #1e293b", padding: "24px 20px 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>
                <span style={{ color: "#818cf8" }}>Apply</span>Track
              </h1>
              <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>Your student application hub</p>
            </div>
            <button
              onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
              style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" }}
            >
              + Add Entry
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
            {[
              { label: "Total", value: stats.total, color: "#818cf8" },
              { label: "In Progress", value: stats.inProgress, color: "#f59e0b" },
              { label: "Upcoming Deadlines", value: stats.upcoming, color: "#f97316" },
              { label: "Accepted", value: stats.accepted, color: "#10b981" },
            ].map(s => (
              <div key={s.label} style={{ background: "#1e293b", borderRadius: 8, padding: "10px 16px", flex: "1 1 80px", minWidth: 80 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Category tabs */}
          <div style={{ display: "flex", gap: 4, marginTop: 20, overflowX: "auto", paddingBottom: 0 }}>
            <button
              onClick={() => setActiveCategory("all")}
              style={{ background: activeCategory === "all" ? "#6366f1" : "transparent", color: activeCategory === "all" ? "#fff" : "#64748b", border: "none", borderRadius: "8px 8px 0 0", padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{ background: activeCategory === cat.id ? cat.color + "22" : "transparent", color: activeCategory === cat.id ? cat.color : "#64748b", border: activeCategory === cat.id ? `1px solid ${cat.color}44` : "1px solid transparent", borderBottom: "none", borderRadius: "8px 8px 0 0", padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 20px" }}>

        {/* Search + Sort */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <input
            placeholder="Search entries..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ flex: "1 1 180px", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", padding: "8px 12px", fontSize: 13 }}
          />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#94a3b8", padding: "8px 12px", fontSize: 13 }}
          >
            <option value="deadline">Sort: Deadline</option>
            <option value="name">Sort: Name</option>
            <option value="status">Sort: Status</option>
          </select>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, color: "#e2e8f0" }}>{editingId ? "Edit Entry" : "New Entry"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Name *</label>
                <input
                  placeholder="e.g. Harvard University"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Deadline</label>
                <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                  {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Link (optional)</label>
                <input placeholder="https://..." value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Notes</label>
                <textarea
                  placeholder="Any details, requirements, contacts..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button onClick={handleSubmit} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 7, padding: "8px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                {editingId ? "Save Changes" : "Add Entry"}
              </button>
              <button onClick={handleCancel} style={{ background: "transparent", color: "#64748b", border: "1px solid #334155", borderRadius: 7, padding: "8px 14px", fontSize: 13, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Entries */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", color: "#475569", padding: "60px 0" }}>
            <div style={{ fontSize: 40 }}>📭</div>
            <div style={{ marginTop: 8, fontSize: 14 }}>No entries yet. Add your first one!</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(entry => {
              const cat = getCat(entry.category);
              const urgent = isUrgent(entry.deadline) && entry.status !== "Submitted" && entry.status !== "Accepted";
              return (
                <div key={entry.id} style={{ background: "#1e293b", border: `1px solid ${urgent ? "#f9731633" : "#1e293b"}`, borderLeft: `3px solid ${cat.color}`, borderRadius: 10, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9" }}>{entry.name}</span>
                      <span style={{ background: cat.color + "22", color: cat.color, borderRadius: 5, padding: "1px 7px", fontSize: 11, fontWeight: 600 }}>{cat.emoji} {cat.label}</span>
                      {urgent && <span style={{ background: "#f9731622", color: "#f97316", borderRadius: 5, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>⚠ Due Soon</span>}
                    </div>
                    {entry.notes && <div style={{ marginTop: 5, fontSize: 12, color: "#64748b" }}>{entry.notes}</div>}
                    {entry.link && (
                      <a href={entry.link} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 4, fontSize: 11, color: "#818cf8" }}>🔗 Open link</a>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, color: "#475569" }}>Deadline</div>
                      <div style={{ fontSize: 13, color: urgent ? "#f97316" : "#94a3b8", fontWeight: urgent ? 700 : 400 }}>{formatDate(entry.deadline)}</div>
                    </div>
                    <select
                      value={entry.status}
                      onChange={e => setEntries(entries.map(en => en.id === entry.id ? { ...en, status: e.target.value } : en))}
                      style={{ background: STATUS_COLORS[entry.status] + "22", color: STATUS_COLORS[entry.status], border: `1px solid ${STATUS_COLORS[entry.status]}44`, borderRadius: 6, padding: "4px 8px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => handleEdit(entry)} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: 16, padding: "2px 4px" }} title="Edit">✏️</button>
                    <button onClick={() => handleDelete(entry.id)} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: 16, padding: "2px 4px" }} title="Delete">🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  background: "#0f1117",
  border: "1px solid #334155",
  borderRadius: 7,
  color: "#e2e8f0",
  padding: "8px 10px",
  fontSize: 13,
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontSize: 11,
  color: "#64748b",
  marginBottom: 4,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};
