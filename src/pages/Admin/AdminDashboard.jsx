import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Package, Pencil, Plus, Trash2, Wallet } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { deleteProduct, fetchProducts } from "@/api/products";
import { fetchOrders, updateOrderStatus } from "@/api/orders";
import { deleteUser, fetchUsers, updateUserRole } from "@/api/users";
import UserForm from "./UserForm";
import { formatPrice } from "@/utils/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ConditionalState from "@/components/ui/ConditionalState";
import { cn } from "@/lib/utils";

const STATUS_STYLE = {
  pending: "bg-amber-500/10 text-amber-700",
  processing: "bg-blue-500/10 text-blue-700",
  completed: "bg-green-500/10 text-green-700",
  cancelled: "bg-red-500/10 text-red-600",
};

const ORDER_FILTERS = ["all", "pending", "processing", "completed", "cancelled"];
const ROLES = ["user", "admin", "superadmin"];

const ROLE_STYLE = {
  user: "bg-secondary text-secondary-foreground",
  admin: "bg-blue-500/10 text-blue-600",
  superadmin: "bg-purple-500/10 text-purple-600",
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, fetching } = useAuth();

  const isSuper = user?.role === "superadmin";
  const [tab, setTab] = useState(
    searchParams.get("tab") === "users" && user?.role === "superadmin"
      ? "users"
      : "products",
  );
  const [statusFilter, setStatusFilter] = useState("pending");

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [userForm, setUserForm] = useState(null); // null | "new" | user object

  useEffect(() => {
    if (!fetching && user?.role !== "admin" && user?.role !== "superadmin") {
      navigate("/unauthorized");
    }
  }, [user, fetching, navigate]);

  const loadProducts = () => {
    setProductsLoading(true);
    setProductsError(null);
    fetchProducts()
      .then(setProducts)
      .catch(setProductsError)
      .finally(() => setProductsLoading(false));
  };

  const loadOrders = () => {
    setOrdersLoading(true);
    setOrdersError(null);
    fetchOrders(statusFilter === "all" ? {} : { status: statusFilter })
      .then(setOrders)
      .catch(setOrdersError)
      .finally(() => setOrdersLoading(false));
  };

  const loadUsers = () => {
    setUsersLoading(true);
    setUsersError(null);
    fetchUsers()
      .then(setUsers)
      .catch(setUsersError)
      .finally(() => setUsersLoading(false));
  };

  useEffect(loadProducts, []);
  useEffect(loadOrders, [statusFilter]);
  useEffect(() => {
    if (isSuper) loadUsers();
  }, [isSuper]);

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(product.productID);
      toast.success("Product deleted");
      loadProducts();
    } catch (error) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  const handleOrderStatus = async (order, status) => {
    try {
      await updateOrderStatus(order.orderID, status);
      toast.success(`Order marked as ${status}`);
      loadOrders();
    } catch (error) {
      toast.error(error.message || "Failed to update order");
    }
  };

  const handleRoleChange = async (target, role) => {
    try {
      await updateUserRole(target.id, role);
      toast.success(`${target.username || target.email} is now ${role}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === target.id ? { ...u, role } : u)),
      );
    } catch (error) {
      toast.error(error.message || "Failed to update role");
    }
  };

  const handleDeleteUser = async (target) => {
    if (!window.confirm(`Delete user ${target.username || target.email}? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteUser(target.id);
      toast.success("User deleted");
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
    } catch (error) {
      toast.error(error.message || "Failed to delete user");
    }
  };

  const lowStock = products.filter((product) => product.stock <= 5).length;
  const pendingOrders = orders.filter((order) => order.status === "pending").length;

  return (
    <div className="container py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage products, discounts, and customer orders.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/addproduct">
            <Plus /> Add Product
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Package className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-bold">{products.length}</p>
              <p className="text-sm text-muted-foreground">Products</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Wallet className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-bold">{lowStock}</p>
              <p className="text-sm text-muted-foreground">Low stock (≤5)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <Wallet className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-bold">{pendingOrders}</p>
              <p className="text-sm text-muted-foreground">Pending orders</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10 text-green-600">
              <Wallet className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-bold">
                {formatPrice(
                  orders.filter((order) => order.status === "completed").reduce(
                    (sum, order) => sum + order.total,
                    0,
                  ),
                )}
              </p>
              <p className="text-sm text-muted-foreground">Completed revenue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-border bg-card p-1">
        {[
          { id: "products", label: "Products" },
          { id: "orders", label: "Orders" },
          ...(isSuper ? [{ id: "users", label: "Users" }] : []),
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === item.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Products tab */}
      {tab === "products" && (
        <ConditionalState
          loading={productsLoading}
          error={productsError}
          onRetry={loadProducts}
          empty={!productsLoading && products.length === 0}
          emptyTitle="No products yet"
          emptyDescription="Add your first product to start selling."
          emptyAction={
            <Button asChild variant="outline">
              <Link to="/admin/addproduct">
                <Plus /> Add Product
              </Link>
            </Button>
          }
        >
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Discount</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.productID} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-10 w-10 flex-none rounded-lg object-cover"
                        />
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{product.category ?? "—"}</td>
                    <td className="px-4 py-3">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3">
                      {product.discount > 0 ? (
                        <Badge variant="destructive">-{product.discount}%</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "font-medium",
                          product.stock <= 5 ? "text-destructive" : "text-foreground",
                        )}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/admin/editproduct/${product.productID}`}>
                            <Pencil /> Edit
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(product)}
                          aria-label={`Delete ${product.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ConditionalState>
      )}

      {/* Orders tab */}
      {tab === "orders" && (
        <>
          <div className="mb-6 flex flex-wrap gap-2">
            {ORDER_FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                  statusFilter === filter
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {filter}
              </button>
            ))}
          </div>

          <ConditionalState
            loading={ordersLoading}
            error={ordersError}
            onRetry={loadOrders}
            empty={!ordersLoading && orders.length === 0}
            emptyTitle="No orders here"
            emptyDescription={`No ${statusFilter === "all" ? "" : statusFilter + " "}orders found.`}
          >
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.orderID}>
                  <CardContent className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">
                          Order #{order.orderID} — {order.customerName}
                        </p>
                        <p className="text-sm text-muted-foreground">{order.email}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(order.createdAt + "Z").toLocaleString()} ·{" "}
                          {order.paymentMethod || "Unknown"} ·{" "}
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={STATUS_STYLE[order.status]}>{order.status}</Badge>
                        <span className="text-lg font-bold">{formatPrice(order.total)}</span>
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl bg-secondary/50 p-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between py-0.5 text-sm">
                          <span>
                            {item.name} × {item.quantity}
                          </span>
                          <span className="text-muted-foreground">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {order.status === "pending" && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleOrderStatus(order, "processing")}
                        >
                          Mark as processing
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOrderStatus(order, "completed")}
                        >
                          Mark as completed
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleOrderStatus(order, "cancelled")}
                        >
                          Cancel order
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ConditionalState>
        </>
      )}

      {/* Users tab (super admin only) */}
      {tab === "users" && (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Manage accounts, roles, and profile details.
            </p>
            <Button size="sm" onClick={() => setUserForm("new")}>
              <Plus /> Add User
            </Button>
          </div>

          <ConditionalState
            loading={usersLoading}
            error={usersError}
            empty={!usersLoading && users.length === 0}
            emptyTitle="No users yet"
            emptyDescription="Accounts created through signup will appear here."
          >
            <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Username</th>
                    <th className="px-4 py-3 font-medium">Contact</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            {(u.name || u.username || u.email).slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <p className="font-medium">{u.name || u.username || u.email}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {u.username ? (
                          <span className="font-medium">@{u.username}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {u.phone || u.address ? (
                          <div className="text-xs text-muted-foreground">
                            {u.phone && <p>{u.phone}</p>}
                            {u.address && <p className="max-w-40 truncate">{u.address}</p>}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={ROLE_STYLE[u.role] || ROLE_STYLE.user}>{u.role}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {u.id !== user.id ? (
                            <select
                              value={u.role}
                              onChange={(event) => handleRoleChange(u, event.target.value)}
                              className="rounded-lg border border-input bg-background px-2 py-1.5 text-xs capitalize outline-none focus:border-primary"
                            >
                              {ROLES.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-xs text-muted-foreground">You</span>
                          )}
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setUserForm(u)}
                            aria-label={`Edit ${u.username || u.email}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {u.id !== user.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteUser(u)}
                              aria-label={`Delete ${u.username || u.email}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
        </ConditionalState>
        </>
      )}

      <UserForm
        key={userForm === null ? "closed" : userForm === "new" ? "new-user" : `edit-${userForm.id}`}
        open={userForm !== null}
        user={userForm === "new" ? null : userForm}
        onOpenChange={(open) => {
          if (!open) setUserForm(null);
        }}
        onSaved={loadUsers}
      />
    </div>
  );
}

export default AdminDashboard;