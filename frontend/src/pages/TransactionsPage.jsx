import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Receipt,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useForm } from "react-hook-form";
import api from "@/lib/axios";
import { useToast } from "@/components/hooks/use-toast";

const formatCurrency = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);

const TYPE_STYLES = {
  income: {
    background: "rgba(16, 185, 129, 0.10)",
    color: "#34D399",
  },
  expense: {
    background: "rgba(248, 113, 113, 0.10)",
    color: "#F87171",
  },
  refund: {
    background: "rgba(96, 165, 250, 0.10)",
    color: "#60A5FA",
  },
  transfer: {
    background: "rgba(167, 139, 250, 0.10)",
    color: "#A78BFA",
  },
};

function applyFilters(
  transactions,
  { search, typeFilter, categoryFilter }
) {
  let list = transactions;

  if (typeFilter && typeFilter !== "all") {
    list = list.filter((t) => t.type === typeFilter);
  }

  if (categoryFilter && categoryFilter !== "all") {
    list = list.filter(
      (t) => t.categoryId === categoryFilter
    );
  }

  if (search) {
    const q = search.toLowerCase().trim();

    list = list.filter((t) => {
      const matchTitle = t.title
        ?.toLowerCase()
        .includes(q);

      const matchAmount = String(t.amount).includes(q);

      const matchCategory = t.Category?.name
        ?.toLowerCase()
        .includes(q);

      const matchNotes = t.notes
        ?.toLowerCase()
        .includes(q);

      const matchDate = t.date
        ?.toLowerCase()
        .includes(q);

      return (
        matchTitle ||
        matchAmount ||
        matchCategory ||
        matchNotes ||
        matchDate
      );
    });
  }

  return list;
}

/* =======================================================
   TRANSACTION FORM
======================================================= */

