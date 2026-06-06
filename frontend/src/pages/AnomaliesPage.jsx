import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Copy,
  Zap,
  BarChart3,
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
    color: "bg-purple-100 text-purple-700",
  },
  duplicate_proximity: {
    label: "Possible Duplicate",
    icon: Copy,
    color: "bg-red-100 text-red-700",
  },
  velocity: {
    label: "High Velocity",
    icon: Zap,
    color: "bg-orange-100 text-orange-700",
  },
  budget_projection: {
    label: "Budget Risk",
    icon: TrendingUp,
    color: "bg-yellow-100 text-yellow-700",
  },
};

export default function AnomaliesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: anomalies, isLoading } = useQuery({
    queryKey: ["anomalies"],
    queryFn: () => api.get("/anomalies").then((r) => r.data.anomalies),
  });

  const dismissMutation = useMutation({
    mutationFn: (id) => api.patch(`/anomalies/${id}/dismiss`),
    onSuccess: () => {
      queryClient.invalidateQueries(["anomalies"]);
      toast({ title: "Anomaly dismissed" });
    },
  });

  const recomputeMutation = useMutation({
    mutationFn: () => api.post("/anomalies/recompute-baselines"),
    onSuccess: (data) => {
      toast({ title: `Baselines recomputed — ${data.data.count} updated` });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-200">
            Anomaly Detection
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {anomalies?.length || 0} active alerts
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => recomputeMutation.mutate()}
          disabled={recomputeMutation.isPending}
        >
          {recomputeMutation.isPending ? "Computing..." : "Recompute Baselines"}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
        </div>
      ) : anomalies?.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-16 text-gray-400">
            <CheckCircle className="w-10 h-10 mx-auto mb-3 text-green-400" />
            <p className="font-medium text-gray-600">No anomalies detected</p>
            <p className="text-sm mt-1">Your spending looks normal</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {anomalies?.map((anomaly) => {
            const config = typeConfig[anomaly.type] || {
              label: anomaly.type,
              icon: AlertTriangle,
              color: "bg-gray-100 text-gray-700",
            };
            const Icon = config.icon;
            return (
              <Card
                key={anomaly.id}
                className="border-0 shadow-sm border-l-4 border-l-orange-400"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-xs ${config.color}`}>
                            {config.label}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            Score: {anomaly.score}
                          </span>
                        </div>
                        {anomaly.Transaction && (
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {anomaly.Transaction.title} —{" "}
                            {anomaly.Transaction.currency}{" "}
                            {anomaly.Transaction.amount}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          {anomaly.explanation}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(anomaly.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-shrink-0 text-gray-500 hover:text-gray-700"
                      onClick={() => dismissMutation.mutate(anomaly.id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
