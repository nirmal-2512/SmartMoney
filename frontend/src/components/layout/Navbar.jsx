import { Menu, Bell, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    logout();
    navigate("/login");
  };

  return (
    <header
      className="h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30"
      style={{
        background: "rgba(10,10,15,0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        style={{ color: "#8888A0" }}
        onClick={onMenuClick}
      >
        <Menu className="w-5 h-5" />
      </Button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/anomalies")}
          style={{ color: "#8888A0" }}
        >
          <Bell className="w-5 h-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2"
              style={{ color: "#F0F0F5" }}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback
                  style={{
                    background: "linear-gradient(135deg, #00C896, #4F8EF7)",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span
                className="hidden md:block text-sm font-medium"
                style={{ color: "#F0F0F5" }}
              >
                {user?.fullName || "User"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48"
            style={{
              background: "#1A1A26",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <DropdownMenuItem
              onClick={() => navigate("/profile")}
              style={{ color: "#F0F0F5", cursor: "pointer" }}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
            <DropdownMenuItem
              onClick={handleLogout}
              style={{ color: "#FF6B6B", cursor: "pointer" }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
