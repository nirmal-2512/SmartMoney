import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, TrendingDown, Wallet, CalendarDays, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import api from "@/lib/axios";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount || 0);

const COLORS = ["#00C896","#4F8EF7","#8B5CF6","#EC4899","#F59E0B","#06B6D4","#EF4444","#10B981","#F97316"];

const card  = { background: "#13131E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 };
const inner = { background: "#1A1A2E", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 };

function isoToday()      { return new Date().toISOString().slice(0, 10); }
function isoMonthStart() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-01`; }

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1A1A2E", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px" }}>
      <p style={{ color: "#8888A0", fontSize: 12, marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const [from, setFrom]   = useState(isoMonthStart());
  const [to, setTo]       = useState(isoToday());
  const [catFilter, setCatFilter] = useState("all");

  // fetch categories for filter dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories").then((r) => r.data.categories),
  });
  const categories = categoriesData || [];

  // category breakdown for the selected date range
  const { data: breakdown, isLoading: breakdownLoading } = useQuery({
    queryKey: ["category-breakdown-range", from, to],
    queryFn: () =>
      api.get("/reports/category-breakdown", { params: { startDate: from, endDate: to } })
         .then((r) => r.data),
    enabled: !!from && !!to,
  });

  // monthly report — for daily breakdown tab we derive from category-breakdown transactions
  // but we also hit the monthly endpoint for the summary cards using the from date's month
  const selectedMonth = from.slice(0, 7);
  const { data: monthly, isLoading: monthlyLoading } = useQuery({
    queryKey: ["monthly-report", selectedMonth],
    queryFn: () =>
      api.get("/reports/monthly", { params: { month: selectedMonth } }).then((r) => r.data),
  });

  // dashboard with date range for totals
  const { data: rangeData, isLoading: rangeLoading } = useQuery({
    queryKey: ["dashboard-range", from, to],
    queryFn: () => api.get("/reports/dashboard", { params: { from, to } }).then((r) => r.data),
    enabled: !!from && !!to,
  });

  const isLoading = breakdownLoading || rangeLoading;

  const totals     = rangeData?.totals || {};
  const comparison = monthly?.comparison || {};
  const dailyData  = monthly?.dailyBreakdown || [];

  // apply category filter to breakdown
  const allCategories = breakdown?.breakdown || [];
  const categoryData  = useMemo(() => {
    if (catFilter === "all") return allCategories;
    return allCategories.filter((c) => c.categoryId === catFilter);
  }, [allCategories, catFilter]);

  // recalculate percentages after filter
  const filteredTotal = categoryData.reduce((s, c) => s + c.total, 0);
  const categoryDataWithPct = categoryData.map((c) => ({
    ...c,
    percentage: filteredTotal ? ((c.total / filteredTotal) * 100).toFixed(1) : 0,
  }));

  return (
    <div className="space-y-5 pb-8" style={{ color: "#F0F0F5" }}>

      {/* ── header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#F0F0F5" }}>Reports</h1>
          <p className="text-sm mt-1" style={{ color: "#8888A0" }}>Financial insights and analytics</p>
        </div>
      </div>

      {/* ── filters bar ── */}
      <div style={card} className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <CalendarDays className="w-4 h-4 flex-shrink-0" style={{ color: "#8888A0" }} />

          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            style={{ background: "#1A1A2E", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#F0F0F5", padding: "6px 10px", fontSize: 13 }} />

          <span style={{ color: "#8888A0", fontSize: 13 }}>to</span>

          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            style={{ background: "#1A1A2E", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#F0F0F5", padding: "6px 10px", fontSize: 13 }} />

          <div className="flex items-center gap-2 ml-auto">
            <Filter className="w-4 h-4" style={{ color: "#8888A0" }} />
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-44" style={{ background: "#1A1A2E", border: "1px solid rgba(255,255,255,0.08)", color: "#F0F0F5" }}>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── summary cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isLoading
          ? [1,2,3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" style={{ background: "#1A1A2E" }} />)
          : [
              { label: "Income",      value: totals.totalIncome,  change: comparison.incomeChange,  color: "#00C896", Icon: TrendingUp,   good: (v) => v >= 0 },
              { label: "Expenses",    value: totals.totalExpense, change: comparison.expenseChange, color: "#FF6B6B", Icon: TrendingDown, good: (v) => v <= 0 },
              { label: "Net balance", value: totals.balance,      change: comparison.balanceChange, color: "#4F8EF7", Icon: Wallet,       good: (v) => v >= 0 },
            ].map(({ label, value, change, color, Icon, good }) => (
              <div key={label} style={card} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm" style={{ color: "#8888A0" }}>{label}</span>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <p className="text-2xl font-bold" style={{ color }}>{formatCurrency(value)}</p>
                {change !== undefined && (
                  <p className="text-xs mt-1" style={{ color: good(change) ? "#00C896" : "#FF6B6B" }}>
                    {change >= 0 ? "+" : ""}{formatCurrency(change)} vs prev month
                  </p>
                )}
              </div>
            ))}
      </div>

      {/* ── tabs ── */}
      <Tabs defaultValue="categories">
        <TabsList style={{ background: "#1A1A2E" }}>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="daily">Daily Breakdown</TabsTrigger>
        </TabsList>

        {/* CATEGORY TAB */}
        <TabsContent value="categories" className="mt-4 space-y-4">
          {isLoading ? (
            <Skeleton className="h-64 rounded-xl" style={{ background: "#1A1A2E" }} />
          ) : categoryDataWithPct.length === 0 ? (
            <div style={card} className="text-center py-16">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm" style={{ color: "#8888A0" }}>No spending data for this range</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* donut */}
              <div style={card} className="p-5">
                <p className="text-sm font-semibold mb-4" style={{ color: "#F0F0F5" }}>Spending distribution</p>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={categoryDataWithPct} cx="50%" cy="50%" innerRadius={60} outerRadius={95}
                      paddingAngle={3} dataKey="total">
                      {categoryDataWithPct.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v)}
                      contentStyle={{ background: "#1A1A2E", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#F0F0F5" }} />
                    <Legend formatter={(value) => <span style={{ color: "#8888A0", fontSize: 12 }}>{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* category list */}
              <div style={card} className="p-5">
                <p className="text-sm font-semibold mb-4" style={{ color: "#F0F0F5" }}>
                  Category totals
                  {catFilter !== "all" && (
                    <button onClick={() => setCatFilter("all")} className="ml-2 text-xs underline" style={{ color: "#8888A0" }}>clear filter</button>
                  )}
                </p>
                <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                  {categoryDataWithPct.map((c, i) => (
                    <div key={c.categoryId}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <div className="flex items-center gap-2">
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                          <span style={{ color: "#F0F0F5" }}>{c.name}</span>
                          <span className="text-xs" style={{ color: "#8888A0" }}>({c.count} txns)</span>
                        </div>
                        <span className="font-semibold" style={{ color: "#F0F0F5" }}>{formatCurrency(c.total)}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${c.percentage}%`, background: COLORS[i % COLORS.length] }} />
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "#8888A0" }}>{c.percentage}%</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "#8888A0" }}>Total</span>
                    <span className="font-bold" style={{ color: "#FF6B6B" }}>{formatCurrency(filteredTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* DAILY TAB */}
        <TabsContent value="daily" className="mt-4">
          <div style={card} className="p-5">
            <p className="text-sm font-semibold mb-4" style={{ color: "#F0F0F5" }}>
              Daily income vs expenses — {selectedMonth}
            </p>
            {monthlyLoading ? (
              <Skeleton className="h-64" style={{ background: "#1A1A2E" }} />
            ) : dailyData.length === 0 ? (
              <div className="text-center py-16" style={{ color: "#8888A0" }}>
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No data for this month</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData} margin={{ left: 0, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: "#8888A0", fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={(d) => d.slice(5)} />
                  <YAxis tick={{ fill: "#8888A0", fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `₹${v >= 1000 ? (v/1000).toFixed(0)+"k" : v}`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="income"  fill="#00C896" radius={[4,4,0,0]} name="Income" />
                  <Bar dataKey="expense" fill="#FF6B6B" radius={[4,4,0,0]} name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}