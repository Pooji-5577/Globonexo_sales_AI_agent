import Link from "next/link";
import Logo from "../ui/Logo";

export default function PublicNav() {
  return (
    <header className="public-nav">
      <Link href="/" aria-label="Globonexo home"><Logo size={34} /></Link>
      <nav>
        <Link href="/#product">Product</Link>
        <Link href="/#how-it-works">How it works</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/help">Help Center</Link>
      </nav>
      <div>
        <Link className="public-link" href="/login">Sign in</Link>
        <Link className="btn btn-primary btn-sm" href="/signup">Start free trial</Link>
      </div>
    </header>
  );
}
