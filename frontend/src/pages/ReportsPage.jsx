import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  CalendarDays,
  Filter,
  TrendingDown,
  TrendingUp,
  Wallet,
  ChevronDown,
  X,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import api from "@/lib/axios";

/* =========================================================
   Helpers
========================================================= */

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const COLORS = [
  "#6366F1",
  "#8B5CF6",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#EC4899",
  "#F97316",
  "#4F8EF7",
  "#14B8A6",
];

const CARD_STYLE = {
  background: "#13131E",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
};

const PANEL_STYLE = {
  background: "#171722",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 12,
};

const INPUT_STYLE = {
  background: "#1A1A2E",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 9,
  color: "#F0F0F5",
};

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function isoMonthStart() {
  const d = new Date();

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-01`;
}

/* =========================================================
   Custom tooltip
========================================================= */

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: "#171722",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10,
        padding: "10px 13px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
      }}
    >
      <p
        style={{
          color: "#8888A0",
          fontSize: 11,
          marginBottom: 5,
        }}
      >
        {label}
      </p>

      {payload.map((item) => (
        <p
          key={item.name}
          style={{
            color: item.color,
            fontSize: 13,
            fontWeight: 600,
            margin: "2px 0",
          }}
        >
          {item.name}: {formatCurrency(item.value)}
        </p>
      ))}
    </div>
  );
};

/* =========================================================
   Summary metric
========================================================= */

function SummaryCard({
  label,
  value,
  change,
  color,
  Icon,
  positiveIsGood = true,
}) {
  const hasChange = change !== undefined && change !== null;

  const changeIsGood = positiveIsGood
    ? change >= 0
    : change <= 0;

  return (
    <div
      style={CARD_STYLE}
      className="p-4 sm:p-5 min-w-0"
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className="text-sm"
          style={{ color: "#8888A0" }}
        >
          {label}
        </span>

        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{
            background: `${color}16`,
            color,
          }}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <p
        className="mt-3 text-xl sm:text-2xl font-bold truncate"
        style={{ color }}
      >
        {formatCurrency(value)}
      </p>

      {hasChange ? (
        <div className="flex items-center gap-1.5 mt-1.5">
          {changeIsGood ? (
            <TrendingUp
              className="w-3.5 h-3.5"
              style={{ color: "#00C896" }}
            />
          ) : (
            <TrendingDown
              className="w-3.5 h-3.5"
              style={{ color: "#FF6B6B" }}
            />
          )}

          <span
            className="text-xs"
            style={{
              color: changeIsGood
                ? "#00C896"
                : "#FF6B6B",
            }}
          >
            {change >= 0 ? "+" : ""}
            {formatCurrency(change)} vs previous month
          </span>
        </div>
      ) : (
        <p
          className="text-xs mt-1.5"
          style={{ color: "#66667A" }}
        >
          Selected date range
        </p>
      )}
    </div>
  );
}

/* =========================================================
   Loading summary
========================================================= */

function SummarySkeletons() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      {[1, 2, 3].map((item) => (
        <Skeleton
          key={item}
          className="h-32 rounded-2xl"
          style={{ background: "#1A1A2E" }}
        />
      ))}
    </div>
  );
}

/* =========================================================
   Main page
========================================================= */

export default function ReportsPage() {
  const [from, setFrom] = useState(isoMonthStart());
  const [to, setTo] = useState(isoToday());
  const [catFilter, setCatFilter] = useState("all");

  /* -------------------------------------------------------
     Categories
  ------------------------------------------------------- */

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      api
        .get("/categories")
        .then((r) => r.data.categories),
  });

  const categories = categoriesData || [];

  /* -------------------------------------------------------
     Category breakdown
  ------------------------------------------------------- */

  const {
    data: breakdown,
    isLoading: breakdownLoading,
    isError: breakdownError,
  } = useQuery({
    queryKey: [
      "category-breakdown-range",
      from,
      to,
    ],

    queryFn: () =>
      api
        .get("/reports/category-breakdown", {
          params: {
            startDate: from,
            endDate: to,
          },
        })
        .then((r) => r.data),

    enabled: !!from && !!to,
  });

  /* -------------------------------------------------------
     Monthly report
  ------------------------------------------------------- */

  const selectedMonth = from.slice(0, 7);

  const {
    data: monthly,
    isLoading: monthlyLoading,
  } = useQuery({
    queryKey: ["monthly-report", selectedMonth],

    queryFn: () =>
      api
        .get("/reports/monthly", {
          params: {
            month: selectedMonth,
          },
        })
        .then((r) => r.data),
  });

  /* -------------------------------------------------------
     Dashboard range
  ------------------------------------------------------- */

  const {
    data: rangeData,
    isLoading: rangeLoading,
    isError: rangeError,
  } = useQuery({
    queryKey: [
      "dashboard-range",
      from,
      to,
    ],

    queryFn: () =>
      api
        .get("/reports/dashboard", {
          params: {
            from,
            to,
          },
        })
        .then((r) => r.data),

    enabled: !!from && !!to,
  });

  /* -------------------------------------------------------
     Derived data
  ------------------------------------------------------- */

  const isLoading =
    breakdownLoading || rangeLoading;

  const totals = rangeData?.totals || {};
  const comparison = monthly?.comparison || {};
  const dailyData = monthly?.dailyBreakdown || [];

  const allCategories =
    breakdown?.breakdown || [];

  const categoryData = useMemo(() => {
    if (catFilter === "all") {
      return allCategories;
    }

    return allCategories.filter(
      (category) =>
        String(category.categoryId) ===
        String(catFilter)
    );
  }, [allCategories, catFilter]);

  const filteredTotal = useMemo(
    () =>
      categoryData.reduce(
        (sum, category) =>
          sum + Number(category.total || 0),
        0
      ),
    [categoryData]
  );

  const categoryDataWithPct = useMemo(
    () =>
      categoryData.map((category) => ({
        ...category,
        percentage: filteredTotal
          ? (
              (Number(category.total || 0) /
                filteredTotal) *
              100
            ).toFixed(1)
          : 0,
      })),
    [categoryData, filteredTotal]
  );

  const selectedCategory =
    categories.find(
      (category) =>
        String(category.id) ===
        String(catFilter)
    );

  /* -------------------------------------------------------
     Validation
  ------------------------------------------------------- */

  const invalidRange =
    from && to && from > to;

  /* =========================================================
     Render
  ========================================================= */

  return (
    <div
      className="space-y-5 pb-8"
      style={{
        color: "#F0F0F5",
      }}
    >
      {/* =====================================================
          Header
      ===================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                background:
                  "rgba(99,102,241,0.12)",
                color: "#818CF8",
              }}
            >
              <BarChart3 className="h-5 w-5" />
            </div>

            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "#F0F0F5" }}
            >
              Reports
            </h1>
          </div>

          <p
            className="text-sm mt-2"
            style={{ color: "#8888A0" }}
          >
            Understand where your money is going
            and how your finances are changing.
          </p>
        </div>
      </div>

      {/* =====================================================
          Filters
      ===================================================== */}

      <div
        style={CARD_STYLE}
        className="p-3 sm:p-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Date controls */}

          <div className="flex items-center gap-2 min-w-0">
            <div
              className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{
                background:
                  "rgba(255,255,255,0.04)",
                color: "#8888A0",
              }}
            >
              <CalendarDays className="w-4 h-4" />
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 w-full sm:w-auto">
              <input
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) =>
                  setFrom(e.target.value)
                }
                className="h-9 w-full sm:w-[145px] px-2.5 text-xs sm:text-sm outline-none"
                style={INPUT_STYLE}
              />

              <span
                className="text-xs"
                style={{ color: "#66667A" }}
              >
                to
              </span>

              <input
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) =>
                  setTo(e.target.value)
                }
                className="h-9 w-full sm:w-[145px] px-2.5 text-xs sm:text-sm outline-none"
                style={INPUT_STYLE}
              />
            </div>
          </div>

          {/* Divider */}

          <div
            className="hidden lg:block h-7 w-px"
            style={{
              background:
                "rgba(255,255,255,0.08)",
            }}
          />

          {/* Category filter */}

          <div className="flex items-center gap-2 w-full lg:w-auto lg:ml-auto">
            <Filter
              className="w-4 h-4 shrink-0"
              style={{ color: "#77778C" }}
            />

            <Select
              value={catFilter}
              onValueChange={setCatFilter}
            >
              <SelectTrigger
                className="h-9 w-full sm:w-52"
                style={{
                  background: "#1A1A2E",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                  color: "#F0F0F5",
                }}
              >
                <SelectValue placeholder="All categories" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All categories
                </SelectItem>

                {categories.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={String(category.id)}
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {catFilter !== "all" && (
              <button
                type="button"
                onClick={() => setCatFilter("all")}
                className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg transition-colors"
                style={{
                  background:
                    "rgba(255,255,255,0.04)",
                  color: "#8888A0",
                }}
                title="Clear category filter"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {invalidRange && (
          <p
            className="text-xs mt-3"
            style={{ color: "#FF6B6B" }}
          >
            The start date must be before the end
            date.
          </p>
        )}
      </div>

      {/* =====================================================
          Summary
      ===================================================== */}

      {isLoading ? (
        <SummarySkeletons />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <SummaryCard
            label="Income"
            value={totals.totalIncome}
            change={comparison.incomeChange}
            color="#00C896"
            Icon={TrendingUp}
            positiveIsGood
          />

          <SummaryCard
            label="Expenses"
            value={totals.totalExpense}
            change={comparison.expenseChange}
            color="#FF6B6B"
            Icon={TrendingDown}
            positiveIsGood={false}
          />

          <SummaryCard
            label="Net balance"
            value={totals.balance}
            change={comparison.balanceChange}
            color="#818CF8"
            Icon={Wallet}
            positiveIsGood
          />
        </div>
      )}

      {/* =====================================================
          Error state
      ===================================================== */}

      {(breakdownError || rangeError) && (
        <div
          style={CARD_STYLE}
          className="px-4 py-5 text-center"
        >
          <p
            className="text-sm font-medium"
            style={{ color: "#F0F0F5" }}
          >
            Unable to load report data
          </p>

          <p
            className="text-xs mt-1"
            style={{ color: "#8888A0" }}
          >
            Try changing the date range or
            refreshing the page.
          </p>
        </div>
      )}

      {/* =====================================================
          Analytics tabs
      ===================================================== */}

      <Tabs defaultValue="categories">
        <div className="flex items-center justify-between gap-3 mb-4">
          <TabsList
            className="h-10 p-1"
            style={{
              background: "#171722",
              border:
                "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <TabsTrigger
              value="categories"
              className="text-xs sm:text-sm px-3 sm:px-4"
            >
              By Category
            </TabsTrigger>

            <TabsTrigger
              value="daily"
              className="text-xs sm:text-sm px-3 sm:px-4"
            >
              Daily Breakdown
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ===================================================
            Category tab
        =================================================== */}

        <TabsContent
          value="categories"
          className="mt-0"
        >
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Skeleton
                className="h-[360px] rounded-2xl"
                style={{ background: "#1A1A2E" }}
              />

              <Skeleton
                className="h-[360px] rounded-2xl"
                style={{ background: "#1A1A2E" }}
              />
            </div>
          ) : categoryDataWithPct.length === 0 ? (
            <div
              style={CARD_STYLE}
              className="py-16 px-5 text-center"
            >
              <div
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl"
                style={{
                  background:
                    "rgba(255,255,255,0.04)",
                  color: "#77778C",
                }}
              >
                <BarChart3 className="w-6 h-6" />
              </div>

              <p
                className="text-sm font-medium mt-4"
                style={{ color: "#D0D0DB" }}
              >
                No spending data
              </p>

              <p
                className="text-xs mt-1"
                style={{ color: "#77778C" }}
              >
                There are no categorized expenses
                for this date range.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* ------------------------------------------------
                  Distribution
              ------------------------------------------------ */}

              <div
                style={CARD_STYLE}
                className="p-4 sm:p-5 min-w-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "#F0F0F5" }}
                    >
                      Spending distribution
                    </p>

                    <p
                      className="text-xs mt-1"
                      style={{ color: "#77778C" }}
                    >
                      {selectedCategory
                        ? selectedCategory.name
                        : "All categories"}
                    </p>
                  </div>

                  <span
                    className="text-xs font-medium px-2 py-1 rounded-md"
                    style={{
                      background:
                        "rgba(255,255,255,0.04)",
                      color: "#8888A0",
                    }}
                  >
                    {categoryDataWithPct.length}{" "}
                    {categoryDataWithPct.length ===
                    1
                      ? "category"
                      : "categories"}
                  </span>
                </div>

                <div className="mt-3">
                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >
                    <PieChart>
                      <Pie
                        data={categoryDataWithPct}
                        cx="50%"
                        cy="46%"
                        innerRadius={68}
                        outerRadius={102}
                        paddingAngle={3}
                        dataKey="total"
                        stroke="none"
                      >
                        {categoryDataWithPct.map(
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
                        formatter={(value) =>
                          formatCurrency(value)
                        }
                        contentStyle={{
                          background: "#171722",
                          border:
                            "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 8,
                          color: "#F0F0F5",
                        }}
                      />

                      <Legend
                        verticalAlign="bottom"
                        formatter={(value) => (
                          <span
                            style={{
                              color: "#8888A0",
                              fontSize: 11,
                            }}
                          >
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div
                  className="mt-1 pt-3 flex items-center justify-between"
                  style={{
                    borderTop:
                      "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span
                    className="text-xs"
                    style={{ color: "#77778C" }}
                  >
                    Total spending
                  </span>

                  <span
                    className="text-sm font-bold"
                    style={{ color: "#FF6B6B" }}
                  >
                    {formatCurrency(filteredTotal)}
                  </span>
                </div>
              </div>

              {/* ------------------------------------------------
                  Category totals
              ------------------------------------------------ */}

              <div
                style={CARD_STYLE}
                className="p-4 sm:p-5 min-w-0"
              >
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "#F0F0F5" }}
                    >
                      Category totals
                    </p>

                    <p
                      className="text-xs mt-1"
                      style={{ color: "#77778C" }}
                    >
                      Where your spending went
                    </p>
                  </div>

                  {catFilter !== "all" && (
                    <button
                      type="button"
                      onClick={() =>
                        setCatFilter("all")
                      }
                      className="text-xs px-2 py-1 rounded-md"
                      style={{
                        color: "#A5A5B8",
                        background:
                          "rgba(255,255,255,0.04)",
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-4 max-h-[290px] overflow-y-auto pr-1">
                  {categoryDataWithPct.map(
                    (category, index) => {
                      const categoryColor =
                        COLORS[
                          index % COLORS.length
                        ];

                      return (
                        <div
                          key={category.categoryId}
                          className="group"
                        >
                          <div className="flex items-center justify-between gap-3 mb-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{
                                  background:
                                    categoryColor,
                                }}
                              />

                              <span
                                className="text-sm truncate"
                                style={{
                                  color: "#E2E2EA",
                                }}
                              >
                                {category.name}
                              </span>

                              <span
                                className="text-[11px] shrink-0"
                                style={{
                                  color: "#66667A",
                                }}
                              >
                                {category.count}
                              </span>
                            </div>

                            <span
                              className="text-sm font-semibold shrink-0"
                              style={{
                                color: "#E8E8EF",
                              }}
                            >
                              {formatCurrency(
                                category.total
                              )}
                            </span>
                          </div>

                          <div
                            className="h-1.5 rounded-full overflow-hidden"
                            style={{
                              background:
                                "rgba(255,255,255,0.055)",
                            }}
                          >
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${category.percentage}%`,
                                background:
                                  categoryColor,
                              }}
                            />
                          </div>

                          <div className="flex justify-end mt-1">
                            <span
                              className="text-[10px]"
                              style={{
                                color: "#66667A",
                              }}
                            >
                              {category.percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                <div
                  className="mt-4 pt-3 flex items-center justify-between"
                  style={{
                    borderTop:
                      "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span
                    className="text-xs"
                    style={{ color: "#77778C" }}
                  >
                    Total
                  </span>

                  <span
                    className="text-sm font-bold"
                    style={{ color: "#F0F0F5" }}
                  >
                    {formatCurrency(filteredTotal)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ===================================================
            Daily tab
        =================================================== */}

        <TabsContent
          value="daily"
          className="mt-0"
        >
          <div
            style={CARD_STYLE}
            className="p-4 sm:p-5 min-w-0"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#F0F0F5" }}
                >
                  Daily income vs expenses
                </p>

                <p
                  className="text-xs mt-1"
                  style={{ color: "#77778C" }}
                >
                  {selectedMonth}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: "#00C896",
                    }}
                  />

                  <span
                    className="text-xs"
                    style={{ color: "#8888A0" }}
                  >
                    Income
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: "#FF6B6B",
                    }}
                  />

                  <span
                    className="text-xs"
                    style={{ color: "#8888A0" }}
                  >
                    Expenses
                  </span>
                </div>
              </div>
            </div>

            {monthlyLoading ? (
              <Skeleton
                className="h-[300px] rounded-xl"
                style={{
                  background: "#1A1A2E",
                }}
              />
            ) : dailyData.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-16"
                style={{ color: "#77778C" }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{
                    background:
                      "rgba(255,255,255,0.04)",
                  }}
                >
                  <BarChart3 className="w-6 h-6 opacity-60" />
                </div>

                <p
                  className="text-sm font-medium mt-4"
                  style={{ color: "#B5B5C2" }}
                >
                  No data for this month
                </p>

                <p className="text-xs mt-1">
                  Income and expense activity will
                  appear here.
                </p>
              </div>
            ) : (
              <div className="w-full min-w-0 overflow-hidden">
                <ResponsiveContainer
                  width="100%"
                  height={320}
                >
                  <BarChart
                    data={dailyData}
                    margin={{
                      top: 8,
                      right: 4,
                      left: -12,
                      bottom: 4,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.04)"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="date"
                      tick={{
                        fill: "#77778C",
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(date) =>
                        date.slice(5)
                      }
                      interval="preserveStartEnd"
                    />

                    <YAxis
                      tick={{
                        fill: "#77778C",
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) =>
                        `₹${
                          value >= 1000
                            ? `${(
                                value / 1000
                              ).toFixed(0)}k`
                            : value
                        }`
                      }
                    />

                    <Tooltip
                      content={
                        <CustomTooltip />
                      }
                      cursor={{
                        fill: "rgba(255,255,255,0.025)",
                      }}
                    />

                    <Bar
                      dataKey="income"
                      fill="#00C896"
                      radius={[
                        4, 4, 0, 0,
                      ]}
                      name="Income"
                      maxBarSize={22}
                    />

                    <Bar
                      dataKey="expense"
                      fill="#FF6B6B"
                      radius={[
                        4, 4, 0, 0,
                      ]}
                      name="Expense"
                      maxBarSize={22}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* =====================================================
          Footer context
      ===================================================== */}

      <div
        className="flex items-center justify-center gap-1.5 text-[11px]"
        style={{ color: "#5F5F72" }}
      >
        <ChevronDown className="w-3 h-3" />
        Reports are based on your recorded
        transactions.
      </div>
    </div>
  );
}