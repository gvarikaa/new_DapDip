import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

export default function ThemeToggle(): JSX.Element {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9 rounded-full" />;
  }

  const currentIcon = 
    theme === "light" ? <Sun className="h-5 w-5" /> :
    theme === "dark" ? <Moon className="h-5 w-5" /> :
    <Monitor className="h-5 w-5" />;

  return (
    <div className="relative">
      <button
        className="rounded-full p-2 hover:bg-muted"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle theme"
      >
        {currentIcon}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-lg border bg-card shadow-lg">
          <div className="p-1">
            <button
              className="flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-muted"
              onClick={() => {
                setTheme("light");
                setIsOpen(false);
              }}
            >
              <Sun className="mr-2 h-4 w-4" />
              Light
            </button>
            <button
              className="flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-muted"
              onClick={() => {
                setTheme("dark");
                setIsOpen(false);
              }}
            >
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </button>
            <button
              className="flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-muted"
              onClick={() => {
                setTheme("system");
                setIsOpen(false);
              }}
            >
              <Monitor className="mr-2 h-4 w-4" />
              System
            </button>
          </div>
        </div>
      )}
    </div>
  );
}