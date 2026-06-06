import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import api from "@/lib/axios";

const COLORS = [
  "#00C896",
  "#4F8EF7",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#06B6D4",
  "#EF4444",
];

const formatCurrency = (amount, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
};

const cardStyle = {
  background: "#16161F",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 14,
};

const StatCard = ({ title, value, icon: Icon, iconBg, change, loading }) => {
  if (loading)
    return (
      <Skeleton className="h-32 rounded-xl" style={{ background: "#1A1A26" }} />
    );
  return (
    <div style={cardStyle} className="p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium" style={{ color: "#8888A0" }}>
          {title}
        </span>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: iconBg }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold" style={{ color: "#F0F0F5" }}>
        {value}
      </div>
      {change !== undefined && (
        <div
          className="flex items-center gap-1 mt-1 text-sm"
          style={{ color: change >= 0 ? "#00C896" : "#FF6B6B" }}
        >
          {change >= 0 ? (
            <ArrowUpRight className="w-4 h-4" />
          ) : (
            <ArrowDownRight className="w-4 h-4" />
          )}
          <span>{Math.abs(change)}% from last month</span>
        </div>
      )}
    </div>
  );
};

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/reports/dashboard").then((r) => r.data),
  });

  const totals = data?.totals || {};
  const recentTransactions = data?.recentTransactions || [];
  const categoryBreakdown = data?.categoryBreakdown || [];
  const budgetStatus = data?.budgetStatus || [];

  const pieData = categoryBreakdown.map((c) => ({
    name: c.name,
    value: c.total,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#F0F0F5" }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "#8888A0" }}>
          Your financial overview for this month
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Income"
          value={formatCurrency(totals.totalIncome || 0)}
          icon={TrendingUp}
          iconBg="rgba(0,200,150,0.2)"
          loading={isLoading}
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totals.totalExpense || 0)}
          icon={TrendingDown}
          iconBg="rgba(255,107,107,0.2)"
          loading={isLoading}
        />
        <StatCard
          title="Net Balance"
          value={formatCurrency(totals.balance || 0)}
          icon={Wallet}
          iconBg="rgba(79,142,247,0.2)"
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div style={cardStyle}>
          <div
            className="p-5 pb-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <h2
              className="text-base font-semibold"
              style={{ color: "#F0F0F5" }}
            >
              Recent Transactions
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {isLoading ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-14 rounded-lg"
                    style={{ background: "#1A1A26" }}
                  />
                ))
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-8" style={{ color: "#8888A0" }}>
                <Wallet className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No transactions this month</p>
              </div>
            ) : (
              recentTransactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: "#1A1A26" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{
                        backgroundColor: t.Category?.color || "#4F8EF7",
                      }}
                    >
                      {t.title.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "#F0F0F5" }}
                      >
                        {t.title}
                      </p>
                      <p className="text-xs" style={{ color: "#8888A0" }}>
                        {t.Category?.name || "Uncategorised"} · {t.date}
                      </p>
                    </div>
                  </div>
                  <div
                    className="text-sm font-semibold"
                    style={{
                      color: t.type === "income" ? "#00C896" : "#FF6B6B",
                    }}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatCurrency(t.amount, t.currency)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div style={cardStyle}>
          <div
            className="p-5 pb-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <h2
              className="text-base font-semibold"
              style={{ color: "#F0F0F5" }}
            >
              Spending by Category
            </h2>
          </div>
          <div className="p-5">
            {isLoading ? (
              <Skeleton
                className="h-48 rounded-lg"
                style={{ background: "#1A1A26" }}
              />
            ) : pieData.length === 0 ? (
              <div className="text-center py-8" style={{ color: "#8888A0" }}>
                <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No spending data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => formatCurrency(val)}
                    contentStyle={{
                      background: "#1A1A26",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 8,
                      color: "#F0F0F5",
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: "#8888A0", fontSize: 12 }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Budget Status */}
      {budgetStatus.length > 0 && (
        <div style={cardStyle}>
          <div
            className="p-5 pb-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <h2
              className="text-base font-semibold"
              style={{ color: "#F0F0F5" }}
            >
              Budget Status
            </h2>
          </div>
          <div className="p-5 space-y-4">
            {budgetStatus.map((b) => (
              <div key={b.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#F0F0F5" }}
                    >
                      {b.category?.name || "Unknown"}
                    </span>
                    {b.isOverrun && (
                      <Badge variant="destructive" className="text-xs">
                        Overrun
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm" style={{ color: "#8888A0" }}>
                    {formatCurrency(b.spent)} / {formatCurrency(b.amount)}
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(b.percentageUsed, 100)}%`,
                      background: b.isOverrun
                        ? "#FF6B6B"
                        : b.percentageUsed > 80
                          ? "#F59E0B"
                          : "#00C896",
                    }}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: "#8888A0" }}>
                  {b.percentageUsed}% used
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
