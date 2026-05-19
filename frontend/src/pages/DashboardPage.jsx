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
  "#3b82f6",
  "#f97316",
  "#22c55e",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f59e0b",
];

const formatCurrency = (amount, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
};

const StatCard = ({ title, value, icon: Icon, color, change, loading }) => {
  if (loading) return <Skeleton className="h-32 rounded-xl" />;
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-500">{title}</span>
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 mt-1 text-sm ${change >= 0 ? "text-green-600" : "text-red-500"}`}
          >
            {change >= 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span>{Math.abs(change)}% from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Your financial overview for this month
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Income"
          value={formatCurrency(totals.totalIncome || 0)}
          icon={TrendingUp}
          color="bg-green-500"
          loading={isLoading}
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totals.totalExpense || 0)}
          icon={TrendingDown}
          color="bg-red-500"
          loading={isLoading}
        />
        <StatCard
          title="Net Balance"
          value={formatCurrency(totals.balance || 0)}
          icon={Wallet}
          color="bg-blue-600"
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              Array(5)
                .fill(0)
                .map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Wallet className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No transactions this month</p>
              </div>
            ) : (
              recentTransactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{
                        backgroundColor: t.Category?.color || "#6366f1",
                      }}
                    >
                      {t.title.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {t.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t.Category?.name || "Uncategorised"} · {t.date}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`text-sm font-semibold ${t.type === "income" ? "text-green-600" : "text-red-500"}`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatCurrency(t.amount, t.currency)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 rounded-lg" />
            ) : pieData.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
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
                  <Tooltip formatter={(val) => formatCurrency(val)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget Status */}
      {budgetStatus.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Budget Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgetStatus.map((b) => (
              <div key={b.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      {b.category?.name || "Unknown"}
                    </span>
                    {b.isOverrun && (
                      <Badge variant="destructive" className="text-xs">
                        Overrun
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatCurrency(b.spent)} / {formatCurrency(b.amount)}
                  </span>
                </div>
                <Progress
                  value={Math.min(b.percentageUsed, 100)}
                  className={`h-2 ${b.isOverrun ? "bg-red-100" : "bg-gray-100"}`}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {b.percentageUsed}% used
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
