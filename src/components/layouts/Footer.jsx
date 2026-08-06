import { Link } from "react-router-dom";
import { Tent } from "lucide-react";
import { FaFacebook, FaInstagram, FaXTwitter, FaLinkedinIn } from "react-icons/fa6";

const SHOP_LINKS = [
  { to: "/search", label: "All Products" },
  { to: "/search?category=1", label: "Tents" },
  { to: "/search?category=2", label: "Backpacks" },
  { to: "/search?category=3", label: "Cooking" },
];

const COMPANY_LINKS = [
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
];

const SOCIALS = [
  { Icon: FaFacebook, label: "Facebook" },
  { Icon: FaInstagram, label: "Instagram" },
  { Icon: FaXTwitter, label: "Twitter" },
  { Icon: FaLinkedinIn, label: "LinkedIn" },
];

function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Tent className="h-5 w-5" />
            </span>
            <span className="text-lg text-foreground">
              Trail<span className="text-primary">Venture</span>
            </span>
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">
            Premium camping gear and outdoor equipment designed to get you closer to
            nature, comfortably.
          </p>
          <div className="flex gap-2">
            {SOCIALS.map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
            Shop
          </h3>
          <ul className="space-y-3">
            {SHOP_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
            Company
          </h3>
          <ul className="space-y-3">
            {COMPANY_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
            Stay in the loop
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Get gear tips and exclusive offers straight to your inbox.
          </p>
          <form
            className="flex gap-2"
            onSubmit={(event) => event.preventDefault()}
          >
            <input
              type="email"
              placeholder="Email address"
              className="h-10 flex-1 rounded-xl border border-input bg-background px-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
            <button
              type="submit"
              className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-sm text-muted-foreground sm:flex-row">
          <span>&copy; {new Date().getFullYear()} Trailventure. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-primary">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors hover:text-primary">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;