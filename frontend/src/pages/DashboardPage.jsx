import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Receipt,
  Target,
  RefreshCw,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import api from "@/lib/axios";

/* =========================================================
   COLORS
========================================================= */

const COLORS = [
  "#00D6A0",
  "#5B8CFF",
  "#9B6CFF",
  "#EE63B7",
  "#F5A623",
  "#06B6D4",
  "#EF4444",
  "#10B981",
  "#F97316",
];

/* =========================================================
   HELPERS
========================================================= */

const formatCurrency = (amount, currency = "INR") => {
  const numericAmount = Number(amount || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(numericAmount);
};

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function isoWeekStart() {
  const d = new Date();

  d.setDate(d.getDate() - d.getDay());

  return d.toISOString().slice(0, 10);
}

function isoMonthStart() {
  const d = new Date();

  return `${d.getFullYear()}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}-01`;
}

function filterTransactions(transactions, period) {
  const today = isoToday();
  const weekStart = isoWeekStart();
  const monthStart = isoMonthStart();

  return transactions.filter((transaction) => {
    if (period === "day") {
      return transaction.date === today;
    }

    if (period === "week") {
      return transaction.date >= weekStart;
    }

    if (period === "month") {
      return transaction.date >= monthStart;
    }

    return true;
  });
}

function buildCategoryTotals(transactions) {
  const map = {};

  for (const transaction of transactions) {
    if (transaction.type !== "expense") continue;

    const category =
      transaction.Category?.name || "Uncategorised";

    map[category] =
      (map[category] || 0) +
      parseFloat(transaction.amount || 0);
  }

  return Object.entries(map)
    .map(([name, value]) => ({
      name,
      value: Math.round(value),
    }))
    .sort((a, b) => b.value - a.value);
}

/* =========================================================
   DATE RANGE
========================================================= */

function useDateRange() {
  const [from, setFrom] = useState(isoMonthStart());
  const [to, setTo] = useState(isoToday());

  return {
    from,
    to,
    setFrom,
    setTo,
  };
}

/* =========================================================
   TOOLTIP
========================================================= */

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="sm-chart-tooltip">
      <div className="sm-tooltip-title">
        {payload[0].name}
      </div>

      <div className="sm-tooltip-value">
        {formatCurrency(payload[0].value)}
      </div>
    </div>
  );
}

/* =========================================================
   PERIOD TAB
========================================================= */

