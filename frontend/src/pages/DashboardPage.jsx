import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  CalendarDays,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import api from "@/lib/axios";

const COLORS = ["#00C896","#4F8EF7","#8B5CF6","#EC4899","#F59E0B","#06B6D4","#EF4444","#10B981","#F97316"];

const formatCurrency = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

const card = { background: "#13131E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 };
const innerCard = { background: "#1A1A2E", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 };

// --- helpers ---
function isoToday() { return new Date().toISOString().slice(0, 10); }
function isoWeekStart() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}
function isoMonthStart() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function filterTransactions(transactions, period) {
  const today = isoToday();
  const weekStart = isoWeekStart();
  const monthStart = isoMonthStart();
  return transactions.filter((t) => {
    if (period === "day") return t.date === today;
    if (period === "week") return t.date >= weekStart;
    if (period === "month") return t.date >= monthStart;
    return true;
  });
}

function buildCategoryTotals(transactions) {
  const map = {};
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    const name = t.Category?.name || "Uncategorised";
    map[name] = (map[name] || 0) + parseFloat(t.amount || 0);
  }
  return Object.entries(map)
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value);
}

// --- mini components ---
function StatPill({ label, value, color }) {
  return (
    <div style={innerCard} className="px-4 py-3 flex items-center justify-between">
      <span className="text-sm" style={{ color: "#8888A0" }}>{label}</span>
      <span className="text-sm font-bold" style={{ color }}>{value}</span>
    </div>
  );
}

