import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Copy,
  RefreshCw,
  TrendingUp,
  Zap,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/hooks/use-toast";
import api from "@/lib/axios";

const typeConfig = {
  z_score: {
    label: "Unusual Amount",
    icon: BarChart3,
  },
  duplicate_proximity: {
    label: "Possible Duplicate",
    icon: Copy,
  },
  velocity: {
    label: "High Velocity",
    icon: Zap,
  },
  budget_projection: {
    label: "Budget Risk",
    icon: TrendingUp,
  },
};

const getConfig = (type) =>
  typeConfig[type] || {
    label: type || "Unknown Alert",
    icon: AlertTriangle,
  };

const formatAmount = (transaction) => {
  if (!transaction) return null;

  return `${transaction.currency || ""} ${Number(
    transaction.amount || 0,
  ).toLocaleString()}`.trim();
};

export default function AnomaliesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: anomalies = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["anomalies"],
    queryFn: () =>
      api.get("/anomalies").then((response) => response.data.anomalies),
  });

  const dismissMutation = useMutation({
    mutationFn: (id) => api.patch(`/anomalies/${id}/dismiss`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["anomalies"],
      });

      toast({
        title: "Alert dismissed",
        description: "The anomaly has been removed from your active alerts.",
      });
    },

    onError: () => {
      toast({
        title: "Unable to dismiss alert",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const recomputeMutation = useMutation({
    mutationFn: () => api.post("/anomalies/recompute-baselines"),

    onSuccess: (response) => {
      toast({
        title: "Baselines updated",
        description: `${response.data?.count || 0} baseline records were updated.`,
      });

      queryClient.invalidateQueries({
        queryKey: ["anomalies"],
      });
    },

    onError: () => {
      toast({
        title: "Unable to recompute baselines",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const activeCount = anomalies.length;

  return (
    <>
      <style>{`
        .anomalies-page {
          min-height: calc(100vh - 7rem);
          color: #e4e4e7;
        }

        .anomalies-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .anomalies-heading {
          min-width: 0;
        }

        .anomalies-eyebrow {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 0.45rem;
          color: #f59e0b;
          font-size: 0.68rem;
          font-weight: 650;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .anomalies-title {
          margin: 0;
          color: #f4f4f5;
          font-size: 1.45rem;
          line-height: 1.25;
          font-weight: 650;
          letter-spacing: -0.025em;
        }

        .anomalies-description {
          margin: 0.4rem 0 0;
          color: #71717a;
          font-size: 0.82rem;
        }

        .anomalies-action {
          height: 40px;
          border-radius: 10px;
          border-color: #29292f;
          background: #111116;
          color: #a1a1aa;
          flex-shrink: 0;
        }

        .anomalies-action:hover {
          border-color: #3f3f46;
          background: #18181d;
          color: #e4e4e7;
        }

        .anomalies-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.85rem 1rem;
          margin-bottom: 1rem;
          border: 1px solid #242429;
          border-radius: 12px;
          background: #0d0d11;
        }

        .summary-left {
          display: flex;
          align-items: center;
          gap: 0.7rem;
        }

        .summary-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.08);
        }

        .summary-text {
          color: #a1a1aa;
          font-size: 0.78rem;
        }

        .summary-text strong {
          color: #e4e4e7;
          font-weight: 600;
        }

        .summary-refresh {
          color: #52525b;
          font-size: 0.68rem;
        }

        .anomaly-list {
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }

        .anomaly-card {
          overflow: hidden;
          border: 1px solid #242429;
          border-radius: 14px;
          background: #0d0d11;
          transition:
            border-color 0.18s ease,
            background 0.18s ease;
        }

        .anomaly-card:hover {
          border-color: #303038;
          background: #0f0f14;
        }

        .anomaly-content {
          display: flex;
          align-items: flex-start;
          gap: 0.9rem;
          padding: 1rem;
        }

        .anomaly-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #17171c;
          border: 1px solid #292930;
          color: #f59e0b;
          flex-shrink: 0;
        }

        .anomaly-main {
          min-width: 0;
          flex: 1;
        }

        .anomaly-top {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.45rem;
          margin-bottom: 0.45rem;
        }

        .anomaly-type {
          border: 1px solid #34343b;
          background: #18181d;
          color: #a1a1aa;
          font-size: 0.65rem;
          font-weight: 600;
        }

        .anomaly-score {
          color: #52525b;
          font-size: 0.65rem;
        }

        .transaction {
          margin-bottom: 0.35rem;
          color: #e4e4e7;
          font-size: 0.83rem;
          font-weight: 600;
          line-height: 1.45;
        }

        .transaction-amount {
          color: #a1a1aa;
          font-weight: 500;
        }

        .anomaly-explanation {
          margin: 0;
          color: #85858d;
          font-size: 0.78rem;
          line-height: 1.6;
        }

        .anomaly-date {
          margin-top: 0.55rem;
          color: #52525b;
          font-size: 0.65rem;
        }

        .dismiss-button {
          flex-shrink: 0;
          height: 32px;
          padding: 0 0.65rem;
          color: #71717a;
          font-size: 0.7rem;
          border-radius: 8px;
        }

        .dismiss-button:hover {
          color: #e4e4e7;
          background: #18181d;
        }

        .empty-state {
          display: flex;
          min-height: 380px;
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
          background: #111916;
          border: 1px solid #24352f;
          color: #4ade80;
          margin-bottom: 1rem;
        }

        .empty-title {
          margin: 0;
          color: #e4e4e7;
          font-size: 0.98rem;
          font-weight: 600;
        }

        .empty-description {
          max-width: 360px;
          margin: 0.45rem 0 0;
          color: #71717a;
          font-size: 0.77rem;
          line-height: 1.6;
        }

        .skeleton-list {
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }

        .anomaly-skeleton {
          height: 104px;
          border-radius: 14px;
          background: #15151a;
        }

        @media (max-width: 700px) {
          .anomalies-page {
            min-height: calc(100vh - 5rem);
          }

          .anomalies-header {
            align-items: stretch;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 1rem;
          }

          .anomalies-title {
            font-size: 1.25rem;
          }

          .anomalies-action {
            width: 100%;
          }

          .anomalies-summary {
            padding: 0.75rem 0.85rem;
          }

          .anomaly-content {
            gap: 0.7rem;
            padding: 0.85rem;
          }

          .anomaly-icon {
            width: 34px;
            height: 34px;
          }

          .dismiss-button {
            padding: 0 0.45rem;
          }
        }

        @media (max-width: 480px) {
          .anomalies-summary {
            align-items: flex-start;
          }

          .summary-refresh {
            display: none;
          }

          .anomaly-content {
            position: relative;
            padding-bottom: 3.2rem;
          }

          .dismiss-button {
            position: absolute;
            left: 0.85rem;
            bottom: 0.7rem;
          }

          .anomaly-main {
            width: calc(100% - 2.5rem);
          }

          .transaction {
            font-size: 0.78rem;
          }

          .anomaly-explanation {
            font-size: 0.75rem;
          }
        }
      `}</style>

      <main className="anomalies-page">
        {/* Header */}
        <header className="anomalies-header">
          <div className="anomalies-heading">
            <div className="anomalies-eyebrow">
              <AlertTriangle size={12} />
              Financial monitoring
            </div>

            <h1 className="anomalies-title">
              Anomaly Detection
            </h1>

            <p className="anomalies-description">
              Review unusual spending activity and potential duplicate
              transactions.
            </p>
          </div>

          <Button
            variant="outline"
            className="anomalies-action"
            onClick={() => recomputeMutation.mutate()}
            disabled={recomputeMutation.isPending}
          >
            {recomputeMutation.isPending ? (
              <RefreshCw
                size={15}
                className="mr-2 animate-spin"
              />
            ) : (
              <RefreshCw size={15} className="mr-2" />
            )}

            {recomputeMutation.isPending
              ? "Updating..."
              : "Recompute Baselines"}
          </Button>
        </header>

        {/* Summary */}
        {!isLoading && (
          <div className="anomalies-summary">
            <div className="summary-left">
              <span className="summary-indicator" />

              <span className="summary-text">
                <strong>{activeCount}</strong>{" "}
                {activeCount === 1 ? "active alert" : "active alerts"}
              </span>
            </div>

            {isFetching && !isLoading && (
              <span className="summary-refresh">
                Updating...
              </span>
            )}
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="skeleton-list">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className="anomaly-skeleton"
              />
            ))}
          </div>
        ) : activeCount === 0 ? (
          /* Empty */
          <div className="empty-state">
            <div className="empty-icon">
              <CheckCircle2 size={24} strokeWidth={1.7} />
            </div>

            <h2 className="empty-title">
              Everything looks normal
            </h2>

            <p className="empty-description">
              No unusual spending activity has been detected in your
              recent financial data.
            </p>
          </div>
        ) : (
          /* Alerts */
          <div className="anomaly-list">
            {anomalies.map((anomaly) => {
              const config = getConfig(anomaly.type);
              const Icon = config.icon;

              const amount = formatAmount(anomaly.Transaction);

              return (
                <Card
                  key={anomaly.id}
                  className="anomaly-card"
                >
                  <CardContent className="anomaly-content">
                    <div className="anomaly-icon">
                      <Icon size={17} strokeWidth={1.8} />
                    </div>

                    <div className="anomaly-main">
                      <div className="anomaly-top">
                        <Badge className="anomaly-type">
                          {config.label}
                        </Badge>

                        {anomaly.score !== undefined &&
                          anomaly.score !== null && (
                            <span className="anomaly-score">
                              Score {anomaly.score}
                            </span>
                          )}
                      </div>

                      {anomaly.Transaction && (
                        <div className="transaction">
                          {anomaly.Transaction.title}

                          {amount && (
                            <span className="transaction-amount">
                              {" · "}
                              {amount}
                            </span>
                          )}
                        </div>
                      )}

                      <p className="anomaly-explanation">
                        {anomaly.explanation}
                      </p>

                      {anomaly.createdAt && (
                        <div className="anomaly-date">
                          Detected{" "}
                          {new Date(
                            anomaly.createdAt,
                          ).toLocaleDateString(undefined, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="dismiss-button"
                      onClick={() =>
                        dismissMutation.mutate(anomaly.id)
                      }
                      disabled={dismissMutation.isPending}
                    >
                      Dismiss
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}