import { Icon } from "../ui/icon";
import { MarketPanel } from "./market-panel";

export function Overview({ onSelect }: { onSelect: (label: string) => void }) {
  return (
    <>
      <section className="welcome-banner">
        <div className="welcome-content">
          <span className="eyebrow">SAMPLE DASHBOARD <span className="eyebrow-dot">•</span> YOUR LEARNING SPACE</span>
          <h1>A little progress<br />goes a long way.</h1>
          <p>Pick up where you left off, or make today a fresh start.</p>
          <button className="primary-button" onClick={() => onSelect("Courses")}>Continue learning <Icon name="arrow" size={16} /></button>
        </div>
        <div className="banner-art" aria-hidden="true">
          <div className="art-sun" />
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-chart"><span /><span /><span /><span /><span /><span /><span /></div>
          <div className="art-caption"><span className="art-caption-dot" /> LEARN AT YOUR PACE</div>
        </div>
      </section>

      <div className="stat-grid">
        <article className="stat-card">
          <div className="stat-top"><span className="stat-icon mint"><Icon name="play" size={16} /></span><span className="stat-label">Learning progress</span></div>
          <div className="stat-value">68<span className="stat-unit">%</span></div>
          <div className="progress-track"><span style={{ width: "68%" }} /></div>
          <div className="stat-foot">A steady pace. Keep it up.</div>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span className="stat-icon blue"><Icon name="book" size={16} /></span><span className="stat-label">Lessons completed</span></div>
          <div className="stat-value">12<span className="stat-unit"> / 18</span></div>
          <div className="stat-foot"><span className="stat-note">6 lessons</span> left in your current course</div>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span className="stat-icon gold"><Icon name="journal" size={16} /></span><span className="stat-label">Journal entries</span></div>
          <div className="stat-value">08</div>
          <div className="stat-foot">Your practice, thoughtfully recorded</div>
        </article>
      </div>

      <div className="content-grid">
        <MarketPanel onOpenMarkets={() => onSelect("Markets")} />
        <div className="right-column">
          <section className="panel course-panel">
            <div className="panel-heading">
              <div><div className="panel-title">Pick up where you left off</div><div className="panel-subtitle">Your current learning path</div></div>
              <button className="icon-button" aria-label="Open courses" onClick={() => onSelect("Courses")}><Icon name="external" size={16} /></button>
            </div>
            <div className="course-art">
              <span className="course-level">BEGINNER · 6 MODULES</span>
              <div className="course-illustration" aria-hidden="true"><span /><span /><span /><i>FX</i></div>
            </div>
            <div className="course-info">
              <div className="course-kicker">FOUNDATIONS</div>
              <h3>Forex fundamentals</h3>
              <p>Understand how the market works, one concept at a time.</p>
              <div className="course-progress-copy"><span>Course progress</span><strong>68%</strong></div>
              <div className="progress-track course-progress"><span style={{ width: "68%" }} /></div>
              <button className="course-continue" onClick={() => onSelect("Courses")}>Continue course <Icon name="chevron" size={15} /></button>
            </div>
          </section>

          <section className="panel schedule-panel">
            <div className="panel-heading">
              <div><div className="panel-title">Coming up</div><div className="panel-subtitle">Make time for your next step</div></div>
              <button className="text-link" onClick={() => onSelect("Classes")}>All classes <Icon name="chevron" size={14} /></button>
            </div>
            <button className="schedule-item" onClick={() => onSelect("Classes")}>
              <span className="schedule-date"><strong>23</strong><small>OCT</small></span>
              <span className="schedule-copy"><strong>Reading the market structure</strong><small><Icon name="clock" size={12} /> Friday · 4:00 PM EAT</small></span>
              <Icon name="chevron" size={16} />
            </button>
            <button className="schedule-item" onClick={() => onSelect("Classes")}>
              <span className="schedule-date muted-date"><strong>27</strong><small>OCT</small></span>
              <span className="schedule-copy"><strong>Risk management, in practice</strong><small><Icon name="clock" size={12} /> Tuesday · 6:30 PM EAT</small></span>
              <Icon name="chevron" size={16} />
            </button>
          </section>
        </div>
      </div>

      <section className="tools-section">
        <div className="section-heading">
          <div><span className="eyebrow dark-eyebrow">BUILT FOR YOUR PRACTICE</span><h2>Helpful tools, right when you need them.</h2></div>
          <button className="text-link" onClick={() => onSelect("Trading tools")}>Explore all tools <Icon name="chevron" size={14} /></button>
        </div>
        <div className="quick-tools">
          {[
            { name: "Lot size calculator", detail: "Explore position sizing", icon: "◉", tint: "tool-mint" },
            { name: "Risk / reward", detail: "Plan a practice scenario", icon: "↗", tint: "tool-blue" },
            { name: "Pip calculator", detail: "Learn how pip values work", icon: "⌁", tint: "tool-peach" },
            { name: "Trading sessions", detail: "See global market hours", icon: "◷", tint: "tool-lilac" },
          ].map((tool) => (
            <button className="quick-tool" key={tool.name} onClick={() => onSelect("Trading tools")}>
              <span className={`quick-tool-icon ${tool.tint}`}>{tool.icon}</span>
              <span className="quick-tool-copy"><strong>{tool.name}</strong><small>{tool.detail}</small></span>
              <Icon name="chevron" size={15} />
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
