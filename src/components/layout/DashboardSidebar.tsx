import {
  Home,
  Package,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  FolderGit2,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const navItems = [
  {
    title: "Overview",
    href: "/",
    icon: Home,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderGit2,
  },
  {
    title: "Deployments",
    href: "/deployments",
    icon: Package,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function DashboardSidebar() {
  const location = useLocation();
  const { signOut } = useClerk();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-white transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn(
              "h-5 w-5 transition-transform duration-300",
              isCollapsed && "rotate-180"
            )}
          />
        </button>
        {!isCollapsed && (
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            SnapDeploy
          </h1>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = 
            location.pathname === item.href ||
            (item.href === "/projects" && location.pathname.startsWith("/projects"));
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors overflow-hidden",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
              title={isCollapsed ? item.title : ""}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span
                className={cn(
                  "whitespace-nowrap transition-all duration-300",
                  isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                )}
              >
                {item.title}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="border-t p-2">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 overflow-hidden"
          title={isCollapsed ? "Sign Out" : ""}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span
            className={cn(
              "whitespace-nowrap transition-all duration-300",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}
          >
            Sign Out
          </span>
        </button>
      </div>
    </div>
  );
}
