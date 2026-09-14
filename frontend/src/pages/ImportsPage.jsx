import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  Clock3,
  Eye,
  Check,
  ArrowUpRight,
  FileUp,
  Sparkles,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

const statusConfig = {
  processing: {
    label: "Processing",
    icon: Clock3,
    className:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",
  },
  staged: {
    label: "Ready for review",
    icon: Eye,
    className:
      "border-indigo-400/20 bg-indigo-400/10 text-indigo-300",
  },
  confirmed: {
    label: "Imported",
    icon: CheckCircle2,
    className:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className:
      "border-red-400/20 bg-red-400/10 text-red-300",
  },
};

export default function ImportsPage() {
  const [dragging, setDragging] = useState(false);
  const [selectedImport, setSelectedImport] = useState(null);
  const [showRows, setShowRows] = useState(false);

  const fileRef = useRef();

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // ---------------------------------------------------------
  // Queries
  // ---------------------------------------------------------

  const {
    data: imports,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["imports"],
    queryFn: () =>
      api.get("/imports").then((r) => r.data.imports),
  });

  const {
    data: rows,
    isLoading: rowsLoading,
  } = useQuery({
    queryKey: ["import-rows", selectedImport?.id],
    enabled: !!selectedImport?.id && showRows,
    queryFn: () =>
      api
        .get(`/imports/${selectedImport.id}/rows`)
        .then((r) => r.data.rows),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      api.get("/categories").then((r) => r.data.categories),
  });

  // ---------------------------------------------------------
  // Upload
  // ---------------------------------------------------------

  const uploadMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData();

      formData.append("file", file);

      return api.post("/imports", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["imports"],
      });

      toast({
        title: "File uploaded",
        description:
          "Your statement has been uploaded and is ready for review.",
      });
    },

    onError: (err) => {
      toast({
        title: "Upload failed",
        description:
          err.response?.data?.error?.message ||
          "Something went wrong while uploading the file.",
        variant: "destructive",
      });
    },
  });

  // ---------------------------------------------------------
  // Confirm import
  // ---------------------------------------------------------

  const confirmMutation = useMutation({
    mutationFn: (id) =>
      api.post(`/imports/${id}/confirm`),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["imports"],
      });

      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      toast({
        title: "Import completed",
        description: `${data.data.importedCount} transactions imported successfully.`,
      });

      setShowRows(false);
    },

    onError: (err) => {
      toast({
        title: "Import failed",
        description:
          err.response?.data?.error?.message ||
          "The transactions could not be imported.",
        variant: "destructive",
      });
    },
  });

  // ---------------------------------------------------------
  // Update row category
  // ---------------------------------------------------------

  const updateRowMutation = useMutation({
    mutationFn: ({
      importId,
      rowId,
      categoryId,
    }) =>
      api.patch(
        `/imports/${importId}/rows/${rowId}`,
        {
          finalCategoryId: categoryId,
        },
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "import-rows",
          selectedImport?.id,
        ],
      });
    },

    onError: () => {
      toast({
        title: "Category update failed",
        variant: "destructive",
      });
    },
  });

  // ---------------------------------------------------------
  // File handling
  // ---------------------------------------------------------

  const handleFile = (file) => {
    if (!file) return;

    const validMimeTypes = [
      "text/csv",
      "application/pdf",
      "application/vnd.ms-excel",
    ];

    const validExtension =
      file.name.toLowerCase().endsWith(".csv") ||
      file.name.toLowerCase().endsWith(".pdf");

    if (
      !validMimeTypes.includes(file.type) &&
      !validExtension
    ) {
      toast({
        title: "Unsupported file",
        description:
          "Only CSV and PDF files are supported.",
        variant: "destructive",
      });

      return;
    }

    uploadMutation.mutate(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    setDragging(false);

    handleFile(e.dataTransfer.files?.[0]);
  };

  // ---------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------

  const totalImports = imports?.length || 0;

  const stagedImports =
    imports?.filter((item) => item.status === "staged")
      .length || 0;

  const confirmedImports =
    imports?.filter(
      (item) => item.status === "confirmed",
    ).length || 0;

  const getStatus = (status) =>
    statusConfig[status] || {
      label: status,
      icon: Clock3,
      className:
        "border-white/10 bg-white/5 text-gray-300",
    };

  return (
    <div className="min-h-full space-y-6 pb-8">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10">
              <FileUp className="h-4 w-4 text-indigo-300" />
            </div>

            <span className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-300/80">
              Data import
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Import Transactions
          </h1>

          <p className="mt-1.5 max-w-xl text-sm leading-6 text-gray-400">
            Upload your bank statements and review transactions
            before adding them to SmartMoney.
          </p>
        </div>
      </div>

      {/* =====================================================
          SUMMARY BUBBLES
      ===================================================== */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

        <SummaryBubble
          icon={FileText}
          label="Total imports"
          value={totalImports}
          description="Files uploaded"
        />

        <SummaryBubble
          icon={Eye}
          label="Needs review"
          value={stagedImports}
          description="Waiting for confirmation"
          accent="indigo"
        />

        <SummaryBubble
          icon={CheckCircle2}
          label="Imported"
          value={confirmedImports}
          description="Successfully processed"
          accent="emerald"
        />

      </div>

      {/* =====================================================
          UPLOAD BUBBLE
      ===================================================== */}

      <Card className="overflow-hidden rounded-3xl border border-white/[0.07] bg-[#15151f] shadow-none">
        <CardContent className="p-4 sm:p-6">

          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10">
              <Upload className="h-4 w-4 text-indigo-300" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white">
                Upload bank statement
              </h2>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Import transactions from CSV or PDF statements.
              </p>
            </div>
          </div>

          <div
            className={`
              group relative cursor-pointer overflow-hidden rounded-2xl
              border border-dashed p-8 text-center transition-all sm:p-12
              ${
                dragging
                  ? "border-indigo-400/60 bg-indigo-500/[0.08]"
                  : "border-white/[0.10] bg-[#101019] hover:border-indigo-400/40 hover:bg-indigo-500/[0.04]"
              }
            `}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10 transition-transform group-hover:scale-105">
              {uploadMutation.isPending ? (
                <RefreshCw className="h-6 w-6 animate-spin text-indigo-300" />
              ) : (
                <Upload className="h-6 w-6 text-indigo-300" />
              )}
            </div>

            <p className="text-sm font-medium text-white">
              {uploadMutation.isPending
                ? "Uploading and processing..."
                : "Drop your bank statement here"}
            </p>

            <p className="mt-1.5 text-xs text-gray-500">
              or click to browse from your device
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <FileTypeBadge label="CSV" />
              <FileTypeBadge label="PDF" />
              <FileTypeBadge label="Up to 10MB" />
            </div>

            {uploadMutation.isPending && (
              <div className="mx-auto mt-5 h-1 max-w-xs overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-indigo-400" />
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".csv,.pdf"
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>

          <div className="mt-4 flex items-center gap-2 text-[11px] text-gray-500">
            <Sparkles className="h-3.5 w-3.5 text-indigo-300/70" />
            <span>
              SmartMoney will analyze your statement and prepare
              transactions for review.
            </span>
          </div>

        </CardContent>
      </Card>

      {/* =====================================================
          IMPORT HISTORY
      ===================================================== */}

      <Card className="overflow-hidden rounded-3xl border border-white/[0.07] bg-[#15151f] shadow-none">

        <CardContent className="p-0">

          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-4 sm:px-6">

            <div>
              <h2 className="text-sm font-semibold text-white">
                Import history
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Review and manage previously uploaded statements.
              </p>
            </div>

            <div className="hidden h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04] sm:flex">
              <FileText className="h-4 w-4 text-gray-500" />
            </div>

          </div>

          {isLoading ? (
            <div className="space-y-3 p-4 sm:p-6">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-20 rounded-2xl bg-white/[0.05]"
                  />
                ))}
            </div>
          ) : isError ? (
            <div className="px-6 py-14 text-center">

              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-300" />
              </div>

              <p className="text-sm font-medium text-white">
                Unable to load imports
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Something went wrong while loading your import history.
              </p>

              <Button
                variant="outline"
                size="sm"
                className="mt-4 border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/[0.07]"
                onClick={() => refetch()}
              >
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                Try again
              </Button>

            </div>
          ) : imports?.length === 0 ? (
            <div className="px-6 py-14 text-center">

              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04]">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>

              <p className="text-sm font-medium text-gray-300">
                No imports yet
              </p>

              <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-gray-500">
                Upload your first bank statement above to start
                importing transactions.
              </p>

            </div>
          ) : (
            <div className="divide-y divide-white/[0.05]">

              {imports?.map((imp) => {
                const status = getStatus(imp.status);
                const StatusIcon = status.icon;

                return (
                  <div
                    key={imp.id}
                    className="group px-4 py-4 transition-colors hover:bg-white/[0.015] sm:px-6"
                  >

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      {/* File information */}

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.035]">
                          <FileText className="h-5 w-5 text-gray-400" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {imp.fileName}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {imp.totalRows ?? 0} rows
                            <span className="mx-1.5 text-gray-700">
                              •
                            </span>
                            {new Date(
                              imp.createdAt,
                            ).toLocaleDateString()}
                          </p>
                        </div>

                      </div>

                      {/* Status + action */}

                      <div className="flex items-center justify-between gap-3 sm:justify-end">

                        <Badge
                          className={`
                            border px-2.5 py-1 text-[11px] font-medium
                            ${status.className}
                          `}
                        >
                          <StatusIcon className="mr-1.5 h-3 w-3" />
                          {status.label}
                        </Badge>

                        {imp.status === "staged" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 rounded-xl border-white/10 bg-white/[0.03] px-3 text-xs text-gray-300 hover:bg-indigo-500/10 hover:text-indigo-200"
                            onClick={() => {
                              setSelectedImport(imp);
                              setShowRows(true);
                            }}
                          >
                            Review
                            <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                          </Button>
                        )}

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </CardContent>
      </Card>

      {/* =====================================================
          REVIEW DIALOG
      ===================================================== */}

      <Dialog
        open={showRows}
        onOpenChange={setShowRows}
      >
        <DialogContent className="max-h-[90vh] w-[calc(100%-24px)] max-w-4xl overflow-hidden rounded-3xl border border-white/[0.08] bg-[#15151f] p-0 text-white shadow-2xl">

          <DialogHeader className="border-b border-white/[0.06] px-5 py-5 sm:px-6">

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10">
                <Eye className="h-4 w-4 text-indigo-300" />
              </div>

              <div className="min-w-0">
                <DialogTitle className="truncate text-base font-semibold text-white">
                  Review import
                </DialogTitle>

                <p className="mt-1 truncate text-xs text-gray-500">
                  {selectedImport?.fileName}
                </p>
              </div>

            </div>

          </DialogHeader>

          <div className="max-h-[calc(90vh-90px)] overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">

            {/* Review summary */}

            <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.025] px-4 py-3">

              <div>
                <p className="text-xs font-medium text-gray-300">
                  Imported rows
                </p>

                <p className="mt-0.5 text-[11px] text-gray-500">
                  Check categories before confirming.
                </p>
              </div>

              <span className="text-sm font-semibold text-white">
                {rows?.length ?? 0}
              </span>

            </div>

            {/* Rows */}

            <div className="space-y-2.5">

              {rowsLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton
                      key={i}
                      className="h-24 rounded-2xl bg-white/[0.05]"
                    />
                  ))
              ) : rows?.length ? (
                rows.map((row) => {

                  const skipped =
                    row.status === "skipped";

                  const needsReview =
                    row.needsReview;

                  return (
                    <div
                      key={row.id}
                      className={`
                        rounded-2xl border p-4 transition-colors
                        ${
                          needsReview
                            ? "border-amber-400/20 bg-amber-400/[0.04]"
                            : "border-white/[0.06] bg-white/[0.02]"
                        }
                      `}
                    >

                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        {/* Transaction */}

                        <div className="min-w-0 flex-1">

                          <div className="flex items-start gap-3">

                            <div
                              className={`
                                mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl
                                ${
                                  needsReview
                                    ? "bg-amber-400/10"
                                    : "bg-white/[0.04]"
                                }
                              `}
                            >
                              {needsReview ? (
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-300" />
                              ) : (
                                <FileText className="h-3.5 w-3.5 text-gray-500" />
                              )}
                            </div>

                            <div className="min-w-0">

                              <p className="truncate text-sm font-medium text-white">
                                {row.description || "Untitled transaction"}
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                {row.date}
                                <span className="mx-1.5 text-gray-700">
                                  •
                                </span>
                                {row.type}
                                <span className="mx-1.5 text-gray-700">
                                  •
                                </span>
                                {row.currency} {row.amount}
                              </p>

                              {row.duplicateOf && (
                                <Badge className="mt-2 border border-red-400/20 bg-red-400/10 text-[10px] text-red-300">
                                  <AlertTriangle className="mr-1 h-3 w-3" />
                                  Possible duplicate
                                </Badge>
                              )}

                            </div>

                          </div>

                        </div>

                        {/* Category + confidence */}

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:shrink-0">

                          {!skipped && (
                            <Select
                              defaultValue={
                                row.finalCategoryId ||
                                row.suggestedCategoryId ||
                                ""
                              }
                              onValueChange={(value) =>
                                updateRowMutation.mutate({
                                  importId:
                                    selectedImport.id,
                                  rowId: row.id,
                                  categoryId: value,
                                })
                              }
                            >
                              <SelectTrigger className="h-9 w-full rounded-xl border-white/[0.08] bg-white/[0.04] text-xs text-gray-300 sm:w-44">
                                <SelectValue placeholder="Category" />
                              </SelectTrigger>

                              <SelectContent className="border-white/[0.08] bg-[#1b1b27] text-white">
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
                          )}

                          <Badge
                            className={`
                              justify-center border px-2.5 py-1.5 text-[10px]
                              ${
                                skipped
                                  ? "border-white/[0.07] bg-white/[0.04] text-gray-500"
                                  : needsReview
                                    ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                                    : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                              }
                            `}
                          >
                            {skipped
                              ? "Skipped"
                              : needsReview
                                ? "Needs review"
                                : `${Math.round(
                                    (row.confidence || 0) *
                                      100,
                                  )}% confidence`}
                          </Badge>

                        </div>

                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-10 text-center">
                  <FileText className="mx-auto h-6 w-6 text-gray-600" />

                  <p className="mt-3 text-sm text-gray-400">
                    No rows found in this import.
                  </p>
                </div>
              )}

            </div>

            {/* Actions */}

            <div className="mt-5 flex flex-col-reverse gap-2 border-t border-white/[0.06] pt-4 sm:flex-row">

              <Button
                variant="outline"
                className="h-10 flex-1 rounded-xl border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/[0.07]"
                onClick={() => setShowRows(false)}
              >
                Cancel
              </Button>

              <Button
                className="h-10 flex-1 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500"
                onClick={() =>
                  confirmMutation.mutate(
                    selectedImport.id,
                  )
                }
                disabled={
                  confirmMutation.isPending ||
                  !selectedImport
                }
              >
                {confirmMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Confirm Import
                  </>
                )}
              </Button>

            </div>

          </div>

        </DialogContent>
      </Dialog>

    </div>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function SummaryBubble({
  icon: Icon,
  label,
  value,
  description,
  accent = "neutral",
}) {
  const accentStyles = {
    neutral:
      "border-white/[0.07] bg-white/[0.025] text-gray-400",
    indigo:
      "border-indigo-400/15 bg-indigo-500/[0.05] text-indigo-300",
    emerald:
      "border-emerald-400/15 bg-emerald-500/[0.04] text-emerald-300",
  };

  return (
    <div
      className={`
        rounded-2xl border p-4
        ${accentStyles[accent]}
      `}
    >
      <div className="flex items-center justify-between">

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04]">
          <Icon className="h-4 w-4" />
        </div>

        <span className="text-xl font-semibold text-white">
          {value}
        </span>

      </div>

      <p className="mt-3 text-xs font-medium text-gray-300">
        {label}
      </p>

      <p className="mt-0.5 text-[11px] text-gray-600">
        {description}
      </p>
    </div>
  );
}

function FileTypeBadge({ label }) {
  return (
    <span className="rounded-lg border border-white/[0.07] bg-white/[0.035] px-2.5 py-1 text-[10px] font-medium text-gray-500">
      {label}
    </span>
  );
}