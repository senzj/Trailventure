import { useNavigate } from "react-router-dom";
import { ShieldCheck, User, Settings, LogOut } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { toast } from "react-toastify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

function initials(user) {
  const source = (user?.username || user?.name || user?.email || "?").trim();
  const parts = source.split(/[\s@]+/).filter(Boolean);
  return `${(parts[0] || "")[0] || ""}${(parts[1] || "")[0] || ""}`
    .toUpperCase()
    .slice(0, 2) || "?";
}

/**
 * Signed-in user dropdown shown in the Header: Profile, Settings, Admin, Logout.
 */
function UserMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success("Successfully logged out");
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" title="Account">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials(user)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="truncate text-sm font-semibold">
            {user?.name || user?.username || "My Account"}
            {user?.username && <span className="ml-1 text-xs font-normal text-muted-foreground">@{user.username}</span>}
          </span>
          <span className="truncate text-xs font-normal text-muted-foreground">{user?.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate("/profile")}>
          <User className="h-4 w-4" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate("/settings")}>
          <Settings className="h-4 w-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate("/admin")}>
          <ShieldCheck className="h-4 w-4" /> Admin
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={handleLogout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenu;