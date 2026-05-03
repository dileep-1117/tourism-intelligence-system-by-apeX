function Recommendation({ place, index }) {
  if (!place) return null;

  return (
    <div className="place-card">
      <div className="place-card-inner">
        <div className="place-rank">{index + 1}</div>

        <div>
          <strong>{place.city}</strong>
          <span>{place.country}</span>
        </div>
      </div>
    </div>
  );
}

export default Recommendation;
