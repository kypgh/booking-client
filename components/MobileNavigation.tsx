import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Home, Calendar, User, List, Clock, Package } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function MobileNavigation() {
  const router = useRouter();
  const { user } = useAuth();
  const currentPath = router.pathname;
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);

  // Get brandId from user context or from the current URL
  useEffect(() => {
    // First try to get from URL params if available
    if (router.query.brandId) {
      setActiveBrandId(router.query.brandId as string);
    }
    // If not in URL, try to get from user context
    else if (user && user.brands && user.brands.length > 0) {
      const brandId =
        typeof user.brands[0] === "string"
          ? user.brands[0]
          : (user.brands[0] as any).id;
      setActiveBrandId(brandId);
    }
  }, [router.query.brandId, user]);

  // Helper function to determine if a link is active
  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  // Generate navigation links
  const getNavLinks = () => {
    return [
      { label: "Home", path: `/home/${activeBrandId}`, icon: Home },
      {
        label: "Classes",
        path: activeBrandId ? `/classes/${activeBrandId}` : "/classes",
        icon: List,
      },
      {
        label: "Schedule",
        path: activeBrandId ? `/schedule/${activeBrandId}` : "/schedule",
        icon: Calendar,
      },
      { label: "Bookings", path: "/bookings", icon: Clock },
      {
        label: "Packages",
        path: activeBrandId ? `/packages/${activeBrandId}` : "/packages",
        icon: Package,
      },
      { label: "Profile", path: "/profile", icon: User },
    ];
  };

  const navItems = getNavLinks();

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
