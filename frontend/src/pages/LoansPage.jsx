import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useToast } from "@/components/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

import { usePDFExport } from '@/components/hooks/usePDFExport';
import { Download } from 'lucide-react';

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
import {
  PlusCircle,
  Pencil,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

const cardStyle = {
  background: "#16161F",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 14,
};

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

export default function LoansPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedPerson, setSelectedPerson] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editLoan, setEditLoan] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [settleId, setSettleId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const { ref, exportPDF, exporting } = usePDFExport('smartmoney-transactions');
  const contactsQuery = useQuery({
    queryKey: ["loans-contacts"],
    queryFn: () => api.get("/loans/contacts").then((r) => r.data.contacts),
    enabled: !selectedPerson,
  });

  const personQuery = useQuery({
    queryKey: ["loans-person", selectedPerson],
    queryFn: () =>
      api
        .get(`/loans/person/${encodeURIComponent(selectedPerson)}`)
        .then((r) => r.data),
    enabled: !!selectedPerson,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["loans-contacts"] });
    queryClient.invalidateQueries({ queryKey: ["loans-person"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  }

  const createMutation = useMutation({
    mutationFn: (body) => api.post("/loans", body),
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
      toast({ title: "Entry added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => api.patch(`/loans/${id}`, body),
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
      toast({ title: "Entry updated" });
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/loans/${id}`),
    onSuccess: () => {
      invalidate();
      setDeleteId(null);
      toast({ title: "Entry deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const settleMutation = useMutation({
    mutationFn: (id) => api.patch(`/loans/${id}/settle`),
    onSuccess: () => {
      invalidate();
      setSettleId(null);
      toast({ title: "Marked as settled" });
    },
    onError: () => toast({ title: "Failed to settle", variant: "destructive" }),
  });

  function openCreate(presetPerson) {
    setEditLoan(null);
    setForm({ ...EMPTY_FORM, personName: presetPerson || "" });
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

  function handleSubmit(e) {
    e.preventDefault();
    const body = {
      ...form,
      principalAmount: parseFloat(form.principalAmount),
      interestRate: parseFloat(form.interestRate) || 0,
      dueDate: form.dueDate || null,
      notes: form.notes || null,
    };
    if (editLoan) updateMutation.mutate({ id: editLoan.id, body });
    else createMutation.mutate(body);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  // ---------------- CONTACT LIST VIEW ----------------
  if (!selectedPerson) {
    const contacts = contactsQuery.data || [];
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#F0F0F5" }}>
              Loans
            </h1>
            <p className="text-sm" style={{ color: "#8888A0" }}>
              Track who owes you and who you owe
            </p>
          </div>
          <Button onClick={() => openCreate()}>
            <PlusCircle className="mr-2 h-4 w-4" /> New entry
          </Button>
        </div>

        {contactsQuery.isLoading ? (
          <p style={{ color: "#8888A0" }}>Loading...</p>
        ) : contacts.length === 0 ? (
          <div style={cardStyle} className="py-12 text-center">
            <p style={{ color: "#8888A0" }}>No loan entries yet.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {contacts.map((c) => (
              <div
                key={c.personName}
                style={cardStyle}
                className="p-4 cursor-pointer hover:border-white/20 transition-colors"
                onClick={() => setSelectedPerson(c.personName)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold" style={{ color: "#F0F0F5" }}>
                      {c.personName}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#8888A0" }}>
                      {c.entryCount} entries
                    </p>
                  </div>
                  <ChevronRight
                    className="h-4 w-4"
                    style={{ color: "#8888A0" }}
                  />
                </div>
                <div className="mt-3">
                  {c.netBalance === 0 ? (
                    <Badge variant="secondary">Settled up</Badge>
                  ) : c.netBalance > 0 ? (
                    <div>
                      <p className="text-xs" style={{ color: "#8888A0" }}>
                        They owe you
                      </p>
                      <p
                        className="text-lg font-bold"
                        style={{ color: "#00C896" }}
                      >
                        {formatCurrency(c.netBalance, c.currency)}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs" style={{ color: "#8888A0" }}>
                        You owe them
                      </p>
                      <p
                        className="text-lg font-bold"
                        style={{ color: "#FF6B6B" }}
                      >
                        {formatCurrency(Math.abs(c.netBalance), c.currency)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <EntryDialog
          open={dialogOpen}
          setOpen={setDialogOpen}
          form={form}
          setForm={setForm}
          editLoan={editLoan}
          onSubmit={handleSubmit}
          isPending={isPending}
          lockPerson={false}
        />
      </div>
    );
  }

  // ---------------- PERSON DIARY VIEW ----------------
  const data = personQuery.data;
  const entries = data?.entries || [];
  const netBalance = data?.netBalance || 0;

  return (
    <div className="space-y-6" ref={ref}>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedPerson(null)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold" style={{ color: "#F0F0F5" }}>
            {selectedPerson}
          </h1>
          <p className="text-sm" style={{ color: "#8888A0" }}>
            Loan diary
          </p>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          <Button variant="outline" className="bg-[#147bbf]" onClick={exportPDF} disabled={exporting}>
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Exporting...' : 'Download PDF'}
          </Button>
          <Button onClick={() => openCreate(selectedPerson)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add entry
          </Button>
        </div>
      </div>

      {/* Net balance summary */}
      <div style={cardStyle} className="p-6 text-center">
        {netBalance === 0 ? (
          <>
            <p className="text-sm" style={{ color: "#8888A0" }}>
              All settled up
            </p>
            <p className="text-3xl font-bold mt-1" style={{ color: "#F0F0F5" }}>
              ₹0
            </p>
          </>
        ) : netBalance > 0 ? (
          <>
            <p className="text-sm" style={{ color: "#8888A0" }}>
              {selectedPerson} owes you
            </p>
            <p className="text-3xl font-bold mt-1" style={{ color: "#00C896" }}>
              {formatCurrency(netBalance)}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm" style={{ color: "#8888A0" }}>
              You owe {selectedPerson}
            </p>
            <p className="text-3xl font-bold mt-1" style={{ color: "#FF6B6B" }}>
              {formatCurrency(Math.abs(netBalance))}
            </p>
          </>
        )}
      </div>

      {/* Entries list */}
      <div className="space-y-3">
        {personQuery.isLoading ? (
          <p style={{ color: "#8888A0" }}>Loading...</p>
        ) : entries.length === 0 ? (
          <p style={{ color: "#8888A0" }}>No entries yet.</p>
        ) : (
          entries.map((loan) => (
            <div key={loan.id} style={cardStyle} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant={loan.type === "given" ? "default" : "secondary"}
                    >
                      {loan.type === "given" ? "You gave" : "You took"}
                    </Badge>
                    {loan.status === "settled" && (
                      <Badge variant="outline">Settled</Badge>
                    )}
                    {loan.status === "overdue" && (
                      <Badge variant="destructive">Overdue</Badge>
                    )}
                  </div>
                  <p className="text-lg font-bold" style={{ color: "#F0F0F5" }}>
                    {formatCurrency(loan.principal, loan.currency)}
                    {loan.interestAccrued > 0 && (
                      <span
                        className="text-sm font-normal ml-2"
                        style={{ color: "#8888A0" }}
                      >
                        + {formatCurrency(loan.interestAccrued, loan.currency)}{" "}
                        interest
                      </span>
                    )}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#8888A0" }}>
                    {new Date(loan.startDate).toLocaleDateString("en-IN")}
                    {loan.dueDate &&
                      ` · Due ${new Date(loan.dueDate).toLocaleDateString("en-IN")}`}
                    {loan.interestRate > 0 &&
                      ` · ${loan.interestRate}% ${loan.interestType}`}
                  </p>
                  {loan.notes && (
                    <p
                      className="text-xs mt-1 italic"
                      style={{ color: "#8888A0" }}
                    >
                      {loan.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {loan.status !== "settled" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSettleId(loan.id)}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(loan)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteId(loan.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <EntryDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        form={form}
        setForm={setForm}
        editLoan={editLoan}
        onSubmit={handleSubmit}
        isPending={isPending}
        lockPerson={true}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the loan entry only. The related transaction in your
              Transactions list will be kept for your records.
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
              This records the entry as fully repaid today and creates a
              balancing transaction.
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

function EntryDialog({
  open,
  setOpen,
  form,
  setForm,
  editLoan,
  onSubmit,
  isPending,
  lockPerson,
}) {
  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editLoan ? "Edit entry" : "Add entry"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Person name</Label>
              <Input
                placeholder="Name"
                value={form.personName}
                onChange={(e) => update("personName", e.target.value)}
                required
                disabled={lockPerson}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => update("type", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="given">You gave (lent)</SelectItem>
                  <SelectItem value="taken">You took (borrowed)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={form.principalAmount}
                onChange={(e) => update("principalAmount", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input
                placeholder="INR"
                value={form.currency}
                onChange={(e) =>
                  update("currency", e.target.value.toUpperCase())
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
                onChange={(e) => update("interestRate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Interest type</Label>
              <Select
                value={form.interestType}
                onValueChange={(v) => update("interestType", v)}
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
              <Label>Date</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => update("startDate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Due date (optional)</Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => update("dueDate", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Optional notes..."
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : editLoan ? "Update" : "Add entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
