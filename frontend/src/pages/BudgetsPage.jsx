import { useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Edit3,
  PiggyBank,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";

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

import { useToast } from "@/components/hooks/use-toast";
import api from "@/lib/axios";

const formatCurrency = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const formatDate = (date) => {
  if (!date) return "";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getCurrentPeriod = () => {
  const now = new Date();

  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0],

    end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0],
  };
};

function BudgetForm({
  budget,
  categories,
  onClose,
  onSuccess,
}) {
  const currentPeriod = getCurrentPeriod();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
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
          categoryId: "",
          amount: "",
          currency: "INR",
          periodType: "monthly",
          periodStart: currentPeriod.start,
          periodEnd: currentPeriod.end,
          rollover: false,
        },
  });

  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const periodType = watch("periodType");
  const categoryId = watch("categoryId");

  const onSubmit = async (formData) => {
    if (!budget && !categoryId) {
      toast({
        title: "Category required",
        description: "Please select an expense category.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
      };

      if (budget) {
        await api.patch(`/budgets/${budget.id}`, payload);

        toast({
          title: "Budget updated",
          description: "Your budget has been updated successfully.",
        });
      } else {
        await api.post("/budgets", payload);

        toast({
          title: "Budget created",
          description: "Your new budget is ready to track.",
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: budget
          ? "Unable to update budget"
          : "Unable to create budget",
        description:
          error.response?.data?.error?.message ||
          "Please check your details and try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="budget-form"
    >
      {!budget && (
        <div className="form-field">
          <Label>Category</Label>

          <Select
            value={categoryId}
            onValueChange={(value) =>
              setValue("categoryId", value)
            }
          >
            <SelectTrigger className="form-control">
              <SelectValue placeholder="Select expense category" />
            </SelectTrigger>

            <SelectContent>
              {categories
                ?.filter((category) => category.type === "expense")
                .map((category) => (
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
      )}

      <div className="form-grid">
        <div className="form-field">
          <Label>Budget amount</Label>

          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="5000"
            className="form-control"
            {...register("amount", {
              required: "Enter a budget amount",
              min: {
                value: 0.01,
                message: "Amount must be greater than zero",
              },
            })}
          />

          {errors.amount && (
            <span className="form-error">
              {errors.amount.message}
            </span>
          )}
        </div>

        <div className="form-field">
          <Label>Currency</Label>

          <Input
            placeholder="INR"
            className="form-control"
            {...register("currency", {
              required: "Currency is required",
            })}
          />
        </div>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <Label>Period start</Label>

          <Input
            type="date"
            className="form-control"
            {...register("periodStart", {
              required: "Start date is required",
            })}
          />
        </div>

        <div className="form-field">
          <Label>Period end</Label>

          <Input
            type="date"
            className="form-control"
            {...register("periodEnd", {
              required: "End date is required",
            })}
          />
        </div>
      </div>

      <div className="form-field">
        <Label>Budget period</Label>

        <Select
          value={periodType}
          onValueChange={(value) =>
            setValue("periodType", value)
          }
        >
          <SelectTrigger className="form-control">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="monthly">
              Monthly
            </SelectItem>

            <SelectItem value="weekly">
              Weekly
            </SelectItem>

            <SelectItem value="custom">
              Custom
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="form-actions">
        <Button
          type="button"
          variant="outline"
          className="form-button cancel-button"
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          className="form-button save-button"
          disabled={saving}
        >
          {saving && (
            <RefreshCw
              size={15}
              className="mr-2 animate-spin"
            />
          )}

          {saving
            ? "Saving..."
            : budget
              ? "Save changes"
              : "Create budget"}
        </Button>
      </div>
    </form>
  );
}

function BudgetCard({
  budget,
  status,
  onEdit,
  onDelete,
  deleting,
}) {
  const percentage = Number(
    status?.percentageUsed || 0,
  );

  const spent = Number(status?.spent || 0);
  const limit = Number(budget.amount || 0);

  const isOverrun = Boolean(status?.isOverrun);
  const isNearLimit =
    !isOverrun && percentage >= 80;

  const progress = Math.min(
    Math.max(percentage, 0),
    100,
  );

  const remaining = Math.max(limit - spent, 0);

  return (
    <Card className="budget-card">
      <CardContent className="budget-card-content">
        {/* Top */}
        <div className="budget-top">
          <div className="budget-category">
            <div
              className="category-icon"
              style={{
                backgroundColor:
                  budget.Category?.color || "#6366f1",
              }}
            >
              <PiggyBank size={17} />
            </div>

            <div className="category-info">
              <p className="category-name">
                {budget.Category?.name || "Unknown category"}
              </p>

              <div className="category-period">
                <CalendarDays size={11} />

                <span>
                  {formatDate(budget.periodStart)}
                  {" — "}
                  {formatDate(budget.periodEnd)}
                </span>
              </div>
            </div>
          </div>

          <div className="budget-actions">
            {isOverrun && (
              <Badge className="status-badge danger">
                Over budget
              </Badge>
            )}

            {isNearLimit && (
              <Badge className="status-badge warning">
                Near limit
              </Badge>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="icon-button"
              onClick={onEdit}
              aria-label="Edit budget"
            >
              <Edit3 size={15} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="icon-button delete"
              onClick={onDelete}
              disabled={deleting}
              aria-label="Delete budget"
            >
              {deleting ? (
                <RefreshCw
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Trash2 size={15} />
              )}
            </Button>
          </div>
        </div>

        {/* Amount */}
        <div className="budget-numbers">
          <div>
            <span className="spent-label">
              Spent
            </span>

            <strong className="spent-value">
              {formatCurrency(
                spent,
                budget.currency,
              )}
            </strong>
          </div>

          <div className="limit-info">
            <span className="spent-label">
              Budget
            </span>

            <strong className="limit-value">
              {formatCurrency(
                limit,
                budget.currency,
              )}
            </strong>
          </div>
        </div>

        {/* Progress */}
        <div className="progress-section">
          <div className="progress-header">
            <span>
              {percentage.toFixed(0)}% used
            </span>

            {!isOverrun && (
              <span>
                {formatCurrency(
                  remaining,
                  budget.currency,
                )}{" "}
                remaining
              </span>
            )}

            {isOverrun && (
              <span className="overrun-text">
                {formatCurrency(
                  spent - limit,
                  budget.currency,
                )}{" "}
                over
              </span>
            )}
          </div>

          <div
            className={`budget-progress ${
              isOverrun
                ? "overrun"
                : isNearLimit
                  ? "warning"
                  : ""
            }`}
          >
            <Progress value={progress} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BudgetsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editBudget, setEditBudget] = useState(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: budgets = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["budgets"],
    queryFn: () =>
      api.get("/budgets").then(
        (response) => response.data.budgets,
      ),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      api.get("/categories").then(
        (response) => response.data.categories,
      ),
  });

  const {
    data: statuses = [],
    isLoading: statusesLoading,
  } = useQuery({
    queryKey: ["budget-statuses", budgets],
    enabled: budgets.length > 0,
    queryFn: async () => {
      return Promise.all(
        budgets.map((budget) =>
          api
            .get(`/budgets/${budget.id}/status`)
            .then((response) => response.data),
        ),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`/budgets/${id}`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["budgets"],
      });

      toast({
        title: "Budget deleted",
        description: "The budget has been removed.",
      });
    },

    onError: () => {
      toast({
        title: "Unable to delete budget",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const totalBudget = useMemo(
    () =>
      budgets.reduce(
        (sum, budget) =>
          sum + Number(budget.amount || 0),
        0,
      ),
    [budgets],
  );

  const totalSpent = useMemo(
    () =>
      statuses.reduce(
        (sum, status) =>
          sum + Number(status?.spent || 0),
        0,
      ),
    [statuses],
  );

  const overrunCount = useMemo(
    () =>
      statuses.filter(
        (status) => status?.isOverrun,
      ).length,
    [statuses],
  );

  const overallPercentage =
    totalBudget > 0
      ? Math.round(
          (totalSpent / totalBudget) * 100,
        )
      : 0;

  const openCreateForm = () => {
    setEditBudget(null);
    setShowForm(true);
  };

  const openEditForm = (budget) => {
    setEditBudget(budget);
    setShowForm(true);
  };

  return (
    <>
      <style>{`
        .budgets-page {
          min-height: calc(100vh - 7rem);
          color: #e4e4e7;
        }

        .budgets-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .budgets-heading {
          min-width: 0;
        }

        .budgets-eyebrow {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #a1a1aa;
          font-size: 0.68rem;
          font-weight: 650;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 0.45rem;
        }

        .budgets-title {
          margin: 0;
          color: #f4f4f5;
          font-size: 1.45rem;
          line-height: 1.25;
          font-weight: 650;
          letter-spacing: -0.025em;
        }

        .budgets-description {
          margin: 0.4rem 0 0;
          color: #71717a;
          font-size: 0.82rem;
        }

        .add-budget {
          height: 40px;
          border-radius: 10px;
          padding: 0 1rem;
          background: #6366f1;
          color: white;
          flex-shrink: 0;
        }

        .add-budget:hover {
          background: #5558e8;
        }

        .budget-summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.7rem;
          margin-bottom: 1.25rem;
        }

        .summary-item {
          padding: 0.9rem 1rem;
          border: 1px solid #242429;
          border-radius: 12px;
          background: #0d0d11;
        }

        .summary-label {
          display: block;
          color: #52525b;
          font-size: 0.67rem;
          margin-bottom: 0.25rem;
        }

        .summary-value {
          display: block;
          color: #e4e4e7;
          font-size: 0.95rem;
          font-weight: 600;
        }

        .summary-value.warning {
          color: #fbbf24;
        }

        .budget-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem;
        }

        .budget-card {
          overflow: hidden;
          border: 1px solid #242429;
          border-radius: 14px;
          background: #0d0d11;
          box-shadow: none;
          transition:
            border-color 0.18s ease,
            background 0.18s ease;
        }

        .budget-card:hover {
          border-color: #303038;
          background: #0f0f14;
        }

        .budget-card-content {
          padding: 1rem;
        }

        .budget-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .budget-category {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          min-width: 0;
        }

        .category-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          color: white;
          flex-shrink: 0;
          opacity: 0.9;
        }

        .category-info {
          min-width: 0;
        }

        .category-name {
          margin: 0;
          color: #e4e4e7;
          font-size: 0.82rem;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .category-period {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          margin-top: 0.2rem;
          color: #52525b;
          font-size: 0.64rem;
        }

        .budget-actions {
          display: flex;
          align-items: center;
          gap: 0.1rem;
          flex-shrink: 0;
        }

        .status-badge {
          border-radius: 6px;
          padding: 0.25rem 0.45rem;
          font-size: 0.6rem;
          font-weight: 600;
          border: 1px solid transparent;
        }

        .status-badge.danger {
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.18);
          color: #fca5a5;
        }

        .status-badge.warning {
          background: rgba(245, 158, 11, 0.08);
          border-color: rgba(245, 158, 11, 0.18);
          color: #fcd34d;
        }

        .icon-button {
          width: 30px;
          height: 30px;
          color: #52525b;
          border-radius: 8px;
        }

        .icon-button:hover {
          color: #d4d4d8;
          background: #18181d;
        }

        .icon-button.delete:hover {
          color: #f87171;
        }

        .budget-numbers {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-top: 1.25rem;
        }

        .spent-label {
          display: block;
          margin-bottom: 0.2rem;
          color: #52525b;
          font-size: 0.65rem;
        }

        .spent-value {
          color: #e4e4e7;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: -0.01em;
        }

        .limit-info {
          text-align: right;
        }

        .limit-value {
          color: #a1a1aa;
          font-size: 0.82rem;
          font-weight: 500;
        }

        .progress-section {
          margin-top: 1rem;
        }

        .progress-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin-bottom: 0.45rem;
          color: #71717a;
          font-size: 0.65rem;
        }

        .overrun-text {
          color: #f87171;
        }

        .budget-progress {
          height: 6px;
          overflow: hidden;
          border-radius: 999px;
        }

        .budget-progress [data-slot="progress-indicator"] {
          background: #6366f1;
        }

        .budget-progress.warning [data-slot="progress-indicator"] {
          background: #f59e0b;
        }

        .budget-progress.overrun [data-slot="progress-indicator"] {
          background: #ef4444;
        }

        .empty-state {
          min-height: 360px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
          padding: 2rem;
          border: 1px solid #242429;
          border-radius: 14px;
          background: #0d0d11;
        }

        .empty-icon {
          width: 54px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          background: #121219;
          border: 1px solid #292930;
          color: #818cf8;
          margin-bottom: 1rem;
        }

        .empty-title {
          margin: 0;
          color: #e4e4e7;
          font-size: 0.98rem;
          font-weight: 600;
        }

        .empty-description {
          max-width: 370px;
          margin: 0.45rem 0 1.25rem;
          color: #71717a;
          font-size: 0.77rem;
          line-height: 1.6;
        }

        .empty-button {
          height: 38px;
          border-radius: 9px;
          background: #6366f1;
        }

        .budget-skeleton-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem;
        }

        .budget-skeleton {
          height: 190px;
          border-radius: 14px;
          background: #15151a;
        }

        .budget-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .form-field label {
          color: #a1a1aa;
          font-size: 0.72rem;
          font-weight: 500;
        }

        .form-control {
          border-color: #292930;
          background: #111116;
          color: #e4e4e7;
        }

        .form-control:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.08);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem;
        }

        .form-error {
          color: #f87171;
          font-size: 0.65rem;
        }

        .form-actions {
          display: flex;
          gap: 0.65rem;
          padding-top: 0.4rem;
        }

        .form-button {
          flex: 1;
          height: 40px;
          border-radius: 9px;
        }

        .cancel-button {
          border-color: #292930;
          background: transparent;
          color: #a1a1aa;
        }

        .cancel-button:hover {
          background: #18181d;
          color: #e4e4e7;
        }

        .save-button {
          background: #6366f1;
        }

        .save-button:hover {
          background: #5558e8;
        }

        @media (max-width: 760px) {
          .budgets-page {
            min-height: calc(100vh - 5rem);
          }

          .budgets-header {
            align-items: stretch;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 1rem;
          }

          .budgets-title {
            font-size: 1.25rem;
          }

          .add-budget {
            width: 100%;
          }

          .budget-summary {
            grid-template-columns: 1fr;
          }

          .budget-grid,
          .budget-skeleton-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .budget-card-content {
            padding: 0.85rem;
          }

          .budget-top {
            gap: 0.5rem;
          }

          .category-icon {
            width: 34px;
            height: 34px;
          }

          .category-period {
            font-size: 0.59rem;
          }

          .status-badge {
            display: none;
          }

          .budget-numbers {
            margin-top: 1rem;
          }

          .spent-value {
            font-size: 0.9rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <main className="budgets-page">
        {/* Header */}
        <header className="budgets-header">
          <div className="budgets-heading">
            <div className="budgets-eyebrow">
              <PiggyBank size={12} />
              Spending limits
            </div>

            <h1 className="budgets-title">
              Budgets
            </h1>

            <p className="budgets-description">
              Set spending limits and keep your expenses on track.
            </p>
          </div>

          <Button
            className="add-budget"
            onClick={openCreateForm}
          >
            <Plus size={16} className="mr-2" />
            Add Budget
          </Button>
        </header>

        {/* Summary */}
        {!isLoading && budgets.length > 0 && (
          <div className="budget-summary">
            <div className="summary-item">
              <span className="summary-label">
                Active budgets
              </span>

              <span className="summary-value">
                {budgets.length}
              </span>
            </div>

            <div className="summary-item">
              <span className="summary-label">
                Total budget
              </span>

              <span className="summary-value">
                {formatCurrency(totalBudget)}
              </span>
            </div>

            <div className="summary-item">
              <span className="summary-label">
                Overall usage
              </span>

              <span
                className={`summary-value ${
                  overallPercentage >= 100
                    ? "warning"
                    : ""
                }`}
              >
                {overallPercentage}% ·{" "}
                {overrunCount} over
              </span>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="budget-skeleton-grid">
            {Array.from({ length: 4 }).map(
              (_, index) => (
                <Skeleton
                  key={index}
                  className="budget-skeleton"
                />
              ),
            )}
          </div>
        ) : budgets.length === 0 ? (
          /* Empty state */
          <div className="empty-state">
            <div className="empty-icon">
              <PiggyBank
                size={24}
                strokeWidth={1.7}
              />
            </div>

            <h2 className="empty-title">
              No budgets yet
            </h2>

            <p className="empty-description">
              Create your first spending limit to start
              tracking how much you spend in each category.
            </p>

            <Button
              className="empty-button"
              onClick={openCreateForm}
            >
              <Plus size={15} className="mr-2" />
              Create your first budget
            </Button>
          </div>
        ) : (
          /* Budget list */
          <div className="budget-grid">
            {budgets.map((budget, index) => {
              const status = statuses[index];

              return (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  status={status}
                  onEdit={() =>
                    openEditForm(budget)
                  }
                  onDelete={() =>
                    deleteMutation.mutate(budget.id)
                  }
                  deleting={
                    deleteMutation.isPending &&
                    deleteMutation.variables === budget.id
                  }
                />
              );
            })}
          </div>
        )}

        {/* Dialog */}
        <Dialog
          open={showForm}
          onOpenChange={setShowForm}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editBudget
                  ? "Edit budget"
                  : "Create a budget"}
              </DialogTitle>
            </DialogHeader>

            <BudgetForm
              budget={editBudget}
              categories={categories}
              onClose={() => setShowForm(false)}
              onSuccess={() =>
                queryClient.invalidateQueries({
                  queryKey: ["budgets"],
                })
              }
            />
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}