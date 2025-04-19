import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Home, Calendar, User, List, Clock } from "lucide-react";

export default function MobileNavigation() {
  const router = useRouter();
  const currentPath = router.pathname;

  // Helper function to determine if a link is active
  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  // Navigation items
  const navItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Classes", path: "/classes", icon: List },
    { label: "Schedule", path: "/schedule", icon: Calendar },
    { label: "Bookings", path: "/bookings", icon: Clock },
    { label: "Profile", path: "/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive(item.path)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon size={24} />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Safe area padding for iOS devices */}
      <div className="h-safe-area-inset-bottom w-full bg-background" />
    </nav>
  );
}
