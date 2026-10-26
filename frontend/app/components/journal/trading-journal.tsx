import { useEffect, useMemo, useState, type FormEvent } from "react";
import { API_URL } from "../../lib/api";

type Trade = {
  id: number;
  symbol: string;
  direction: "buy" | "sell";
  entry_price: string | number;
  exit_price: string | number | null;
  stop_loss: string | number | null;
  take_profit: string | number | null;
  lot_size: string | number | null;
  risk_percent: string | number | null;
  strategy: string | null;
  result: "open" | "win" | "loss" | "breakeven";
  notes: string | null;
  opened_at: string;
};

async function journalRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (response.status === 204) return undefined as T;
  const result = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(result.error ?? `Request failed (${response.status}).`);
  return result;
}

export function TradingJournal() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadTrades() {
    setError("");
    try {
      const result = await journalRequest<{ trades: Trade[] }>("/api/journal");
      setTrades(result.trades);
      setStatus("loaded");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load your journal.");
      setStatus("error");
    }
  }

  useEffect(() => {
    void loadTrades();
  }, []);

  const stats = useMemo(() => {
    const closed = trades.filter((trade) => trade.result !== "open");
    const wins = closed.filter((trade) => trade.result === "win").length;
    return {
      total: trades.length,
      open: trades.filter((trade) => trade.result === "open").length,
      winRate: closed.length ? Math.round((wins / closed.length) * 100) : null,
    };
  }, [trades]);

  async function addTrade(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const optionalNumber = (key: string) => {
      const value = String(form.get(key) ?? "");
      return value ? Number(value) : null;
    };
    const payload = {
      symbol: String(form.get("symbol") ?? ""),
      direction: String(form.get("direction") ?? "buy"),
      entry_price: Number(form.get("entry_price")),
      exit_price: optionalNumber("exit_price"),
      stop_loss: optionalNumber("stop_loss"),
      take_profit: optionalNumber("take_profit"),
      lot_size: optionalNumber("lot_size"),
      risk_percent: optionalNumber("risk_percent"),
      strategy: String(form.get("strategy") ?? "") || null,
      result: String(form.get("result") ?? "open"),
      notes: String(form.get("notes") ?? "") || null,
      opened_at: new Date(String(form.get("opened_at"))).toISOString(),
    };

    setBusy(true);
    setError("");
    try {
      await journalRequest("/api/journal", { method: "POST", body: JSON.stringify(payload) });
      formElement.reset();
      await loadTrades();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not save this trade.");
    } finally {
      setBusy(false);
    }
  }

  async function removeTrade(id: number) {
    setBusy(true);
    setError("");
    try {
      const trade = trades.find((entry) => entry.id === id);
      if (trade && !window.confirm(`Delete the ${trade.symbol} ${trade.direction} journal entry?`)) return;
      await journalRequest(`/api/journal/${id}`, { method: "DELETE" });
      await loadTrades();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete this trade.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="journal-page">
      <div className="journal-heading"><div><span className="eyebrow dark-eyebrow">REFLECT & IMPROVE</span><h1>Trading journal</h1><p>Record your decisions. Review your process. Your entries stay private to your account.</p></div></div>
      {error && <p className="admin-message error" role="alert">{error}</p>}
      <div className="journal-stats">
        <article><span>Total trades</span><strong>{status === "loaded" ? stats.total : "—"}</strong></article>
        <article><span>Open positions</span><strong>{status === "loaded" ? stats.open : "—"}</strong></article>
        <article><span>Closed-trade win rate</span><strong>{status === "loaded" && stats.winRate !== null ? `${stats.winRate}%` : "—"}</strong></article>
      </div>
      <form className="journal-form" onSubmit={addTrade}>
        <h2>Record a trade</h2>
        <div className="journal-form-grid">
          <label>Symbol<input name="symbol" placeholder="EURUSD" required minLength={3} maxLength={24} /></label>
          <label>Direction<select name="direction"><option value="buy">Buy</option><option value="sell">Sell</option></select></label>
          <label>Entry price<input name="entry_price" type="number" step="any" min="0" required /></label>
          <label>Exit price<input name="exit_price" type="number" step="any" min="0" /></label>
          <label>Stop loss<input name="stop_loss" type="number" step="any" min="0" /></label>
          <label>Take profit<input name="take_profit" type="number" step="any" min="0" /></label>
          <label>Lot size<input name="lot_size" type="number" step="any" min="0" /></label>
          <label>Risk %<input name="risk_percent" type="number" step="0.01" min="0" max="100" /></label>
          <label>Strategy<input name="strategy" maxLength={120} placeholder="Optional" /></label>
          <label>Result<select name="result"><option value="open">Open</option><option value="win">Win</option><option value="loss">Loss</option><option value="breakeven">Breakeven</option></select></label>
          <label>Opened at<input name="opened_at" type="datetime-local" required defaultValue={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)} /></label>
          <label className="wide">Notes<textarea name="notes" rows={2} maxLength={5000} /></label>
        </div>
        <button className="primary-button" disabled={busy}>Save trade</button>
      </form>
      <section className="journal-list">
        <div className="class-schedule-heading"><h2>Recent trades</h2><span>PRIVATE TO YOUR ACCOUNT</span></div>
        {status === "loading" && <p className="catalog-message">Loading journal…</p>}
        {status === "error" && <p className="catalog-message error">Sign in again or check that the API is ready.</p>}
        {status === "loaded" && trades.length === 0 && <p className="catalog-message">Your journal is empty. Add your first practice trade above.</p>}
        {status === "loaded" && trades.map((trade) => <article className="trade-row" key={trade.id}>
          <div><strong>{trade.symbol} <span className={`trade-direction ${trade.direction}`}>{trade.direction}</span></strong><small>{new Date(trade.opened_at).toLocaleString()} · {trade.strategy || "No strategy"}</small></div>
          <div><span>Entry</span><strong>{trade.entry_price}</strong></div>
          <span className={`trade-result ${trade.result}`}>{trade.result}</span>
          <button className="danger-button" disabled={busy} onClick={() => void removeTrade(trade.id)}>Delete</button>
        </article>)}
      </section>
      <p className="module-note">Journal analytics are descriptive and educational, not financial advice or a promise of future performance.</p>
    </section>
  );
}