function PeriodTab({ value, current, onChange, label }) {
  const active = value === current;
  return (
    <button
      onClick={() => onChange(value)}
      style={{
        padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none",
        cursor: "pointer", transition: "all 0.15s",
        background: active ? "rgba(0,200,150,0.15)" : "transparent",
        color: active ? "#00C896" : "#8888A0",
      }}
    >
      {label}
    </button>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1A1A2E", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px" }}>
      <p style={{ color: "#F0F0F5", fontWeight: 600, marginBottom: 2 }}>{payload[0].name}</p>
      <p style={{ color: "#00C896", fontSize: 13 }}>{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

// --- date range picker state ---
function useDateRange() {
  const today = isoToday();
  const firstOfMonth = isoMonthStart();
  const [from, setFrom] = useState(firstOfMonth);
  const [to, setTo] = useState(today);
  return { from, to, setFrom, setTo };
}

export default function DashboardPage() {
  const [period, setPeriod] = useState("month");
  const { from, to, setFrom, setTo } = useDateRange();

  // overall data (uses date range)
  const { data: overallData, isLoading: overallLoading } = useQuery({
    queryKey: ["dashboard-overview", from, to],
    queryFn: () => api.get(`/reports/dashboard?from=${from}&to=${to}`).then((r) => r.data),
  });

  // all transactions for period breakdown
  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ["transactions-all"],
    queryFn: () => api.get("/transactions?limit=500").then((r) => r.data),
  });

  const allTx = txData?.transactions || [];
  const periodTx = useMemo(() => filterTransactions(allTx, period), [allTx, period]);
  const categoryTotals = useMemo(() => buildCategoryTotals(periodTx), [periodTx]);

  const periodIncome = periodTx.filter(t => t.type === "income").reduce((s, t) => s + parseFloat(t.amount), 0);
  const periodExpense = periodTx.filter(t => t.type === "expense").reduce((s, t) => s + parseFloat(t.amount), 0);

  const totals = overallData?.totals || {};
  const recentTransactions = overallData?.recentTransactions || [];
  const budgetStatus = overallData?.budgetStatus || [];

  const periodLabel = { day: "Today", week: "This week", month: "This month" }[period];

  return (
    <div className="space-y-6 pb-8" style={{ color: "#F0F0F5" }}>

      {/* ── HEADER ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#F0F0F5" }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: "#8888A0" }}>Your complete financial picture</p>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SECTION 1 — OVERALL OVERVIEW (date range)
      ══════════════════════════════════════════ */}
      <div style={card} className="p-5">
        {/* Section label + date pickers */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "#00C896" }}>
              Overview
            </p>
            <h2 className="text-base font-bold" style={{ color: "#F0F0F5" }}>Overall spending</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <CalendarDays className="w-4 h-4" style={{ color: "#8888A0" }} />
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              style={{
                background: "#1A1A2E", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8, color: "#F0F0F5", padding: "5px 10px", fontSize: 13,
              }}
            />
            <span style={{ color: "#8888A0", fontSize: 13 }}>to</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              style={{
                background: "#1A1A2E", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8, color: "#F0F0F5", padding: "5px 10px", fontSize: 13,
              }}
            />
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {overallLoading
            ? [1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" style={{ background: "#1A1A2E" }} />
              ))
            : [
                { label: "Total income", value: formatCurrency(totals.totalIncome || 0), color: "#00C896", Icon: TrendingUp, bg: "rgba(0,200,150,0.12)" },
                { label: "Total expenses", value: formatCurrency(totals.totalExpense || 0), color: "#FF6B6B", Icon: TrendingDown, bg: "rgba(255,107,107,0.12)" },
                { label: "Net balance", value: formatCurrency(totals.balance || 0), color: "#4F8EF7", Icon: Wallet, bg: "rgba(79,142,247,0.12)" },
              ].map(({ label, value, color, Icon, bg }) => (
                <div key={label} style={innerCard} className="p-4 flex items-center gap-4">
                  <div style={{ background: bg, borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon style={{ color, width: 18, height: 18 }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "#8888A0" }}>{label}</p>
                    <p className="text-lg font-bold" style={{ color }}>{value}</p>
                  </div>
                </div>
              ))}
        </div>

        {/* Recent transactions */}
        <div>
          <p className="text-sm font-semibold mb-3" style={{ color: "#8888A0" }}>Recent transactions</p>
          <div className="space-y-2">
            {overallLoading
              ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-lg" style={{ background: "#1A1A2E" }} />)
              : recentTransactions.length === 0
              ? (
                <div className="text-center py-6" style={{ color: "#8888A0" }}>
                  <Wallet className="w-7 h-7 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No transactions in this range</p>
                </div>
              )
              : recentTransactions.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={innerCard}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: t.Category?.color || "#4F8EF7" }}>
                      {t.title.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "#F0F0F5" }}>{t.title}</p>
                      <p className="text-xs" style={{ color: "#8888A0" }}>{t.Category?.name || "Uncategorised"} · {t.date}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: t.type === "income" ? "#00C896" : "#FF6B6B" }}>
                    {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount, t.currency)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SECTION 2 — PERIOD BREAKDOWN (day/week/month)
      ══════════════════════════════════════════ */}
      <div style={card} className="p-5">
        {/* Label + period tabs */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "#4F8EF7" }}>
              Breakdown
            </p>
            <h2 className="text-base font-bold" style={{ color: "#F0F0F5" }}>
              Spending — <span style={{ color: "#4F8EF7" }}>{periodLabel}</span>
            </h2>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "#1A1A2E" }}>
            <PeriodTab value="day" current={period} onChange={setPeriod} label="Day" />
            <PeriodTab value="week" current={period} onChange={setPeriod} label="Week" />
            <PeriodTab value="month" current={period} onChange={setPeriod} label="Month" />
          </div>
        </div>

        {/* Period summary pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          <StatPill label="Income" value={formatCurrency(periodIncome)} color="#00C896" />
          <StatPill label="Expenses" value={formatCurrency(periodExpense)} color="#FF6B6B" />
          <StatPill label="Net" value={formatCurrency(periodIncome - periodExpense)}
            color={periodIncome - periodExpense >= 0 ? "#00C896" : "#FF6B6B"} />
        </div>

        {txLoading ? (
          <Skeleton className="h-56 rounded-xl" style={{ background: "#1A1A2E" }} />
        ) : categoryTotals.length === 0 ? (
          <div className="text-center py-10" style={{ color: "#8888A0" }}>
            <RefreshCw className="w-7 h-7 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No expense data for {periodLabel.toLowerCase()}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar chart */}
            <div>
              <p className="text-xs font-semibold mb-3" style={{ color: "#8888A0" }}>By category</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryTotals.slice(0, 7)} layout="vertical" margin={{ left: 0, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#8888A0", fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#8888A0", fontSize: 11 }} axisLine={false}
                    tickLine={false} width={90} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {categoryTotals.slice(0, 7).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Donut + legend */}
            <div>
              <p className="text-xs font-semibold mb-3" style={{ color: "#8888A0" }}>Distribution</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categoryTotals} cx="40%" cy="50%" innerRadius={50} outerRadius={75}
                    paddingAngle={3} dataKey="value">
                    {categoryTotals.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    layout="vertical" align="right" verticalAlign="middle"
                    formatter={(value) => <span style={{ color: "#8888A0", fontSize: 11 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Category list */}
        {categoryTotals.length > 0 && (
          <div className="mt-5 space-y-2">
            {categoryTotals.map((cat, i) => {
              const pct = Math.round((cat.value / periodExpense) * 100);
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                      <span className="text-sm" style={{ color: "#F0F0F5" }}>{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs" style={{ color: "#8888A0" }}>{pct}%</span>
                      <span className="text-sm font-semibold" style={{ color: "#F0F0F5" }}>{formatCurrency(cat.value)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          BUDGET STATUS
      ══════════════════════════════════════════ */}
      {budgetStatus.length > 0 && (
        <div style={card} className="p-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#8B5CF6" }}>Budgets</p>
          <h2 className="text-base font-bold mb-5" style={{ color: "#F0F0F5" }}>Budget status</h2>
          <div className="space-y-4">
            {budgetStatus.map((b) => (
              <div key={b.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: "#F0F0F5" }}>{b.category?.name || "Unknown"}</span>
                    {b.isOverrun && <Badge variant="destructive" className="text-xs">Overrun</Badge>}
                  </div>
                  <span className="text-xs" style={{ color: "#8888A0" }}>
                    {formatCurrency(b.spent)} / {formatCurrency(b.amount)}
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(b.percentageUsed, 100)}%`,
                      background: b.isOverrun ? "#FF6B6B" : b.percentageUsed > 80 ? "#F59E0B" : "#8B5CF6",
                    }}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: "#8888A0" }}>{b.percentageUsed}% used</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}