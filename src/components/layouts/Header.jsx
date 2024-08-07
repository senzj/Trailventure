import { Link, useLocation } from "react-router-dom";
import { useAtom } from "jotai";
import { toast } from "react-toastify";
import useAuth from "../../hooks/useAuth";
import { auth } from "../../utils/firebase";
import {
  addQuantity,
  removeProduct,
  shoppingCartAtom,
  subtractQuantity,
} from "../../atom/shoppingCart";
import { TbMinus, TbPlus, TbShoppingCart, TbTrash, TbX } from "react-icons/tb";
import { useEffect, useState } from "react";

function Header() {
  const location = useLocation();
  const currentPath = location.pathname;

  const [shoppingCart] = useAtom(shoppingCartAtom);
  const [shoppingCartOpened, setShoppingCartOpened] = useState(false);

  // get the user session data
  const { user } = useAuth();

  const handleLogout = async () => {
    await auth.signOut();
    toast.success("Successfuly logged out");
  };

  useEffect(() => {
    console.log("shopping cart", shoppingCartOpened);
  }, [shoppingCartOpened]);

  console.log("Current Path:", currentPath);
  console.log("User:", user);
  console.log("User Role:", user?.role);

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
          {user && user.role === "admin" && (
            <Link to="/admin/dashboard" className="text-black dark:text-white">
              Admin Dashboard
            </Link>
          )}

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

          <div className="relative">
            <button
              className="p-2 rounded-md hover:bg-slate-300"
              onClick={() => setShoppingCartOpened(true)}
            >
              <TbShoppingCart className="text-2xl" />
            </button>

            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white aspect-square rounded-full text-xs flex justify-center items-center">
              {shoppingCart.length}
            </span>
          </div>

          <div
            className={
              "fixed top-0 right-0 z-40 flex flex-col w-96 px-3 py-4 min-h-screen h-screen overflow-y-auto bg-white shadow-md transition-transform ease-in" +
              (!shoppingCartOpened ? " translate-x-full" : "")
            }
          >
            <div className="mb-3 flex justify-between">
              <h2 className="text-xl font-bold">Shopping Cart</h2>

              <button onClick={() => setShoppingCartOpened(false)}>
                <TbX className="w-7 h-7" />
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                {shoppingCart.map((item) => (
                  <div key={item.productID} className="p-3 flex gap-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-contain rounded-lg"
                    />

                    <div className="flex flex-col justify-between flex-grow">
                      <div>
                        <p className="text-base font-bold">{item.name}</p>
                        <p className="text-red-500 font-bold">${item.price}</p>
                      </div>

                      <div className="mt-2 inline-flex rounded-md overflow-hidden">
                        <button
                          className="w-8 h-8 bg-blue-500 hover:bg-blue-700 text-white font-bold flex justify-center items-center"
                          onClick={() => subtractQuantity(item.productID)}
                        >
                          <TbMinus />
                        </button>

                        <div className="w-8 h-8 border flex justify-center items-center">
                          {item.quantity}
                        </div>

                        <button
                          className="w-8 h-8 bg-blue-500 hover:bg-blue-700 text-white font-bold flex justify-center items-center"
                          onClick={() => addQuantity(item.productID)}
                        >
                          <TbPlus />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-full text-xs"
                        onClick={() => removeProduct(item.productID)}
                      >
                        <TbTrash />
                      </button>
                      <p>Total: ${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Link
                  to="/checkout"
                  onClick={() => setShoppingCartOpened(false)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-sm"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;
