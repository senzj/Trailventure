import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { toast } from "react-toastify";
import { LogOut, Menu, Search, ShoppingCart, Tent } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { shoppingCartAtom } from "@/atom/shoppingCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import CartDrawer from "@/components/cart/CartDrawer";
import UserMenu from "@/components/layouts/UserMenu";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/search", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [shoppingCart] = useAtom(shoppingCartAtom);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  const cartCount = shoppingCart.reduce((count, item) => count + item.quantity, 0);

  const handleLogout = async () => {
    await logout();
    toast.success("Successfully logged out");
  };

  const handleSearch = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setMobileMenuOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    cn(
      "text-sm font-medium transition-colors hover:text-primary",
      isActive ? "text-primary" : "text-muted-foreground",
    );

  const renderNavLinks = () =>
    NAV_ITEMS.map((item) => (
      <NavLink key={item.to} to={item.to} end={item.to === "/"} className={navLinkClass}>
        {item.label}
      </NavLink>
    ));

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Mobile menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="gap-0 p-0">
            <SheetHeader className="border-b px-5 py-4">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 p-3">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
                      isActive ? "bg-muted text-primary" : "text-foreground",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="my-2 h-px bg-border" />
              {user && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Admin
                </Link>
              )}
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground hover:bg-muted"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Login
                </Link>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Tent className="h-5 w-5" />
          </span>
          <span className="text-lg text-foreground">
            Trail<span className="text-primary">Venture</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 lg:flex">{renderNavLinks()}</nav>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="hidden flex-1 items-center md:flex md:max-w-md"
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tents, backpacks, gear..."
              className="pl-9"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {user ? (
            <UserMenu />
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/signup">Sign up</Link>
              </Button>
            </>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                aria-label="Open cart"
                title="Shopping cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <CartDrawer />
          </Sheet>
        </div>
      </div>

      {/* Mobile search */}
      <form onSubmit={handleSearch} className="border-t border-border p-3 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products..."
            className="pl-9"
          />
        </div>
      </form>
    </header>
  );
}

export default Header;