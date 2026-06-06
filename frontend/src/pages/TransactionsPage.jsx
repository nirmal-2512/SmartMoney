import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, Trash2, Edit, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const formatCurrency = (amount, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
};

const typeColors = {
  income: "bg-green-100 text-green-700",
  expense: "bg-red-100 text-red-700",
  refund: "bg-blue-100 text-blue-700",
  transfer: "bg-purple-100 text-purple-700",
};

function TransactionForm({ transaction, categories, onClose, onSuccess }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: transaction
      ? {
          title: transaction.title,
          amount: transaction.amount,
          type: transaction.type,
          date: transaction.date,
          currency: transaction.currency,
          categoryId: transaction.categoryId,
          notes: transaction.notes,
        }
      : {
          currency: "INR",
          type: "expense",
          date: new Date().toISOString().split("T")[0],
        },
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
      toast({
        title: "Error",
        description: err.response?.data?.error?.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label>Title</Label>
          <Input
            placeholder="e.g. Samir Shop"
            {...register("title", { required: true })}
          />
        </div>
        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("amount", { required: true })}
          />
        </div>
        <div className="space-y-2">
          <Label>Currency</Label>
          <Input placeholder="INR" {...register("currency")} />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            onValueChange={(v) => setValue("type", v)}
            defaultValue={watch("type")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
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
          <Select
            onValueChange={(v) => setValue("categoryId", v)}
            defaultValue={watch("categoryId")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-2">
          <Label>Notes</Label>
          <Textarea
            placeholder="Optional notes..."
            {...register("notes")}
            rows={2}
          />
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
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Saving..." : transaction ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", page, search, typeFilter],
    queryFn: () =>
      api
        .get("/transactions", {
          params: {
            page,
            limit: 20,
            search: search || undefined,
            type: typeFilter === "all" ? undefined : typeFilter,
          },
        })
        .then((r) => r.data),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories").then((r) => r.data.categories),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["transactions"]);
      queryClient.invalidateQueries(["dashboard"]);
      toast({ title: "Transaction deleted" });
    },
  });

  const transactions = data?.transactions || [];
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-200">Transactions</h1>
          <p className="text-gray-500 text-sm mt-1">
            {pagination.total || 0} transactions total
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            setEditTransaction(null);
            setShowForm(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Select
              value={typeFilter}
              onValueChange={(v) => {
                setTypeFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array(8)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Receipt className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No transactions found</p>
              <p className="text-sm mt-1">
                Add your first transaction to get started
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{
                        backgroundColor: t.Category?.color || "#6366f1",
                      }}
                    >
                      {t.title.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {t.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">{t.date}</span>
                        {t.Category && (
                          <span className="text-xs text-gray-400">
                            · {t.Category.name}
                          </span>
                        )}
                        <Badge
                          className={`text-xs px-1.5 py-0 ${typeColors[t.type]}`}
                        >
                          {t.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`text-sm font-semibold ${t.type === "income" ? "text-green-600" : "text-red-500"}`}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {formatCurrency(t.amount, t.currency)}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditTransaction(t);
                          setShowForm(true);
                        }}
                      >
                        <Edit className="w-3.5 h-3.5 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => deleteMutation.mutate(t.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editTransaction ? "Edit Transaction" : "New Transaction"}
            </DialogTitle>
          </DialogHeader>
          <TransactionForm
            transaction={editTransaction}
            categories={categories}
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              queryClient.invalidateQueries(["transactions"]);
              queryClient.invalidateQueries(["dashboard"]);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
