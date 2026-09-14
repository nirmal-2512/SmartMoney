import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Check,
  Edit3,
  Palette,
  Plus,
  RefreshCw,
  Tag,
  Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { useToast } from "@/components/hooks/use-toast";
import api from "@/lib/axios";

const COLORS = [
  "#6366f1",
  "#3b82f6",
  "#06b6d4",
  "#10b981",
  "#22c55e",
  "#f59e0b",
  "#f97316",
  "#ef4444",
  "#ec4899",
  "#8b5cf6",
];

function CategoryForm({
  category,
  onClose,
  onSuccess,
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: category
      ? {
          name: category.name,
          icon: category.icon || "",
          color: category.color || "#6366f1",
          type: category.type,
        }
      : {
          name: "",
          icon: "",
          color: "#6366f1",
          type: "expense",
        },
  });

  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const selectedColor = watch("color");
  const selectedType = watch("type");

  const onSubmit = async (formData) => {
    setSaving(true);

    try {
      if (category) {
        await api.patch(
          `/categories/${category.id}`,
          formData,
        );

        toast({
          title: "Category updated",
          description: "Your category has been updated.",
        });
      } else {
        await api.post("/categories", formData);

        toast({
          title: "Category created",
          description: "Your new category is ready to use.",
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: category
          ? "Unable to update category"
          : "Unable to create category",
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
      className="category-form"
    >
      {/* Name */}
      <div className="form-field">
        <Label>Category name</Label>

        <Input
          placeholder="e.g. Food & Dining"
          className="form-control"
          autoFocus
          {...register("name", {
            required: "Category name is required",
          })}
        />

        {errors.name && (
          <span className="form-error">
            {errors.name.message}
          </span>
        )}
      </div>

      {/* Type */}
      {!category && (
        <div className="form-field">
          <Label>Category type</Label>

          <Select
            value={selectedType}
            onValueChange={(value) =>
              setValue("type", value)
            }
          >
            <SelectTrigger className="form-control">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="expense">
                Expense
              </SelectItem>

              <SelectItem value="income">
                Income
              </SelectItem>
            </SelectContent>
          </Select>

          <span className="field-hint">
            Choose whether this category is used for
            money you spend or receive.
          </span>
        </div>
      )}

      {/* Icon */}
      <div className="form-field">
        <Label>Icon name</Label>

        <Input
          placeholder="e.g. utensils, car, home"
          className="form-control"
          {...register("icon")}
        />

        <span className="field-hint">
          Optional. Used to identify the category visually.
        </span>
      </div>

      {/* Color */}
      <div className="form-field">
        <div className="color-label-row">
          <Label>Category color</Label>

          <span
            className="color-preview"
            style={{
              backgroundColor:
                selectedColor || "#6366f1",
            }}
          />
        </div>

        <div className="color-grid">
          {COLORS.map((color) => {
            const selected =
              selectedColor === color;

            return (
              <button
                key={color}
                type="button"
                className={`color-option ${
                  selected ? "selected" : ""
                }`}
                style={{
                  backgroundColor: color,
                }}
                onClick={() =>
                  setValue("color", color)
                }
                aria-label={`Select color ${color}`}
              >
                {selected && (
                  <Check
                    size={14}
                    strokeWidth={2.5}
                  />
                )}
              </button>
            );
          })}
        </div>

        <Input
          placeholder="#6366f1"
          className="form-control"
          {...register("color")}
        />
      </div>

      {/* Actions */}
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
            : category
              ? "Save changes"
              : "Create category"}
        </Button>
      </div>
    </form>
  );
}

function CategoryItem({
  category,
  onEdit,
  onDelete,
  deleting,
}) {
  return (
    <div className="category-item">
      <div className="category-left">
        <div
          className="category-color"
          style={{
            backgroundColor:
              category.color || "#6366f1",
          }}
        >
          <Tag size={15} />
        </div>

        <div className="category-details">
          <div className="category-name-row">
            <span className="category-name">
              {category.name}
            </span>

            {category.isDefault && (
              <Badge className="default-badge">
                Default
              </Badge>
            )}
          </div>

          {category.icon && (
            <span className="category-icon-name">
              {category.icon}
            </span>
          )}
        </div>
      </div>

      {!category.isDefault && (
        <div className="category-actions">
          <Button
            variant="ghost"
            size="icon"
            className="category-action"
            onClick={onEdit}
            aria-label={`Edit ${category.name}`}
          >
            <Edit3 size={15} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="category-action delete"
            onClick={onDelete}
            disabled={deleting}
            aria-label={`Delete ${category.name}`}
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
      )}
    </div>
  );
}

function CategoryList({
  categories,
  isLoading,
  emptyText,
  onEdit,
  onDelete,
  deleteMutation,
}) {
  if (isLoading) {
    return (
      <div className="category-list">
        {Array.from({ length: 6 }).map(
          (_, index) => (
            <Skeleton
              key={index}
              className="category-skeleton"
            />
          ),
        )}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="category-empty">
        <div className="category-empty-icon">
          <Tag size={20} />
        </div>

        <p>{emptyText}</p>

        <span>
          Add a category to start organizing your
          transactions.
        </span>
      </div>
    );
  }

  return (
    <div className="category-list">
      {categories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          onEdit={() => onEdit(category)}
          onDelete={() =>
            onDelete(category.id)
          }
          deleting={
            deleteMutation.isPending &&
            deleteMutation.variables === category.id
          }
        />
      ))}
    </div>
  );
}

