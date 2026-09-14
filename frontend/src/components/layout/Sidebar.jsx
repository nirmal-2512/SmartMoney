
import { useEffect, useState } from "react";
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
  Sparkles,
  PanelLeftClose,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

/* ============================================================
   NAVIGATION
============================================================ */

const navSections = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Money",
    items: [
      {
        label: "Transactions",
        href: "/transactions",
        icon: ArrowLeftRight,
      },
      {
        label: "Categories",
        href: "/categories",
        icon: Tag,
      },
      {
        label: "Budgets",
        href: "/budgets",
        icon: PiggyBank,
      },
      {
        label: "Loans",
        href: "/loans",
        icon: HandCoins,
      },
      {
        label: "Import",
        href: "/imports",
        icon: Upload,
      },
    ],
  },
  {
    label: "Insights",
    items: [
      {
        label: "Reports",
        href: "/reports",
        icon: BarChart3,
      },
      {
        label: "AI Chat",
        href: "/ai/chat",
        icon: MessageSquare,
        ai: true,
      },
      {
        label: "AI Report",
        href: "/ai/report",
        icon: FileText,
        ai: true,
      },
      {
        label: "Anomalies",
        href: "/anomalies",
        icon: AlertTriangle,
        alert: true,
      },
    ],
  },
];

const accountItems = [
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
];

/* ============================================================
   SIDEBAR
============================================================ */

