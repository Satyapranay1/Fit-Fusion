import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, Sun, Dumbbell, Menu, X, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export function Navbar({ darkMode, setDarkMode }: NavbarProps) {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const navSections = [
    {
      label: "Overview",
      links: [
        { path: "/dashboard", label: "Dashboard" },
        { path: "/goals", label: "Goals" },
        { path: "/water", label: "Water" },
      ],
    },
    {
      label: "Workout",
      links: [
        { path: "/workout", label: "Workout" },
        { path: "/workout-history", label: "History" },
        { path: "/workout-builder", label: "Builder" },
        { path: "/exercises", label: "Exercises" },
      ],
    },
    {
      label: "Nutrition",
      links: [
        { path: "/diet", label: "Diet" },
        { path: "/shopping-list", label: "Shopping" },
      ],
    },
  ];

  return (
    <nav className="sticky top-0 z-50 glass shadow-md backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="gradient-primary p-2 rounded-xl shadow-glow group-hover:scale-110 transition-transform">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              FitFusion
            </span>
          </Link>

         {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 ml-auto">
            {navSections.map((section) => (
              <div
                key={section.label}
                className="relative"
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800",
                    openDropdown === section.label && "font-bold text-blue-600"
                  )}
                  onClick={() =>
                    setOpenDropdown(openDropdown === section.label ? null : section.label)
                  }
                >
                  {section.label}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      openDropdown === section.label && "rotate-180 text-blue-600"
                    )}
                  />
                </Button>

                {/* Dropdown */}
                {openDropdown === section.label && (
                  <div
                    className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-900 shadow-lg rounded-md z-50 min-w-[150px]"
                    onMouseLeave={() => setOpenDropdown(null)} // closes when moving mouse away
                  >
                    {section.links.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setOpenDropdown(null)} // closes after clicking
                      >
                        <div
                          className={cn(
                            "px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800",
                            location.pathname === item.path && "font-bold text-blue-600"
                          )}
                        >
                          {item.label}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Profile */}
            <Link to="/profile">
              <Button
                variant="ghost"
                className={cn(
                  "flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800",
                  location.pathname === "/profile" && "font-bold text-blue-600"
                )}
              >
                <User className="h-4 w-4" />
                Profile
              </Button>
            </Link>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-full hover:scale-110 transition-transform"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>


          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-md">
          <div className="flex flex-col p-4 space-y-3">
            {navSections.map((section) => (
              <div key={section.label} className="space-y-1">
                <p className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1">
                  {section.label}
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </p>
                {section.links.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "block px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800",
                      location.pathname === item.path && "font-bold text-blue-600"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}

            {/* Profile */}
            <Link
              to="/profile"
              onClick={() => setMenuOpen(false)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800",
                location.pathname === "/profile" && "font-bold text-blue-600"
              )}
            >
              <User className="h-4 w-4" />
              Profile
            </Link>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? (
                <>
                  <Sun className="h-5 w-5" /> Light Mode
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5" /> Dark Mode
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
