"use client";
import { useState } from "react";
import Link from "next/link";
import Logo from "../ui/Logo";
import Icon from "../ui/Icon";

// variant: "light" (default, white pages) or "dark" (homepage hero over Aurora background)
// scrollTo: pass on the homepage so Product/How it works/Results scroll the current page instead of linking to /#anchor
// onSignIn: pass on the homepage for the smart returning-user redirect; otherwise Sign in links to /login
export default function PublicNav({ variant = "light", scrollTo, onSignIn }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dark = variant === "dark";

  const handleScroll = (id) => {
    scrollTo?.(id);
    setMobileOpen(false);
  };

  const NavLink = ({ id, href, children }) =>
    scrollTo ? (
      <button onClick={() => handleScroll(id)}>{children}</button>
    ) : (
      <Link href={href} onClick={() => setMobileOpen(false)}>{children}</Link>
    );

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
        <NavLink id="product" href="/#product">Product</NavLink>
        <NavLink id="how-it-works" href="/#how-it-works">How it works</NavLink>
        <NavLink id="results" href="/#results">Results</NavLink>
        <Link href="/solutions" onClick={() => setMobileOpen(false)}>Solutions</Link>
        <Link href="/pricing" onClick={() => setMobileOpen(false)}>Pricing</Link>
      </nav>

      <div className="site-nav-actions">
        {onSignIn ? (
          <button className="public-link" onClick={onSignIn}>Sign in</button>
        ) : (
          <Link className="public-link" href="/login">Sign in</Link>
        )}
        <Link className="btn btn-primary btn-sm" href="/signup">
          Choose a plan <Icon name="arrow" size={16} color="#06231a" />
        </Link>
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
          <NavLink id="product" href="/#product">Product</NavLink>
          <NavLink id="how-it-works" href="/#how-it-works">How it works</NavLink>
          <NavLink id="results" href="/#results">Results</NavLink>
          <Link href="/solutions" onClick={() => setMobileOpen(false)}>Solutions</Link>
          <Link href="/pricing" onClick={() => setMobileOpen(false)}>Pricing</Link>

          <div className="site-nav-mobile-actions">
            {onSignIn ? (
              <button className="btn btn-ghost btn-lg" onClick={() => { onSignIn(); setMobileOpen(false); }}>Sign in</button>
            ) : (
              <Link className="btn btn-ghost btn-lg" href="/login" onClick={() => setMobileOpen(false)}>Sign in</Link>
            )}
            <Link className="btn btn-primary btn-lg" href="/signup" onClick={() => setMobileOpen(false)}>Choose a plan</Link>
          </div>
        </div>
      )}
    </header>
  );
}