export default function Sidebar({ open, onClose }) {
  const location = useLocation();

  /*
   * Desktop sidebar state
   *
   * false = compact / icon-only
   * true  = expanded / full navigation
   */
  const [expanded, setExpanded] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return (
      localStorage.getItem("smartmoney-sidebar") ===
      "expanded"
    );
  });

  /* Save sidebar preference */
  useEffect(() => {
    localStorage.setItem(
      "smartmoney-sidebar",
      expanded ? "expanded" : "collapsed"
    );
  }, [expanded]);

  /* Toggle desktop sidebar */
  const toggleSidebar = () => {
    setExpanded((current) => !current);
  };

  /* Active route */
  const isActive = (href) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    return location.pathname === href;
  };

  return (
    <>
      {/* ======================================================
          MOBILE OVERLAY
      ======================================================= */}

      {open && (
        <div
          className="sidebar-overlay fixed inset-0 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ======================================================
          SIDEBAR
      ======================================================= */}

      <aside
        className={cn(
          "smart-sidebar fixed inset-y-0 left-0 z-50",
          "flex flex-col",
          "transition-[width,transform] duration-300 ease-out",
          "lg:static lg:z-auto lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
          expanded ? "w-[260px]" : "w-[72px]"
        )}
      >
        {/* ====================================================
            HEADER
        ===================================================== */}

        <div
          className={cn(
            "sidebar-header",
            expanded
              ? "sidebar-header-expanded"
              : "sidebar-header-collapsed"
          )}
        >
          {/* ==================================================
              COLLAPSED:
              LOGO ITSELF IS THE EXPAND BUTTON
          =================================================== */}

          {!expanded && (
            <button
              type="button"
              onClick={toggleSidebar}
              className="logo-expand-button"
              aria-label="Expand SmartMoney sidebar"
              title="Expand sidebar"
            >
              <div className="brand-mark">
                <img
                  src="/smartMoney_logo_purple.png"
                  alt="SmartMoney"
                />
              </div>

              <span className="expand-hint">
                <span className="expand-hint-line" />
                <span className="expand-hint-arrow">→</span>
              </span>
            </button>
          )}

          {/* ==================================================
              EXPANDED:
              LOGO + CONTRACTION BUTTON
          =================================================== */}

          {expanded && (
            <>
              <Link
                to="/dashboard"
                onClick={onClose}
                className="brand-link"
                aria-label="SmartMoney Dashboard"
              >
                <div className="brand-mark">
                  <img
                    src="/smartMoney_logo_purple.png"
                    alt="SmartMoney"
                  />
                </div>

                <div className="brand-copy">
                  <span className="brand-name">
                    SmartMoney
                  </span>

                  <span className="brand-caption">
                    Personal finance
                  </span>
                </div>
              </Link>

              {/* Desktop contraction button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="collapse-button hidden lg:flex"
                aria-label="Collapse SmartMoney sidebar"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="h-[17px] w-[17px]" />
              </Button>

              {/* Mobile close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="mobile-close lg:hidden"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* ====================================================
            NAVIGATION
        ===================================================== */}

        <ScrollArea className="sidebar-scroll">
          <nav
            className={cn(
              "sidebar-navigation",
              expanded ? "expanded-nav" : "collapsed-nav"
            )}
            aria-label="Main navigation"
          >
            {navSections.map((section) => (
              <div
                key={section.label}
                className={cn(
                  "nav-section",
                  !expanded && "nav-section-compact"
                )}
              >
                {/* Section title */}
                {expanded && (
                  <div className="section-label">
                    {section.label}
                  </div>
                )}

                {/* Small divider when collapsed */}
                {!expanded && (
                  <div className="collapsed-divider" />
                )}

                <div className="section-items">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={onClose}
                        title={!expanded ? item.label : undefined}
                        aria-current={
                          active ? "page" : undefined
                        }
                        className={cn(
                          "nav-item",
                          active && "nav-item-active",
                          !expanded && "nav-item-compact"
                        )}
                      >
                        {/* Active background */}
                        {active && (
                          <span className="active-background" />
                        )}

                        {/* Active indicator */}
                        {active && (
                          <span className="active-indicator" />
                        )}

                        {/* Icon */}
                        <span
                          className={cn(
                            "nav-icon",
                            active && "nav-icon-active"
                          )}
                        >
                          <Icon
                            className="h-[18px] w-[18px]"
                            strokeWidth={
                              active ? 2.2 : 1.8
                            }
                          />
                        </span>

                        {/* Label */}
                        {expanded && (
                          <span className="nav-label">
                            {item.label}
                          </span>
                        )}

                        {/* AI indicator */}
                        {expanded && item.ai && (
                          <span className="ai-badge">
                            <Sparkles className="h-2.5 w-2.5" />
                          </span>
                        )}

                        {/* Alert */}
                        {item.alert && (
                          <span
                            className={cn(
                              "alert-dot",
                              !expanded &&
                                "alert-dot-compact"
                            )}
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* ==================================================
                ACCOUNT
            =================================================== */}

            <div
              className={cn(
                "nav-section account-section",
                !expanded && "nav-section-compact"
              )}
            >
              {expanded && (
                <div className="section-label">
                  Account
                </div>
              )}

              {!expanded && (
                <div className="collapsed-divider" />
              )}

              <div className="section-items">
                {accountItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={onClose}
                      title={!expanded ? item.label : undefined}
                      aria-current={
                        active ? "page" : undefined
                      }
                      className={cn(
                        "nav-item",
                        active && "nav-item-active",
                        !expanded && "nav-item-compact"
                      )}
                    >
                      {active && (
                        <span className="active-background" />
                      )}

                      {active && (
                        <span className="active-indicator" />
                      )}

                      <span
                        className={cn(
                          "nav-icon",
                          active && "nav-icon-active"
                        )}
                      >
                        <Icon
                          className="h-[18px] w-[18px]"
                          strokeWidth={
                            active ? 2.2 : 1.8
                          }
                        />
                      </span>

                      {expanded && (
                        <span className="nav-label">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
        </ScrollArea>

        {/* ====================================================
            FOOTER
        ===================================================== */}

        <div
          className={cn(
            "sidebar-footer",
            !expanded && "sidebar-footer-compact"
          )}
        >
          {expanded ? (
            <div className="finance-status">
              <div className="status-icon">
                <Sparkles className="h-3.5 w-3.5" />
              </div>

              <div className="status-content">
                <span className="status-title">
                  Smart finances
                </span>

                <span className="status-text">
                  Your money, organized.
                </span>
              </div>
            </div>
          ) : (
            <div className="compact-footer-logo">
              <Sparkles className="h-[17px] w-[17px]" />
            </div>
          )}
        </div>
      </aside>

      {/* ======================================================
          STYLES
      ======================================================= */}

      <style>{`
        /* =====================================================
           SIDEBAR
        ====================================================== */

        .smart-sidebar {
          background: #111118;
          border-right: 1px solid rgba(255, 255, 255, 0.055);
          overflow: hidden;
        }

        /* =====================================================
           HEADER
        ====================================================== */

        .sidebar-header {
          position: relative;
          height: 76px;
          min-height: 76px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.055);
        }

        .sidebar-header-expanded {
          justify-content: space-between;
          padding: 0 15px;
        }

        .sidebar-header-collapsed {
          justify-content: center;
          padding: 0;
        }

        /* =====================================================
           LOGO
        ====================================================== */

        .brand-link {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          text-decoration: none;
          border-radius: 10px;
          outline: none;
        }

        .brand-link:focus-visible {
          box-shadow:
            0 0 0 2px rgba(139, 92, 246, 0.45);
        }

        .brand-mark {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          overflow: hidden;
          border-radius: 12px;
          background: #191923;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow:
            0 5px 18px rgba(0, 0, 0, 0.24);
        }

        .brand-mark img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .brand-copy {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
          white-space: nowrap;
        }

        .brand-name {
          color: #f4f4f7;
          font-size: 15px;
          line-height: 1.2;
          font-weight: 650;
          letter-spacing: -0.02em;
        }

        .brand-caption {
          color: #5f5f70;
          font-size: 9px;
          line-height: 1.2;
          font-weight: 500;
        }

        /* =====================================================
           COLLAPSED LOGO = EXPAND BUTTON
        ====================================================== */

        .logo-expand-button {
          position: relative;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: 0;
          border-radius: 13px;
          background: transparent;
          cursor: pointer;
          outline: none;
        }

        .logo-expand-button .brand-mark {
          width: 42px;
          height: 42px;
          transition:
            transform 180ms ease,
            border-color 180ms ease,
            box-shadow 180ms ease;
        }

        .logo-expand-button:hover .brand-mark {
          transform: scale(1.05);
          border-color: rgba(167, 139, 250, 0.35);
          box-shadow:
            0 6px 22px rgba(139, 92, 246, 0.16);
        }

        .logo-expand-button:active .brand-mark {
          transform: scale(0.96);
        }

        .logo-expand-button:focus-visible {
          box-shadow:
            0 0 0 2px rgba(139, 92, 246, 0.45);
        }

        /* Tiny hover arrow */
        .expand-hint {
          position: absolute;
          right: -5px;
          top: 3px;
          width: 17px;
          height: 17px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: #b9a7ff;
          background: #191923;
          border: 1px solid rgba(139, 92, 246, 0.2);
          opacity: 0;
          transform: scale(0.7);
          transition:
            opacity 160ms ease,
            transform 160ms ease;
        }

        .logo-expand-button:hover .expand-hint {
          opacity: 1;
          transform: scale(1);
        }

        .expand-hint-line {
          display: none;
        }

        .expand-hint-arrow {
          font-size: 11px;
          line-height: 1;
        }

        /* =====================================================
           COLLAPSE BUTTON
        ====================================================== */

        .collapse-button {
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          color: #6d6d7e;
          border-radius: 8px;
        }

        .collapse-button:hover {
          color: #c2b5f5;
          background: rgba(139, 92, 246, 0.08);
        }

        /* =====================================================
           MOBILE CLOSE
        ====================================================== */

        .mobile-close {
          width: 32px;
          height: 32px;
          color: #777789;
          border-radius: 8px;
        }

        .mobile-close:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.06);
        }

        /* =====================================================
           SCROLL
        ====================================================== */

        .sidebar-scroll {
          flex: 1;
          min-height: 0;
        }

        .sidebar-navigation {
          padding-top: 18px;
          padding-bottom: 18px;
        }

        .expanded-nav {
          padding-left: 12px;
          padding-right: 12px;
        }

        .collapsed-nav {
          padding-left: 10px;
          padding-right: 10px;
        }

        /* =====================================================
           SECTIONS
        ====================================================== */

        .nav-section {
          margin-bottom: 21px;
        }

        .nav-section:last-child {
          margin-bottom: 0;
        }

        .nav-section-compact {
          margin-bottom: 9px;
        }

        .section-label {
          padding: 0 10px;
          margin-bottom: 7px;
          color: #505061;
          font-size: 9px;
          line-height: 1;
          font-weight: 650;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .section-items {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .collapsed-divider {
          width: 30px;
          height: 1px;
          margin: 5px auto 10px;
          background: rgba(255, 255, 255, 0.07);
        }

        /* =====================================================
           NAV ITEM
        ====================================================== */

        .nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 11px;
          min-height: 41px;
          padding: 0 10px;
          border-radius: 9px;
          color: #777789;
          text-decoration: none;
          outline: none;
          overflow: hidden;
          transition:
            color 150ms ease,
            background 150ms ease,
            transform 150ms ease;
        }

        .nav-item:hover {
          color: #e8e8ef;
          background: rgba(255, 255, 255, 0.045);
        }

        .nav-item:active {
          transform: scale(0.985);
        }

        .nav-item:focus-visible {
          box-shadow:
            inset 0 0 0 1px rgba(139, 92, 246, 0.4);
        }

        /* =====================================================
           COLLAPSED NAV ITEM
        ====================================================== */

        .nav-item-compact {
          width: 50px;
          height: 46px;
          min-height: 46px;
          margin: 0 auto;
          padding: 0;
          justify-content: center;
          border-radius: 11px;
        }

        /* =====================================================
           ACTIVE STATE
        ====================================================== */

        .nav-item-active {
          color: #c4b5fd;
        }

        .nav-item-active:hover {
          color: #d4c9ff;
          background: transparent;
        }

        .active-background {
          position: absolute;
          inset: 0;
          border-radius: 9px;
          background:
            linear-gradient(
              90deg,
              rgba(139, 92, 246, 0.14),
              rgba(139, 92, 246, 0.055)
            );
          pointer-events: none;
        }

        .nav-item-compact .active-background {
          border-radius: 11px;
          background:
            rgba(139, 92, 246, 0.13);
        }

        .active-indicator {
          position: absolute;
          left: 0;
          top: 9px;
          bottom: 9px;
          width: 2px;
          border-radius: 0 3px 3px 0;
          background: #9b7cff;
          box-shadow:
            0 0 10px rgba(139, 92, 246, 0.35);
        }

        .nav-item-compact .active-indicator {
          left: 0;
          top: 11px;
          bottom: 11px;
        }

        /* =====================================================
           ICON
        ====================================================== */

        .nav-icon {
          position: relative;
          z-index: 1;
          width: 19px;
          height: 19px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #686878;
          transition: color 150ms ease;
        }

        .nav-item:hover .nav-icon {
          color: #aaaab9;
        }

        .nav-icon-active {
          color: #a78bfa !important;
        }

        /* =====================================================
           LABEL
        ====================================================== */

        .nav-label {
          position: relative;
          z-index: 1;
          flex: 1;
          min-width: 0;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-size: 12.5px;
          font-weight: 500;
          line-height: 1;
        }

        .nav-item-active .nav-label {
          font-weight: 600;
        }

        /* =====================================================
           AI BADGE
        ====================================================== */

        .ai-badge {
          position: relative;
          z-index: 1;
          width: 19px;
          height: 19px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 6px;
          color: #a78bfa;
          background: rgba(139, 92, 246, 0.10);
          border: 1px solid rgba(139, 92, 246, 0.14);
        }

        /* =====================================================
           ALERT
        ====================================================== */

        .alert-dot {
          position: relative;
          z-index: 1;
          width: 6px;
          height: 6px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow:
            0 0 0 3px rgba(245, 158, 11, 0.08);
        }

        .alert-dot-compact {
          position: absolute;
          right: 8px;
          top: 7px;
        }

        /* =====================================================
           FOOTER
        ====================================================== */

        .sidebar-footer {
          flex-shrink: 0;
          padding: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.055);
        }

        .sidebar-footer-compact {
          display: flex;
          justify-content: center;
          padding: 12px 0;
        }

        .finance-status {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.045);
        }

        .status-icon {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 8px;
          color: #a78bfa;
          background: rgba(139, 92, 246, 0.10);
        }

        .status-content {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .status-title {
          color: #a4a4b2;
          font-size: 10px;
          font-weight: 600;
        }

        .status-text {
          color: #555566;
          font-size: 9px;
          font-weight: 450;
        }

        .compact-footer-logo {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          color: #8171b5;
          background: rgba(139, 92, 246, 0.055);
          border: 1px solid rgba(139, 92, 246, 0.08);
        }

        /* =====================================================
           MOBILE
        ====================================================== */

        .sidebar-overlay {
          background: rgba(0, 0, 0, 0.62);
          backdrop-filter: blur(3px);
        }

        @media (max-width: 1023px) {
          /*
           * Mobile is ALWAYS full width.
           * The desktop collapse state does not affect it.
           */
          .smart-sidebar {
            width: 260px !important;
            box-shadow:
              18px 0 50px rgba(0, 0, 0, 0.35);
          }

          .sidebar-header {
            justify-content: space-between;
            padding: 0 15px;
          }

          .sidebar-header-collapsed {
            justify-content: space-between;
          }

          /*
           * On mobile the logo is a normal brand link,
           * not the expand button.
           */
          .logo-expand-button {
            display: flex;
            width: auto;
            height: auto;
            justify-content: flex-start;
          }

          .logo-expand-button .brand-mark {
            width: 42px;
            height: 42px;
          }

          .expand-hint {
            display: none;
          }

          .sidebar-navigation {
            padding-left: 12px;
            padding-right: 12px;
          }

          .nav-item {
            width: auto;
            height: auto;
            min-height: 41px;
            margin: 0;
            padding: 0 10px;
            justify-content: flex-start;
          }

          .nav-item-compact {
            width: auto;
            height: auto;
            min-height: 41px;
            margin: 0;
            padding: 0 10px;
            justify-content: flex-start;
          }

          .collapsed-divider {
            display: none;
          }

          .nav-section-compact {
            margin-bottom: 21px;
          }

          .section-label {
            display: block;
          }

          .nav-label {
            display: block;
          }

          .sidebar-footer {
            display: block;
          }

          .sidebar-footer-compact {
            display: block;
            padding: 12px;
          }

          .compact-footer-logo {
            display: none;
          }
        }

        /* =====================================================
           SMALL HEIGHT SCREENS
        ====================================================== */

        @media (max-height: 700px) {
          .sidebar-navigation {
            padding-top: 12px;
          }

          .nav-section {
            margin-bottom: 13px;
          }

          .nav-item {
            min-height: 37px;
          }

          .nav-item-compact {
            height: 40px;
            min-height: 40px;
          }
        }
      `}</style>
    </>
  );
}