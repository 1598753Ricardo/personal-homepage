import siteData from '../data/siteData'

export default function Resume() {
  return (
    <section className="section" style={{background:'var(--bg)'}}>
      <div className="container timeline-container">
        <hr className="divider" style={{marginBottom:'var(--sp-4xl)'}} />

        <div className="timeline-layout">
          <div className="timeline-list" data-animate>
            <svg className="timeline-road" viewBox="0 0 100 100" aria-hidden="true" preserveAspectRatio="none">
              <defs>
                <linearGradient id="timelineRoadGradient" x1="20" y1="80" x2="80" y2="20" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="rgba(255,70,80,.28)" />
                  <stop offset="42%" stopColor="#FF4650" />
                  <stop offset="100%" stopColor="rgba(255,255,255,.62)" />
                </linearGradient>
              </defs>
              <path className="timeline-road-glow" d="M20 80 C8 72 26 63 40 60 C57 56 43 43 60 40 C74 37 68 21 80 20" />
              <path className="timeline-road-line" d="M20 80 C8 72 26 63 40 60 C57 56 43 43 60 40 C74 37 68 21 80 20" />
            </svg>
            {siteData.experience.items.map((item, i) => (
              <article key={item.title} className="glass timeline-card" tabIndex={0}>
                <div className="timeline-dot" />
                <p className="tag" style={{marginBottom:'var(--sp-xs)'}}>{item.time}</p>
                <h3>{item.title}</h3>
                <ul className="timeline-detail">
                  {item.points.map(point => <li key={point}>{point}</li>)}
                </ul>
                <span className="timeline-number">{`0${i + 1}`}</span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
