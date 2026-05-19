import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit, Tag } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/hooks/use-toast";
import api from "@/lib/axios";

const COLORS = [
  "#3b82f6",
  "#f97316",
  "#22c55e",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#6366f1",
];

function CategoryForm({ category, onClose, onSuccess }) {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: category
      ? {
          name: category.name,
          icon: category.icon,
          color: category.color,
          type: category.type,
        }
      : { color: "#3b82f6", type: "expense" },
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (category) {
        await api.patch(`/categories/${category.id}`, data);
        toast({ title: "Category updated" });
      } else {
        await api.post("/categories", data);
        toast({ title: "Category created" });
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
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          placeholder="e.g. Food and Dining"
          {...register("name", { required: true })}
        />
      </div>

      {!category && (
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            onValueChange={(v) => setValue("type", v)}
            defaultValue={watch("type")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Icon (name)</Label>
        <Input placeholder="e.g. utensils, car, home" {...register("icon")} />
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue("color", color)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${watch("color") === color ? "border-gray-900 scale-110" : "border-transparent"}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <Input placeholder="#3b82f6" {...register("color")} />
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
          {loading ? "Saving..." : category ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}

export default function CategoriesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories").then((r) => r.data.categories),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      toast({ title: "Category deleted" });
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.response?.data?.error?.message,
        variant: "destructive",
      });
    },
  });

  const seedMutation = useMutation({
    mutationFn: () => api.post("/categories/seed"),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      toast({ title: "Default categories created" });
    },
  });

  const income = categories?.filter((c) => c.type === "income") || [];
  const expense = categories?.filter((c) => c.type === "expense") || [];

  const CategoryCard = ({ category }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: category.color || "#6366f1" }}
        >
          <Tag className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{category.name}</p>
          {category.isDefault && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0 mt-0.5">
              Default
            </Badge>
          )}
        </div>
      </div>
      {!category.isDefault && (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setEditCategory(category);
              setShowForm(true);
            }}
          >
            <Edit className="w-3.5 h-3.5 text-gray-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => deleteMutation.mutate(category.id)}
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">
            {categories?.length || 0} categories total
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
          >
            {seedMutation.isPending ? "Seeding..." : "Seed Defaults"}
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              setEditCategory(null);
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Category
          </Button>
        </div>
      </div>

      <Tabs defaultValue="expense">
        <TabsList className="mb-4">
          <TabsTrigger value="expense">Expense ({expense.length})</TabsTrigger>
          <TabsTrigger value="income">Income ({income.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="expense">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              {isLoading ? (
                <div className="space-y-3">
                  {Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-14 rounded-lg" />
                    ))}
                </div>
              ) : expense.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Tag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No expense categories yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {expense.map((c) => (
                    <CategoryCard key={c.id} category={c} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              {isLoading ? (
                <div className="space-y-3">
                  {Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-14 rounded-lg" />
                    ))}
                </div>
              ) : income.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Tag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No income categories yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {income.map((c) => (
                    <CategoryCard key={c.id} category={c} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editCategory ? "Edit Category" : "New Category"}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            category={editCategory}
            onClose={() => setShowForm(false)}
            onSuccess={() => queryClient.invalidateQueries(["categories"])}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
