import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit, PiggyBank } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/hooks/use-toast";
import api from "@/lib/axios";

const formatCurrency = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);

function BudgetForm({ budget, categories, onClose, onSuccess }) {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: budget
      ? {
          categoryId: budget.categoryId,
          amount: budget.amount,
          currency: budget.currency,
          periodType: budget.periodType,
          periodStart: budget.periodStart,
          periodEnd: budget.periodEnd,
          rollover: budget.rollover,
        }
      : {
          currency: "INR",
          periodType: "monthly",
          periodStart: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1,
          )
            .toISOString()
            .split("T")[0],
          periodEnd: new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            0,
          )
            .toISOString()
            .split("T")[0],
        },
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (budget) {
        await api.patch(`/budgets/${budget.id}`, data);
        toast({ title: "Budget updated" });
      } else {
        await api.post("/budgets", data);
        toast({ title: "Budget created" });
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
      {!budget && (
        <div className="space-y-2">
          <Label>Category</Label>
          <Select onValueChange={(v) => setValue("categoryId", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories
                ?.filter((c) => c.type === "expense")
                .map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="5000"
            {...register("amount", { required: true })}
          />
        </div>
        <div className="space-y-2">
          <Label>Currency</Label>
          <Input placeholder="INR" {...register("currency")} />
        </div>
        <div className="space-y-2">
          <Label>Period Start</Label>
          <Input type="date" {...register("periodStart", { required: true })} />
        </div>
        <div className="space-y-2">
          <Label>Period End</Label>
          <Input type="date" {...register("periodEnd", { required: true })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Period Type</Label>
        <Select
          onValueChange={(v) => setValue("periodType", v)}
          defaultValue={watch("periodType")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
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
          {loading ? "Saving..." : budget ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}

export default function BudgetsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editBudget, setEditBudget] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: budgets, isLoading } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => api.get("/budgets").then((r) => r.data.budgets),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories").then((r) => r.data.categories),
  });

  const { data: statuses } = useQuery({
    queryKey: ["budget-statuses", budgets],
    enabled: !!budgets?.length,
    queryFn: async () => {
      const results = await Promise.all(
        budgets.map((b) =>
          api.get(`/budgets/${b.id}/status`).then((r) => r.data),
        ),
      );
      return results;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/budgets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["budgets"]);
      toast({ title: "Budget deleted" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-200">Budgets</h1>
          <p className="text-gray-500 text-sm mt-1">
            {budgets?.length || 0} active budgets
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            setEditBudget(null);
            setShowForm(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Budget
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
        </div>
      ) : budgets?.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-16 text-gray-400">
            <PiggyBank className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No budgets yet</p>
            <p className="text-sm mt-1">
              Create a budget to track your spending limits
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets?.map((budget, index) => {
            const status = statuses?.[index];
            const pct = status?.percentageUsed || 0;
            const isOverrun = status?.isOverrun;
            return (
              <Card key={budget.id} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: budget.Category?.color || "#6366f1",
                        }}
                      >
                        <PiggyBank className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {budget.Category?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {budget.periodStart} — {budget.periodEnd}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {isOverrun && (
                        <Badge variant="destructive" className="text-xs">
                          Overrun
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditBudget(budget);
                          setShowForm(true);
                        }}
                      >
                        <Edit className="w-3.5 h-3.5 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => deleteMutation.mutate(budget.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </Button>
                    </div>
                  </div>
                  <Progress
                    value={Math.min(pct, 100)}
                    className={`h-2 mb-2 ${isOverrun ? "bg-red-100" : "bg-gray-100"}`}
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      Spent:{" "}
                      <span className="font-medium text-gray-900">
                        {formatCurrency(status?.spent || 0, budget.currency)}
                      </span>
                    </span>
                    <span className="text-gray-500">
                      Limit:{" "}
                      <span className="font-medium text-gray-900">
                        {formatCurrency(budget.amount, budget.currency)}
                      </span>
                    </span>
                  </div>
                  <p
                    className={`text-xs mt-1 ${isOverrun ? "text-red-500" : "text-gray-400"}`}
                  >
                    {pct}% used
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editBudget ? "Edit Budget" : "New Budget"}
            </DialogTitle>
          </DialogHeader>
          <BudgetForm
            budget={editBudget}
            categories={categories}
            onClose={() => setShowForm(false)}
            onSuccess={() => queryClient.invalidateQueries(["budgets"])}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
