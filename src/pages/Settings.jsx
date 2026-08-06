import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { toast } from "react-toastify";
import {
  Laptop,
  Moon,
  Palette,
  PartyPopper,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  Volume2,
} from "lucide-react";
import {
  themeAtom,
  accentAtom,
  ACCENTS,
  setThemeLocal,
  setAccentLocal,
} from "@/atom/theme";
import { beep, confetti, setSoundEnabled, soundEnabled } from "@/lib/fx";
import useAuth from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { key: "light", label: "Light", icon: Sun },
  { key: "dark", label: "Dark", icon: Moon },
  { key: "system", label: "System", icon: Laptop },
];

const TRAIL_TIPS = [
  "Pack your tent at the bottom of your bag so it stays dry and balances the load.",
  "The ‘leave no trace’ rule: carry out everything you carry in.",
  "Wear three thin layers instead of one heavy jacket — warmth without the bulk.",
  "Stake your tent before dark; ropes love to tangle once the sun goes down.",
  "Boil water at a rolling boil for purifying — a full minute at high altitude.",
  "Test your headlamp batteries before every trip, not after the first night.",
];

function Settings() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const isSuper = user?.role === "superadmin";
  const [theme, setTheme] = useAtom(themeAtom);
  const [accent, setAccent] = useAtom(accentAtom);
  const [soundOn, setSoundOn] = useState(soundEnabled());

  const changeTheme = (value) => {
    setTheme(value);
    setThemeLocal(value);
    beep({ freq: value === "dark" ? 660 : 380 });
  };

  const changeAccent = (value) => {
    setAccent(value);
    setAccentLocal(value);
    beep({ freq: 480 });
  };

  const showTrailTip = () => {
    const tip = TRAIL_TIPS[Math.floor(Math.random() * TRAIL_TIPS.length)];
    toast.info(`🏕️ ${tip}`);
  };

  const celebrate = () => {
    beep({ freq: 660, duration: 0.2 });
    confetti(110);
    toast.success("Here's to your next adventure! 🎉");
  };

  const resetPrefs = () => {
    setTheme("system");
    setAccent("blue");
    setSoundEnabled(true);
    setSoundOn(true);
    toast.success("Preferences reset");
    beep({ freq: 300, duration: 0.2 });
  };

  // Fun keyboard shortcuts while on the Settings page.
  useEffect(() => {
    const onKey = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key.toLowerCase() === "c") celebrate();
      if (event.key.toLowerCase() === "t") showTrailTip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Personalize your experience. Press <Badge variant="outline">C</Badge> for confetti or{" "}
          <Badge variant="outline">T</Badge> for a trail tip while you&apos;re here.
        </p>
      </div>

      {/* Theme */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-muted-foreground" /> Appearance
          </CardTitle>
          <CardDescription>Choose how Trailventure looks for you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="mb-2 text-sm font-medium">Theme</p>
            <div className="grid grid-cols-3 gap-2">
              {THEME_OPTIONS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => changeTheme(key)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 text-sm font-medium transition-colors",
                    theme === key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <p className="mb-2 text-sm font-medium">Accent Color</p>
            <div className="flex flex-wrap gap-2">
              {ACCENTS.map(({ key, label, primary }) => {
                const [h, s, l] = primary.split(" ");
                return (
                  <button
                    key={key}
                    type="button"
                    title={label}
                    aria-label={label}
                    onClick={() => changeAccent(key)}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-transform hover:scale-110",
                      accent === key ? "border-foreground" : "border-transparent",
                    )}
                    style={{ background: `hsl(${h} ${s} ${l})` }}
                  >
                    {accent === key && (
                      <span className="h-2.5 w-2.5 rounded-full bg-background" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account & access */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" /> Account &amp; Access
          </CardTitle>
          <CardDescription>Your role on this store.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-secondary/40 p-4">
            <div>
              <p className="font-semibold">
                {user?.name || user?.username || "Outdoors Enthusiast"}
                {user?.username && <span className="ml-1 text-sm font-normal text-muted-foreground">@{user.username}</span>}
              </p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Badge
              variant={isAdmin ? "default" : "secondary"}
              className={cn("px-3 py-1", isSuper && "bg-purple-500 text-white hover:bg-purple-500")}
            >
              {isSuper ? "Super Admin" : isAdmin ? "Administrator" : "Member"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {isSuper
              ? "You have full super admin access — manage users and roles, plus all admin tools."
              : isAdmin
                ? "You have full admin access — products, discounts, and orders."
                : "You don't have administrator privileges. Admin tools are hidden for members."}
          </p>
          {isAdmin && (
            <Button asChild variant="outline" size="sm">
              <Link to="/admin">Open admin hub</Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Fun & extras */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" /> Fun &amp; Extras
          </CardTitle>
          <CardDescription>Mostly harmless little interactives.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium">
                <Volume2 className="h-4 w-4 text-muted-foreground" /> Sound effects
              </p>
              <p className="text-sm text-muted-foreground">
                Play a tiny beep when you toggle preferences.
              </p>
            </div>
            <Switch
              checked={soundOn}
              onCheckedChange={(value) => {
                setSoundEnabled(value);
                setSoundOn(value);
                if (value) beep();
              }}
            />
          </div>

          <Separator />

          <div className="flex flex-wrap gap-3">
            <Button onClick={celebrate} variant="secondary">
              <PartyPopper className="h-4 w-4" /> Celebrate
            </Button>
            <Button onClick={showTrailTip} variant="outline">
              Trail tip of the moment
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Tip: the <b>Celebrate</b> button fires a confetti burst — handy after a big checkout.
          </p>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Reset preferences</p>
              <p className="text-sm text-muted-foreground">
                Restore default theme, accent, and sound.
              </p>
            </div>
            <Button onClick={resetPrefs} variant="ghost" className="text-destructive">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Settings;