import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const statusColors = {
  processing: "bg-yellow-100 text-yellow-700",
  staged: "bg-blue-100 text-blue-700",
  confirmed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

const statusIcons = {
  processing: Clock,
  staged: Eye,
  confirmed: CheckCircle,
  failed: XCircle,
};

export default function ImportsPage() {
  const [dragging, setDragging] = useState(false);
  const [selectedImport, setSelectedImport] = useState(null);
  const [showRows, setShowRows] = useState(false);
  const fileRef = useRef();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: imports, isLoading } = useQuery({
    queryKey: ["imports"],
    queryFn: () => api.get("/imports").then((r) => r.data.imports),
  });

  const { data: rows, isLoading: rowsLoading } = useQuery({
    queryKey: ["import-rows", selectedImport?.id],
    enabled: !!selectedImport?.id && showRows,
    queryFn: () =>
      api.get(`/imports/${selectedImport.id}/rows`).then((r) => r.data.rows),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories").then((r) => r.data.categories),
  });

  const uploadMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post("/imports", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["imports"]);
      toast({ title: "File uploaded and staged for review" });
    },
    onError: (err) => {
      toast({
        title: "Upload failed",
        description: err.response?.data?.error?.message,
        variant: "destructive",
      });
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (id) => api.post(`/imports/${id}/confirm`),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["imports"]);
      queryClient.invalidateQueries(["transactions"]);
      queryClient.invalidateQueries(["dashboard"]);
      toast({
        title: `${data.data.importedCount} transactions imported successfully`,
      });
      setShowRows(false);
    },
  });

  const updateRowMutation = useMutation({
    mutationFn: ({ importId, rowId, categoryId }) =>
      api.patch(`/imports/${importId}/rows/${rowId}`, {
        finalCategoryId: categoryId,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries(["import-rows", selectedImport?.id]),
  });

  const handleFile = (file) => {
    if (!file) return;
    if (
      !["text/csv", "application/pdf", "application/vnd.ms-excel"].includes(
        file.type,
      ) &&
      !file.name.endsWith(".csv")
    ) {
      toast({
        title: "Only CSV and PDF files are supported",
        variant: "destructive",
      });
      return;
    }
    uploadMutation.mutate(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-200">
          Import Transactions
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Upload CSV or PDF bank statements
        </p>
      </div>

      {/* Upload Area */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current.click()}
          >
            <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
            <p className="font-medium text-gray-700">
              Drop your bank statement here
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Supports CSV and PDF formats — up to 10MB
            </p>
            {uploadMutation.isPending && (
              <p className="text-sm text-blue-600 mt-3 font-medium">
                Uploading and processing...
              </p>
            )}
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".csv,.pdf"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>
        </CardContent>
      </Card>

      {/* Imports List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Import History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
            </div>
          ) : imports?.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No imports yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {imports?.map((imp) => {
                const StatusIcon = statusIcons[imp.status];
                return (
                  <div
                    key={imp.id}
                    className="flex items-center justify-between px-4 py-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {imp.fileName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {imp.totalRows} rows ·{" "}
                          {new Date(imp.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`text-xs ${statusColors[imp.status]}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {imp.status}
                      </Badge>
                      {imp.status === "staged" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedImport(imp);
                            setShowRows(true);
                          }}
                        >
                          Review
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={showRows} onOpenChange={setShowRows}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Review Import — {selectedImport?.fileName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {rowsLoading
              ? Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                  ))
              : rows?.map((row) => (
                  <div
                    key={row.id}
                    className={`p-3 rounded-lg border ${row.needsReview ? "border-yellow-200 bg-yellow-50" : "border-gray-100 bg-gray-50"}`}
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {row.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {row.date} · {row.type} · {row.currency} {row.amount}
                        </p>
                        {row.duplicateOf && (
                          <Badge className="text-xs bg-red-100 text-red-700 mt-1">
                            Possible duplicate
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {row.status !== "skipped" && (
                          <Select
                            defaultValue={
                              row.finalCategoryId ||
                              row.suggestedCategoryId ||
                              ""
                            }
                            onValueChange={(v) =>
                              updateRowMutation.mutate({
                                importId: selectedImport.id,
                                rowId: row.id,
                                categoryId: v,
                              })
                            }
                          >
                            <SelectTrigger className="w-40 h-8 text-xs">
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories?.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        <Badge
                          className={`text-xs ${row.status === "skipped" ? "bg-gray-100 text-gray-500" : row.needsReview ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
                        >
                          {row.status === "skipped"
                            ? "Skipped"
                            : row.needsReview
                              ? "Review"
                              : `${Math.round((row.confidence || 0) * 100)}%`}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowRows(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => confirmMutation.mutate(selectedImport.id)}
                disabled={confirmMutation.isPending}
              >
                <Check className="w-4 h-4 mr-2" />
                {confirmMutation.isPending ? "Importing..." : "Confirm Import"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
