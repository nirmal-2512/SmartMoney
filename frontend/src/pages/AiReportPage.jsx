import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Calendar,
  CheckCircle2,
  FileText,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/hooks/use-toast";
import api from "@/lib/axios";

const months = Array.from({ length: 12 }, (_, i) => {
  const date = new Date();
  date.setMonth(date.getMonth() - i);
  return date.toISOString().slice(0, 7);
});

const formatMonth = (month) => {
  const [year, monthNumber] = month.split("-");

  return new Date(
    Number(year),
    Number(monthNumber) - 1,
    1,
  ).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

export default function AiReportPage() {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );

  const { toast } = useToast();

  const selectedMonthLabel = useMemo(
    () => formatMonth(selectedMonth),
    [selectedMonth],
  );

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["ai-report", selectedMonth],
    queryFn: () =>
      api
        .get(`/ai/reports/${selectedMonth}`)
        .then((response) => response.data.report),
    retry: false,
  });

  const generateMutation = useMutation({
    mutationFn: () => api.post(`/ai/reports/${selectedMonth}/generate`),

    onSuccess: () => {
      toast({
        title: "Report generated",
        description: `Your ${selectedMonthLabel} financial report is ready.`,
      });

      refetch();
    },

    onError: (error) => {
      toast({
        title: "Unable to generate report",
        description:
          error.response?.data?.error?.message ||
          "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const isGenerating = generateMutation.isPending;

  return (
    <>
      <style>{`
        .report-page {
          min-height: calc(100vh - 7rem);
          color: #e4e4e7;
        }

        .report-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .report-heading {
          min-width: 0;
        }

        .report-eyebrow {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          color: #818cf8;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 0.45rem;
        }

        .report-title {
          margin: 0;
          color: #f4f4f5;
          font-size: 1.45rem;
          line-height: 1.25;
          font-weight: 650;
          letter-spacing: -0.025em;
        }

        .report-description {
          margin: 0.4rem 0 0;
          color: #71717a;
          font-size: 0.82rem;
        }

        .report-controls {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-shrink: 0;
        }

        .month-select {
          width: 170px;
        }

        .month-select button {
          height: 40px;
          border-radius: 10px;
          border-color: #29292f;
          background: #111116;
          color: #d4d4d8;
        }

        .generate-button {
          height: 40px;
          border-radius: 10px;
          padding: 0 1rem;
          background: #6366f1;
          color: white;
          box-shadow: none;
        }

        .generate-button:hover {
          background: #5558e8;
        }

        .generate-button:disabled {
          opacity: 0.55;
        }

        .report-container {
          overflow: hidden;
          border: 1px solid #242429;
          border-radius: 16px;
          background: #0d0d11;
        }

        .report-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #242429;
        }

        .report-toolbar-left {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          min-width: 0;
        }

        .report-icon {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: #17171d;
          border: 1px solid #292930;
          color: #a5b4fc;
          flex-shrink: 0;
        }

        .report-toolbar-title {
          margin: 0;
          color: #e4e4e7;
          font-size: 0.86rem;
          font-weight: 600;
        }

        .report-toolbar-subtitle {
          margin: 0.15rem 0 0;
          color: #52525b;
          font-size: 0.68rem;
        }

        .report-status {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          color: #71717a;
          font-size: 0.68rem;
          white-space: nowrap;
        }

        .report-status.ready {
          color: #86efac;
        }

        .report-content {
          padding: 2rem;
        }

        .report-document {
          max-width: 820px;
          margin: 0 auto;
        }

        .report-document-header {
          padding-bottom: 1.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #242429;
        }

        .report-document-label {
          margin: 0 0 0.35rem;
          color: #6366f1;
          font-size: 0.7rem;
          font-weight: 650;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .report-document-title {
          margin: 0;
          color: #f4f4f5;
          font-size: 1.55rem;
          font-weight: 650;
          letter-spacing: -0.025em;
        }

        .report-narrative {
          color: #c4c4ca;
          font-size: 0.9rem;
          line-height: 1.85;
          white-space: pre-wrap;
        }

        .report-narrative::selection {
          background: rgba(99, 102, 241, 0.25);
        }

        .report-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding-top: 1.25rem;
          margin-top: 2rem;
          border-top: 1px solid #242429;
          color: #52525b;
          font-size: 0.67rem;
        }

        .report-meta span {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .report-empty {
          min-height: 430px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 3rem 1rem;
        }

        .empty-icon {
          width: 54px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          background: #15151b;
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
          max-width: 400px;
          margin: 0.45rem 0 1.25rem;
          color: #71717a;
          font-size: 0.78rem;
          line-height: 1.6;
        }

        .empty-button {
          height: 38px;
          border-radius: 9px;
          background: #6366f1;
        }

        .loading-document {
          max-width: 820px;
          margin: 0 auto;
        }

        .loading-header {
          margin-bottom: 1.75rem;
        }

        .loading-lines {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .loading-line {
          background: #18181d;
        }

        .report-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          margin-top: 1rem;
          color: #3f3f46;
          font-size: 0.65rem;
        }

        @media (max-width: 720px) {
          .report-page {
            min-height: calc(100vh - 5rem);
          }

          .report-header {
            align-items: stretch;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 1rem;
          }

          .report-title {
            font-size: 1.25rem;
          }

          .report-controls {
            width: 100%;
          }

          .month-select {
            flex: 1;
            width: auto;
          }

          .generate-button {
            flex-shrink: 0;
          }

          .report-container {
            border-radius: 14px;
          }

          .report-toolbar {
            padding: 0.85rem;
          }

          .report-toolbar-subtitle {
            display: none;
          }

          .report-content {
            padding: 1.25rem 1rem;
          }

          .report-document-title {
            font-size: 1.3rem;
          }

          .report-narrative {
            font-size: 0.85rem;
            line-height: 1.75;
          }

          .report-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .report-empty {
            min-height: 360px;
            padding: 2rem 1rem;
          }

          .report-status {
            display: none;
          }
        }

        @media (max-width: 460px) {
          .report-controls {
            gap: 0.5rem;
          }

          .generate-button {
            padding: 0 0.8rem;
          }

          .generate-label {
            display: none;
          }

          .generate-button svg {
            margin: 0;
          }

          .report-icon {
            width: 32px;
            height: 32px;
          }

          .report-content {
            padding: 1rem 0.85rem;
          }
        }
      `}</style>

      <main className="report-page">
        {/* Page header */}
        <header className="report-header">
          <div className="report-heading">
            <div className="report-eyebrow">
              <Sparkles size={12} />
              AI Insights
            </div>

            <h1 className="report-title">Monthly Financial Report</h1>

            <p className="report-description">
              An AI-generated summary of your financial activity and trends.
            </p>
          </div>

          <div className="report-controls">
            <Select
              value={selectedMonth}
              onValueChange={setSelectedMonth}
            >
              <SelectTrigger className="month-select">
                <Calendar size={15} />
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {formatMonth(month)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              className="generate-button"
              onClick={() => generateMutation.mutate()}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <RefreshCw
                  size={15}
                  className="mr-2 animate-spin"
                />
              ) : (
                <Sparkles size={15} className="mr-2" />
              )}

              <span className="generate-label">
                {isGenerating ? "Generating..." : "Generate Report"}
              </span>
            </Button>
          </div>
        </header>

        {/* Report */}
        <section className="report-container">
          <div className="report-toolbar">
            <div className="report-toolbar-left">
              <div className="report-icon">
                <FileText size={16} />
              </div>

              <div>
                <p className="report-toolbar-title">
                  Financial Report
                </p>
                <p className="report-toolbar-subtitle">
                  {selectedMonthLabel}
                </p>
              </div>
            </div>

            {data && !isFetching && (
              <div className="report-status ready">
                <CheckCircle2 size={13} />
                Ready
              </div>
            )}

            {isFetching && !isGenerating && (
              <div className="report-status">
                <RefreshCw size={12} className="animate-spin" />
                Loading
              </div>
            )}
          </div>

          <div className="report-content">
            {isLoading ? (
              <div className="loading-document">
                <div className="loading-header">
                  <Skeleton className="h-3 w-28 mb-3 loading-line" />
                  <Skeleton className="h-7 w-64 loading-line" />
                </div>

                <div className="loading-lines">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      className={`h-3 loading-line ${
                        index % 4 === 3 ? "w-3/4" : "w-full"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : data ? (
              <article className="report-document">
                <div className="report-document-header">
                  <p className="report-document-label">
                    Monthly analysis
                  </p>

                  <h2 className="report-document-title">
                    {selectedMonthLabel}
                  </h2>
                </div>

                <div className="report-narrative">
                  {data.narrative}
                </div>

                <footer className="report-meta">
                  <span>
                    <Sparkles size={11} />
                    Generated by {data.modelUsed || "SmartMoney AI"}
                  </span>

                  <span>
                    <Calendar size={11} />
                    {data.generatedAt
                      ? new Date(data.generatedAt).toLocaleString()
                      : "Recently generated"}
                  </span>
                </footer>
              </article>
            ) : (
              <div className="report-empty">
                <div className="empty-icon">
                  <FileText size={23} strokeWidth={1.7} />
                </div>

                <h2 className="empty-title">
                  No report for {selectedMonthLabel}
                </h2>

                <p className="empty-description">
                  Generate an AI-powered summary of your spending,
                  financial activity, and important trends for this month.
                </p>

                <Button
                  className="empty-button"
                  onClick={() => generateMutation.mutate()}
                  disabled={isGenerating}
                >
                  <Sparkles size={15} className="mr-2" />
                  {isGenerating ? "Generating..." : "Generate Report"}
                </Button>
              </div>
            )}
          </div>
        </section>

        <div className="report-footer">
          <Sparkles size={10} />
          SmartMoney AI · Financial insights for informational purposes
        </div>
      </main>
    </>
  );
}