export default function CategoriesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] =
    useState(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: categories = [],
    isLoading,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      api
        .get("/categories")
        .then(
          (response) =>
            response.data.categories,
        ),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`/categories/${id}`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });

      toast({
        title: "Category deleted",
        description:
          "The category has been removed.",
      });
    },

    onError: (error) => {
      toast({
        title: "Unable to delete category",
        description:
          error.response?.data?.error?.message ||
          "Please try again.",
        variant: "destructive",
      });
    },
  });

  const seedMutation = useMutation({
    mutationFn: () =>
      api.post("/categories/seed"),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });

      toast({
        title: "Default categories added",
        description:
          "Your default categories are ready.",
      });
    },

    onError: (error) => {
      toast({
        title: "Unable to seed categories",
        description:
          error.response?.data?.error?.message ||
          "Please try again.",
        variant: "destructive",
      });
    },
  });

  const income = categories.filter(
    (category) => category.type === "income",
  );

  const expense = categories.filter(
    (category) => category.type === "expense",
  );

  const openCreateForm = () => {
    setEditCategory(null);
    setShowForm(true);
  };

  const openEditForm = (category) => {
    setEditCategory(category);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditCategory(null);
  };

  return (
    <>
      <style>{`
        .categories-page {
          min-height: calc(100vh - 7rem);
          color: #e4e4e7;
        }

        .categories-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .categories-heading {
          min-width: 0;
        }

        .categories-eyebrow {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 0.45rem;
          color: #a1a1aa;
          font-size: 0.68rem;
          font-weight: 650;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .categories-title {
          margin: 0;
          color: #f4f4f5;
          font-size: 1.45rem;
          line-height: 1.25;
          font-weight: 650;
          letter-spacing: -0.025em;
        }

        .categories-description {
          margin: 0.4rem 0 0;
          color: #71717a;
          font-size: 0.82rem;
        }

        .categories-actions {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-shrink: 0;
        }

        .seed-button {
          height: 40px;
          border-radius: 10px;
          border-color: #29292f;
          background: #111116;
          color: #a1a1aa;
        }

        .seed-button:hover {
          background: #18181d;
          border-color: #3f3f46;
          color: #e4e4e7;
        }

        .add-button {
          height: 40px;
          border-radius: 10px;
          background: #6366f1;
          color: white;
        }

        .add-button:hover {
          background: #5558e8;
        }

        .category-overview {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.7rem;
          margin-bottom: 1.25rem;
        }

        .overview-item {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          padding: 0.9rem 1rem;
          border: 1px solid #242429;
          border-radius: 12px;
          background: #0d0d11;
        }

        .overview-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: #17171d;
          color: #a5b4fc;
        }

        .overview-label {
          display: block;
          color: #52525b;
          font-size: 0.64rem;
        }

        .overview-value {
          display: block;
          margin-top: 0.1rem;
          color: #e4e4e7;
          font-size: 0.88rem;
          font-weight: 600;
        }

        .category-tabs {
          width: 100%;
        }

        .category-tabs-list {
          width: fit-content;
          margin-bottom: 0.75rem;
          padding: 3px;
          border: 1px solid #242429;
          border-radius: 9px;
          background: #0d0d11;
        }

        .category-tab {
          min-width: 105px;
          color: #71717a;
          font-size: 0.72rem;
        }

        .category-tab[data-state="active"] {
          background: #18181d;
          color: #e4e4e7;
          box-shadow: none;
        }

        .category-panel {
          border: 1px solid #242429;
          border-radius: 14px;
          background: #0d0d11;
          overflow: hidden;
        }

        .category-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.9rem 1rem;
          border-bottom: 1px solid #242429;
        }

        .panel-title {
          color: #d4d4d8;
          font-size: 0.78rem;
          font-weight: 600;
        }

        .panel-count {
          color: #52525b;
          font-size: 0.65rem;
        }

        .category-list {
          display: flex;
          flex-direction: column;
        }

        .category-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          min-height: 64px;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #1d1d22;
          transition: background 0.15s ease;
        }

        .category-item:last-child {
          border-bottom: 0;
        }

        .category-item:hover {
          background: #101014;
        }

        .category-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
        }

        .category-color {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          color: white;
          flex-shrink: 0;
        }

        .category-details {
          min-width: 0;
        }

        .category-name-row {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          min-width: 0;
        }

        .category-name {
          color: #d4d4d8;
          font-size: 0.8rem;
          font-weight: 550;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .category-icon-name {
          display: block;
          margin-top: 0.15rem;
          color: #52525b;
          font-size: 0.62rem;
        }

        .default-badge {
          padding: 0.15rem 0.4rem;
          border: 1px solid #292930;
          border-radius: 5px;
          background: #17171c;
          color: #71717a;
          font-size: 0.57rem;
          font-weight: 500;
        }

        .category-actions {
          display: flex;
          align-items: center;
          gap: 0.15rem;
          flex-shrink: 0;
        }

        .category-action {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          color: #52525b;
        }

        .category-action:hover {
          background: #18181d;
          color: #d4d4d8;
        }

        .category-action.delete:hover {
          color: #f87171;
        }

        .category-empty {
          min-height: 280px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
        }

        .category-empty-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.8rem;
          border-radius: 13px;
          background: #15151b;
          border: 1px solid #292930;
          color: #818cf8;
        }

        .category-empty p {
          margin: 0;
          color: #d4d4d8;
          font-size: 0.82rem;
          font-weight: 600;
        }

        .category-empty span {
          max-width: 320px;
          margin-top: 0.35rem;
          color: #52525b;
          font-size: 0.7rem;
          line-height: 1.5;
        }

        .category-skeleton {
          height: 64px;
          border-radius: 0;
          background: #15151a;
        }

        .category-form {
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

        .field-hint {
          color: #52525b;
          font-size: 0.62rem;
          line-height: 1.4;
        }

        .form-error {
          color: #f87171;
          font-size: 0.65rem;
        }

        .color-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .color-preview {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          border: 2px solid #292930;
        }

        .color-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .color-option {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid transparent;
          border-radius: 50%;
          color: white;
          transition:
            transform 0.15s ease,
            border-color 0.15s ease;
        }

        .color-option:hover {
          transform: scale(1.08);
        }

        .color-option.selected {
          border-color: #f4f4f5;
          box-shadow: 0 0 0 2px #111116;
        }

        .form-actions {
          display: flex;
          gap: 0.65rem;
          padding-top: 0.35rem;
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

        @media (max-width: 700px) {
          .categories-page {
            min-height: calc(100vh - 5rem);
          }

          .categories-header {
            align-items: stretch;
            flex-direction: column;
            gap: 1rem;
          }

          .categories-title {
            font-size: 1.25rem;
          }

          .categories-actions {
            width: 100%;
          }

          .seed-button,
          .add-button {
            flex: 1;
          }

          .category-overview {
            grid-template-columns: 1fr;
          }

          .category-tabs-list {
            width: 100%;
          }

          .category-tab {
            flex: 1;
            min-width: 0;
          }
        }

        @media (max-width: 460px) {
          .categories-actions {
            flex-direction: column;
          }

          .seed-button,
          .add-button {
            width: 100%;
          }

          .category-panel-header {
            padding: 0.8rem;
          }

          .category-item {
            padding: 0.7rem 0.8rem;
          }

          .category-icon-name {
            display: none;
          }

          .category-color {
            width: 34px;
            height: 34px;
          }
        }
      `}</style>

      <main className="categories-page">
        {/* Header */}
        <header className="categories-header">
          <div className="categories-heading">
            <div className="categories-eyebrow">
              <Tag size={12} />
              Organization
            </div>

            <h1 className="categories-title">
              Categories
            </h1>

            <p className="categories-description">
              Organize income and expenses to keep your
              financial data meaningful.
            </p>
          </div>

          <div className="categories-actions">
            <Button
              variant="outline"
              className="seed-button"
              onClick={() =>
                seedMutation.mutate()
              }
              disabled={seedMutation.isPending}
            >
              {seedMutation.isPending ? (
                <RefreshCw
                  size={15}
                  className="mr-2 animate-spin"
                />
              ) : (
                <RefreshCw
                  size={15}
                  className="mr-2"
                />
              )}

              {seedMutation.isPending
                ? "Adding..."
                : "Seed Defaults"}
            </Button>

            <Button
              className="add-button"
              onClick={openCreateForm}
            >
              <Plus
                size={16}
                className="mr-2"
              />
              Add Category
            </Button>
          </div>
        </header>

        {/* Overview */}
        {!isLoading && (
          <div className="category-overview">
            <div className="overview-item">
              <div className="overview-icon">
                <Tag size={15} />
              </div>

              <div>
                <span className="overview-label">
                  Expense categories
                </span>

                <span className="overview-value">
                  {expense.length}
                </span>
              </div>
            </div>

            <div className="overview-item">
              <div className="overview-icon">
                <Palette size={15} />
              </div>

              <div>
                <span className="overview-label">
                  Income categories
                </span>

                <span className="overview-value">
                  {income.length}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs
          defaultValue="expense"
          className="category-tabs"
        >
          <TabsList className="category-tabs-list">
            <TabsTrigger
              value="expense"
              className="category-tab"
            >
              Expenses ({expense.length})
            </TabsTrigger>

            <TabsTrigger
              value="income"
              className="category-tab"
            >
              Income ({income.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expense">
            <section className="category-panel">
              <div className="category-panel-header">
                <span className="panel-title">
                  Expense categories
                </span>

                <span className="panel-count">
                  {expense.length} total
                </span>
              </div>

              <CategoryList
                categories={expense}
                isLoading={isLoading}
                emptyText="No expense categories yet"
                onEdit={openEditForm}
                onDelete={(id) =>
                  deleteMutation.mutate(id)
                }
                deleteMutation={deleteMutation}
              />
            </section>
          </TabsContent>

          <TabsContent value="income">
            <section className="category-panel">
              <div className="category-panel-header">
                <span className="panel-title">
                  Income categories
                </span>

                <span className="panel-count">
                  {income.length} total
                </span>
              </div>

              <CategoryList
                categories={income}
                isLoading={isLoading}
                emptyText="No income categories yet"
                onEdit={openEditForm}
                onDelete={(id) =>
                  deleteMutation.mutate(id)
                }
                deleteMutation={deleteMutation}
              />
            </section>
          </TabsContent>
        </Tabs>

        {/* Form dialog */}
        <Dialog
          open={showForm}
          onOpenChange={(open) => {
            if (!open) closeForm();
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editCategory
                  ? "Edit category"
                  : "Create category"}
              </DialogTitle>
            </DialogHeader>

            <CategoryForm
              category={editCategory}
              onClose={closeForm}
              onSuccess={() =>
                queryClient.invalidateQueries({
                  queryKey: ["categories"],
                })
              }
            />
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}