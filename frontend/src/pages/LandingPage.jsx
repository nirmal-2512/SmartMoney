import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

const ANDROID_DOWNLOAD_URL =
  "https://drive.google.com/file/d/1cLqgkEhSKKTwSqtEjEo0rNuCiGNd0Fl-/view?usp=drive_link";

export default function LandingPage() {
  const stylesheetRef = useRef(null);

  useEffect(() => {
    const existing = document.querySelector(
      'link[data-smartmoney-font="inter"]'
    );

    if (!existing) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap";
      link.dataset.smartmoneyFont = "inter";

      document.head.appendChild(link);
      stylesheetRef.current = link;
    }

    return () => {
      if (stylesheetRef.current?.parentNode) {
        stylesheetRef.current.parentNode.removeChild(
          stylesheetRef.current
        );
      }
    };
  }, []);

  const features = [
    {
      icon: "📊",
      title: "Smart Dashboard",
      description:
        "See your income, expenses and savings at a glance with simple visual insights.",
      tone: "green",
    },
    {
      icon: "💸",
      title: "Transaction Tracking",
      description:
        "Track every rupee, search transactions and organize your spending effortlessly.",
      tone: "blue",
    },
    {
      icon: "🎯",
      title: "Budget Management",
      description:
        "Set spending limits and know when you're getting close to your budget.",
      tone: "purple",
    },
    {
      icon: "🤖",
      title: "AI Financial Advisor",
      description:
        "Ask questions about your money and get personalized AI-powered financial insights.",
      tone: "pink",
    },
    {
      icon: "📥",
      title: "Bank Statement Import",
      description:
        "Upload CSV or PDF statements and let AI help organize your transactions.",
      tone: "orange",
    },
    {
      icon: "🤝",
      title: "Loans Tracker",
      description:
        "Keep track of money you've lent or borrowed with automatic interest calculations.",
      tone: "teal",
    },
    {
      icon: "📈",
      title: "Monthly AI Reports",
      description:
        "Understand your monthly financial behavior with useful AI-generated summaries.",
      tone: "green",
    },
    {
      icon: "🌍",
      title: "Multi-Currency",
      description:
        "Track spending in different currencies while keeping your finances organized.",
      tone: "blue",
    },
    {
      icon: "🔍",
      title: "Anomaly Detection",
      description:
        "Identify unusual spending, duplicates and potential budget problems early.",
      tone: "purple",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Create your account",
      description:
        "Sign up in seconds and get your SmartMoney workspace ready.",
    },
    {
      number: "02",
      title: "Add your transactions",
      description:
        "Import statements or add transactions manually. AI helps categorize them.",
    },
    {
      number: "03",
      title: "Set your budgets",
      description:
        "Create spending limits and financial goals that fit your lifestyle.",
    },
    {
      number: "04",
      title: "Understand your money",
      description:
        "Use AI insights and reports to make better financial decisions.",
    },
  ];

  return (
    <div className="sm-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #07070b;
        }

        .sm-page {
          --bg: #07070b;
          --surface: #101017;
          --surface-2: #15151e;
          --surface-3: #1b1b26;

          --text: #f7f7fb;
          --muted: #9696a9;
          --muted-2: #707082;

          --green: #00d6a0;
          --blue: #5b8cff;
          --purple: #9b6cff;
          --pink: #ee63b7;
          --orange: #f5a623;
          --teal: #14b8a6;

          min-height: 100vh;
          overflow-x: hidden;

          color: var(--text);

          background:
            radial-gradient(
              circle at 10% 5%,
              rgba(0, 214, 160, 0.08),
              transparent 28%
            ),
            radial-gradient(
              circle at 90% 18%,
              rgba(91, 140, 255, 0.08),
              transparent 30%
            ),
            var(--bg);

          font-family:
            "Inter",
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .sm-container {
          width: min(1160px, calc(100% - 40px));
          margin: 0 auto;
        }

        /* =========================================
           GLOBAL BUBBLES
        ========================================= */

        .sm-orb {
          position: absolute;
          border-radius: 999px;
          pointer-events: none;
          filter: blur(2px);
          opacity: 0.7;
        }

        .sm-orb-green {
          width: 260px;
          height: 260px;
          background: radial-gradient(
            circle,
            rgba(0, 214, 160, 0.18),
            transparent 68%
          );
        }

        .sm-orb-blue {
          width: 340px;
          height: 340px;
          background: radial-gradient(
            circle,
            rgba(91, 140, 255, 0.16),
            transparent 68%
          );
        }

        .sm-orb-purple {
          width: 300px;
          height: 300px;
          background: radial-gradient(
            circle,
            rgba(155, 108, 255, 0.13),
            transparent 68%
          );
        }

        /* =========================================
           NAVBAR
        ========================================= */

        .sm-nav-wrap {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;

          padding: 14px 16px;

          pointer-events: none;
        }

        .sm-nav {
          pointer-events: auto;

          width: min(1120px, 100%);
          margin: 0 auto;

          min-height: 64px;
          padding: 8px 10px 8px 14px;

          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;

          background: rgba(14, 14, 21, 0.82);

          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 999px;

          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);

          box-shadow:
            0 12px 40px rgba(0, 0, 0, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }

        .sm-brand {
          display: flex;
          align-items: center;
          gap: 10px;

          text-decoration: none;
          color: var(--text);

          min-width: max-content;
        }

        .sm-brand-logo {
          width: 40px;
          height: 40px;

          border-radius: 13px;
          overflow: hidden;
          flex-shrink: 0;

          box-shadow:
            0 6px 18px rgba(0, 0, 0, 0.3),
            0 0 24px rgba(0, 214, 160, 0.08);
        }

        .sm-brand-logo img {
          width: 100%;
          height: 100%;

          display: block;
          object-fit: cover;
        }

        .sm-brand-name {
          font-size: 16px;
          font-weight: 800;
          letter-spacing: -0.03em;

          background: linear-gradient(
            135deg,
            #00d6a0,
            #5b8cff,
            #9b6cff
          );

          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sm-nav-links {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sm-nav-link {
          color: var(--muted);
          text-decoration: none;

          padding: 10px 15px;
          border-radius: 999px;

          font-size: 13px;
          font-weight: 600;

          transition: 0.2s ease;
        }

        .sm-nav-link:hover {
          color: var(--text);
          background: rgba(255, 255, 255, 0.05);
        }

        .sm-nav-actions {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        /* =========================================
           BUTTONS
        ========================================= */

        .sm-btn {
          min-height: 46px;

          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          padding: 0 20px;

          border-radius: 999px;

          text-decoration: none;

          font-size: 14px;
          font-weight: 700;
          letter-spacing: -0.01em;

          cursor: pointer;
          border: 0;

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease;
        }

        .sm-btn:hover {
          transform: translateY(-2px);
        }

        .sm-btn:active {
          transform: translateY(0) scale(0.98);
        }

        .sm-btn-primary {
          color: white;

          background: linear-gradient(
            135deg,
            #00d6a0 0%,
            #32bfa8 35%,
            #5b8cff 100%
          );

          box-shadow:
            0 10px 30px rgba(0, 214, 160, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.22);
        }

        .sm-btn-primary:hover {
          box-shadow:
            0 14px 38px rgba(0, 214, 160, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.22);
        }

        .sm-btn-secondary {
          color: var(--text);

          border: 1px solid rgba(255, 255, 255, 0.09);

          background: rgba(255, 255, 255, 0.035);
        }

        .sm-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.07);
        }

        .sm-btn-small {
          min-height: 40px;
          padding: 0 17px;
          font-size: 13px;
        }

        /* =========================================
           HERO
        ========================================= */

        .sm-hero {
          position: relative;

          min-height: 900px;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 150px 20px 90px;

          overflow: hidden;
        }

        .sm-hero-grid {
          position: absolute;
          inset: 0;

          background-image:
            linear-gradient(
              rgba(255,255,255,0.025) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,0.025) 1px,
              transparent 1px
            );

          background-size: 70px 70px;

          mask-image: radial-gradient(
            ellipse at center,
            black 10%,
            transparent 72%
          );

          pointer-events: none;
        }

        .sm-hero-content {
          position: relative;
          z-index: 2;

          width: min(900px, 100%);

          text-align: center;
        }

        .sm-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;

          padding: 8px 14px;

          border-radius: 999px;

          border: 1px solid rgba(0, 214, 160, 0.18);

          background: rgba(0, 214, 160, 0.055);

          color: #67eac5;

          font-size: 12px;
          font-weight: 700;

          margin-bottom: 24px;
        }

        .sm-status-dot {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: var(--green);

          box-shadow: 0 0 14px rgba(0, 214, 160, 0.8);

          animation: sm-pulse 2s infinite;
        }

        @keyframes sm-pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }

          50% {
            opacity: 0.45;
            transform: scale(0.78);
          }
        }

        .sm-hero h1 {
          margin: 0 auto;

          max-width: 920px;

          font-size: clamp(44px, 7vw, 86px);

          line-height: 0.98;

          letter-spacing: -0.065em;

          font-weight: 900;
        }

        .sm-gradient-text {
          background: linear-gradient(
            135deg,
            #00e0a7 0%,
            #5b9aff 50%,
            #a477ff 100%
          );

          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sm-hero-description {
          max-width: 600px;

          margin: 28px auto 0;

          color: var(--muted);

          font-size: clamp(16px, 2vw, 19px);

          line-height: 1.7;

          letter-spacing: -0.015em;
        }

        .sm-hero-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;

          margin-top: 34px;
        }

        .sm-hero-actions .sm-btn {
          min-height: 52px;
          padding: 0 25px;
        }

        .sm-trust-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;

          margin-top: 25px;

          color: var(--muted-2);

          font-size: 12px;
          font-weight: 500;
        }

        .sm-trust-dot {
          width: 4px;
          height: 4px;

          border-radius: 50%;

          background: #444451;
        }

        /* =========================================
           FLOATING STATS
        ========================================= */

        .sm-floating-stats {
          display: flex;
          justify-content: center;
          align-items: stretch;
          flex-wrap: wrap;
          gap: 12px;

          margin: 60px auto 0;

          max-width: 720px;
        }

        .sm-stat-bubble {
          min-width: 180px;

          padding: 18px 22px;

          border-radius: 24px;

          background: rgba(18, 18, 27, 0.74);

          border: 1px solid rgba(255, 255, 255, 0.07);

          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);

          box-shadow:
            0 15px 50px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.035);
        }

        .sm-stat-number {
          font-size: 25px;

          font-weight: 900;

          letter-spacing: -0.04em;

          background: linear-gradient(
            135deg,
            #00d6a0,
            #5b8cff
          );

          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sm-stat-label {
          margin-top: 3px;

          color: var(--muted);

          font-size: 11px;
          font-weight: 500;
        }

        /* =========================================
           DASHBOARD PREVIEW
        ========================================= */

        .sm-preview-section {
          position: relative;
          padding: 10px 20px 120px;
        }

        .sm-dashboard {
          position: relative;

          width: min(1040px, 100%);

          margin: 0 auto;

          padding: 10px;

          border-radius: 34px;

          background: linear-gradient(
            145deg,
            rgba(255,255,255,0.1),
            rgba(255,255,255,0.025)
          );

          box-shadow:
            0 40px 100px rgba(0, 0, 0, 0.45),
            0 0 100px rgba(0, 214, 160, 0.05);
        }

        .sm-dashboard-inner {
          overflow: hidden;

          border-radius: 27px;

          background: #111119;

          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .sm-browser-bar {
          display: flex;
          align-items: center;
          gap: 7px;

          height: 48px;

          padding: 0 17px;

          border-bottom: 1px solid rgba(255, 255, 255, 0.06);

          background: #0c0c12;
        }

        .sm-browser-dot {
          width: 8px;
          height: 8px;

          border-radius: 50%;
        }

        .sm-browser-address {
          flex: 1;

          text-align: center;

          color: #666677;

          font-size: 10px;
        }

        .sm-dashboard-layout {
          display: grid;

          grid-template-columns: 190px 1fr;

          min-height: 480px;
        }

        .sm-sidebar {
          padding: 24px 12px;

          background: #15151f;

          border-right: 1px solid rgba(255, 255, 255, 0.06);
        }

        .sm-sidebar-brand {
          display: flex;
          align-items: center;
          gap: 8px;

          margin: 0 8px 28px;

          font-size: 13px;
          font-weight: 800;
        }

        .sm-sidebar-logo {
          width: 27px;
          height: 27px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          background: linear-gradient(
            135deg,
            #00d6a0,
            #5b8cff
          );

          font-size: 11px;
          font-weight: 900;
        }

        .sm-side-item {
          display: flex;
          align-items: center;
          gap: 9px;

          padding: 10px 11px;

          margin-bottom: 5px;

          border-radius: 13px;

          color: #77778a;

          font-size: 11px;
          font-weight: 600;
        }

        .sm-side-item.active {
          color: #63e9c5;
          background: rgba(0, 214, 160, 0.09);
        }

        .sm-side-icon {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: currentColor;
        }

        .sm-dashboard-main {
          padding: 25px;

          background:
            radial-gradient(
              circle at 100% 0,
              rgba(91, 140, 255, 0.06),
              transparent 35%
            ),
            #111119;
        }

        .sm-dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          gap: 15px;

          margin-bottom: 18px;
        }

        .sm-dashboard-title {
          font-size: 20px;
          font-weight: 800;

          letter-spacing: -0.03em;
        }

        .sm-dashboard-date {
          color: #666678;
          font-size: 10px;
        }

        .sm-dashboard-cards {
          display: grid;

          grid-template-columns: repeat(3, 1fr);

          gap: 11px;
        }

        .sm-dashboard-card {
          padding: 17px;

          border-radius: 20px;

          background: #191923;

          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .sm-card-label {
          color: #767688;

          font-size: 10px;

          margin-bottom: 7px;
        }

        .sm-card-value {
          font-size: 19px;

          font-weight: 800;

          letter-spacing: -0.03em;
        }

        .sm-income {
          color: #4ce0b6;
        }

        .sm-expense {
          color: #ff7777;
        }

        .sm-saving {
          color: #70a0ff;
        }

        .sm-chart-card {
          margin-top: 12px;

          padding: 17px;

          border-radius: 20px;

          background: #191923;

          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .sm-chart-header {
          display: flex;
          justify-content: space-between;

          margin-bottom: 18px;
        }

        .sm-chart-title {
          font-size: 11px;
          font-weight: 700;
        }

        .sm-chart-period {
          color: #686879;
          font-size: 9px;
        }

        .sm-chart {
          height: 160px;

          display: flex;
          align-items: flex-end;

          gap: 9px;
        }

        .sm-bar {
          flex: 1;

          min-width: 8px;

          border-radius: 999px 999px 5px 5px;

          background: linear-gradient(
            180deg,
            #00d6a0,
            #5b8cff
          );

          opacity: 0.8;
        }

        /* =========================================
           SECTIONS
        ========================================= */

        .sm-section {
          padding: 110px 20px;
        }

        .sm-section-header {
          text-align: center;

          max-width: 680px;

          margin: 0 auto 55px;
        }

        .sm-eyebrow {
          display: inline-flex;
          align-items: center;

          padding: 7px 13px;

          border-radius: 999px;

          color: #5de2bd;

          background: rgba(0, 214, 160, 0.07);

          border: 1px solid rgba(0, 214, 160, 0.13);

          font-size: 11px;
          font-weight: 800;

          text-transform: uppercase;

          letter-spacing: 0.09em;
        }

        .sm-section-title {
          margin: 16px 0 13px;

          font-size: clamp(32px, 5vw, 54px);

          line-height: 1.05;

          letter-spacing: -0.055em;

          font-weight: 900;
        }

        .sm-section-description {
          margin: 0 auto;

          max-width: 580px;

          color: var(--muted);

          font-size: 16px;

          line-height: 1.7;
        }

        /* =========================================
           FEATURE CARDS
        ========================================= */

        .sm-feature-grid {
          display: grid;

          grid-template-columns: repeat(3, 1fr);

          gap: 15px;
        }

        .sm-feature-card {
          position: relative;

          min-height: 245px;

          padding: 27px;

          border-radius: 30px;

          background:
            radial-gradient(
              circle at 100% 0,
              rgba(255,255,255,0.035),
              transparent 35%
            ),
            #111119;

          border: 1px solid rgba(255, 255, 255, 0.065);

          overflow: hidden;

          transition:
            transform 0.25s ease,
            border-color 0.25s ease,
            box-shadow 0.25s ease;
        }

        .sm-feature-card::after {
          content: "";

          position: absolute;

          width: 150px;
          height: 150px;

          right: -75px;
          bottom: -75px;

          border-radius: 50%;

          background: var(--card-glow);

          filter: blur(30px);

          opacity: 0.12;
        }

        .sm-feature-card:hover {
          transform: translateY(-5px);

          border-color: rgba(255, 255, 255, 0.12);

          box-shadow:
            0 25px 60px rgba(0, 0, 0, 0.22);
        }

        .sm-feature-icon {
          width: 54px;
          height: 54px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 19px;

          font-size: 23px;

          background: var(--icon-bg);

          margin-bottom: 23px;

          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.06);
        }

        .sm-feature-title {
          margin: 0 0 9px;

          font-size: 17px;

          font-weight: 800;

          letter-spacing: -0.025em;
        }

        .sm-feature-description {
          margin: 0;

          color: var(--muted);

          font-size: 13px;

          line-height: 1.7;
        }

        /* =========================================
           HOW IT WORKS
        ========================================= */

        .sm-how-section {
          position: relative;

          overflow: hidden;

          background:
            radial-gradient(
              circle at 20% 50%,
              rgba(0, 214, 160, 0.05),
              transparent 30%
            ),
            #0c0c12;
        }

        .sm-step-grid {
          position: relative;

          display: grid;

          grid-template-columns: repeat(4, 1fr);

          gap: 15px;
        }

        .sm-step {
          position: relative;

          padding: 27px;

          min-height: 245px;

          border-radius: 30px;

          background: rgba(255,255,255,0.025);

          border: 1px solid rgba(255,255,255,0.06);
        }

        .sm-step-number {
          width: 55px;
          height: 55px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          color: white;

          background: linear-gradient(
            135deg,
            #00d6a0,
            #5b8cff
          );

          font-size: 15px;
          font-weight: 900;

          margin-bottom: 28px;

          box-shadow:
            0 12px 30px rgba(0, 214, 160, 0.13),
            inset 0 1px 0 rgba(255,255,255,0.25);
        }

        .sm-step h3 {
          margin: 0 0 9px;

          font-size: 16px;

          font-weight: 800;

          letter-spacing: -0.02em;
        }

        .sm-step p {
          margin: 0;

          color: var(--muted);

          font-size: 13px;

          line-height: 1.7;
        }

        /* =========================================
           CREATOR / ABOUT
        ========================================= */

        .sm-creator-section {
          position: relative;

          overflow: hidden;

          background:
            radial-gradient(
              circle at 85% 35%,
              rgba(155,108,255,0.07),
              transparent 32%
            ),
            #07070b;
        }

        .sm-creator-glass {
          position: relative;

          display: grid;

          grid-template-columns: 330px 1fr;

          gap: 45px;

          padding: 34px;

          border-radius: 34px;

          overflow: hidden;

          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,0.07),
              rgba(255,255,255,0.018)
            );

          border: 1px solid rgba(255,255,255,0.09);

          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);

          box-shadow:
            0 30px 90px rgba(0,0,0,.32),
            inset 0 1px 0 rgba(255,255,255,.06);
        }

        .sm-creator-glass::before {
          content: "";

          position: absolute;

          width: 350px;
          height: 350px;

          top: -200px;
          right: -100px;

          border-radius: 50%;

          background: rgba(155,108,255,.13);

          filter: blur(70px);

          pointer-events: none;
        }

        .sm-creator-photo-wrap {
          position: relative;

          display: flex;

          align-items: center;
          justify-content: center;

          z-index: 1;
        }

        .sm-creator-photo {
          position: relative;

          width: 270px;
          height: 270px;

          overflow: hidden;

          border-radius: 32px;

          background:
            radial-gradient(
              circle at 50% 30%,
              rgba(155,108,255,.25),
              transparent 62%
            ),
            #111119;

          border: 1px solid rgba(155,108,255,.25);

          box-shadow:
            0 25px 60px rgba(0,0,0,.35),
            inset 0 1px 0 rgba(255,255,255,.08);
        }

        .sm-creator-photo img {
          width: 100%;
          height: 100%;

          display: block;

          object-fit: cover;
        }

        .sm-photo-placeholder {
          width: 100%;
          height: 100%;

          display: flex;

          flex-direction: column;

          align-items: center;
          justify-content: center;

          color: #8074a7;

          font-size: 11px;

          text-align: center;
        }

        .sm-photo-placeholder strong {
          display: block;

          margin-top: 6px;

          color: #b6a5e9;

          font-size: 20px;
        }

        .sm-creator-content {
          position: relative;

          z-index: 1;

          display: flex;

          flex-direction: column;

          justify-content: center;
        }

        .sm-creator-label {
          color: #a78bfa;

          font-size: 10px;

          font-weight: 800;

          letter-spacing: .12em;
        }

        .sm-creator-content h3 {
          margin: 10px 0 14px;

          font-size: clamp(30px, 4vw, 46px);

          line-height: 1;

          letter-spacing: -.055em;
        }

        .sm-creator-content p {
          max-width: 650px;

          margin: 0 0 12px;

          color: var(--muted);

          font-size: 14px;

          line-height: 1.8;
        }

        .sm-contact-label {
          margin-top: 15px;
          margin-bottom: 12px;

          color: #e5e5ec;

          font-size: 12px;

          font-weight: 700;
        }

        .sm-contact-grid {
          display: grid;

          grid-template-columns: repeat(2, minmax(0, 1fr));

          gap: 10px;
        }

        .sm-contact-item {
          min-height: 52px;

          display: flex;

          align-items: center;

          gap: 10px;

          padding: 0 13px;

          border-radius: 14px;

          border: 1px solid rgba(255,255,255,.08);

          background: rgba(255,255,255,.035);

          color: #e7e7ed;

          text-decoration: none;

          font-size: 12px;

          font-weight: 650;

          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);

          transition:
            transform .2s ease,
            background .2s ease,
            border-color .2s ease;
        }

        .sm-contact-item:hover {
          transform: translateY(-2px);

          border-color: rgba(155,108,255,.35);

          background: rgba(155,108,255,.08);
        }

        .sm-contact-icon {
          width: 31px;
          height: 31px;

          flex-shrink: 0;

          display: grid;

          place-items: center;

          border-radius: 10px;

          color: #c4b5fd;

          background: rgba(155,108,255,.12);

          font-size: 12px;

          font-weight: 900;
        }

        .sm-contact-arrow {
          margin-left: auto;

          color: #6d6d7e;
        }

        /* =========================================
           ANDROID DOWNLOAD
        ========================================= */

        .sm-android-section {
          position: relative;

          overflow: hidden;

          background:
            radial-gradient(
              circle at 10% 50%,
              rgba(91,140,255,.07),
              transparent 32%
            ),
            #0c0c12;
        }

        .sm-android-glass {
          position: relative;

          display: grid;

          grid-template-columns: 1fr 210px;

          align-items: center;

          gap: 40px;

          padding: 38px;

          border-radius: 34px;

          overflow: hidden;

          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.07),
              rgba(255,255,255,.018)
            );

          border: 1px solid rgba(255,255,255,.09);

          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);

          box-shadow:
            0 30px 90px rgba(0,0,0,.3),
            inset 0 1px 0 rgba(255,255,255,.06);
        }

        .sm-android-glass::before {
          content: "";

          position: absolute;

          width: 350px;
          height: 350px;

          top: -210px;
          right: -90px;

          border-radius: 50%;

          background: rgba(91,140,255,.13);

          filter: blur(75px);

          pointer-events: none;
        }

        .sm-android-content {
          position: relative;

          z-index: 1;
        }

        .sm-android-label {
          color: #7fa4ff;

          font-size: 10px;

          font-weight: 800;

          letter-spacing: .12em;
        }

        .sm-android-content h3 {
          margin: 10px 0 14px;

          font-size: clamp(32px, 5vw, 54px);

          line-height: 1;

          letter-spacing: -.06em;
        }

        .sm-android-content h3 span {
          background: linear-gradient(
            135deg,
            #5b8cff,
            #a477ff
          );

          -webkit-background-clip: text;
          background-clip: text;

          -webkit-text-fill-color: transparent;
        }

        .sm-android-content p {
          max-width: 590px;

          margin: 0;

          color: var(--muted);

          font-size: 14px;

          line-height: 1.8;
        }

        .sm-android-actions {
          display: flex;

          flex-wrap: wrap;

          gap: 9px;

          margin-top: 24px;
        }

        .sm-qr-area {
          position: relative;

          z-index: 1;

          display: flex;

          flex-direction: column;

          align-items: center;

          gap: 10px;
        }

        .sm-qr-glass {
          padding: 13px;

          border-radius: 20px;

          background: rgba(255,255,255,.93);

          box-shadow:
            0 25px 55px rgba(0,0,0,.32);
        }

        .sm-qr-glass img {
          display: block;

          width: 155px;
          height: 155px;
        }

        .sm-qr-caption {
          color: #77778a;

          font-size: 8px;

          font-weight: 800;

          letter-spacing: .13em;
        }

        /* =========================================
           CTA
        ========================================= */

        .sm-cta-section {
          padding: 120px 20px;
        }

        .sm-cta {
          position: relative;

          max-width: 900px;

          margin: 0 auto;

          padding: 80px 40px;

          text-align: center;

          border-radius: 42px;

          overflow: hidden;

          background:
            radial-gradient(
              circle at 50% 0,
              rgba(0, 214, 160, 0.15),
              transparent 42%
            ),
            linear-gradient(
              145deg,
              #14141d,
              #0e0e15
            );

          border: 1px solid rgba(255,255,255,0.08);

          box-shadow:
            0 40px 100px rgba(0,0,0,0.3),
            inset 0 1px 0 rgba(255,255,255,0.05);
        }

        .sm-cta-bubble {
          position: absolute;

          border-radius: 50%;

          pointer-events: none;

          filter: blur(1px);
        }

        .sm-cta-bubble.one {
          width: 170px;
          height: 170px;

          top: -90px;
          left: -50px;

          background: rgba(0,214,160,0.09);
        }

        .sm-cta-bubble.two {
          width: 230px;
          height: 230px;

          bottom: -140px;
          right: -80px;

          background: rgba(91,140,255,0.09);
        }

        .sm-cta h2 {
          position: relative;
          z-index: 1;

          max-width: 680px;

          margin: 0 auto;

          font-size: clamp(34px, 5vw, 58px);

          line-height: 1.02;

          letter-spacing: -0.055em;

          font-weight: 900;
        }

        .sm-cta p {
          position: relative;
          z-index: 1;

          max-width: 510px;

          margin: 20px auto 28px;

          color: var(--muted);

          font-size: 15px;

          line-height: 1.7;
        }

        .sm-cta .sm-btn {
          position: relative;
          z-index: 1;

          min-height: 54px;

          padding: 0 27px;
        }

        /* =========================================
           FOOTER
        ========================================= */

        .sm-footer {
          border-top: 1px solid rgba(255,255,255,0.06);

          padding: 30px 20px 38px;
        }

        .sm-footer-inner {
          width: min(1160px, 100%);

          margin: 0 auto;

          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 20px;
        }

        .sm-footer-brand {
          display: flex;

          align-items: center;

          gap: 9px;

          font-size: 13px;

          font-weight: 800;
        }

        .sm-footer-logo {
          width: 31px;
          height: 31px;

          border-radius: 10px;

          overflow: hidden;
        }

        .sm-footer-logo img {
          width: 100%;
          height: 100%;

          object-fit: cover;
        }

        .sm-footer-links {
          display: flex;

          gap: 22px;

          flex-wrap: wrap;
        }

        .sm-footer-links a {
          color: #77778a;

          text-decoration: none;

          font-size: 12px;

          font-weight: 600;

          transition: color 0.2s ease;
        }

        .sm-footer-links a:hover {
          color: var(--text);
        }

        .sm-copyright {
          color: #5d5d6d;

          font-size: 11px;
        }

        /* =========================================
           TABLET
        ========================================= */

        @media (max-width: 950px) {
          .sm-feature-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .sm-step-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .sm-dashboard-layout {
            grid-template-columns: 165px 1fr;
          }

          .sm-creator-glass {
            grid-template-columns: 270px 1fr;
            gap: 30px;
          }
        }

        /* =========================================
           MOBILE
        ========================================= */

        @media (max-width: 700px) {
          .sm-container {
            width: min(100% - 28px, 1160px);
          }

          .sm-nav-wrap {
            padding: 10px;
          }

          .sm-nav {
            min-height: 58px;

            padding: 7px 7px 7px 9px;
          }

          .sm-brand-logo {
            width: 38px;
            height: 38px;

            border-radius: 12px;
          }

          .sm-brand-name {
            font-size: 15px;
          }

          .sm-nav-links {
            display: none;
          }

          .sm-nav-actions {
            gap: 5px;
          }

          .sm-nav-actions .sm-btn-secondary {
            display: none;
          }

          .sm-btn-small {
            min-height: 40px;

            padding: 0 15px;
          }

          .sm-hero {
            min-height: auto;

            padding: 145px 18px 75px;
          }

          .sm-hero h1 {
            font-size: clamp(43px, 13vw, 66px);

            line-height: 0.98;

            letter-spacing: -0.07em;
          }

          .sm-hero-description {
            margin-top: 22px;

            font-size: 15px;

            line-height: 1.65;
          }

          .sm-hero-actions {
            width: 100%;

            margin-top: 27px;

            flex-direction: column;

            gap: 9px;
          }

          .sm-hero-actions .sm-btn {
            width: min(100%, 360px);

            min-height: 52px;
          }

          .sm-trust-row {
            gap: 8px;

            flex-wrap: wrap;

            line-height: 1.5;
          }

          .sm-floating-stats {
            display: grid;

            grid-template-columns: repeat(3, 1fr);

            gap: 7px;

            width: 100%;

            margin-top: 42px;
          }

          .sm-stat-bubble {
            min-width: 0;

            padding: 14px 8px;

            border-radius: 19px;
          }

          .sm-stat-number {
            font-size: 19px;
          }

          .sm-stat-label {
            font-size: 9px;
          }

          .sm-preview-section {
            padding: 5px 10px 80px;
          }

          .sm-dashboard {
            padding: 6px;

            border-radius: 27px;
          }

          .sm-dashboard-inner {
            border-radius: 22px;
          }

          .sm-browser-bar {
            height: 38px;

            padding: 0 12px;
          }

          .sm-browser-dot {
            width: 6px;
            height: 6px;
          }

          .sm-browser-address {
            font-size: 8px;
          }

          .sm-dashboard-layout {
            display: block;

            min-height: 0;
          }

          .sm-sidebar {
            display: none;
          }

          .sm-dashboard-main {
            padding: 17px 13px 18px;
          }

          .sm-dashboard-header {
            margin-bottom: 12px;
          }

          .sm-dashboard-title {
            font-size: 17px;
          }

          .sm-dashboard-date {
            font-size: 8px;
          }

          .sm-dashboard-cards {
            grid-template-columns: 1fr;

            gap: 7px;
          }

          .sm-dashboard-card {
            padding: 12px 14px;

            border-radius: 15px;
          }

          .sm-card-label {
            font-size: 9px;

            margin-bottom: 4px;
          }

          .sm-card-value {
            font-size: 17px;
          }

          .sm-chart-card {
            padding: 13px;

            border-radius: 15px;
          }

          .sm-chart {
            height: 105px;

            gap: 6px;
          }

          .sm-section {
            padding: 80px 14px;
          }

          .sm-section-header {
            margin-bottom: 38px;
          }

          .sm-section-title {
            font-size: clamp(32px, 10vw, 44px);
          }

          .sm-section-description {
            font-size: 14px;
          }

          .sm-feature-grid {
            grid-template-columns: 1fr;

            gap: 10px;
          }

          .sm-feature-card {
            min-height: auto;

            padding: 22px;

            border-radius: 25px;
          }

          .sm-feature-icon {
            width: 50px;
            height: 50px;

            margin-bottom: 18px;

            border-radius: 17px;
          }

          .sm-feature-title {
            font-size: 16px;
          }

          .sm-feature-description {
            font-size: 13px;
          }

          .sm-step-grid {
            grid-template-columns: 1fr;

            gap: 10px;
          }

          .sm-step {
            min-height: auto;

            padding: 22px;

            border-radius: 25px;
          }

          .sm-step-number {
            width: 48px;
            height: 48px;

            margin-bottom: 20px;
          }

          /* Creator */

          .sm-creator-glass {
            grid-template-columns: 1fr;

            gap: 30px;

            padding: 24px;

            border-radius: 27px;
          }

          .sm-creator-photo {
            width: 220px;
            height: 220px;
          }

          .sm-contact-grid {
            grid-template-columns: 1fr;
          }

          /* Android */

          .sm-android-glass {
            grid-template-columns: 1fr;

            gap: 30px;

            padding: 28px 22px;

            border-radius: 27px;

            text-align: center;
          }

          .sm-android-content p {
            margin-left: auto;
            margin-right: auto;
          }

          .sm-android-actions {
            justify-content: center;
          }

          .sm-android-actions .sm-btn {
            width: 100%;
          }

          .sm-qr-area {
            margin-top: 5px;
          }

          .sm-qr-glass img {
            width: 140px;
            height: 140px;
          }

          .sm-cta-section {
            padding: 80px 14px;
          }

          .sm-cta {
            padding: 58px 20px;

            border-radius: 32px;
          }

          .sm-cta p {
            font-size: 14px;
          }

          .sm-footer {
            padding: 28px 14px 35px;
          }

          .sm-footer-inner {
            flex-direction: column;

            text-align: center;
          }

          .sm-footer-links {
            justify-content: center;

            gap: 15px;
          }

          .sm-copyright {
            font-size: 10px;
          }
        }

        /* =========================================
           VERY SMALL PHONES
        ========================================= */

        @media (max-width: 380px) {
          .sm-brand-name {
            display: none;
          }

          .sm-nav {
            padding-left: 7px;
          }

          .sm-floating-stats {
            grid-template-columns: 1fr;
          }

          .sm-stat-bubble {
            padding: 12px;

            display: flex;

            align-items: center;
            justify-content: space-between;
          }

          .sm-stat-label {
            margin-top: 0;
          }

          .sm-hero h1 {
            font-size: 42px;
          }

          .sm-creator-photo {
            width: 190px;
            height: 190px;
          }
        }

        /* =========================================
           REDUCED MOTION
        ========================================= */

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* =========================================
          NAVIGATION
      ========================================= */}

      <div className="sm-nav-wrap">
        <nav className="sm-nav">
          <Link to="/" className="sm-brand">
            <div className="sm-brand-logo">
              <img
                src="/smartMoney_logo_purple.png"
                alt="SmartMoney"
              />
            </div>

            <span className="sm-brand-name">
              SmartMoney
            </span>
          </Link>

          <div className="sm-nav-links">
            <a href="#features" className="sm-nav-link">
              Features
            </a>

            <a href="#how-it-works" className="sm-nav-link">
              How it works
            </a>

            <a href="#creator" className="sm-nav-link">
              Creator
            </a>

            <a href="#android" className="sm-nav-link">
              Android
            </a>
          </div>

          <div className="sm-nav-actions">
            <Link
              to="/login"
              className="sm-btn sm-btn-secondary sm-btn-small"
            >
              Sign in
            </Link>

            <Link
              to="/register"
              className="sm-btn sm-btn-primary sm-btn-small"
            >
              Get started
            </Link>
          </div>
        </nav>
      </div>

      {/* =========================================
          HERO
      ========================================= */}

      <section className="sm-hero">
        <div className="sm-hero-grid" />

        <div
          className="sm-orb sm-orb-green"
          style={{
            top: "5%",
            left: "-100px",
          }}
        />

        <div
          className="sm-orb sm-orb-blue"
          style={{
            top: "18%",
            right: "-150px",
          }}
        />

        <div
          className="sm-orb sm-orb-purple"
          style={{
            bottom: "0",
            left: "30%",
          }}
        />

        <div className="sm-hero-content">
          <div className="sm-status-pill">
            <span className="sm-status-dot" />
            AI-powered personal finance
          </div>

          <h1>
            Your money.
            <br />

            <span className="sm-gradient-text">
              Your control.
            </span>
          </h1>

          <p className="sm-hero-description">
            Track expenses, manage budgets, understand your
            spending and get intelligent financial insights —
            all in one beautifully simple app.
          </p>

          <div className="sm-hero-actions">
            <Link
              to="/register"
              className="sm-btn sm-btn-primary"
            >
              Start for free
              <span>→</span>
            </Link>

            <a
              href="#features"
              className="sm-btn sm-btn-secondary"
            >
              Explore features
            </a>
          </div>

          <div className="sm-trust-row">
            <span>Free to use</span>

            <span className="sm-trust-dot" />

            <span>No credit card</span>

            <span className="sm-trust-dot" />

            <span>Built for India</span>
          </div>

          <div className="sm-floating-stats">
            <div className="sm-stat-bubble">
              <div className="sm-stat-number">
                100%
              </div>

              <div className="sm-stat-label">
                Free to use
              </div>
            </div>

            <div className="sm-stat-bubble">
              <div className="sm-stat-number">
                13+
              </div>

              <div className="sm-stat-label">
                Powerful features
              </div>
            </div>

            <div className="sm-stat-bubble">
              <div className="sm-stat-number">
                AI
              </div>

              <div className="sm-stat-label">
                Powered insights
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          DASHBOARD PREVIEW
      ========================================= */}

      <section className="sm-preview-section">
        <div className="sm-dashboard">
          <div className="sm-dashboard-inner">
            <div className="sm-browser-bar">
              <span
                className="sm-browser-dot"
                style={{ background: "#ff5f57" }}
              />

              <span
                className="sm-browser-dot"
                style={{ background: "#febc2e" }}
              />

              <span
                className="sm-browser-dot"
                style={{ background: "#28c840" }}
              />

              <div className="sm-browser-address">
                app.smartmoney.in
              </div>
            </div>

            <div className="sm-dashboard-layout">
              <aside className="sm-sidebar">
                <div className="sm-sidebar-brand">
                  <div className="sm-sidebar-logo">
                    S
                  </div>

                  SmartMoney
                </div>

                {[
                  "Dashboard",
                  "Transactions",
                  "Budgets",
                  "Reports",
                  "AI Chat",
                  "Loans",
                ].map((item, index) => (
                  <div
                    key={item}
                    className={`sm-side-item ${
                      index === 0 ? "active" : ""
                    }`}
                  >
                    <span className="sm-side-icon" />

                    {item}
                  </div>
                ))}
              </aside>

              <main className="sm-dashboard-main">
                <div className="sm-dashboard-header">
                  <div className="sm-dashboard-title">
                    Dashboard
                  </div>

                  <div className="sm-dashboard-date">
                    September 2026
                  </div>
                </div>

                <div className="sm-dashboard-cards">
                  <div className="sm-dashboard-card">
                    <div className="sm-card-label">
                      Total income
                    </div>

                    <div className="sm-card-value sm-income">
                      ₹65,000
                    </div>
                  </div>

                  <div className="sm-dashboard-card">
                    <div className="sm-card-label">
                      Total expenses
                    </div>

                    <div className="sm-card-value sm-expense">
                      ₹31,240
                    </div>
                  </div>

                  <div className="sm-dashboard-card">
                    <div className="sm-card-label">
                      Net savings
                    </div>

                    <div className="sm-card-value sm-saving">
                      ₹33,760
                    </div>
                  </div>
                </div>

                <div className="sm-chart-card">
                  <div className="sm-chart-header">
                    <div className="sm-chart-title">
                      Spending overview
                    </div>

                    <div className="sm-chart-period">
                      Last 7 days
                    </div>
                  </div>

                  <div className="sm-chart">
                    {[
                      55,
                      72,
                      42,
                      86,
                      62,
                      48,
                      78,
                      67,
                      90,
                      57,
                    ].map((height, index) => (
                      <div
                        key={index}
                        className="sm-bar"
                        style={{
                          height: `${height}%`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          FEATURES
      ========================================= */}

      <section id="features" className="sm-section">
        <div className="sm-container">
          <div className="sm-section-header">
            <div className="sm-eyebrow">
              Everything in one place
            </div>

            <h2 className="sm-section-title">
              Your complete money
              <br />

              <span className="sm-gradient-text">
                command center.
              </span>
            </h2>

            <p className="sm-section-description">
              SmartMoney gives you the tools to understand,
              organize and improve your finances without making
              money management complicated.
            </p>
          </div>

          <div className="sm-feature-grid">
            {features.map((feature) => {
              const toneMap = {
                green: {
                  bg: "rgba(0,214,160,0.10)",
                  glow: "#00d6a0",
                },
                blue: {
                  bg: "rgba(91,140,255,0.10)",
                  glow: "#5b8cff",
                },
                purple: {
                  bg: "rgba(155,108,255,0.10)",
                  glow: "#9b6cff",
                },
                pink: {
                  bg: "rgba(238,99,183,0.10)",
                  glow: "#ee63b7",
                },
                orange: {
                  bg: "rgba(245,166,35,0.10)",
                  glow: "#f5a623",
                },
                teal: {
                  bg: "rgba(20,184,166,0.10)",
                  glow: "#14b8a6",
                },
              };

              const tone =
                toneMap[feature.tone] || toneMap.green;

              return (
                <article
                  key={feature.title}
                  className="sm-feature-card"
                  style={{
                    "--icon-bg": tone.bg,
                    "--card-glow": tone.glow,
                  }}
                >
                  <div className="sm-feature-icon">
                    {feature.icon}
                  </div>

                  <h3 className="sm-feature-title">
                    {feature.title}
                  </h3>

                  <p className="sm-feature-description">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================
          HOW IT WORKS
      ========================================= */}

      <section
        id="how-it-works"
        className="sm-section sm-how-section"
      >
        <div className="sm-container">
          <div className="sm-section-header">
            <div className="sm-eyebrow">
              Simple by design
            </div>

            <h2 className="sm-section-title">
              From chaos to
              <br />

              <span className="sm-gradient-text">
                clarity.
              </span>
            </h2>

            <p className="sm-section-description">
              Start managing your money in minutes. No complicated
              setup and no spreadsheets.
            </p>
          </div>

          <div className="sm-step-grid">
            {steps.map((step) => (
              <article
                key={step.number}
                className="sm-step"
              >
                <div className="sm-step-number">
                  {step.number}
                </div>

                <h3>{step.title}</h3>

                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          CREATOR / ABOUT ME
      ========================================= */}

      <section
        id="creator"
        className="sm-section sm-creator-section"
      >
        <div className="sm-container">
          <div className="sm-section-header">
            <div className="sm-eyebrow">
              About the creator
            </div>

            <h2 className="sm-section-title">
              Built with a simple idea:
              <br />

              <span className="sm-gradient-text">
                make money easier.
              </span>
            </h2>

            <p className="sm-section-description">
              SmartMoney is built as a practical personal finance
              platform focused on simplicity and useful financial
              insights.
            </p>
          </div>

          <div className="sm-creator-glass">
            {/* PHOTO */}

            <div className="sm-creator-photo-wrap">
              <div className="sm-creator-photo">
                <img
                  src="/creator-photo.png"
                  alt="SmartMoney creator"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                    const fallback =
                      event.currentTarget.nextElementSibling;

                    if (fallback) {
                      fallback.style.display = "flex";
                    }
                  }}
                />

                <div
                  className="sm-photo-placeholder"
                  style={{ display: "none" }}
                >
                  <span>
                    Add your photo at
                  </span>

                  <strong>
                    public/creator-photo.png
                  </strong>
                </div>
              </div>
            </div>

            {/* CREATOR CONTENT */}

            <div className="sm-creator-content">
              <span className="sm-creator-label">
                CREATOR
              </span>

              <h3>NIRMAL PATIDAR</h3>

              <p>
                Hi! I'm the creator of SmartMoney. I built
                SmartMoney as a personal finance platform that
                brings transactions, budgets, reports, AI
                insights and financial tracking together in one
                place.
              </p>

              <p>
                The goal is simple — make managing personal
                finances easier, clearer and more useful for
                everyday life.
              </p>

              <div className="sm-contact-label">
                Connect with me
              </div>

              <div className="sm-contact-grid">
                {/* LINKEDIN */}

                <a
                  href="https://www.linkedin.com/in/nirmal2512/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm-contact-item"
                >
                  <span className="sm-contact-icon">
                    in
                  </span>

                  <span>LinkedIn</span>

                  <span className="sm-contact-arrow">
                    ↗
                  </span>
                </a>

                {/* INSTAGRAM */}

                <a
                  href="https://www.instagram.com/its.nirmal25/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm-contact-item"
                >
                  <span className="sm-contact-icon">
                    ◎
                  </span>

                  <span>Instagram</span>

                  <span className="sm-contact-arrow">
                    ↗
                  </span>
                </a>

                {/* WHATSAPP */}

                <a
                  href="https://wa.me/9165905280"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm-contact-item"
                >
                  <span className="sm-contact-icon">
                    ◉
                  </span>

                  <span>WhatsApp</span>

                  <span className="sm-contact-arrow">
                    ↗
                  </span>
                </a>

                {/* EMAIL */}

                <a
                  href="mailto:n.patidar.2512@gmail.com"
                  className="sm-contact-item"
                >
                  <span className="sm-contact-icon">
                    ✉
                  </span>

                  <span>Email</span>

                  <span className="sm-contact-arrow">
                    ↗
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          ANDROID DOWNLOAD
      ========================================= */}

      <section
        id="android"
        className="sm-section sm-android-section"
      >
        <div className="sm-container">
          <div className="sm-section-header">
            <div className="sm-eyebrow">
              Android app
            </div>

            <h2 className="sm-section-title">
              Take SmartMoney
              <br />

              <span className="sm-gradient-text">
                with you.
              </span>
            </h2>

            <p className="sm-section-description">
              Download the SmartMoney Android app and keep your
              finances accessible wherever you go.
            </p>
          </div>

          <div className="sm-android-glass">
            <div className="sm-android-content">
              <span className="sm-android-label">
                SMARTMONEY FOR ANDROID
              </span>

              <h3>
                Scan.
                <br />

                <span>Download. Manage.</span>
              </h3>

              <p>
                Scan the QR code with your phone camera to open
                the SmartMoney Android download page. You can
                also use the download button.
              </p>

              <div className="sm-android-actions">
                <a
                  href={ANDROID_DOWNLOAD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm-btn sm-btn-primary"
                >
                  Download Android App
                  <span>↗</span>
                </a>
              </div>
            </div>

            <div className="sm-qr-area">
              <a
                href={ANDROID_DOWNLOAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download SmartMoney Android app"
              >
                <div className="sm-qr-glass">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                      ANDROID_DOWNLOAD_URL
                    )}`}
                    alt="QR code to download SmartMoney Android app"
                  />
                </div>
              </a>

              <span className="sm-qr-caption">
                SCAN TO DOWNLOAD
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          CTA
      ========================================= */}

      <section className="sm-cta-section">
        <div className="sm-cta">
          <div className="sm-cta-bubble one" />

          <div className="sm-cta-bubble two" />

          <h2>
            Your future self will
            <br />

            <span className="sm-gradient-text">
              thank you.
            </span>
          </h2>

          <p>
            Start understanding your money today. SmartMoney is
            free, simple and built to help you make better
            financial decisions.
          </p>

          <Link
            to="/register"
            className="sm-btn sm-btn-primary"
          >
            Create free account
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* =========================================
          FOOTER
      ========================================= */}

      <footer className="sm-footer">
        <div className="sm-footer-inner">
          <div className="sm-footer-brand">
            <div className="sm-footer-logo">
              <img
                src="/smartMoney_logo_purple.png"
                alt="SmartMoney"
              />
            </div>

            SmartMoney
          </div>

          <div className="sm-footer-links">
            <a href="#features">
              Features
            </a>

            <a href="#how-it-works">
              How it works
            </a>

            <a href="#creator">
              Creator
            </a>

            <a href="#android">
              Android
            </a>

            <Link to="/login">
              Sign in
            </Link>

            <Link to="/register">
              Get started
            </Link>
          </div>

          <div className="sm-copyright">
            © 2026 SmartMoney
          </div>
        </div>
      </footer>
    </div>
  );
}