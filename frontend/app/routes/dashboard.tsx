import { useEffect, useState } from "react";
import type { Route } from "./+types/dashboard";
import { ProfileEditor } from "../components/auth/profile-editor";
import { AdminPanel } from "../components/admin/admin-panel";
import { ClassSchedule } from "../components/classes/class-schedule";
import { Overview } from "../components/dashboard/overview";
import { TradingJournal } from "../components/journal/trading-journal";
import { Sidebar } from "../components/layout/sidebar";
import { Topbar } from "../components/layout/topbar";
import { ModulePage } from "../components/modules/module-page";
import { BrandMark } from "../components/ui/brand-mark";
import { Icon } from "../components/ui/icon";
import { TradingTools } from "../components/tools/trading-tools";
import { API_URL } from "../lib/api";
import type { Account } from "../types";
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AmazonFX — Learn. Practice. Improve." },
    { name: "description", content: "Your home for trading education, practice tools, and thoughtful market analysis." },
  ];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState("Overview");
  const [profileOpen, setProfileOpen] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const [accountError, setAccountError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/api/ready`, { credentials: "include", signal: controller.signal })
      .then((response) => {
        setApiReady(response.ok);
        return response.ok ? fetch(`${API_URL}/api/auth/me`, { credentials: "include", signal: controller.signal }) : null;
      })
      .then(async (response) => {
        if (response?.ok) {
          const result = await response.json() as { user: Account };
          setAccount(result.user);
        }
        setSessionLoaded(true);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setApiReady(false);
          setSessionLoaded(true);
        }
      });
    return () => controller.abort();
  }, []);

  async function signOut() {
    setAccountError("");
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, { method: "POST", credentials: "include" });
      if (!response.ok) throw new Error(`Sign out failed (${response.status}).`);
      setAccount(null);
      navigate("/", { replace: true });
    } catch (error) {
      setAccountError(error instanceof Error ? error.message : "Could not sign out.");
    }
  }

  return (
    <div className="app-shell" id="overview">
      {sessionLoaded && account
        ? <>
            <Sidebar active={active} onSelect={setActive} account={account} />
            <main className="main-area">
              <Topbar active={active} account={account} apiReady={apiReady} accountError={accountError} onSelect={setActive} onSignIn={() => navigate("/")} onSignOut={() => void signOut()} onEditProfile={() => setProfileOpen(true)} />
              <div className="page-content">
                {active === "Overview" && <Overview onSelect={setActive} />}
                {active === "Admin" && account.role === "admin" && <AdminPanel />}
                {active === "Classes" && <ModulePage name="Classes" onSelect={setActive}><ClassSchedule /></ModulePage>}
                {active === "Trading journal" && <TradingJournal />}
                {active === "Trading tools" && <TradingTools />}
                {!["Overview", "Admin", "Classes", "Trading journal", "Trading tools"].includes(active) && <ModulePage name={active} onSelect={setActive} />}
                <footer className="footer"><span>AmazonFX <span className="footer-separator">·</span> Different mindset. Same mission.</span><span>Learn. Practice. Analyze. Improve.</span></footer>
              </div>
            </main>
          </>
        : <main className="dashboard-gate">
            <a href="/" className="landing-brand" aria-label="AmazonFX home"><BrandMark /></a>
            <span className="eyebrow dark-eyebrow">{sessionLoaded ? "MEMBER SPACE" : "LOADING YOUR SPACE"}</span>
            <h1>{sessionLoaded ? "Sign in to open your dashboard." : "Checking your account…"}</h1>
            <p>{sessionLoaded ? "Your learning progress, classes, and journal are available after you sign in." : "Please wait while we verify your session."}</p>
            {sessionLoaded && <button className="primary-button" onClick={() => navigate("/")}>Go to AmazonFX <Icon name="arrow" size={16} /></button>}
          </main>}
      {profileOpen && account && <ProfileEditor account={account} onClose={() => setProfileOpen(false)} onUpdated={(updated) => { setAccount(updated); setProfileOpen(false); }} />}
    </div>
  );
}
