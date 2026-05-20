import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useToast } from "@/components/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Pencil, Trash2, CheckCircle2 } from "lucide-react";

const EMPTY_FORM = {
  personName: "",
  type: "given",
  principalAmount: "",
  currency: "INR",
  interestRate: "0",
  interestType: "simple",
  startDate: new Date().toISOString().slice(0, 10),
  dueDate: "",
  notes: "",
};

function formatCurrency(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function statusBadge(status) {
  const map = {
    active: "default",
    settled: "secondary",
    overdue: "destructive",
  };
  return <Badge variant={map[status] || "default"}>{status}</Badge>;
}

export default function LoansPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("given");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editLoan, setEditLoan] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [settleId, setSettleId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data, isLoading } = useQuery({
    queryKey: ["loans", activeTab],
    queryFn: () =>
      api.get(`/loans?type=${activeTab}`).then((r) => r.data.loans),
  });

  const loans = data || [];

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["loans"] });
  }

  const createMutation = useMutation({
    mutationFn: (body) => api.post("/loans", body),
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
      toast({ title: "Loan added" });
    },
    onError: () =>
      toast({ title: "Failed to save loan", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => api.patch(`/loans/${id}`, body),
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
      toast({ title: "Loan updated" });
    },
    onError: () =>
      toast({ title: "Failed to update loan", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/loans/${id}`),
    onSuccess: () => {
      invalidate();
      setDeleteId(null);
      toast({ title: "Loan deleted" });
    },
    onError: () =>
      toast({ title: "Failed to delete loan", variant: "destructive" }),
  });

  const settleMutation = useMutation({
    mutationFn: (id) => api.patch(`/loans/${id}/settle`),
    onSuccess: () => {
      invalidate();
      setSettleId(null);
      toast({ title: "Loan marked as settled" });
    },
    onError: () =>
      toast({ title: "Failed to settle loan", variant: "destructive" }),
  });

  function openCreate() {
    setEditLoan(null);
    setForm({ ...EMPTY_FORM, type: activeTab });
    setDialogOpen(true);
  }

  function openEdit(loan) {
    setEditLoan(loan);
    setForm({
      personName: loan.personName,
      type: loan.type,
      principalAmount: String(loan.principalAmount),
      currency: loan.currency,
      interestRate: String(loan.interestRate),
      interestType: loan.interestType,
      startDate: loan.startDate,
      dueDate: loan.dueDate || "",
      notes: loan.notes || "",
    });
    setDialogOpen(true);
  }

  function handleFormChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const body = {
      ...form,
      principalAmount: parseFloat(form.principalAmount),
      interestRate: parseFloat(form.interestRate) || 0,
      dueDate: form.dueDate || null,
      notes: form.notes || null,
    };
    if (editLoan) {
      updateMutation.mutate({ id: editLoan.id, body });
    } else {
      createMutation.mutate(body);
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Loans</h1>
          <p className="text-muted-foreground text-sm">
            Track money you lent or borrowed
          </p>
        </div>
        <Button onClick={openCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add loan
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="given">Given (lent)</TabsTrigger>
          <TabsTrigger value="taken">Taken (borrowed)</TabsTrigger>
        </TabsList>

        {["given", "taken"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            {isLoading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : loans.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No {tab === "given" ? "lent" : "borrowed"} loans yet.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {loans.map((loan) => (
                  <LoanCard
                    key={loan.id}
                    loan={loan}
                    onEdit={() => openEdit(loan)}
                    onDelete={() => setDeleteId(loan.id)}
                    onSettle={() => setSettleId(loan.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editLoan ? "Edit loan" : "Add loan"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Person name</Label>
                <Input
                  placeholder="Name"
                  value={form.personName}
                  onChange={(e) =>
                    handleFormChange("personName", e.target.value)
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => handleFormChange("type", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="given">Given (lent)</SelectItem>
                    <SelectItem value="taken">Taken (borrowed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Principal amount</Label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={form.principalAmount}
                  onChange={(e) =>
                    handleFormChange("principalAmount", e.target.value)
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input
                  placeholder="INR"
                  value={form.currency}
                  onChange={(e) =>
                    handleFormChange("currency", e.target.value.toUpperCase())
                  }
                  maxLength={10}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Interest rate (%/year)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0"
                  value={form.interestRate}
                  onChange={(e) =>
                    handleFormChange("interestRate", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Interest type</Label>
                <Select
                  value={form.interestType}
                  onValueChange={(v) => handleFormChange("interestType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="compound">Compound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start date</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    handleFormChange("startDate", e.target.value)
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Due date (optional)</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => handleFormChange("dueDate", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Optional notes..."
                value={form.notes}
                onChange={(e) => handleFormChange("notes", e.target.value)}
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : editLoan ? "Update" : "Add loan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete loan?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Settle confirm */}
      <AlertDialog open={!!settleId} onOpenChange={() => setSettleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as settled?</AlertDialogTitle>
            <AlertDialogDescription>
              This will record the loan as fully repaid today.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => settleMutation.mutate(settleId)}>
              Settle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function LoanCard({ loan, onEdit, onDelete, onSettle }) {
  const isGiven = loan.type === "given";

  return (
    <Card
      className={`border-l-4 ${isGiven ? "border-l-green-500" : "border-l-red-500"}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{loan.personName}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Since {new Date(loan.startDate).toLocaleDateString("en-IN")}
              {loan.dueDate && (
                <>
                  {" "}
                  &middot; Due{" "}
                  {new Date(loan.dueDate).toLocaleDateString("en-IN")}
                </>
              )}
            </p>
          </div>
          {statusBadge(loan.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Principal</p>
            <p className="font-medium">
              {formatCurrency(loan.principal, loan.currency)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Interest</p>
            <p className="font-medium">
              {formatCurrency(loan.interestAccrued, loan.currency)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Total owed</p>
            <p
              className={`font-semibold ${isGiven ? "text-green-600" : "text-red-600"}`}
            >
              {formatCurrency(loan.totalOwed, loan.currency)}
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {loan.interestRate}% per year &middot; {loan.interestType} &middot;{" "}
          {loan.daysElapsed} days elapsed
        </p>

        {loan.notes && (
          <p className="text-xs text-muted-foreground line-clamp-2 italic">
            {loan.notes}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          {loan.status !== "settled" && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={onSettle}
            >
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              Settle
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="outline" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
