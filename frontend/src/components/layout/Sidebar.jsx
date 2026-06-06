import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tag,
  PiggyBank,
  BarChart3,
  Upload,
  MessageSquare,
  FileText,
  AlertTriangle,
  User,
  X,
  HandCoins,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Categories", href: "/categories", icon: Tag },
  { label: "Budgets", href: "/budgets", icon: PiggyBank },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Import", href: "/imports", icon: Upload },
  { label: "AI Chat", href: "/ai/chat", icon: MessageSquare },
  { label: "AI Report", href: "/ai/report", icon: FileText },
  { label: "Anomalies", href: "/anomalies", icon: AlertTriangle },
  { label: "Loans", href: "/loans", icon: HandCoins },
  { label: "Profile", href: "/profile", icon: User },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        style={{
          background: "#12121A",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-between px-5 py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              style={{
                width: 34,
                height: 34,
                background: "linear-gradient(135deg, #00C896, #4F8EF7)",
                borderRadius: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 16,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              <img
                src="./../src/img/smartMoney_logo_purple.png"
                alt="SM"
                style={{
                  width: 34,
                  height: 34,
                  background: "linear-gradient(135deg, #00C896, #4F8EF7)",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 16,
                  color: "#fff",
                  flexShrink: 0,
                }}
              />
            </div>
            <span
              style={{
                fontWeight: 700,
                fontSize: 18,
                background: "linear-gradient(135deg, #00C896, #4F8EF7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              SmartMoney
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 py-3">
          <nav className="px-3 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: active ? "rgba(0,200,150,0.1)" : "transparent",
                    color: active ? "#00C896" : "#8888A0",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.05)";
                      e.currentTarget.style.color = "#F0F0F5";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#8888A0";
                    }
                  }}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
}
