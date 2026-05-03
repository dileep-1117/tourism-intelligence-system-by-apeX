function InfoPanel({ data, selectedCountry }) {
  if (!selectedCountry || !data[selectedCountry]) {
    return <p>Click a country</p>;
  }

  const info = data[selectedCountry];

  return (
    <div>
      <h3>{selectedCountry}</h3>
      <p>Demand: {info.demand_level}</p>
      <p>Index: {info.tourism_index.toFixed(2)}</p>
      <p>City: {info.city}</p>
      <p>Event: {info.event}</p>
    </div>
  );
}

export default InfoPanel;