"use client";

import { useTheme } from "./ThemeProvider";
import { Moon, Sun, Laptop, Palette, Zap, Clock, Sparkles, Waves, Terminal, Sunset } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const themes = [
  {
    value: "light",
    label: "Light",
    Icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    Icon: Moon,
  },
  {
    value: "skeleton",
    label: "Skeleton",
    Icon: Palette,
  },
  {
    value: "modern",
    label: "Modern",
    Icon: Laptop,
  },
  {
    value: "retro",
    label: "Retro",
    Icon: Clock,
  },
  {
    value: "cyberpunk",
    label: "Cyberpunk",
    Icon: Zap,
  },
  {
    value: "neon",
    label: "Neon",
    Icon: Sparkles,
  },
  {
    value: "ocean",
    label: "Ocean",
    Icon: Waves,
  },
  {
    value: "matrix",
    label: "Matrix",
    Icon: Terminal,
  },
  {
    value: "sunset",
    label: "Sunset",
    Icon: Sunset,
  },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const currentTheme = themes.find((t) => t.value === theme);

  return (
    <Select value={theme} onValueChange={(value: typeof theme) => setTheme(value)}>
      <SelectTrigger className="w-[150px] h-8">
        <SelectValue placeholder="Select theme">
          <div className="flex items-center gap-2">
            {currentTheme && <currentTheme.Icon className="h-4 w-4" />}
            <span>{currentTheme?.label}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {themes.map(({ value, label, Icon }) => (
          <SelectItem key={value} value={value}>
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
