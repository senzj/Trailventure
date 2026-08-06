import { useState } from "react";
import { toast } from "react-toastify";
import { createUser, updateUser } from "@/api/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const ROLES = ["user", "admin", "superadmin"];

const inputClass =
  "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-60";

/**
 * Slide-over form to create or edit a user account (super admin only).
 * `user` is null when creating; pass an account object to edit it.
 */
function UserForm({ open, onOpenChange, user, onSaved }) {
  const isEdit = Boolean(user);
  const [form, setForm] = useState(() => ({
    username: user?.username ?? "",
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    address: user?.address ?? "",
    email: user?.email ?? "",
    password: "",
    role: user?.role ?? "user",
  }));
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (form.password && form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!isEdit && !form.password) {
      toast.error("A password is required for new accounts");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        username: form.username,
        name: form.name,
        phone: form.phone,
        address: form.address,
        role: form.role,
      };
      if (isEdit) {
        if (form.password) payload.password = form.password;
        await updateUser(user.id, payload);
        toast.success("User updated");
      } else {
        await createUser({ ...payload, email: form.email, password: form.password });
        toast.success("User created");
      }
      onSaved();
      onOpenChange(false);
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit User" : "Create User"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? `Update the account for ${user.email}.`
              : "Add a new account to the store."}
          </SheetDescription>
        </SheetHeader>

        <form id="user-form" onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto px-1">
          <div>
            <Label htmlFor="uf-email" className="mb-1.5 block">
              Email
            </Label>
            <Input
              id="uf-email"
              type="email"
              value={form.email}
              onChange={set("email")}
              disabled={isEdit}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="uf-username" className="mb-1.5 block">
                Username
              </Label>
              <Input
                id="uf-username"
                value={form.username}
                onChange={set("username")}
                placeholder="trail_blazer"
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="uf-name" className="mb-1.5 block">
                Full Name
              </Label>
              <Input
                id="uf-name"
                value={form.name}
                onChange={set("name")}
                placeholder="Jane Doe"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="uf-phone" className="mb-1.5 block">
                Phone
              </Label>
              <Input
                id="uf-phone"
                value={form.phone}
                onChange={set("phone")}
                placeholder="+1 (555) 000-0000"
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="uf-role" className="mb-1.5 block">
                Role
              </Label>
              <select id="uf-role" value={form.role} onChange={set("role")} className={inputClass}>
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="uf-address" className="mb-1.5 block">
              Address
            </Label>
            <Input
              id="uf-address"
              value={form.address}
              onChange={set("address")}
              placeholder="123 Summit Trail, Aspen, CO 81611"
              className={inputClass}
            />
          </div>

          <div>
            <Label htmlFor="uf-password" className="mb-1.5 block">
              Password
            </Label>
            <Input
              id="uf-password"
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder={isEdit ? "Leave blank to keep current" : "At least 8 characters"}
              className={inputClass}
            />
          </div>
        </form>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button type="submit" form="user-form" disabled={submitting}>
            {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create User"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default UserForm;