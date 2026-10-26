import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/landing";
import { AuthDialog } from "../components/auth/auth-dialog";
import { BrandMark } from "../components/ui/brand-mark";
import { Icon } from "../components/ui/icon";
import { API_URL } from "../lib/api";
import type { Account } from "../types";

const learningPaths = [
  { number: "01", title: "Learn the foundations", detail: "Clear, structured courses from beginner to advanced.", icon: "book" as const },
  { number: "02", title: "Practice with purpose", detail: "Build a repeatable process with thoughtful tools and a journal.", icon: "tool" as const },
  { number: "03", title: "Reflect and improve", detail: "Review your decisions, learn from patterns, and keep growing.", icon: "chart" as const },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AmazonFX — Learn. Practice. Improve." },
    { name: "description", content: "A thoughtful home for trading education, practice tools, and analysis." },
  ];
}

export default function Landing() {
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/api/auth/me`, { credentials: "include", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return;
        const result = await response.json() as { user: Account };
        setAccount(result.user);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Could not check the current session:", error);
        }
      });
    return () => controller.abort();
  }, []);

  const continueToDashboard = () => {
    if (account) navigate("/dashboard");
    else setAuthOpen(true);
  };

  return (
    <main className="landing-page">
      <header className="landing-header">
        <a href="/" className="landing-brand" aria-label="AmazonFX home"><BrandMark /></a>
        <nav className="landing-nav" aria-label="Landing page navigation">
          <a href="#approach">Our approach</a>
          <a href="#learning">Learning paths</a>
          <button className="landing-signin" onClick={continueToDashboard}>{account ? "Open dashboard" : "Sign in"}</button>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <span className="eyebrow"><span className="landing-live-dot" /> A SPACE TO LEARN AND PRACTICE</span>
          <h1>Different mindset.<br /><span>Same mission.</span></h1>
          <p className="landing-lead">A more thoughtful way to build your trading knowledge. Learn the concepts, practice your process, and make room to improve.</p>
          <div className="landing-actions">
            <button className="primary-button landing-primary" onClick={continueToDashboard}>{account ? "Go to your dashboard" : "Start learning"} <Icon name="arrow" size={16} /></button>
            <a className="landing-secondary" href="#learning">Explore the platform <Icon name="chevron" size={15} /></a>
          </div>
          <p className="landing-disclaimer">Education first. No promises of profits or guaranteed results.</p>
        </div>
        <div className="landing-visual" aria-hidden="true">
          <div className="landing-visual-orbit landing-visual-orbit-one" />
          <div className="landing-visual-orbit landing-visual-orbit-two" />
          <div className="landing-visual-sun" />
          <div className="landing-visual-card">
            <span className="visual-label">YOUR NEXT STEP</span>
            <span className="visual-title">Learn the language<br />of the markets.</span>
            <div className="visual-chart"><i /><i /><i /><i /><i /><i /><i /><i /></div>
            <span className="visual-caption"><span />LEARN · PRACTICE · IMPROVE</span>
          </div>
          <span className="visual-float visual-float-top">01 <span>LEARN</span></span>
          <span className="visual-float visual-float-bottom">02 <span>PRACTICE</span></span>
        </div>
      </section>

      <section className="landing-proof" id="approach">
        <div><span>ONE ECOSYSTEM</span><strong>Learning, tools & reflection</strong></div>
        <div><span>BUILT FOR REAL PROGRESS</span><strong>Practice at your own pace</strong></div>
        <div><span>EDUCATION FIRST</span><strong>Risk-aware by design</strong></div>
      </section>

      <section className="landing-learning" id="learning">
        <div className="landing-section-heading">
          <span className="eyebrow dark-eyebrow">A CLEARER PATH FORWARD</span>
          <h2>Small steps. Stronger foundations.</h2>
          <p>Trading knowledge grows with time, thoughtful practice, and honest reflection.</p>
        </div>
        <div className="learning-paths">
          {learningPaths.map((path) => (
            <article className="learning-card" key={path.number}>
              <div className="learning-card-top"><span className="learning-card-icon"><Icon name={path.icon} size={19} /></span><span>{path.number}</span></div>
              <h3>{path.title}</h3>
              <p>{path.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <div><span className="eyebrow">YOUR JOURNEY STARTS HERE</span><h2>There’s always more to learn.</h2></div>
        <button className="primary-button" onClick={continueToDashboard}>{account ? "Open your dashboard" : "Create your account"} <Icon name="arrow" size={16} /></button>
      </section>

      <footer className="landing-footer"><a href="/" className="landing-footer-brand"><BrandMark /></a><span>AmazonFX · Learn. Practice. Analyze. Improve.</span><span>Trading involves substantial risk. Educational content only.</span></footer>
      {authOpen && <AuthDialog onClose={() => setAuthOpen(false)} onAuthenticated={() => navigate("/dashboard")} />}
    </main>
  );
}
