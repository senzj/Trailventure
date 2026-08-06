import { Link } from "react-router-dom";
import { LayoutDashboard, Plus, ShieldAlert, ShieldCheck, ShoppingBag, Users } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * /admin — shows the signed-in user's role and their admin access status.
 * Non-admins see what they're missing; admins/super admins get shortcuts.
 */
function AdminHub() {
  const { user, fetching } = useAuth();

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const isSuper = user?.role === "superadmin";

  if (fetching) {
    return (
      <div className="container max-w-3xl py-10">
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">Loading...</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your access level and admin tools.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Your Role
          </CardTitle>
          <CardDescription>Accounts on Trailventure are either members or administrators.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-secondary/40 p-4">
            <div>
              <p className="text-lg font-semibold">{user?.name || user?.username || "Outdoors Enthusiast"}</p>
              <p className="text-sm text-muted-foreground">
                {user?.username && <span>@{user.username} · </span>}
                {user?.email}
              </p>
            </div>
            <Badge
              variant={isAdmin ? "default" : "secondary"}
              className={cn("px-3 py-1 text-sm", isSuper && "bg-purple-500 text-white hover:bg-purple-500")}
            >
              {isSuper ? "Super Admin" : isAdmin ? "Administrator" : "Member"}
            </Badge>
          </div>

          {isAdmin ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <p className="text-sm text-muted-foreground">
                  You have <span className="font-semibold text-foreground">full admin access</span>.
                  You can manage products, discounts, stock, and customer orders.
                  {isSuper && (
                    <>
                      {" "}
                      As a <span className="font-semibold text-foreground">super admin</span> you can
                      also manage user accounts and roles.
                    </>
                  )}
                </p>
              </div>
              <Separator />
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <Link to="/admin/dashboard">
                    <LayoutDashboard className="h-4 w-4" /> Open Dashboard
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/admin/addproduct">
                    <Plus className="h-4 w-4" /> Add Product
                  </Link>
                </Button>
                {isSuper && (
                  <Button asChild variant="outline">
                    <Link to="/admin/dashboard?tab=users">
                      <Users className="h-4 w-4" /> Manage Users
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  <ShieldAlert className="h-5 w-5" />
                </span>
                <p className="text-sm text-muted-foreground">
                  Your account is a <span className="font-semibold text-foreground">member</span> —
                  you don&apos;t have administrator privileges on this store, so the admin tools
                  are hidden. Need access? Ask a store owner to promote your account.
                </p>
              </div>
              <Separator />
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <Link to="/search">
                    <ShoppingBag className="h-4 w-4" /> Browse the Shop
                  </Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/profile">Go to Profile</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminHub;