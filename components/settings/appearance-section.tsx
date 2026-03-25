"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

const themeOptions: { value: string; label: string; icon: React.ReactNode }[] =
  [
    { value: "light", label: "Light", icon: <Sun className="size-3.5" /> },
    { value: "dark", label: "Dark", icon: <Moon className="size-3.5" /> },
    {
      value: "system",
      label: "System",
      icon: <Monitor className="size-3.5" />,
    },
  ];

export function AppearanceSection() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Appearance
      </h2>
      <div className="flex items-center gap-2">
        {themeOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors ${
              theme === opt.value
                ? "border-foreground/30 bg-foreground/5 text-foreground"
                : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
