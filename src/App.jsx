import "./App.css";
import { useState, useEffect } from "react";
import TranscriptCard from "./components/TranscriptCard";
import SearchBar from "./components/SearchBar";

// External data source: a public JSON file served from this project's GitHub
// repo. The app fetches this at runtime rather than importing a local file,
// which satisfies the "pull dynamic data from an external source" requirement.
const DATA_URL =
  "https://raw.githubusercontent.com/hueyfreemanwasright/nemt-transcript-db/main/transcripts.json";

// Status filter options rendered as chips. "all" shows every transcript.
const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "scheduled", label: "Scheduled" },
  { key: "review", label: "Needs review" },
  { key: "flagged", label: "Flagged" },
  { key: "completed", label: "Completed" },
];

// Drives the per-status count summary shown in the header.
const COUNT_ITEMS = [
  { key: "scheduled", label: "scheduled", color: "var(--status-scheduled)" },
  { key: "review", label: "needs review", color: "var(--status-review)" },
  { key: "flagged", label: "flagged", color: "var(--status-flagged)" },
  { key: "completed", label: "completed", color: "var(--status-completed)" },
];

function App() {
  // Fetched data plus the request lifecycle flags.
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Incrementing reloadKey re-runs the fetch effect; this powers "Try again".
  const [reloadKey, setReloadKey] = useState(0);

  // UI state owned by the parent so it can be shared with child components.
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [shortlist, setShortlist] = useState([]);
  const [shortlistOnly, setShortlistOnly] = useState(false);

  // The fetch lives inside useEffect so it runs once after mount (and again
  // only when reloadKey changes), never on every render. Calling fetch directly
  // in the component body would set state and trigger an infinite render loop.
  useEffect(() => {
    // Flag used by the cleanup function to ignore a stale in-flight response.
    let ignore = false;

    async function loadTranscripts() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(DATA_URL);
        // fetch does not reject on HTTP errors like 404 or 500, so the response
        // status has to be checked manually and turned into a thrown error.
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const json = await response.json();
        if (!ignore) {
          setData(json);
        }
      } catch (err) {
        // Any network or parse failure lands here and populates the error state.
        if (!ignore) {
          setError(err.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadTranscripts();

    // Cleanup runs before the next effect or on unmount; it marks the current
    // request stale so a late response can't overwrite newer state.
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  // Lifting state up: child cards call this to add or remove their id. The
  // saved list is owned here in the parent, not inside the individual cards.
  const toggleShortlist = (id) => {
    setShortlist((prev) =>
      prev.includes(id) ? prev.filter((savedId) => savedId !== id) : [...prev, id]
    );
  };

  // Derived value, recomputed each render from data, so it is a const rather
  // than its own piece of state (avoids storing data that can go out of sync).
  const counts = data.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  const normalizedQuery = query.trim().toLowerCase();

  // The visible list is also derived: it applies the active search, status,
  // and shortlist filters together. Kept as a const, not state.
  const filtered = data.filter((t) => {
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
        {/* Header counts and controls are hidden until data has loaded cleanly. */}
        {!loading && !error && (
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
        )}
      </header>

      {!loading && !error && (
        <div className="controls">
          {/* Search text lives in the parent and is passed down to SearchBar. */}
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
      )}

      <main>
        {/* Loading state: shown while the fetch promise is still pending. */}
        {loading && (
          <div className="state-panel">
            <p className="state-panel__msg state-panel__msg--loading">
              Loading transcripts…
            </p>
          </div>
        )}

        {/* Error state: shown if the fetch failed, with a retry control. */}
        {!loading && error && (
          <div className="state-panel state-panel--error">
            <h2 className="state-panel__title">Could not load transcripts</h2>
            <p className="state-panel__msg">{error}</p>
            <button
              type="button"
              className="retry-btn"
              onClick={() => setReloadKey((k) => k + 1)}
            >
              Try again
            </button>
          </div>
        )}

        {/* Success state: render the filtered cards. The key prop is required
            so React can track each card across re-renders. */}
        {!loading && !error && filtered.length > 0 && (
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
        )}

        {/* Empty state: data loaded fine but the active filters match nothing. */}
        {!loading && !error && filtered.length === 0 && (
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