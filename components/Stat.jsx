export default function Stat({ value, label }) {
  return (
    <div className="home-stat">
      <div className="home-stat__value">{value}</div>
      <div className="home-stat__label">{label}</div>
    </div>
  );
}
