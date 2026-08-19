"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import Logo from "../ui/Logo";
import Icon from "../ui/Icon";

// variant: "light" (default, white pages) or "dark" (homepage hero over Aurora background)
// scrollTo: pass on the homepage so the logo scrolls to top instead of navigating
// onSignIn: pass on the homepage for the smart returning-user redirect; otherwise Sign in links to /login
export default function PublicNav({ variant = "light", scrollTo, onSignIn }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading } = useAuth();
  const dark = variant === "dark";

  const handleScroll = (id) => {
    scrollTo?.(id);
    setMobileOpen(false);
  };

  return (
    <header className={`site-nav${dark ? " site-nav--dark" : ""}`}>
      {scrollTo ? (
        <button className="site-nav-logo" onClick={() => handleScroll("landing-top")} aria-label="GNX Sales home">
          <Logo size={34} light={dark} />
        </button>
      ) : (
        <Link className="site-nav-logo" href="/" aria-label="GNX Sales home" onClick={() => setMobileOpen(false)}>
          <Logo size={34} light={dark} />
        </Link>
      )}

      <nav className="site-nav-links">
        <Link href="/platform" onClick={() => setMobileOpen(false)}>The Agent</Link>
        <Link href="/voice" onClick={() => setMobileOpen(false)}>AI Calls</Link>
        <Link href="/accuracy" onClick={() => setMobileOpen(false)}>No Guessing</Link>
        <Link href="/solutions" onClick={() => setMobileOpen(false)}>Who It&apos;s For</Link>
        <Link href="/pricing" onClick={() => setMobileOpen(false)}>Pricing</Link>
      </nav>

      <div className="site-nav-actions" style={loading ? { visibility: "hidden" } : undefined} aria-hidden={loading || undefined}>
        {user ? (
          <Link className="btn btn-primary btn-sm" href="/dashboard">
            Back to dashboard <Icon name="arrow" size={16} color="#06231a" />
          </Link>
        ) : (
          <>
            {onSignIn ? (
              <button className="public-link" onClick={onSignIn}>Sign in</button>
            ) : (
              <Link className="public-link" href="/login">Sign in</Link>
            )}
            <Link className="btn btn-primary btn-sm" href="/signup">
              Choose a plan <Icon name="arrow" size={16} color="#06231a" />
            </Link>
          </>
        )}
      </div>

      <button
        className="site-nav-burger"
        aria-label="Toggle menu"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((open) => !open)}
      >
        <Icon name={mobileOpen ? "close" : "menu"} size={22} />
      </button>

      {mobileOpen && (
        <div className="site-nav-mobile">
          <Link href="/platform" onClick={() => setMobileOpen(false)}>The Agent</Link>
          <Link href="/voice" onClick={() => setMobileOpen(false)}>AI Calls</Link>
          <Link href="/accuracy" onClick={() => setMobileOpen(false)}>No Guessing</Link>
          <Link href="/solutions" onClick={() => setMobileOpen(false)}>Who It&apos;s For</Link>
          <Link href="/pricing" onClick={() => setMobileOpen(false)}>Pricing</Link>

          <div className="site-nav-mobile-actions" style={loading ? { visibility: "hidden" } : undefined} aria-hidden={loading || undefined}>
            {user ? (
              <Link className="btn btn-primary btn-lg" href="/dashboard" onClick={() => setMobileOpen(false)}>
                Back to dashboard
              </Link>
            ) : (
              <>
                {onSignIn ? (
                  <button className="btn btn-ghost btn-lg" onClick={() => { onSignIn(); setMobileOpen(false); }}>Sign in</button>
                ) : (
                  <Link className="btn btn-ghost btn-lg" href="/login" onClick={() => setMobileOpen(false)}>Sign in</Link>
                )}
                <Link className="btn btn-primary btn-lg" href="/signup" onClick={() => setMobileOpen(false)}>Choose a plan</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
