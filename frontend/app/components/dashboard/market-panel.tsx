import { useState } from "react";
import { markets, type Market } from "../../data/markets";
import { Icon } from "../ui/icon";

function Sparkline({ values, up }: { values: number[]; up: boolean }) {
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${20 - value}`).join(" ");
  return (
    <svg className="sparkline" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} fill="none" stroke={up ? "#41a884" : "#df7878"} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function MarketChart({ values, up }: { values: number[]; up: boolean }) {
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 720},${104 - value * 3.8}`).join(" ");
  const color = up ? "#51b58b" : "#d97171";
  return (
    <svg className="market-chart" viewBox="0 0 720 160" preserveAspectRatio="none" role="img" aria-label="Illustrative market price chart">
      <defs>
        <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".17" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[28, 64, 100, 136].map((y) => <line key={y} x1="0" x2="720" y1={y} y2={y} stroke="#edf0ed" strokeDasharray="4 6" />)}
      <polygon points={`0,160 ${points} 720,160`} fill="url(#chart-fill)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      <circle cx="720" cy={104 - values[values.length - 1] * 3.8} r="4" fill={color} />
    </svg>
  );
}

export function MarketPanel({ onOpenMarkets }: { onOpenMarkets: () => void }) {
  const [selected, setSelected] = useState<Market>(markets[0]);
  const [period, setPeriod] = useState("1D");
  return (
    <section className="panel market-panel">
      <div className="panel-heading">
        <div><div className="panel-title">Market watch</div><div className="panel-subtitle">A sample of the markets you follow</div></div>
        <button className="text-link" onClick={onOpenMarkets}>View markets <Icon name="chevron" size={14} /></button>
      </div>
      <div className="market-feature">
        <div className="market-price-block">
          <span className="market-symbol">{selected.symbol} <span className="sample-dot" title="Illustrative data" /></span>
          <strong>{selected.price}</strong>
          <span className={selected.up ? "positive" : "negative"}>{selected.change} <span className="muted">today</span></span>
        </div>
        <div className="period-selector" aria-label="Chart period">
          {["1D", "1W", "1M", "1Y"].map((value) => <button key={value} onClick={() => setPeriod(value)} className={period === value ? "selected" : ""} aria-pressed={period === value}>{value}</button>)}
        </div>
      </div>
      <MarketChart values={selected.values} up={selected.up} />
      <div className="chart-axis"><span>09:00</span><span>12:00</span><span>15:00</span><span>18:00</span><span>21:00</span></div>
      <div className="watchlist">
        {markets.map((market) => (
          <button className={`watch-row${market.symbol === selected.symbol ? " chosen" : ""}`} key={market.symbol} onClick={() => setSelected(market)} aria-pressed={market.symbol === selected.symbol}>
            <span className={`pair-icon ${market.symbol === "XAU/USD" ? "gold" : ""}`}>{market.symbol === "XAU/USD" ? "Au" : market.symbol.slice(0, 2)}</span>
            <span className="pair-copy"><strong>{market.symbol}</strong><small>{market.name}</small></span>
            <span className="pair-spark"><Sparkline values={market.values} up={market.up} /></span>
            <span className="pair-price"><strong>{market.price}</strong><small className={market.up ? "positive" : "negative"}>{market.change}</small></span>
          </button>
        ))}
      </div>
      <p className="data-disclaimer">Illustrative market data for demonstration only. Not live prices or trading advice.</p>
    </section>
  );
}
