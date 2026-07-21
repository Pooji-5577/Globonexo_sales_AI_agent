import Link from "next/link";
import Logo from "../ui/Logo";

const groups = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "/#product" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact Support", href: "/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "FAQs", href: "/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Refund Policy", href: "/refund" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  },
];

export default function PublicFooter() {
  return (
    <footer className="public-footer public-section">
      <div className="public-footer-grid">
        <div className="public-footer-brand">
          <Logo size={30} />
          <p>AI sales agents that find buyers, start conversations, and book meetings.</p>
        </div>
        {groups.map((group) => (
          <div key={group.title} className="public-footer-col">
            <span>{group.title}</span>
            {group.links.map((link) => (
              <Link key={link.href} href={link.href}>{link.label}</Link>
            ))}
          </div>
        ))}
      </div>
      <div className="public-footer-base">
        <span>© 2026 Globonexo, Inc.</span>
        <a href="mailto:support@globonexo.com">support@globonexo.com</a>
      </div>
    </footer>
  );
}
