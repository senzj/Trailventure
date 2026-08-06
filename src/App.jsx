import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";

// Storefront pages
import Home from "./pages/Home";
import Search from "./pages/Search";
import ProductDetails from "./pages/ProductDetails";
import CheckOut from "./pages/CheckOut";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Unauthorized from "./pages/Unauthorized";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import RequireAuth from "./components/RequireAuth";

// Admin pages
import AdminHub from "./pages/Admin/AdminHub";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminAddProduct from "./pages/Admin/AdminAddProduct";
import AdminEditProduct from "./pages/Admin/AdminEditProduct";

// css
import "react-toastify/dist/ReactToastify.css";

// Wraps a page with the shared Header/Footer layout.
const route = (path, element) => ({
  path,
  element: <Layout>{element}</Layout>,
});

const authShell = (element) => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-16">
    {element}
  </div>
);

const router = createBrowserRouter([
  route("/", <Home />),
  route("/search", <Search />),
  route("/product/:id", <ProductDetails />),
  route("/checkout", <CheckOut />),
  route("/about", <About />),
  route("/contact", <Contact />),
  route("/login", authShell(<Login />)),
  route("/signup", authShell(<Signup />)),
  route("/unauthorized", <Unauthorized />),
  route("/profile", <RequireAuth><Profile /></RequireAuth>),
  route("/settings", <RequireAuth><Settings /></RequireAuth>),
  route("/admin", <RequireAuth><AdminHub /></RequireAuth>),
  route("/admin/dashboard", <AdminDashboard />),
  route("/admin/addproduct", <AdminAddProduct />),
  route("/admin/editproduct/:id", <AdminEditProduct />),
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;