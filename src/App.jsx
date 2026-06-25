import "./App.css";
import { useState } from "react";
import { transcripts } from "./data/transcripts";
import TranscriptCard from "./components/TranscriptCard";
import SearchBar from "./components/SearchBar";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "scheduled", label: "Scheduled" },
  { key: "review", label: "Needs review" },
  { key: "flagged", label: "Flagged" },
  { key: "completed", label: "Completed" },
];

const COUNT_ITEMS = [
  { key: "scheduled", label: "scheduled", color: "var(--status-scheduled)" },
  { key: "review", label: "needs review", color: "var(--status-review)" },
  { key: "flagged", label: "flagged", color: "var(--status-flagged)" },
  { key: "completed", label: "completed", color: "var(--status-completed)" },
];

function App() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [shortlist, setShortlist] = useState([]);
  const [shortlistOnly, setShortlistOnly] = useState(false);

  const toggleShortlist = (id) => {
    setShortlist((prev) =>
      prev.includes(id) ? prev.filter((savedId) => savedId !== id) : [...prev, id]
    );
  };

  const counts = transcripts.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = transcripts.filter((t) => {
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesQuery =
      normalizedQuery === "" ||
      t.callerName.toLowerCase().includes(normalizedQuery) ||
      t.memberId.toLowerCase().includes(normalizedQuery) ||
      t.pickup.toLowerCase().includes(normalizedQuery) ||
      t.dropoff.toLowerCase().includes(normalizedQuery);
    const matchesShortlist = !shortlistOnly || shortlist.includes(t.id);
    return matchesStatus && matchesQuery && matchesShortlist;
  });

  return (
    <div className="app">
      <header className="command-bar">
        <div className="command-bar__brand">
          <h1 className="command-bar__title">NEMT Intake</h1>
          <span className="command-bar__tag">review console</span>
        </div>
        <div className="status-counts">
          {COUNT_ITEMS.map((item) => (
            <span key={item.key} className="status-counts__item">
              <span
                className="status-counts__dot"
                style={{ background: item.color }}
              ></span>
              {counts[item.key] || 0} {item.label}
            </span>
          ))}
        </div>
      </header>

      <div className="controls">
        <SearchBar value={query} onChange={setQuery} />
        <div className="chips">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              className={`chip ${statusFilter === f.key ? "chip--active" : ""}`}
              onClick={() => setStatusFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`chip chip--toggle ${shortlistOnly ? "chip--active" : ""}`}
          aria-pressed={shortlistOnly}
          onClick={() => setShortlistOnly((v) => !v)}
        >
          Shortlist ({shortlist.length})
        </button>
      </div>

      <main>
        {filtered.length > 0 ? (
          <div className="transcript-list">
            {filtered.map((t) => (
              <TranscriptCard
                key={t.id}
                transcript={t}
                isSaved={shortlist.includes(t.id)}
                onToggleSave={toggleShortlist}
              />
            ))}
          </div>
        ) : (
          <p className="empty">
            No transcripts match the current filters. Clear the search, status,
            or shortlist filter to see more.
          </p>
        )}
      </main>
    </div>
  );
}

export default App;