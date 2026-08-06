import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAtomValue } from "jotai";
import { toast } from "react-toastify";
import { Package, Settings, ShoppingBag, User as UserIcon } from "lucide-react";
import { userAtom, handleUpdateProfile } from "@/atom/auth";
import { fetchMyOrders } from "@/api/orders";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import ConditionalState from "@/components/ui/ConditionalState";
import { formatPrice } from "@/utils/price";

const STATUS_VARIANT = {
  pending: "outline",
  processing: "secondary",
  completed: "success",
  cancelled: "destructive",
};

function initials(value) {
  const source = value?.trim() || "";
  const parts = source.split(/[\s@]+/).filter(Boolean);
  return `${(parts[0] || "")[0] || ""}${(parts[1] || "")[0] || ""}`.toUpperCase().slice(0, 2) || "?";
}

function Profile() {
  const persistedUser = useAtomValue(userAtom);

  const [username, setUsername] = useState(persistedUser?.username ?? "");
  const [name, setName] = useState(persistedUser?.name ?? "");
  const [phone, setPhone] = useState(persistedUser?.phone ?? "");
  const [address, setAddress] = useState(persistedUser?.address ?? "");
  const [saving, setSaving] = useState(false);

  const [orders, setOrders] = useState(null);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    fetchMyOrders()
      .then(setOrders)
      .catch((err) => setOrdersError(err.message || "Could not load your orders"));
  }, []);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await handleUpdateProfile({ username, name, phone, address });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const joinedDate = persistedUser?.createdAt
    ? new Date(`${persistedUser.createdAt} UTC`).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">My Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal details and review your past orders.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Account summary */}
        <Card className="h-fit lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" /> Account
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">
                {initials(persistedUser?.username || persistedUser?.name || persistedUser?.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">
                {persistedUser?.name || persistedUser?.username || "Outdoors Enthusiast"}
              </p>
              <p className="text-sm text-muted-foreground">
                {persistedUser?.username && <span className="mr-1 font-medium text-foreground">@{persistedUser.username}</span>}
                {persistedUser?.email}
              </p>
            </div>
            <Badge variant={persistedUser?.role === "admin" ? "default" : "secondary"}>
              {persistedUser?.role === "admin" ? "Administrator" : "Member"}
            </Badge>
            <Separator />
            <div className="w-full space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member since</span>
                <span className="font-medium">{joinedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Orders</span>
                <span className="font-medium">{orders?.length ?? "—"}</span>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/settings">
                <Settings className="h-4 w-4" /> Preferences & Settings
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Profile form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>Update your name and contact information.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="p-username" className="mb-1.5 block">Username</Label>
                  <Input
                    id="p-username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="3-30 letters, numbers, underscores"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Shown publicly as @yourusername.</p>
                </div>
                <div>
                  <Label htmlFor="p-name" className="mb-1.5 block">Full Name</Label>
                  <Input
                    id="p-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Jane Doe"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="p-email" className="mb-1.5 block">Email</Label>
                <Input id="p-email" value={persistedUser?.email ?? ""} disabled />
                <p className="mt-1 text-xs text-muted-foreground">Email is used to sign in and cannot be changed here.</p>
              </div>
              <div>
                <Label htmlFor="p-phone" className="mb-1.5 block">Phone</Label>
                <Input
                  id="p-phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <Label htmlFor="p-address" className="mb-1.5 block">Shipping Address</Label>
                <Input
                  id="p-address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="123 Summit Trail, Aspen, CO 81611"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Purchase history */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-muted-foreground" /> Purchase History
          </CardTitle>
          <CardDescription>Every order placed with your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <ConditionalState
            loading={orders === null && !ordersError}
            empty={!ordersError && Array.isArray(orders) && orders.length === 0}
            emptyTitle="No orders yet"
            emptyDescription="Head to the shop and pick out some gear — your purchases will show up here."
            emptyAction={
              <Button asChild>
                <Link to="/search">Browse gear</Link>
              </Button>
            }
            error={ordersError || ""}
          >
            <ul className="space-y-3">
              {orders?.map((order) => (
                <li key={order.orderID}>
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          Order #{order.orderID}
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            {new Date(`${order.createdAt} UTC`).toLocaleString()}
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.items.map((item) => `${item.quantity} × ${item.name}`).join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{formatPrice(order.total)}</span>
                      <Badge variant={STATUS_VARIANT[order.status] || "outline"}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </ConditionalState>
        </CardContent>
      </Card>
    </div>
  );
}

export default Profile;