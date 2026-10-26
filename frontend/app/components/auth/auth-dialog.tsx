import { useState, type FormEvent } from "react";
import { API_URL } from "../../lib/api";
import type { Account } from "../../types";
import { BrandMark } from "../ui/brand-mark";
import { Icon } from "../ui/icon";

export function AuthDialog({ onClose, onAuthenticated }: { onClose: () => void; onAuthenticated: (account: Account) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const body: Record<string, string> = {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    };
    if (mode === "register") body.name = String(form.get("name") ?? "");

    try {
      const response = await fetch(`${API_URL}/api/auth/${mode}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json() as { user?: Account; error?: string };
      if (!response.ok || !result.user) throw new Error(result.error ?? "Could not sign in.");
      onAuthenticated(result.user);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not reach the AmazonFX API.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="auth-close" onClick={onClose} aria-label="Close sign in">×</button>
        <BrandMark />
        <span className="eyebrow dark-eyebrow auth-eyebrow">YOUR LEARNING SPACE</span>
        <h2 id="auth-title">{mode === "login" ? "Welcome back." : "Create your account."}</h2>
        <p className="auth-intro">{mode === "login" ? "Sign in to continue your learning journey." : "Start learning, practicing, and tracking your progress."}</p>
        <form className="auth-form" onSubmit={submit}>
          {mode === "register" && <label>Your name<input name="name" autoComplete="name" required minLength={2} maxLength={80} /></label>}
          <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
          <label>Password<input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={12} maxLength={72} /><small>Use at least 12 characters (up to 72 UTF-8 bytes).</small></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="primary-button auth-submit" disabled={submitting}>{submitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"} <Icon name="arrow" size={15} /></button>
        </form>
        <p className="auth-switch">{mode === "login" ? "New to AmazonFX?" : "Already have an account?"} <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "Create an account" : "Sign in"}</button></p>
        <p className="auth-disclaimer">Educational platform only. Trading involves substantial risk.</p>
      </section>
    </div>
  );
}
