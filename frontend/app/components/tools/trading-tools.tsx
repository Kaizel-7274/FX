import { useEffect, useState } from "react";

const sessions = [
  { name: "Sydney", timezone: "Australia/Sydney", open: 21, close: 6 },
  { name: "Tokyo", timezone: "Asia/Tokyo", open: 0, close: 9 },
  { name: "London", timezone: "Europe/London", open: 8, close: 17 },
  { name: "New York", timezone: "America/New_York", open: 8, close: 17 },
];

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

export function TradingTools() {
  const [balance, setBalance] = useState(1000);
  const [risk, setRisk] = useState(1);
  const [stopPips, setStopPips] = useState(20);
  const [pipValue, setPipValue] = useState(10);
  const [lots, setLots] = useState(0.1);
  const [entry, setEntry] = useState(1.08);
  const [stop, setStop] = useState(1.075);
  const [target, setTarget] = useState(1.09);
  const [direction, setDirection] = useState<"buy" | "sell">("buy");
  const [pipSize, setPipSize] = useState(0.0001);
  const now = useClock();

  const riskAmount = balance * risk / 100;
  const positionLots = stopPips > 0 && pipValue > 0 ? riskAmount / (stopPips * pipValue) : 0;
  const riskDistance = Math.abs(entry - stop);
  const rewardDistance = Math.abs(target - entry);
  const levelsValid = direction === "buy" ? stop < entry && target > entry : stop > entry && target < entry;
  const rewardRisk = levelsValid && riskDistance > 0 ? rewardDistance / riskDistance : null;
  const pipCount = pipSize > 0 ? Math.abs(entry - target) / pipSize : 0;
  const pipProfit = pipCount * pipValue * lots;

  return (
    <section className="tools-page">
      <div className="tools-page-heading"><span className="eyebrow dark-eyebrow">PLAN WITH CARE</span><h1>Trading tools</h1><p>Practice calculations with your own assumptions. Results are estimates, not trade instructions.</p></div>
      <div className="calculator-grid">
        <article className="calculator-card">
          <span className="calculator-number">01 · POSITION SIZING</span><h2>Risk & lot size</h2><p>Estimate size from your balance, risk amount, stop distance, and pip value per standard lot.</p>
          <div className="calculator-fields">
            <label>Account balance<input type="number" min="0" step="any" value={balance} onChange={(event) => setBalance(Number(event.target.value))} /></label>
            <label>Risk per trade (%)<input type="number" min="0" max="100" step="0.1" value={risk} onChange={(event) => setRisk(Number(event.target.value))} /></label>
            <label>Stop distance (pips)<input type="number" min="0" step="any" value={stopPips} onChange={(event) => setStopPips(Number(event.target.value))} /></label>
            <label>Pip value / standard lot<input type="number" min="0" step="any" value={pipValue} onChange={(event) => setPipValue(Number(event.target.value))} /></label>
          </div>
          <div className="calculator-result"><span>Estimated risk amount</span><strong>{Number.isFinite(riskAmount) ? riskAmount.toFixed(2) : "—"}</strong><small>Account currency units</small></div>
          <div className="calculator-result secondary-result"><span>Estimated position size</span><strong>{Number.isFinite(positionLots) ? positionLots.toFixed(3) : "—"} lots</strong><small>Confirm pip value for your instrument and account currency.</small></div>
        </article>

        <article className="calculator-card">
          <span className="calculator-number">02 · SCENARIO PLANNING</span><h2>Risk / reward</h2><p>Compare entry, stop, and target distances for a hypothetical scenario.</p>
          <div className="calculator-fields">
            <label>Direction<select value={direction} onChange={(event) => setDirection(event.target.value as "buy" | "sell")}><option value="buy">Buy</option><option value="sell">Sell</option></select></label>
            <label>Entry<input type="number" step="any" value={entry} onChange={(event) => setEntry(Number(event.target.value))} /></label>
            <label>Stop loss<input type="number" step="any" value={stop} onChange={(event) => setStop(Number(event.target.value))} /></label>
            <label>Take profit<input type="number" step="any" value={target} onChange={(event) => setTarget(Number(event.target.value))} /></label>
          </div>
          <div className="calculator-result"><span>Risk / reward ratio</span><strong>{rewardRisk === null ? "Check price levels" : `1 : ${rewardRisk.toFixed(2)}`}</strong><small>{rewardRisk === null ? "For a buy: stop below entry and target above. Reverse for a sell." : `Risk distance ${riskDistance.toPrecision(4)} · Reward distance ${rewardDistance.toPrecision(4)}`}</small></div>
        </article>

        <article className="calculator-card">
          <span className="calculator-number">03 · PIP ESTIMATE</span><h2>Pip movement & value</h2><p>Estimate movement and value using a pip size and pip value that you supply.</p>
          <div className="calculator-fields">
            <label>Entry price<input type="number" step="any" value={entry} onChange={(event) => setEntry(Number(event.target.value))} /></label>
            <label>Comparison price<input type="number" step="any" value={target} onChange={(event) => setTarget(Number(event.target.value))} /></label>
            <label>Pip size<input type="number" min="0" step="any" value={pipSize} onChange={(event) => setPipSize(Number(event.target.value))} /></label>
            <label>Position size (lots)<input type="number" min="0" step="any" value={lots} onChange={(event) => setLots(Number(event.target.value))} /></label>
          </div>
          <div className="calculator-result"><span>Estimated movement</span><strong>{Number.isFinite(pipCount) ? `${pipCount.toFixed(1)} pips` : "—"}</strong><small>Direction: {target >= entry ? "up" : "down"}</small></div>
          <div className="calculator-result secondary-result"><span>Estimated value movement</span><strong>{Number.isFinite(pipProfit) ? pipProfit.toFixed(2) : "—"}</strong><small>Uses the pip-value assumption from the position-sizing calculator.</small></div>
        </article>

        <article className="calculator-card session-card">
          <span className="calculator-number">04 · MARKET HOURS</span><h2>Trading sessions</h2><p>Local clocks for common market sessions. Forex hours vary around holidays and daylight saving changes.</p>
          <div className="session-list">{sessions.map((session) => {
            const time = new Intl.DateTimeFormat(undefined, { timeZone: session.timezone, hour: "2-digit", minute: "2-digit", hour12: false }).format(now);
            const hour = Number(new Intl.DateTimeFormat("en", { timeZone: session.timezone, hour: "2-digit", hourCycle: "h23" }).format(now));
            const isOpen = session.open < session.close ? hour >= session.open && hour < session.close : hour >= session.open || hour < session.close;
            return <div className="session-row" key={session.name}><span className={`session-status${isOpen ? " open" : ""}`} /><strong>{session.name}</strong><span>{time}</span><small>{isOpen ? "Open" : "Closed"}</small></div>;
          })}</div>
        </article>
      </div>
      <p className="module-note">Position size and pip value depend on instrument, account currency, broker contract specifications, and market conditions. Verify all inputs independently.</p>
    </section>
  );
}
