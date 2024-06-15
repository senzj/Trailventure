import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import useAuth from "../../hooks/useAuth";
import { auth } from "../../utils/firebase";
import { TbShoppingCart } from "react-icons/tb";

function Header() {
  const location = useLocation();
  const currentPath = location.pathname;

  // get the user session data
  const { user } = useAuth();

  const handleLogout = async () => {
    await auth.signOut();
    toast.success("Successfuly logged out");
  };

  console.log("Current Path:", currentPath);

  // Show the search link if the current path is not /login or /signup, to avoid showing the search link on the login and signup pages
  const showSearchLink = currentPath !== "/login" && currentPath !== "/signup";
  const showBuyNowLink = showSearchLink;

  return (
    <header className="relative flex w-full flex-wrap items-center justify-between bg-zinc-50 py-2 shadow-dark-mild dark:bg-neutral-700 lg:py-4">
      <div className="px-3 flex w-full flex-wrap items-center justify-between">
        <div className="ml-2">
          {/* Nav Title page */}
          <Link to="/" className="text-2xl text-black dark:text-white">
            TrailVenture
          </Link>
        </div>

        <nav className="flex gap-5 items-center">
          {showSearchLink && (
            <Link to="/search" className="text-black dark:text-white">
              Search Icon
            </Link>
          )}

          {/* Link to Admin Dashboard, Only users with admin role can access this */}
          <Link to="/admin/dashboard">Admin</Link>

          {/* Line Separator */}
          <div className="inline-block w-0.5 self-stretch bg-neutral-100 dark:bg-white/10" />

          {/* Login and Logout buttons deirect page */}
          {showBuyNowLink &&
            (!user ? (
              <Link
                to="/login"
                className="px-3 py-1 rounded-md bg-blue-600 text-black dark:text-white"
              >
                BUY NOW!
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="px-3 py-1 border-radius rounded-md bg-red-600 text-black dark:text-white"
              >
                Logout
              </button>
            ))}

          <button className="p-2 rounded-md hover:bg-slate-300">
            <TbShoppingCart className="text-2xl" />
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
