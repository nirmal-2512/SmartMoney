import { useState } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [loggingOut, setLoggingOut] =
    useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await api.post("/auth/logout");
    } catch {
      // Continue with local logout even if the
      // server request fails.
    } finally {
      logout();
      navigate("/login");
      setLoggingOut(false);
    }
  };

  const initials =
    user?.fullName
      ?.trim()
      ?.split(/\s+/)
      ?.slice(0, 2)
      ?.map((name) => name.charAt(0))
      ?.join("")
      ?.toUpperCase() || "U";

  return (
    <>
      <style>{`
        .smart-navbar {
          position: sticky;
          top: 0;
          z-index: 30;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1rem;
          background: rgba(9, 9, 13, 0.88);
          border-bottom: 1px solid #202026;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .navbar-spacer {
          flex: 1;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .navbar-icon-button {
          position: relative;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          color: #71717a;
          transition:
            color 0.15s ease,
            background 0.15s ease;
        }

        .navbar-icon-button:hover {
          color: #d4d4d8;
          background: #17171c;
        }

        .notification-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #818cf8;
          box-shadow: 0 0 0 2px #09090d;
        }

        .profile-trigger {
          height: 42px;
          padding: 0 0.45rem 0 0.35rem;
          border-radius: 11px;
          color: #d4d4d8;
          transition: background 0.15s ease;
        }

        .profile-trigger:hover {
          background: #17171c;
        }

        .profile-avatar {
          width: 31px;
          height: 31px;
          border: 1px solid #35353d;
          background: #1b1b22;
          color: #c4b5fd;
          font-size: 0.68rem;
          font-weight: 650;
        }

        .profile-name {
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #d4d4d8;
          font-size: 0.76rem;
          font-weight: 550;
        }

        .profile-chevron {
          color: #52525b;
          transition: transform 0.15s ease;
        }

        .profile-trigger[data-state="open"] .profile-chevron {
          transform: rotate(180deg);
        }

        .profile-menu {
          width: 190px;
          padding: 0.35rem;
          border: 1px solid #292930;
          border-radius: 12px;
          background: #111116;
          box-shadow:
            0 18px 45px rgba(0, 0, 0, 0.35),
            0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .profile-menu-item {
          height: 36px;
          border-radius: 8px;
          color: #a1a1aa;
          font-size: 0.75rem;
          cursor: pointer;
        }

        .profile-menu-item:hover {
          background: #1a1a20;
          color: #e4e4e7;
        }

        .profile-menu-item.logout {
          color: #f87171;
        }

        .profile-menu-item.logout:hover {
          background: rgba(239, 68, 68, 0.07);
          color: #fca5a5;
        }

        .profile-separator {
          margin: 0.35rem 0;
          background: #242429;
        }

        @media (min-width: 1024px) {
          .smart-navbar {
            padding: 0 1.5rem;
          }
        }

        @media (max-width: 640px) {
          .smart-navbar {
            height: 58px;
            padding: 0 0.65rem;
          }

          .navbar-actions {
            gap: 0.1rem;
          }

          .profile-name,
          .profile-chevron {
            display: none;
          }

          .profile-trigger {
            width: 38px;
            height: 38px;
            padding: 0;
            justify-content: center;
          }

          .profile-avatar {
            width: 31px;
            height: 31px;
          }
        }
      `}</style>

      <header className="smart-navbar">
        {/* Mobile menu */}
        <Button
          variant="ghost"
          size="icon"
          className="navbar-icon-button lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={19} strokeWidth={1.8} />
        </Button>

        <div className="navbar-spacer" />

        <div className="navbar-actions">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="navbar-icon-button"
            onClick={() => navigate("/anomalies")}
            aria-label="View financial alerts"
          >
            <Bell size={18} strokeWidth={1.8} />

            <span className="notification-dot" />
          </Button>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="profile-trigger"
              >
                <Avatar className="profile-avatar">
                  <AvatarFallback className="profile-avatar">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <span className="profile-name">
                  {user?.fullName || "User"}
                </span>

                <ChevronDown
                  size={14}
                  strokeWidth={1.8}
                  className="profile-chevron"
                />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="profile-menu"
            >
              <DropdownMenuItem
                className="profile-menu-item"
                onClick={() =>
                  navigate("/profile")
                }
              >
                <User
                  size={15}
                  className="mr-2.5"
                  strokeWidth={1.8}
                />
                Profile
              </DropdownMenuItem>

              <DropdownMenuSeparator className="profile-separator" />

              <DropdownMenuItem
                className="profile-menu-item logout"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                <LogOut
                  size={15}
                  className="mr-2.5"
                  strokeWidth={1.8}
                />
                {loggingOut
                  ? "Logging out..."
                  : "Log out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}