function TransactionForm({
  transaction,
  categories,
  onClose,
  onSuccess,
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
  } = useForm({
    defaultValues: transaction
      ? {
          title: transaction.title,
          amount: transaction.amount,
          type: transaction.type,
          date: transaction.date,
          currency: transaction.currency,
          categoryId: transaction.categoryId,
          notes: transaction.notes || "",
        }
      : {
          title: "",
          amount: "",
          type: "expense",
          date: new Date()
            .toISOString()
            .split("T")[0],
          currency: "INR",
          categoryId: "",
          notes: "",
        },
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      if (transaction) {
        await api.patch(
          `/transactions/${transaction.id}`,
          data
        );

        toast({
          title: "Transaction updated",
        });
      } else {
        await api.post("/transactions", data);

        toast({
          title: "Transaction created",
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      toast({
        title: "Unable to save transaction",
        description:
          err.response?.data?.error?.message ||
          "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      <div className="grid grid-cols-2 gap-4">

        {/* Title */}
        <div className="col-span-2 space-y-2">
          <Label htmlFor="title">
            Title
          </Label>

          <Input
            id="title"
            placeholder="e.g. Swiggy order"
            {...register("title", {
              required: true,
            })}
          />
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">
            Amount
          </Label>

          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register("amount", {
              required: true,
            })}
          />
        </div>

        {/* Currency */}
        <div className="space-y-2">
          <Label htmlFor="currency">
            Currency
          </Label>

          <Input
            id="currency"
            placeholder="INR"
            {...register("currency")}
          />
        </div>

        {/* Type */}
        <div className="space-y-2">
          <Label>
            Type
          </Label>

          <Select
            value={watch("type")}
            onValueChange={(value) =>
              setValue("type", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="income">
                Income
              </SelectItem>

              <SelectItem value="expense">
                Expense
              </SelectItem>

              <SelectItem value="refund">
                Refund
              </SelectItem>

              <SelectItem value="transfer">
                Transfer
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date">
            Date
          </Label>

          <Input
            id="date"
            type="date"
            {...register("date", {
              required: true,
            })}
          />
        </div>

        {/* Category */}
        <div className="col-span-2 space-y-2">
          <Label>
            Category
          </Label>

          <Select
            value={watch("categoryId") || ""}
            onValueChange={(value) =>
              setValue("categoryId", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>

            <SelectContent>
              {categories?.map((category) => (
                <SelectItem
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="col-span-2 space-y-2">
          <Label htmlFor="notes">
            Description
          </Label>

          <Textarea
            id="notes"
            rows={3}
            placeholder="Add a description for this transaction..."
            {...register("notes")}
          />

          <p className="text-xs text-muted-foreground">
            This description will appear with the
            transaction.
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          className="flex-1 bg-indigo-600 hover:bg-indigo-500"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : transaction
            ? "Update"
            : "Create"}
        </Button>
      </div>
    </form>
  );
}

/* =======================================================
   MOBILE TRANSACTION CARD
======================================================= */

function MobileTransactionCard({
  transaction,
  onEdit,
  onDelete,
  deleting,
}) {
  const typeStyle =
    TYPE_STYLES[transaction.type] ||
    TYPE_STYLES.expense;

  const description =
    transaction.notes?.trim() ||
    "No description";

  const amountColor =
    transaction.type === "income"
      ? "#34D399"
      : transaction.type === "refund"
      ? "#60A5FA"
      : "#F87171";

  return (
    <div className="px-4 py-4 border-b border-white/[0.06] last:border-b-0">

      {/* Top row */}
      <div className="flex items-start justify-between gap-3">

        <div className="flex min-w-0 items-start gap-3">

          {/* Category icon */}
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white"
            style={{
              background:
                transaction.Category?.color ||
                "#6366F1",
            }}
          >
            {transaction.title
              ?.charAt(0)
              .toUpperCase() || "T"}
          </div>

          {/* Main info */}
          <div className="min-w-0">

            <p className="truncate text-sm font-medium text-gray-200">
              {transaction.title}
            </p>

            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-gray-600">
                {transaction.date}
              </span>

              {transaction.Category && (
                <>
                  <span className="text-gray-700">
                    ·
                  </span>

                  <span className="truncate text-xs text-gray-500 max-w-[120px]">
                    {transaction.Category.name}
                  </span>
                </>
              )}
            </div>

          </div>
        </div>

        {/* Amount */}
        <div className="shrink-0 text-right">

          <p
            className="text-sm font-semibold"
            style={{ color: amountColor }}
          >
            {transaction.type === "income"
              ? "+"
              : "-"}

            {formatCurrency(
              transaction.amount,
              transaction.currency
            )}
          </p>

          <p className="mt-1 text-[10px] uppercase tracking-wide text-gray-600">
            {transaction.currency || "INR"}
          </p>

        </div>
      </div>

      {/* Description */}
      <div className="ml-[52px] mt-3">

        <p
          className={`text-sm leading-5 ${
            transaction.notes
              ? "text-gray-400"
              : "text-gray-700 italic"
          }`}
        >
          {description}
        </p>

      </div>

      {/* Bottom row */}
      <div className="ml-[52px] mt-3 flex items-center justify-between">

        <span
          className="rounded-md px-2 py-1 text-[11px] font-medium capitalize"
          style={{
            background: typeStyle.background,
            color: typeStyle.color,
          }}
        >
          {transaction.type}
        </span>

        <div className="flex items-center gap-1">

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:bg-white/[0.05] hover:text-gray-200"
            onClick={() => onEdit(transaction)}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-600 hover:bg-red-500/10 hover:text-red-400"
            onClick={() => onDelete(transaction.id)}
            disabled={deleting}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>

        </div>
      </div>
    </div>
  );
}

/* =======================================================
   MAIN PAGE
======================================================= */

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] =
    useState("all");
  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editTransaction, setEditTransaction] =
    useState(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  /* Main query */
  const {
    data,
    isLoading,
  } = useQuery({
    queryKey: ["transactions", page],

    queryFn: () =>
      api
        .get("/transactions", {
          params: {
            page,
            limit: 20,
          },
        })
        .then((r) => r.data),
  });

  /* Filter query */
  const { data: allData } = useQuery({
    queryKey: ["transactions-all-filter"],

    queryFn: () =>
      api
        .get("/transactions", {
          params: {
            limit: 500,
          },
        })
        .then((r) => r.data),

    enabled: Boolean(
      search ||
        typeFilter !== "all" ||
        categoryFilter !== "all"
    ),
  });

  /* Categories */
  const { data: categories } = useQuery({
    queryKey: ["categories"],

    queryFn: () =>
      api
        .get("/categories")
        .then((r) => r.data.categories),
  });

  /* Delete */
  const deleteMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`/transactions/${id}`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      toast({
        title: "Transaction deleted",
      });
    },

    onError: (err) => {
      toast({
        title: "Unable to delete transaction",
        description:
          err.response?.data?.error?.message ||
          "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  const isFiltering =
    Boolean(search) ||
    typeFilter !== "all" ||
    categoryFilter !== "all";

  const sourceTransactions = isFiltering
    ? allData?.transactions || []
    : data?.transactions || [];

  const transactions = isFiltering
    ? applyFilters(sourceTransactions, {
        search,
        typeFilter,
        categoryFilter,
      })
    : sourceTransactions;

  const pagination = !isFiltering
    ? data?.pagination || {}
    : {};

  const activeFilters = [
    typeFilter !== "all" && typeFilter,

    categoryFilter !== "all" &&
      categories?.find(
        (c) => c.id === categoryFilter
      )?.name,
  ].filter(Boolean);

  function clearFilters() {
    setSearch("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setPage(1);
  }

  function openCreate() {
    setEditTransaction(null);
    setShowForm(true);
  }

  function openEdit(transaction) {
    setEditTransaction(transaction);
    setShowForm(true);
  }

  return (
    <div className="w-full space-y-5 pb-8">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Transactions
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {isFiltering
              ? `${transactions.length} result${
                  transactions.length !== 1
                    ? "s"
                    : ""
                } found`
              : `${
                  data?.pagination?.total || 0
                } transactions total`}
          </p>
        </div>

        <Button
          onClick={openCreate}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add transaction
        </Button>

      </div>

      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="rounded-xl border border-white/[0.07] bg-[#16161f] p-3 sm:p-4">

        <div className="flex flex-col gap-3">

          {/* Search */}
          <div className="relative w-full">

            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />

            <Input
              placeholder="Search transactions..."
              className="h-11 pl-9 bg-[#10101d] border-white/[0.08] text-white placeholder:text-gray-600"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />

          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-2 sm:flex">

            <Select
              value={typeFilter}
              onValueChange={(value) => {
                setTypeFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full bg-[#10101d] border-white/[0.08] text-gray-200">
                <SelectValue placeholder="Type" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All types
                </SelectItem>

                <SelectItem value="income">
                  Income
                </SelectItem>

                <SelectItem value="expense">
                  Expense
                </SelectItem>

                <SelectItem value="refund">
                  Refund
                </SelectItem>

                <SelectItem value="transfer">
                  Transfer
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={categoryFilter}
              onValueChange={(value) => {
                setCategoryFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full bg-[#10101d] border-white/[0.08] text-gray-200">
                <Filter className="mr-1.5 h-3.5 w-3.5 shrink-0" />

                <SelectValue placeholder="Category" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All categories
                </SelectItem>

                {categories?.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          </div>
        </div>

        {/* Active filters */}
        {activeFilters.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">

            <span className="text-xs text-gray-600">
              Filtered by:
            </span>

            {activeFilters.map((filter) => (
              <Badge
                key={filter}
                variant="outline"
                className="border-indigo-500/20 bg-indigo-500/10 text-indigo-300"
              >
                {filter}
              </Badge>
            ))}

            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-gray-500 underline underline-offset-2 hover:text-gray-300"
            >
              Clear
            </button>

          </div>
        )}
      </div>

      {/* =================================================
          MOBILE LIST
      ================================================= */}

      <div className="md:hidden overflow-hidden rounded-xl border border-white/[0.07] bg-[#16161f]">

        {isLoading ? (
          <div className="space-y-3 p-4">

            {Array(6)
              .fill(0)
              .map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-28 rounded-xl bg-[#10101d]"
                />
              ))}

          </div>
        ) : transactions.length === 0 ? (
          <div className="px-5 py-16 text-center">

            <Receipt className="mx-auto mb-3 h-9 w-9 text-gray-700" />

            <p className="font-medium text-gray-300">
              No transactions found
            </p>

            <p className="mt-1 text-sm text-gray-600">
              {isFiltering
                ? "Try changing your filters."
                : "Add your first transaction."}
            </p>

            {isFiltering && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 text-sm text-indigo-400"
              >
                Clear filters
              </button>
            )}

          </div>
        ) : (
          <div>

            {transactions.map((transaction) => (
              <MobileTransactionCard
                key={transaction.id}
                transaction={transaction}
                onEdit={openEdit}
                onDelete={(id) =>
                  deleteMutation.mutate(id)
                }
                deleting={
                  deleteMutation.isPending
                }
              />
            ))}

          </div>
        )}

      </div>

      {/* =================================================
          DESKTOP TABLE
      ================================================= */}

      <div className="hidden md:block overflow-hidden rounded-xl border border-white/[0.07] bg-[#16161f]">

        {isLoading ? (
          <div className="space-y-3 p-4">

            {Array(7)
              .fill(0)
              .map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-16 rounded-lg bg-[#10101d]"
                />
              ))}

          </div>
        ) : transactions.length === 0 ? (
          <div className="py-20 text-center">

            <Receipt className="mx-auto mb-4 h-10 w-10 text-gray-700" />

            <p className="font-medium text-gray-300">
              No transactions found
            </p>

            <p className="mt-1 text-sm text-gray-600">
              {isFiltering
                ? "Try changing your filters."
                : "Add your first transaction to get started."}
            </p>

            {isFiltering && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 text-sm text-indigo-400"
              >
                Clear filters
              </button>
            )}

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px]">

              <thead>
                <tr className="border-b border-white/[0.06]">

                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                    Transaction
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                    Description
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                    Category
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                    Date
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                    Type
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">
                    Amount
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>

                {transactions.map((transaction) => {
                  const typeStyle =
                    TYPE_STYLES[
                      transaction.type
                    ] || TYPE_STYLES.expense;

                  const description =
                    transaction.notes?.trim() ||
                    "No description";

                  const amountColor =
                    transaction.type === "income"
                      ? "#34D399"
                      : transaction.type === "refund"
                      ? "#60A5FA"
                      : "#F87171";

                  return (
                    <tr
                      key={transaction.id}
                      className="border-b border-white/[0.045] last:border-b-0 hover:bg-white/[0.02] transition-colors"
                    >

                      {/* Transaction */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
                            style={{
                              background:
                                transaction.Category
                                  ?.color ||
                                "#6366F1",
                            }}
                          >
                            {transaction.title
                              ?.charAt(0)
                              .toUpperCase() ||
                              "T"}
                          </div>

                          <div className="min-w-0">

                            <p className="max-w-[180px] truncate text-sm font-medium text-gray-200">
                              {transaction.title}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-600">
                              {transaction.currency ||
                                "INR"}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* Description */}
                      <td className="px-5 py-4">

                        <p
                          className={`max-w-[260px] truncate text-sm ${
                            transaction.notes
                              ? "text-gray-400"
                              : "italic text-gray-700"
                          }`}
                          title={description}
                        >
                          {description}
                        </p>

                      </td>

                      {/* Category */}
                      <td className="px-5 py-4">

                        {transaction.Category ? (
                          <div className="flex items-center gap-2">

                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{
                                background:
                                  transaction.Category
                                    .color ||
                                  "#6366F1",
                              }}
                            />

                            <span className="text-sm text-gray-400">
                              {
                                transaction.Category
                                  .name
                              }
                            </span>

                          </div>
                        ) : (
                          <span className="text-sm text-gray-700">
                            —
                          </span>
                        )}

                      </td>

                      {/* Date */}
                      <td className="px-5 py-4">

                        <span className="text-sm text-gray-400">
                          {transaction.date}
                        </span>

                      </td>

                      {/* Type */}
                      <td className="px-5 py-4">

                        <span
                          className="inline-flex rounded-md px-2 py-1 text-xs font-medium capitalize"
                          style={{
                            background:
                              typeStyle.background,
                            color:
                              typeStyle.color,
                          }}
                        >
                          {transaction.type}
                        </span>

                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4 text-right">

                        <span
                          className="text-sm font-semibold"
                          style={{
                            color: amountColor,
                          }}
                        >
                          {transaction.type ===
                          "income"
                            ? "+"
                            : "-"}

                          {formatCurrency(
                            transaction.amount,
                            transaction.currency
                          )}
                        </span>

                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-1">

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:bg-white/[0.05] hover:text-gray-200"
                            onClick={() =>
                              openEdit(transaction)
                            }
                            title="Edit transaction"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-600 hover:bg-red-500/10 hover:text-red-400"
                            onClick={() =>
                              deleteMutation.mutate(
                                transaction.id
                              )
                            }
                            disabled={
                              deleteMutation.isPending
                            }
                            title="Delete transaction"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>
            </table>

          </div>
        )}

      </div>

      {/* =================================================
          PAGINATION
      ================================================= */}

      {!isFiltering &&
        pagination.totalPages > 1 && (
          <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-[#16161f] px-4 py-3">

            <p className="text-sm text-gray-600">
              Page {page} of{" "}
              {pagination.totalPages}
            </p>

            <div className="flex gap-2">

              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() =>
                  setPage((p) => p - 1)
                }
                className="border-white/[0.08] bg-transparent text-gray-300 hover:bg-white/[0.04]"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={
                  page === pagination.totalPages
                }
                onClick={() =>
                  setPage((p) => p + 1)
                }
                className="border-white/[0.08] bg-transparent text-gray-300 hover:bg-white/[0.04]"
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>

            </div>
          </div>
        )}

      {/* =================================================
          FORM DIALOG
      ================================================= */}

      <Dialog
        open={showForm}
        onOpenChange={setShowForm}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[90vh] overflow-y-auto">

          <DialogHeader>
            <DialogTitle>
              {editTransaction
                ? "Edit transaction"
                : "New transaction"}
            </DialogTitle>
          </DialogHeader>

          <TransactionForm
            transaction={editTransaction}
            categories={categories}
            onClose={() =>
              setShowForm(false)
            }
            onSuccess={() => {
              queryClient.invalidateQueries({
                queryKey: ["transactions"],
              });

              queryClient.invalidateQueries({
                queryKey: ["dashboard"],
              });
            }}
          />

        </DialogContent>
      </Dialog>
    </div>
  );
}