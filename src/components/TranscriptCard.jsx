// Maps each raw status value to the label shown on the card badge.
const STATUS_LABELS = {
  scheduled: "Scheduled",
  review: "Needs review",
  flagged: "Flagged",
  completed: "Completed",
};

// TranscriptCard is a presentational component: it holds no state of its own.
// It receives a single transcript object plus the `isSaved` flag and the
// `onToggleSave` handler as props. When its button is clicked it calls
// onToggleSave back up to the parent, which owns the saved list. This is the
// "lifting state up" pattern: the child triggers a state change in the parent.
function TranscriptCard({ transcript, isSaved, onToggleSave }) {
  // Pull the fields out of the one prop object for readable JSX below.
  const {
    id,
    callerName,
    memberId,
    phone,
    callDateTime,
    pickup,
    dropoff,
    rideDate,
    appointmentTime,
    mobility,
    status,
    summary,
  } = transcript;

  return (
    // The saved state only changes styling here; the actual data lives in the parent.
    <article className={`card ${isSaved ? "card--saved" : ""}`}>
      <div className="card__top">
        <div>
          <h3 className="card__name">{callerName}</h3>
          <span className="card__member">{memberId}</span>
        </div>
        <span className={`badge badge--${status}`}>{STATUS_LABELS[status]}</span>
      </div>

      {/* Signature element: pickup -> dropoff drawn as a transit-style route line. */}
      <div className="route">
        <div className="route__line">
          <span className="route__dot"></span>
          <span className="route__track"></span>
          <span className="route__pin"></span>
        </div>
        <div className="route__points">
          <div className="route__point">
            <span className="route__label">Pickup</span>
            <span className="route__place">{pickup}</span>
          </div>
          <div className="route__point">
            <span className="route__label">Dropoff</span>
            <span className="route__place">{dropoff}</span>
          </div>
        </div>
      </div>

      <dl className="meta">
        <div className="meta__item">
          <dt>Ride</dt>
          <dd>
            {rideDate} · {appointmentTime}
          </dd>
        </div>
        <div className="meta__item">
          <dt>Mobility</dt>
          <dd>{mobility}</dd>
        </div>
        <div className="meta__item">
          <dt>Phone</dt>
          <dd>{phone}</dd>
        </div>
        <div className="meta__item">
          <dt>Call</dt>
          <dd>{callDateTime}</dd>
        </div>
      </dl>

      <p className="card__summary">{summary}</p>

      <div className="card__footer">
        {/* Reports this card's id up to the parent instead of changing state locally. */}
        <button
          type="button"
          className={`save-btn ${isSaved ? "save-btn--active" : ""}`}
          aria-pressed={isSaved}
          onClick={() => onToggleSave(id)}
        >
          {isSaved ? "Saved" : "Save to shortlist"}
        </button>
      </div>
    </article>
  );
}

export default TranscriptCard;