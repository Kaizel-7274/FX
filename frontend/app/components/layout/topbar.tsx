import { useState } from "react";
import type { Account } from "../../types";
import { Icon } from "../ui/icon";

export function Topbar({
  active,
  account,
  apiReady,
  accountError,
  onSelect,
  onSignIn,
  onSignOut,
  onEditProfile,
}: {
  active: string;
  account: Account | null;
  apiReady: boolean;
  accountError: string;
  onSelect: (label: string) => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onEditProfile: () => void;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");

  return (
    <>
      <header className="topbar">
        <div className="breadcrumb"><span>Workspace</span><Icon name="chevron" size={14} /><strong>{active}</strong></div>
        <div className="topbar-actions">
          <span className={`api-status${apiReady ? " ready" : ""}`} role="status"><span />{apiReady ? "Connected" : "API offline"}</span>
          <button className={`topbar-icon${searchOpen ? " topbar-icon-active" : ""}`} aria-label="Search" aria-expanded={searchOpen} onClick={() => { setSearchOpen(!searchOpen); setSearchMessage(""); }}><Icon name="search" size={18} /></button>
          <div className="notification-wrap">
            <button className={`topbar-icon${notificationsOpen ? " topbar-icon-active" : ""}`} aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen(!notificationsOpen)}><Icon name="bell" size={18} /><span className="notification-dot" /></button>
            {notificationsOpen && <div className="notification-popover"><strong>You’re all caught up</strong><span>We’ll let you know when there’s something new.</span></div>}
          </div>
          <span className="topbar-divider" />
          {account
            ? <div className="account-menu-wrap">
                <button className="topbar-profile" onClick={() => setAccountMenuOpen(!accountMenuOpen)} aria-label="Open account menu" aria-expanded={accountMenuOpen}><span className="avatar avatar-small">{account.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span><span>{account.name}</span><Icon name="chevron" size={14} /></button>
                {accountMenuOpen && <div className="account-popover">
                  <div className="account-popover-heading"><strong>{account.name}</strong><span>{account.email}</span></div>
                  <button onClick={() => { setAccountMenuOpen(false); onEditProfile(); }}>Edit profile</button>
                  <button onClick={() => { setAccountMenuOpen(false); onSignOut(); }}>Sign out</button>
                </div>}
              </div>
            : <button className="sign-in-button" onClick={onSignIn}>Sign in</button>}
        </div>
      </header>
      {accountError && <div className="account-error" role="alert">{accountError}</div>}
      {searchOpen && (
        <form className="search-panel" onSubmit={(event) => {
          event.preventDefault();
          const query = new FormData(event.currentTarget).get("search")?.toString().trim().toLowerCase();
          const destinations = ["Overview", "Classes", "Courses", "Markets", "Trading journal", "Trading tools", "Bots", "Community", "Settings"];
          const destination = destinations.find((label) => label.toLowerCase().includes(query ?? ""));
          if (destination && query) {
            onSelect(destination);
            setSearchOpen(false);
            setSearchMessage("");
          } else setSearchMessage(query ? "No matching section. Try courses, markets, or tools." : "Enter a section to search.");
        }}>
          <Icon name="search" size={17} />
          <input autoFocus name="search" placeholder="Search sections (e.g. courses, markets)..." aria-label="Search workspace sections" onChange={() => setSearchMessage("")} />
          <button type="submit">Search</button>
          <button type="button" onClick={() => { setSearchOpen(false); setSearchMessage(""); }}>Close</button>
          {searchMessage && <span className="search-message" role="status">{searchMessage}</span>}
        </form>
      )}
    </>
  );
}
