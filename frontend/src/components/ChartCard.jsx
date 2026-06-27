export default function ChartCard({ title, subtitle, children, className = "" }) {
  return (
    <section className={`chart-card ${className}`}>
      <div className="section-head">
        <div>
          <p className="card-label">{subtitle}</p>
          <h3>{title}</h3>
        </div>
      </div>
      {children}
    </section>
  );
}