function PeriodTab({
  value,
  current,
  onChange,
  label,
}) {
  const active = value === current;

  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`sm-period-tab ${
        active ? "active" : ""
      }`}
    >
      {label}
    </button>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function DashboardPage() {
  const [period, setPeriod] = useState("month");

  const {
    from,
    to,
    setFrom,
    setTo,
  } = useDateRange();

  /* =======================================================
     OVERALL DASHBOARD
  ======================================================= */

  const {
    data: overallData,
    isLoading: overallLoading,
  } = useQuery({
    queryKey: [
      "dashboard-overview",
      from,
      to,
    ],

    queryFn: () =>
      api
        .get(
          `/reports/dashboard?from=${from}&to=${to}`
        )
        .then((response) => response.data),
  });

  /* =======================================================
     LIFETIME SUMMARY
  ======================================================= */

  const {
    data: lifetimeData,
    isLoading: lifetimeLoading,
  } = useQuery({
    queryKey: ["lifetime-summary"],

    queryFn: () =>
      api
        .get("/reports/lifetime-summary")
        .then((response) => response.data),
  });

  /* =======================================================
     ALL TRANSACTIONS
  ======================================================= */

  const {
    data: txData,
    isLoading: txLoading,
  } = useQuery({
    queryKey: ["transactions-all"],

    queryFn: () =>
      api
        .get("/transactions?limit=500")
        .then((response) => response.data),
  });

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const allTransactions =
    txData?.transactions || [];

  const periodTransactions = useMemo(
    () =>
      filterTransactions(
        allTransactions,
        period
      ),
    [allTransactions, period]
  );

  const categoryTotals = useMemo(
    () =>
      buildCategoryTotals(
        periodTransactions
      ),
    [periodTransactions]
  );

  const periodIncome =
    periodTransactions
      .filter(
        (transaction) =>
          transaction.type === "income"
      )
      .reduce(
        (sum, transaction) =>
          sum +
          parseFloat(
            transaction.amount || 0
          ),
        0
      );

  const periodExpense =
    periodTransactions
      .filter(
        (transaction) =>
          transaction.type === "expense"
      )
      .reduce(
        (sum, transaction) =>
          sum +
          parseFloat(
            transaction.amount || 0
          ),
        0
      );

  const periodNet =
    periodIncome - periodExpense;

  const totals =
    overallData?.totals || {};

  const recentTransactions =
    overallData?.recentTransactions || [];

  const budgetStatus =
    overallData?.budgetStatus || [];

  const lifetimeIncome =
    lifetimeData?.totalIncome || 0;

  const lifetimeExpense =
    lifetimeData?.totalExpense || 0;

  const lifetimeBalance =
    lifetimeData?.currentBalance || 0;

  const periodLabel = {
    day: "Today",
    week: "This week",
    month: "This month",
  }[period];

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="sm-dashboard-page">
      <style>{`

        /* =====================================================
           BASE
        ===================================================== */

        .sm-dashboard-page {
          --sm-bg: #08080D;
          --sm-surface: #111119;
          --sm-surface-2: #15151F;
          --sm-surface-3: #1A1A25;

          --sm-text: #F7F7FB;
          --sm-muted: #9292A5;
          --sm-muted-2: #686879;

          --sm-green: #00D6A0;
          --sm-blue: #5B8CFF;
          --sm-purple: #9B6CFF;
          --sm-red: #FF7070;
          --sm-orange: #F5A623;

          width: 100%;
          min-height: 100vh;

          color: var(--sm-text);

          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          background:
            radial-gradient(
              circle at 0% 0%,
              rgba(0, 214, 160, 0.055),
              transparent 27%
            ),
            radial-gradient(
              circle at 100% 10%,
              rgba(91, 140, 255, 0.055),
              transparent 30%
            ),
            var(--sm-bg);

          overflow-x: hidden;
        }

        .sm-dashboard-content {
          width: min(
            1180px,
            calc(100% - 40px)
          );

          margin: 0 auto;

          padding:
            32px
            0
            70px;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .sm-dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;

          margin-bottom: 28px;
        }

        .sm-dashboard-heading {
          min-width: 0;
        }

        .sm-dashboard-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;

          margin-bottom: 8px;

          color: #62E7C2;

          font-size: 11px;
          font-weight: 800;

          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .sm-dashboard-eyebrow-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: var(--sm-green);

          box-shadow:
            0 0 12px
            rgba(0, 214, 160, 0.7);
        }

        .sm-dashboard-title {
          margin: 0;

          color: var(--sm-text);

          font-size: clamp(
            28px,
            4vw,
            38px
          );

          line-height: 1.05;

          font-weight: 900;

          letter-spacing: -0.055em;
        }

        .sm-dashboard-subtitle {
          margin: 8px 0 0;

          color: var(--sm-muted);

          font-size: 14px;

          line-height: 1.6;
        }

        /* =====================================================
           CARDS
        ===================================================== */

        .sm-bubble-card {
          position: relative;

          background:
            radial-gradient(
              circle at 100% 0,
              rgba(255,255,255,0.025),
              transparent 32%
            ),
            var(--sm-surface);

          border:
            1px solid
            rgba(255,255,255,0.065);

          border-radius: 30px;

          box-shadow:
            0 20px 60px
            rgba(0,0,0,0.16),

            inset 0 1px 0
            rgba(255,255,255,0.025);
        }

        .sm-section-card {
          padding: 24px;

          margin-bottom: 18px;
        }

        .sm-section-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;

          gap: 20px;

          margin-bottom: 22px;
        }

        .sm-section-label {
          margin: 0 0 5px;

          color: var(--sm-green);

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .sm-section-title {
          margin: 0;

          font-size: 19px;
          line-height: 1.2;

          font-weight: 800;

          letter-spacing: -0.025em;
        }

        .sm-section-description {
          margin: 6px 0 0;

          color: var(--sm-muted);

          font-size: 12px;
          line-height: 1.6;
        }

        /* =====================================================
           LIFETIME
        ===================================================== */

        .sm-lifetime-grid {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 12px;
        }

        .sm-money-card {
          position: relative;

          min-height: 112px;

          padding: 19px;

          display: flex;
          align-items: center;

          gap: 14px;

          overflow: hidden;

          border-radius: 23px;

          background: var(--sm-surface-2);

          border:
            1px solid
            rgba(255,255,255,0.055);
        }

        .sm-money-card::after {
          content: "";

          position: absolute;

          width: 130px;
          height: 130px;

          right: -70px;
          bottom: -70px;

          border-radius: 50%;

          background: var(--money-glow);

          filter: blur(30px);

          opacity: 0.12;

          pointer-events: none;
        }

        .sm-money-icon {
          width: 48px;
          height: 48px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 17px;

          background: var(--money-bg);
        }

        .sm-money-content {
          min-width: 0;
        }

        .sm-money-label {
          color: var(--sm-muted);

          font-size: 11px;

          margin-bottom: 5px;
        }

        .sm-money-value {
          font-size: 20px;

          line-height: 1.15;

          font-weight: 900;

          letter-spacing: -0.035em;

          word-break: break-word;
        }

        /* =====================================================
           DATE CONTROLS
        ===================================================== */

        .sm-date-controls {
          display: flex;
          align-items: center;

          gap: 8px;

          flex-wrap: wrap;
        }

        .sm-date-input-wrap {
          position: relative;
        }

        .sm-date-input {
          width: 145px;

          height: 40px;

          padding:
            0
            11px;

          color: var(--sm-text);

          background: var(--sm-surface-2);

          border:
            1px solid
            rgba(255,255,255,0.075);

          border-radius: 13px;

          outline: none;

          font-family: inherit;

          font-size: 11px;
          font-weight: 600;
        }

        .sm-date-input:focus {
          border-color:
            rgba(0,214,160,0.4);
        }

        .sm-date-separator {
          color: var(--sm-muted-2);

          font-size: 12px;
        }

        /* =====================================================
           OVERVIEW STATS
        ===================================================== */

        .sm-overview-grid {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 11px;

          margin-bottom: 25px;
        }

        .sm-overview-stat {
          padding: 17px;

          border-radius: 21px;

          background: var(--sm-surface-2);

          border:
            1px solid
            rgba(255,255,255,0.055);
        }

        .sm-overview-stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 10px;

          margin-bottom: 13px;
        }

        .sm-overview-icon {
          width: 34px;
          height: 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 12px;

          background: var(--stat-bg);
        }

        .sm-overview-label {
          color: var(--sm-muted);

          font-size: 11px;
        }

        .sm-overview-value {
          font-size: 21px;

          font-weight: 900;

          letter-spacing: -0.04em;

          word-break: break-word;
        }

        /* =====================================================
           TRANSACTIONS
        ===================================================== */

        .sm-transactions-title {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-bottom: 11px;
        }

        .sm-transactions-label {
          color: var(--sm-muted);

          font-size: 12px;

          font-weight: 700;
        }

        .sm-transaction-list {
          display: flex;

          flex-direction: column;

          gap: 7px;
        }

        .sm-transaction {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 12px;

          padding:
            11px
            12px;

          border-radius: 17px;

          background: var(--sm-surface-2);

          border:
            1px solid
            rgba(255,255,255,0.045);

          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }

        .sm-transaction:hover {
          background: var(--sm-surface-3);

          transform: translateY(-1px);
        }

        .sm-transaction-left {
          display: flex;
          align-items: center;

          gap: 11px;

          min-width: 0;
        }

        .sm-transaction-icon {
          width: 39px;
          height: 39px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 14px;

          color: white;

          font-size: 13px;
          font-weight: 900;
        }

        .sm-transaction-info {
          min-width: 0;
        }

        .sm-transaction-title {
          margin: 0;

          color: var(--sm-text);

          font-size: 12px;
          font-weight: 700;

          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sm-transaction-meta {
          margin: 3px 0 0;

          color: var(--sm-muted);

          font-size: 10px;

          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sm-transaction-amount {
          flex-shrink: 0;

          font-size: 12px;

          font-weight: 800;
        }

        /* =====================================================
           PERIOD
        ===================================================== */

        .sm-period-control {
          display: flex;

          align-items: center;

          padding: 4px;

          gap: 2px;

          flex-shrink: 0;

          border-radius: 14px;

          background: var(--sm-surface-2);

          border:
            1px solid
            rgba(255,255,255,0.055);
        }

        .sm-period-tab {
          min-height: 36px;

          padding:
            0
            13px;

          border: none;

          border-radius: 10px;

          background: transparent;

          color: var(--sm-muted);

          font-family: inherit;

          font-size: 11px;
          font-weight: 700;

          cursor: pointer;

          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .sm-period-tab.active {
          color: var(--sm-green);

          background:
            rgba(0,214,160,0.105);
        }

        .sm-period-summary {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 9px;

          margin-bottom: 25px;
        }

        .sm-period-pill {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 10px;

          padding:
            14px
            16px;

          border-radius: 17px;

          background: var(--sm-surface-2);

          border:
            1px solid
            rgba(255,255,255,0.05);
        }

        .sm-period-pill-label {
          color: var(--sm-muted);

          font-size: 11px;
        }

        .sm-period-pill-value {
          font-size: 12px;
          font-weight: 800;

          white-space: nowrap;
        }

        /* =====================================================
           CHARTS
        ===================================================== */

        .sm-charts-grid {
          display: grid;

          grid-template-columns:
            minmax(0, 1.15fr)
            minmax(0, 0.85fr);

          gap: 14px;
        }

        .sm-chart-container {
          min-width: 0;

          padding: 17px;

          border-radius: 23px;

          background: var(--sm-surface-2);

          border:
            1px solid
            rgba(255,255,255,0.05);
        }

        .sm-chart-heading {
          margin-bottom: 10px;

          color: var(--sm-muted);

          font-size: 11px;
          font-weight: 700;
        }

        .sm-chart-tooltip {
          min-width: 120px;

          padding:
            9px
            12px;

          border-radius: 13px;

          background: #20202C;

          border:
            1px solid
            rgba(255,255,255,0.09);

          box-shadow:
            0 15px 35px
            rgba(0,0,0,0.25);
        }

        .sm-tooltip-title {
          margin-bottom: 3px;

          color: var(--sm-text);

          font-size: 11px;
          font-weight: 700;
        }

        .sm-tooltip-value {
          color: var(--sm-green);

          font-size: 11px;
          font-weight: 700;
        }

        /* =====================================================
           CATEGORY LIST
        ===================================================== */

        .sm-category-list {
          display: flex;

          flex-direction: column;

          gap: 12px;

          margin-top: 18px;
        }

        .sm-category-row {
          min-width: 0;
        }

        .sm-category-top {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 12px;

          margin-bottom: 6px;
        }

        .sm-category-name {
          display: flex;
          align-items: center;

          gap: 8px;

          min-width: 0;

          color: var(--sm-text);

          font-size: 11px;
          font-weight: 600;

          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sm-category-dot {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          flex-shrink: 0;
        }

        .sm-category-right {
          display: flex;
          align-items: center;

          gap: 10px;

          flex-shrink: 0;
        }

        .sm-category-percent {
          color: var(--sm-muted);

          font-size: 10px;
        }

        .sm-category-value {
          color: var(--sm-text);

          font-size: 11px;
          font-weight: 700;
        }

        .sm-progress-track {
          width: 100%;
          height: 5px;

          overflow: hidden;

          border-radius: 999px;

          background:
            rgba(255,255,255,0.055);
        }

        .sm-progress-bar {
          height: 100%;

          border-radius: 999px;

          transition:
            width 0.5s ease;
        }

        /* =====================================================
           BUDGET
        ===================================================== */

        .sm-budget-list {
          display: grid;

          grid-template-columns:
            repeat(2, 1fr);

          gap: 11px;
        }

        .sm-budget {
          padding: 17px;

          border-radius: 21px;

          background: var(--sm-surface-2);

          border:
            1px solid
            rgba(255,255,255,0.05);
        }

        .sm-budget-top {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 10px;

          margin-bottom: 13px;
        }

        .sm-budget-name {
          color: var(--sm-text);

          font-size: 12px;
          font-weight: 700;

          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sm-budget-amount {
          color: var(--sm-muted);

          font-size: 10px;

          white-space: nowrap;
        }

        .sm-budget-progress {
          width: 100%;
          height: 7px;

          overflow: hidden;

          border-radius: 999px;

          background:
            rgba(255,255,255,0.055);

          margin-bottom: 8px;
        }

        .sm-budget-progress-bar {
          height: 100%;

          border-radius: 999px;

          transition:
            width 0.5s ease;
        }

        .sm-budget-bottom {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 10px;
        }

        .sm-budget-percent {
          color: var(--sm-muted);

          font-size: 10px;
        }

        /* =====================================================
           EMPTY STATE
        ===================================================== */

        .sm-empty {
          display: flex;

          align-items: center;
          justify-content: center;

          flex-direction: column;

          min-height: 160px;

          padding: 25px;

          text-align: center;

          color: var(--sm-muted);
        }

        .sm-empty-icon {
          width: 46px;
          height: 46px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 10px;

          border-radius: 16px;

          color: var(--sm-muted);

          background:
            rgba(255,255,255,0.045);
        }

        .sm-empty-title {
          margin: 0;

          color: var(--sm-text);

          font-size: 13px;
          font-weight: 700;
        }

        .sm-empty-description {
          margin: 5px 0 0;

          font-size: 11px;
        }

        .sm-skeleton {
          background:
            rgba(255,255,255,0.055) !important;

          border-radius: 18px !important;
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 950px) {

          .sm-dashboard-content {
            width: min(
              100% - 28px,
              1180px
            );
          }

          .sm-charts-grid {
            grid-template-columns: 1fr;
          }

          .sm-budget-list {
            grid-template-columns: 1fr;
          }

        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 700px) {

          .sm-dashboard-content {
            width: calc(100% - 24px);

            padding-top: 22px;
            padding-bottom: 50px;
          }

          .sm-dashboard-header {
            margin-bottom: 20px;
          }

          .sm-dashboard-title {
            font-size: 30px;
          }

          .sm-dashboard-subtitle {
            font-size: 13px;
          }

          .sm-bubble-card {
            border-radius: 25px;
          }

          .sm-section-card {
            padding: 17px;

            margin-bottom: 12px;
          }

          .sm-section-heading {
            flex-direction: column;

            gap: 14px;

            margin-bottom: 17px;
          }

          .sm-lifetime-grid {
            grid-template-columns: 1fr;

            gap: 8px;
          }

          .sm-money-card {
            min-height: 88px;

            padding: 14px;

            border-radius: 19px;
          }

          .sm-money-icon {
            width: 42px;
            height: 42px;

            border-radius: 14px;
          }

          .sm-money-value {
            font-size: 18px;
          }

          .sm-date-controls {
            width: 100%;
          }

          .sm-date-input-wrap {
            flex: 1;
            min-width: 0;
          }

          .sm-date-input {
            width: 100%;
            height: 42px;

            font-size: 11px;
          }

          .sm-date-separator {
            display: none;
          }

          .sm-overview-grid {
            grid-template-columns: 1fr;

            gap: 7px;

            margin-bottom: 18px;
          }

          .sm-overview-stat {
            padding: 13px;

            display: flex;
            align-items: center;

            gap: 12px;

            border-radius: 18px;
          }

          .sm-overview-stat-top {
            margin: 0;

            flex-shrink: 0;
          }

          .sm-overview-icon {
            width: 38px;
            height: 38px;
          }

          .sm-overview-stat-content {
            min-width: 0;
          }

          .sm-overview-label {
            font-size: 10px;
          }

          .sm-overview-value {
            font-size: 18px;
          }

          .sm-transaction {
            padding: 10px;

            border-radius: 15px;
          }

          .sm-transaction-icon {
            width: 36px;
            height: 36px;

            border-radius: 12px;
          }

          .sm-transaction-title {
            max-width: 150px;

            font-size: 11px;
          }

          .sm-transaction-meta {
            max-width: 150px;

            font-size: 9px;
          }

          .sm-transaction-amount {
            font-size: 11px;
          }

          .sm-period-control {
            width: 100%;
          }

          .sm-period-tab {
            flex: 1;

            padding: 0 8px;

            min-height: 39px;
          }

          .sm-period-summary {
            grid-template-columns:
              1fr 1fr;

            gap: 7px;

            margin-bottom: 15px;
          }

          .sm-period-pill:last-child {
            grid-column: 1 / -1;
          }

          .sm-period-pill {
            padding: 12px;

            border-radius: 16px;
          }

          .sm-period-pill-label {
            font-size: 10px;
          }

          .sm-period-pill-value {
            font-size: 11px;
          }

          .sm-chart-container {
            padding: 10px;

            border-radius: 19px;
          }

          .sm-chart-heading {
            padding-left: 5px;
          }

          .sm-category-list {
            gap: 10px;
          }

          .sm-category-name {
            font-size: 10px;
          }

          .sm-category-value {
            font-size: 10px;
          }

          .sm-category-percent {
            font-size: 9px;
          }

          .sm-budget {
            padding: 14px;

            border-radius: 18px;
          }

        }

        /* =====================================================
           SMALL PHONES
        ===================================================== */

        @media (max-width: 380px) {

          .sm-dashboard-content {
            width: calc(100% - 18px);
          }

          .sm-dashboard-title {
            font-size: 27px;
          }

          .sm-dashboard-subtitle {
            font-size: 12px;
          }

          .sm-money-value {
            font-size: 16px;
          }

          .sm-transaction-title,
          .sm-transaction-meta {
            max-width: 115px;
          }

          .sm-transaction-amount {
            font-size: 10px;
          }

          .sm-period-tab {
            font-size: 10px;
          }

        }

        /* =====================================================
           REDUCED MOTION
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {

          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }

        }

      `}</style>

      <main className="sm-dashboard-content">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="sm-dashboard-header">

          <div className="sm-dashboard-heading">

            <div className="sm-dashboard-eyebrow">
              <span className="sm-dashboard-eyebrow-dot" />
              Financial overview
            </div>

            <h1 className="sm-dashboard-title">
              Dashboard
            </h1>

            <p className="sm-dashboard-subtitle">
              Your complete financial picture,
              all in one place.
            </p>

          </div>

        </header>


        {/* ===================================================
            LIFETIME SUMMARY
        =================================================== */}

        <section className="sm-bubble-card sm-section-card">

          <div className="sm-section-heading">

            <div>

              <p className="sm-section-label">
                Lifetime
              </p>

              <h2 className="sm-section-title">
                Overall financial summary
              </h2>

              <p className="sm-section-description">
                Your complete financial history
                across all transactions.
              </p>

            </div>

          </div>


          <div className="sm-lifetime-grid">

            {lifetimeLoading ? (
              <>
                <Skeleton className="h-24 sm-skeleton" />
                <Skeleton className="h-24 sm-skeleton" />
                <Skeleton className="h-24 sm-skeleton" />
              </>
            ) : (
              <>

                {/* INCOME */}

                <div
                  className="sm-money-card"
                  style={{
                    "--money-bg":
                      "rgba(0,214,160,0.11)",
                    "--money-glow":
                      "#00D6A0",
                  }}
                >

                  <div className="sm-money-icon">
                    <TrendingUp
                      size={19}
                      color="#00D6A0"
                    />
                  </div>

                  <div className="sm-money-content">

                    <div className="sm-money-label">
                      Total income
                    </div>

                    <div
                      className="sm-money-value"
                      style={{
                        color: "#00D6A0",
                      }}
                    >
                      {formatCurrency(
                        lifetimeIncome
                      )}
                    </div>

                  </div>

                </div>


                {/* EXPENSE */}

                <div
                  className="sm-money-card"
                  style={{
                    "--money-bg":
                      "rgba(255,112,112,0.11)",
                    "--money-glow":
                      "#FF7070",
                  }}
                >

                  <div className="sm-money-icon">
                    <TrendingDown
                      size={19}
                      color="#FF7070"
                    />
                  </div>

                  <div className="sm-money-content">

                    <div className="sm-money-label">
                      Total expenses
                    </div>

                    <div
                      className="sm-money-value"
                      style={{
                        color: "#FF7070",
                      }}
                    >
                      {formatCurrency(
                        lifetimeExpense
                      )}
                    </div>

                  </div>

                </div>


                {/* BALANCE */}

                <div
                  className="sm-money-card"
                  style={{
                    "--money-bg":
                      "rgba(91,140,255,0.11)",
                    "--money-glow":
                      "#5B8CFF",
                  }}
                >

                  <div className="sm-money-icon">
                    <Wallet
                      size={19}
                      color="#5B8CFF"
                    />
                  </div>

                  <div className="sm-money-content">

                    <div className="sm-money-label">
                      Current balance
                    </div>

                    <div
                      className="sm-money-value"
                      style={{
                        color:
                          lifetimeBalance >= 0
                            ? "#5B8CFF"
                            : "#FF7070",
                      }}
                    >
                      {formatCurrency(
                        lifetimeBalance
                      )}
                    </div>

                  </div>

                </div>

              </>
            )}

          </div>

        </section>


        {/* ===================================================
            OVERALL OVERVIEW
        =================================================== */}

        <section className="sm-bubble-card sm-section-card">

          <div className="sm-section-heading">

            <div>

              <p
                className="sm-section-label"
                style={{
                  color: "#00D6A0",
                }}
              >
                Overview
              </p>

              <h2 className="sm-section-title">
                Spending overview
              </h2>

              <p className="sm-section-description">
                Choose a date range to understand
                your finances.
              </p>

            </div>


            {/* DATE RANGE */}

            <div className="sm-date-controls">

              <div className="sm-date-input-wrap">

                <CalendarDays
                  size={13}
                  style={{
                    position: "absolute",
                    right: 11,
                    top: 13,
                    color: "#686879",
                    pointerEvents: "none",
                  }}
                />

                <input
                  className="sm-date-input"
                  type="date"
                  value={from}
                  onChange={(event) =>
                    setFrom(
                      event.target.value
                    )
                  }
                />

              </div>

              <span className="sm-date-separator">
                to
              </span>

              <div className="sm-date-input-wrap">

                <CalendarDays
                  size={13}
                  style={{
                    position: "absolute",
                    right: 11,
                    top: 13,
                    color: "#686879",
                    pointerEvents: "none",
                  }}
                />

                <input
                  className="sm-date-input"
                  type="date"
                  value={to}
                  onChange={(event) =>
                    setTo(
                      event.target.value
                    )
                  }
                />

              </div>

            </div>

          </div>


          {/* OVERVIEW STATS */}

          <div className="sm-overview-grid">

            {overallLoading ? (
              <>
                <Skeleton className="h-24 sm-skeleton" />
                <Skeleton className="h-24 sm-skeleton" />
                <Skeleton className="h-24 sm-skeleton" />
              </>
            ) : (
              <>

                {/* INCOME */}

                <div
                  className="sm-overview-stat"
                  style={{
                    "--stat-bg":
                      "rgba(0,214,160,0.1)",
                  }}
                >

                  <div className="sm-overview-stat-top">

                    <div className="sm-overview-icon">
                      <TrendingUp
                        size={17}
                        color="#00D6A0"
                      />
                    </div>

                  </div>

                  <div className="sm-overview-stat-content">

                    <div className="sm-overview-label">
                      Total income
                    </div>

                    <div
                      className="sm-overview-value"
                      style={{
                        color: "#00D6A0",
                      }}
                    >
                      {formatCurrency(
                        totals.totalIncome || 0
                      )}
                    </div>

                  </div>

                </div>


                {/* EXPENSE */}

                <div
                  className="sm-overview-stat"
                  style={{
                    "--stat-bg":
                      "rgba(255,112,112,0.1)",
                  }}
                >

                  <div className="sm-overview-stat-top">

                    <div className="sm-overview-icon">
                      <TrendingDown
                        size={17}
                        color="#FF7070"
                      />
                    </div>

                  </div>

                  <div className="sm-overview-stat-content">

                    <div className="sm-overview-label">
                      Total expenses
                    </div>

                    <div
                      className="sm-overview-value"
                      style={{
                        color: "#FF7070",
                      }}
                    >
                      {formatCurrency(
                        totals.totalExpense || 0
                      )}
                    </div>

                  </div>

                </div>


                {/* BALANCE */}

                <div
                  className="sm-overview-stat"
                  style={{
                    "--stat-bg":
                      "rgba(91,140,255,0.1)",
                  }}
                >

                  <div className="sm-overview-stat-top">

                    <div className="sm-overview-icon">
                      <Wallet
                        size={17}
                        color="#5B8CFF"
                      />
                    </div>

                  </div>

                  <div className="sm-overview-stat-content">

                    <div className="sm-overview-label">
                      Net balance
                    </div>

                    <div
                      className="sm-overview-value"
                      style={{
                        color:
                          (totals.balance || 0) >= 0
                            ? "#5B8CFF"
                            : "#FF7070",
                      }}
                    >
                      {formatCurrency(
                        totals.balance || 0
                      )}
                    </div>

                  </div>

                </div>

              </>
            )}

          </div>


          {/* RECENT TRANSACTIONS */}

          <div>

            <div className="sm-transactions-title">

              <span className="sm-transactions-label">
                Recent transactions
              </span>

              <Receipt
                size={15}
                color="#686879"
              />

            </div>


            {overallLoading ? (

              <div className="sm-transaction-list">

                {[1, 2, 3, 4].map(
                  (item) => (
                    <Skeleton
                      key={item}
                      className="h-14 sm-skeleton"
                    />
                  )
                )}

              </div>

            ) : recentTransactions.length === 0 ? (

              <div className="sm-empty">

                <div className="sm-empty-icon">
                  <Receipt size={19} />
                </div>

                <p className="sm-empty-title">
                  No transactions yet
                </p>

                <p className="sm-empty-description">
                  There are no transactions
                  in this date range.
                </p>

              </div>

            ) : (

              <div className="sm-transaction-list">

                {recentTransactions
                  .slice(0, 5)
                  .map((transaction) => {

                    const isIncome =
                      transaction.type ===
                      "income";

                    const categoryColor =
                      transaction.Category
                        ?.color ||
                      (isIncome
                        ? "#00D6A0"
                        : "#5B8CFF");

                    return (
                      <div
                        key={transaction.id}
                        className="sm-transaction"
                      >

                        <div className="sm-transaction-left">

                          <div
                            className="sm-transaction-icon"
                            style={{
                              background:
                                categoryColor,
                            }}
                          >
                            {transaction.title
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              "T"}
                          </div>

                          <div className="sm-transaction-info">

                            <p className="sm-transaction-title">
                              {transaction.title}
                            </p>

                            <p className="sm-transaction-meta">
                              {transaction.Category
                                ?.name ||
                                "Uncategorised"}
                              {" · "}
                              {transaction.date}
                            </p>

                          </div>

                        </div>


                        <div
                          className="sm-transaction-amount"
                          style={{
                            color: isIncome
                              ? "#00D6A0"
                              : "#FF7070",
                          }}
                        >
                          {isIncome
                            ? "+"
                            : "-"}
                          {formatCurrency(
                            transaction.amount,
                            transaction.currency
                          )}
                        </div>

                      </div>
                    );

                  })}

              </div>

            )}

          </div>

        </section>


        {/* ===================================================
            PERIOD BREAKDOWN
        =================================================== */}

        <section className="sm-bubble-card sm-section-card">

          <div className="sm-section-heading">

            <div>

              <p
                className="sm-section-label"
                style={{
                  color: "#5B8CFF",
                }}
              >
                Breakdown
              </p>

              <h2 className="sm-section-title">
                Spending —{" "}
                <span
                  style={{
                    color: "#5B8CFF",
                  }}
                >
                  {periodLabel}
                </span>
              </h2>

              <p className="sm-section-description">
                See where your money is going.
              </p>

            </div>


            <div className="sm-period-control">

              <PeriodTab
                value="day"
                current={period}
                onChange={setPeriod}
                label="Day"
              />

              <PeriodTab
                value="week"
                current={period}
                onChange={setPeriod}
                label="Week"
              />

              <PeriodTab
                value="month"
                current={period}
                onChange={setPeriod}
                label="Month"
              />

            </div>

          </div>


          {/* PERIOD SUMMARY */}

          <div className="sm-period-summary">

            <div className="sm-period-pill">

              <span className="sm-period-pill-label">
                Income
              </span>

              <span
                className="sm-period-pill-value"
                style={{
                  color: "#00D6A0",
                }}
              >
                {formatCurrency(
                  periodIncome
                )}
              </span>

            </div>


            <div className="sm-period-pill">

              <span className="sm-period-pill-label">
                Expenses
              </span>

              <span
                className="sm-period-pill-value"
                style={{
                  color: "#FF7070",
                }}
              >
                {formatCurrency(
                  periodExpense
                )}
              </span>

            </div>


            <div className="sm-period-pill">

              <span className="sm-period-pill-label">
                Net
              </span>

              <span
                className="sm-period-pill-value"
                style={{
                  color:
                    periodNet >= 0
                      ? "#00D6A0"
                      : "#FF7070",
                }}
              >
                {formatCurrency(
                  periodNet
                )}
              </span>

            </div>

          </div>


          {/* PERIOD CHARTS */}

          {txLoading ? (

            <Skeleton
              className="h-64 sm-skeleton"
            />

          ) : categoryTotals.length === 0 ? (

            <div className="sm-empty">

              <div className="sm-empty-icon">
                <RefreshCw size={19} />
              </div>

              <p className="sm-empty-title">
                No expense data
              </p>

              <p className="sm-empty-description">
                No expenses were found for{" "}
                {periodLabel.toLowerCase()}.
              </p>

            </div>

          ) : (

            <>

              <div className="sm-charts-grid">

                {/* BAR CHART */}

                <div className="sm-chart-container">

                  <div className="sm-chart-heading">
                    Spending by category
                  </div>

                  <ResponsiveContainer
                    width="100%"
                    height={220}
                  >

                    <BarChart
                      data={categoryTotals.slice(
                        0,
                        7
                      )}
                      layout="vertical"
                      margin={{
                        left: 0,
                        right: 10,
                        top: 5,
                        bottom: 5,
                      }}
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.035)"
                        horizontal={false}
                      />

                      <XAxis
                        type="number"
                        tick={{
                          fill: "#77778A",
                          fontSize: 9,
                        }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) =>
                          `₹${
                            value >= 1000
                              ? (
                                  value /
                                  1000
                                ).toFixed(0) +
                                "k"
                              : value
                          }`
                        }
                      />

                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{
                          fill: "#9292A5",
                          fontSize: 9,
                        }}
                        axisLine={false}
                        tickLine={false}
                        width={75}
                      />

                      <Tooltip
                        content={
                          <CustomTooltip />
                        }
                        cursor={{
                          fill:
                            "rgba(255,255,255,0.025)",
                        }}
                      />

                      <Bar
                        dataKey="value"
                        radius={[
                          0,
                          7,
                          7,
                          0,
                        ]}
                      >

                        {categoryTotals
                          .slice(0, 7)
                          .map(
                            (_, index) => (
                              <Cell
                                key={index}
                                fill={
                                  COLORS[
                                    index %
                                      COLORS.length
                                  ]
                                }
                              />
                            )
                          )}

                      </Bar>

                    </BarChart>

                  </ResponsiveContainer>

                </div>


                {/* DONUT */}

                <div className="sm-chart-container">

                  <div className="sm-chart-heading">
                    Spending distribution
                  </div>

                  <ResponsiveContainer
                    width="100%"
                    height={220}
                  >

                    <PieChart>

                      <Pie
                        data={categoryTotals}
                        cx="40%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={78}
                        paddingAngle={3}
                        dataKey="value"
                      >

                        {categoryTotals.map(
                          (_, index) => (
                            <Cell
                              key={index}
                              fill={
                                COLORS[
                                  index %
                                    COLORS.length
                                ]
                              }
                            />
                          )
                        )}

                      </Pie>

                      <Tooltip
                        content={
                          <CustomTooltip />
                        }
                      />

                      <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        formatter={(value) => (
                          <span
                            style={{
                              color:
                                "#9292A5",
                              fontSize: 9,
                            }}
                          >
                            {value}
                          </span>
                        )}
                      />

                    </PieChart>

                  </ResponsiveContainer>

                </div>

              </div>


              {/* CATEGORY BREAKDOWN */}

              <div className="sm-category-list">

                {categoryTotals.map(
                  (category, index) => {

                    const percentage =
                      periodExpense > 0
                        ? Math.round(
                            (category.value /
                              periodExpense) *
                              100
                          )
                        : 0;

                    const color =
                      COLORS[
                        index %
                          COLORS.length
                      ];

                    return (
                      <div
                        key={category.name}
                        className="sm-category-row"
                      >

                        <div className="sm-category-top">

                          <div className="sm-category-name">

                            <span
                              className="sm-category-dot"
                              style={{
                                background:
                                  color,
                              }}
                            />

                            {category.name}

                          </div>

                          <div className="sm-category-right">

                            <span className="sm-category-percent">
                              {percentage}%
                            </span>

                            <span className="sm-category-value">
                              {formatCurrency(
                                category.value
                              )}
                            </span>

                          </div>

                        </div>


                        <div className="sm-progress-track">

                          <div
                            className="sm-progress-bar"
                            style={{
                              width: `${percentage}%`,
                              background:
                                color,
                            }}
                          />

                        </div>

                      </div>
                    );

                  }
                )}

              </div>

            </>

          )}

        </section>


        {/* ===================================================
            BUDGET STATUS
        =================================================== */}

        {budgetStatus.length > 0 && (

          <section className="sm-bubble-card sm-section-card">

            <div className="sm-section-heading">

              <div>

                <p
                  className="sm-section-label"
                  style={{
                    color: "#9B6CFF",
                  }}
                >
                  Budgets
                </p>

                <h2 className="sm-section-title">
                  Budget status
                </h2>

                <p className="sm-section-description">
                  Keep your spending under control.
                </p>

              </div>

              <Target
                size={19}
                color="#9B6CFF"
              />

            </div>


            <div className="sm-budget-list">

              {budgetStatus.map(
                (budget) => {

                  const percentage =
                    Number(
                      budget.percentageUsed ||
                        0
                    );

                  const progress =
                    Math.min(
                      percentage,
                      100
                    );

                  const progressColor =
                    budget.isOverrun
                      ? "#FF7070"
                      : percentage > 80
                      ? "#F5A623"
                      : "#9B6CFF";

                  return (
                    <div
                      key={budget.id}
                      className="sm-budget"
                    >

                      <div className="sm-budget-top">

                        <span className="sm-budget-name">
                          {budget.category
                            ?.name ||
                            "Unknown"}
                        </span>

                        <span className="sm-budget-amount">
                          {formatCurrency(
                            budget.spent
                          )}{" "}
                          /{" "}
                          {formatCurrency(
                            budget.amount
                          )}
                        </span>

                      </div>


                      <div className="sm-budget-progress">

                        <div
                          className="sm-budget-progress-bar"
                          style={{
                            width: `${progress}%`,
                            background:
                              progressColor,
                          }}
                        />

                      </div>


                      <div className="sm-budget-bottom">

                        <span className="sm-budget-percent">
                          {percentage}% used
                        </span>

                        {budget.isOverrun && (
                          <Badge
                            variant="destructive"
                            className="text-[10px]"
                          >
                            Overrun
                          </Badge>
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </section>

        )}

      </main>
    </div>
  );
}