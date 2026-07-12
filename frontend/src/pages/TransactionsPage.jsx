import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, Trash2, Edit, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import api from "@/lib/axios";
import { useToast } from "@/components/hooks/use-toast";

const formatCurrency = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);

const card = { background: "#13131E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 };
const innerCard = { background: "#1A1A2E", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 };

const TYPE_COLORS = {
  income:   { bg: "rgba(0,200,150,0.12)",  color: "#00C896" },
  expense:  { bg: "rgba(255,107,107,0.12)", color: "#FF6B6B" },
  refund:   { bg: "rgba(79,142,247,0.12)",  color: "#4F8EF7" },
  transfer: { bg: "rgba(139,92,246,0.12)",  color: "#8B5CF6" },
};

// ── filter helper (client-side so we can filter by category name & amount) ──
function applyFilters(transactions, { search, typeFilter, categoryFilter }) {
  let list = transactions;

  if (typeFilter && typeFilter !== "all") {
    list = list.filter((t) => t.type === typeFilter);
  }

  if (categoryFilter && categoryFilter !== "all") {
    list = list.filter((t) => t.categoryId === categoryFilter);
  }

  if (search) {
    const q = search.toLowerCase().trim();
    list = list.filter((t) => {
      const matchTitle    = t.title?.toLowerCase().includes(q);
      const matchAmount   = String(t.amount).includes(q);
      const matchCategory = t.Category?.name?.toLowerCase().includes(q);
      const matchNotes    = t.notes?.toLowerCase().includes(q);
      return matchTitle || matchAmount || matchCategory || matchNotes;
    });
  }

  return list;
}

// ── form ──
function TransactionForm({ transaction, categories, onClose, onSuccess }) {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: transaction
      ? { title: transaction.title, amount: transaction.amount, type: transaction.type,
          date: transaction.date, currency: transaction.currency,
          categoryId: transaction.categoryId, notes: transaction.notes }
      : { currency: "INR", type: "expense", date: new Date().toISOString().split("T")[0] },
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (transaction) {
        await api.patch(`/transactions/${transaction.id}`, data);
        toast({ title: "Transaction updated" });
      } else {
        await api.post("/transactions", data);
        toast({ title: "Transaction created" });
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.error?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label>Title</Label>
          <Input placeholder="e.g. Swiggy order" {...register("title", { required: true })} />
        </div>
        <div className="space-y-2">
          <Label>Amount</Label>
          <Input type="number" step="0.01" placeholder="0.00" {...register("amount", { required: true })} />
        </div>
        <div className="space-y-2">
          <Label>Currency</Label>
          <Input placeholder="INR" {...register("currency")} />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select onValueChange={(v) => setValue("type", v)} defaultValue={watch("type")}>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" {...register("date", { required: true })} />
        </div>
        <div className="col-span-2 space-y-2">
          <Label>Category</Label>
          <Select onValueChange={(v) => setValue("categoryId", v)} defaultValue={watch("categoryId")}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-2">
          <Label>Notes</Label>
          <Textarea placeholder="Optional notes..." {...register("notes")} rows={2} />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? "Saving..." : transaction ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}

// ── main page ──
export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all transactions (up to 500) so we can filter client-side by category name & amount
  const { data, isLoading } = useQuery({
    queryKey: ["transactions", page],
    queryFn: () => api.get("/transactions", { params: { page, limit: 20 } }).then((r) => r.data),
  });

  // Also fetch a larger set for client-side filtering when filters are active
  const { data: allData } = useQuery({
    queryKey: ["transactions-all-filter"],
    queryFn: () => api.get("/transactions", { params: { limit: 500 } }).then((r) => r.data),
    enabled: !!(search || typeFilter !== "all" || categoryFilter !== "all"),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories").then((r) => r.data.categories),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: "Transaction deleted" });
    },
  });

  const isFiltering = search || typeFilter !== "all" || categoryFilter !== "all";
  const sourceTransactions = isFiltering ? (allData?.transactions || []) : (data?.transactions || []);
  const transactions = isFiltering
    ? applyFilters(sourceTransactions, { search, typeFilter, categoryFilter })
    : sourceTransactions;
  const pagination = !isFiltering ? (data?.pagination || {}) : {};

  const activeFilters = [
    typeFilter !== "all" && typeFilter,
    categoryFilter !== "all" && categories?.find((c) => c.id === categoryFilter)?.name,
  ].filter(Boolean);

  function clearFilters() {
    setSearch("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setPage(1);
  }

  return (
    <div className="space-y-5 pb-8" style={{ color: "#F0F0F5" }}>
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#F0F0F5" }}>Transactions</h1>
          <p className="text-sm mt-1" style={{ color: "#8888A0" }}>
            {isFiltering
              ? `${transactions.length} result${transactions.length !== 1 ? "s" : ""} found`
              : `${data?.pagination?.total || 0} transactions total`}
          </p>
        </div>
        <Button onClick={() => { setEditTransaction(null); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add
        </Button>
      </div>

      {/* filters */}
      <div style={card} className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#8888A0" }} />
            <Input
              placeholder="Search by title, amount, category, notes..."
              className="pl-9"
              style={{ background: "#1A1A2E", border: "1px solid rgba(255,255,255,0.08)", color: "#F0F0F5" }}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {/* type filter */}
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-36" style={{ background: "#1A1A2E", border: "1px solid rgba(255,255,255,0.08)", color: "#F0F0F5" }}>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>

          {/* category filter */}
          <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-44" style={{ background: "#1A1A2E", border: "1px solid rgba(255,255,255,0.08)", color: "#F0F0F5" }}>
              <Filter className="w-3.5 h-3.5 mr-1.5" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* active filter pills */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs" style={{ color: "#8888A0" }}>Filtered by:</span>
            {activeFilters.map((f) => (
              <span key={f} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(0,200,150,0.12)", color: "#00C896" }}>{f}</span>
            ))}
            <button onClick={clearFilters} className="text-xs underline ml-1" style={{ color: "#8888A0" }}>Clear</button>
          </div>
        )}
      </div>

      {/* list */}
      <div style={card} className="overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array(8).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" style={{ background: "#1A1A2E" }} />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16" style={{ color: "#8888A0" }}>
            <Receipt className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No transactions found</p>
            {isFiltering && (
              <button onClick={clearFilters} className="text-sm underline mt-2" style={{ color: "#00C896" }}>Clear filters</button>
            )}
          </div>
        ) : (
          <div>
            {transactions.map((t, i) => {
              const typeStyle = TYPE_COLORS[t.type] || TYPE_COLORS.expense;
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between px-4 py-3 transition-colors"
                  style={{
                    borderBottom: i < transactions.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#1A1A2E"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* avatar */}
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: t.Category?.color || "#4F8EF7" }}
                    >
                      {t.title.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#F0F0F5" }}>{t.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs" style={{ color: "#8888A0" }}>{t.date}</span>
                        {t.Category && (
                          <span className="text-xs" style={{ color: "#8888A0" }}>· {t.Category.name}</span>
                        )}
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                          style={{ background: typeStyle.bg, color: typeStyle.color }}
                        >
                          {t.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-semibold" style={{ color: t.type === "income" ? "#00C896" : "#FF6B6B" }}>
                      {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount, t.currency)}
                    </span>
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8"
                      onClick={() => { setEditTransaction(t); setShowForm(true); }}
                    >
                      <Edit className="w-3.5 h-3.5" style={{ color: "#8888A0" }} />
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8"
                      onClick={() => deleteMutation.mutate(t.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" style={{ color: "#FF6B6B" }} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* pagination — only shown when not filtering */}
      {!isFiltering && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm" style={{ color: "#8888A0" }}>Page {page} of {pagination.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      {/* form dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editTransaction ? "Edit transaction" : "New transaction"}</DialogTitle>
          </DialogHeader>
          <TransactionForm
            transaction={editTransaction}
            categories={categories}
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["transactions"] });
              queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}