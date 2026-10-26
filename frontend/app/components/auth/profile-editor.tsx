import { useState, type FormEvent } from "react";
import { API_URL } from "../../lib/api";
import type { Account } from "../../types";

export function ProfileEditor({ account, onClose, onUpdated }: {
  account: Account;
  onClose: () => void;
  onUpdated: (account: Account) => void;
}) {
  const [name, setName] = useState(account.name);
  const [email, setEmail] = useState(account.email);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const result = await response.json() as { user?: Account; error?: string };
      if (!response.ok || !result.user) throw new Error(result.error ?? "Could not update your profile.");
      onUpdated(result.user);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not reach the AmazonFX API.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="auth-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <button className="auth-close" onClick={onClose} aria-label="Close profile">×</button>
        <span className="eyebrow dark-eyebrow">YOUR ACCOUNT</span>
        <h2 id="profile-title">Edit your profile.</h2>
        <p className="auth-intro">Update the name and email on your AmazonFX account.</p>
        <form className="auth-form" onSubmit={save}>
          <label>Full name<input name="name" autoComplete="name" required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <div className="profile-actions">
            <button className="profile-cancel" type="button" onClick={onClose}>Cancel</button>
            <button className="primary-button auth-submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
          </div>
        </form>
        <p className="auth-disclaimer">Email changes apply immediately to future sign-ins.</p>
      </section>
    </div>
  );
}
