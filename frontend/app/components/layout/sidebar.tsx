import type { Account, IconName } from "../../types";
import { BrandMark } from "../ui/brand-mark";
import { Icon } from "../ui/icon";

const navigation: { label: string; icon: IconName }[] = [
  { label: "Overview", icon: "grid" },
  { label: "Classes", icon: "book" },
  { label: "Courses", icon: "graduation" },
  { label: "Markets", icon: "chart" },
  { label: "Trading journal", icon: "journal" },
  { label: "Trading tools", icon: "tool" },
  { label: "Bots", icon: "bot" },
  { label: "Community", icon: "users" },
  { label: "Settings", icon: "settings" },
];

export function Sidebar({ active, onSelect, account }: { active: string; onSelect: (label: string) => void; account: Account | null }) {
  const items = account?.role === "admin"
    ? [...navigation, { label: "Admin", icon: "settings" as const }]
    : navigation;
  return (
    <aside className="sidebar">
      <a className="brand-link" href="#overview" onClick={() => onSelect("Overview")} aria-label="AmazonFX overview"><BrandMark /></a>
      <div className="workspace-label">YOUR WORKSPACE</div>
      <nav className="side-nav" aria-label="Main navigation">
        {items.map(({ label, icon }) => (
          <button key={label} className={`nav-item${active === label ? " active" : ""}`} onClick={() => onSelect(label)} aria-current={active === label ? "page" : undefined}>
            <Icon name={icon} size={17} />
            <span>{label}</span>
            {label === "Bots" && <span className="nav-tag">SOON</span>}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="upgrade-card">
          <span className="upgrade-icon"><Icon name="graduation" size={17} /></span>
          <p className="upgrade-title">Keep growing</p>
          <p className="upgrade-copy">Small steps add up to lasting progress.</p>
          <button onClick={() => onSelect("Courses")} className="upgrade-link">Explore courses <Icon name="chevron" size={14} /></button>
        </div>
        <div className="sidebar-user">
          <div className="avatar">{account ? account.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() : "AF"}</div>
          <div className="sidebar-user-copy"><strong>{account?.name ?? "Guest learner"}</strong><span>{account ? `${account.role} account` : "Preview mode"}</span></div>
          <button className="user-menu" aria-label="Open account settings" onClick={() => onSelect("Settings")}>•••</button>
        </div>
      </div>
    </aside>
  );
}
