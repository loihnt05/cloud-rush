import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { FaChartLine, FaBrain, FaDatabase, FaSync } from "react-icons/fa";
import { getAllForecasts, getAllMetrics, collectMetricsForDate } from "@/api/revenue";
import type { RevenueForecast, RevenueMetrics } from "@/types/revenue";
import useSettingStore from "@/stores/setting-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import PredictionPanel from "@/components/revenue/prediction-panel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RevenuePredictionPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth0();
  const { accessToken } = useSettingStore();

  const [forecasts, setForecasts] = useState<RevenueForecast[]>([]);
  const [metrics, setMetrics] = useState<RevenueMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [collectingMetrics, setCollectingMetrics] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (user) {
      const userWithRoles = user as Record<string, unknown>;
      const roles = (userWithRoles["http://localhost:8000/roles"] as string[]) || [];
      const hasAdminRole = roles.includes("admin");
      setIsAdmin(hasAdminRole);
      
      if (!hasAdminRole) {
        setError("Access Denied: Admin privileges required");
        setLoading(false);
      }
    }
  }, [user]);

  const loadData = async () => {
    if (!isAdmin || !accessToken) return;

    try {
      setLoading(true);
      setError(null);

      const [forecastsData, metricsData] = await Promise.all([
        getAllForecasts(),
        getAllMetrics(),
      ]);

      setForecasts(forecastsData);
      setMetrics(metricsData);
    } catch (err: unknown) {
      console.error("Error loading data:", err);
      const error = err as { response?: { status?: number }; message?: string };
      
      if (error.response?.status === 403) {
        setError("Access Denied: Admin privileges required");
      } else {
        setError(error.message || "Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated || !isAdmin || !accessToken) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, isAdmin, accessToken]);

  const handleCollectTodayMetrics = async () => {
    setCollectingMetrics(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await collectMetricsForDate(today);
      await loadData(); // Reload data
    } catch (err) {
      console.error("Error collecting metrics:", err);
      setError(err instanceof Error ? err.message : "Failed to collect metrics");
    } finally {
      setCollectingMetrics(false);
    }
  };

  const handlePredictionGenerated = (predictions: RevenueForecast[]) => {
    // Add new predictions to the list
    setForecasts((prev) => [...predictions, ...prev]);
  };

  const formatCurrency = (amount: string | number): string => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading revenue prediction system...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <FaChartLine className="text-destructive text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate("/")}>Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#07401F]/5 via-[#224A33]/5 to-[#357D52]/5 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FaBrain className="text-primary text-xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Revenue Prediction System</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  AI-powered revenue forecasting and analytics
                </p>
              </div>
            </div>
            <Button
              onClick={handleCollectTodayMetrics}
              disabled={collectingMetrics}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FaSync className={collectingMetrics ? "animate-spin" : ""} />
              {collectingMetrics ? "Collecting..." : "Collect Today's Metrics"}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="predict" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="predict" className="flex items-center gap-2">
              <FaBrain />
              <span className="hidden sm:inline">Predict Revenue</span>
              <span className="sm:hidden">Predict</span>
            </TabsTrigger>
            <TabsTrigger value="forecasts" className="flex items-center gap-2">
              <FaChartLine />
              <span className="hidden sm:inline">All Forecasts</span>
              <span className="sm:hidden">Forecasts</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <FaDatabase />
              <span className="hidden sm:inline">Actual Metrics</span>
              <span className="sm:hidden">Metrics</span>
            </TabsTrigger>
          </TabsList>

          {/* Prediction Tab */}
          <TabsContent value="predict">
            <PredictionPanel onPredictionGenerated={handlePredictionGenerated} />
          </TabsContent>

          {/* All Forecasts Tab */}
          <TabsContent value="forecasts">
            <Card>
              <CardHeader>
                <CardTitle>All Revenue Forecasts</CardTitle>
                <CardDescription>
                  Historical and generated revenue predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {forecasts.length === 0 ? (
                  <div className="text-center py-12">
                    <FaChartLine className="text-muted-foreground text-4xl mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No Forecasts Available
                    </h3>
                    <p className="text-muted-foreground">
                      Generate predictions using the Predict Revenue tab
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Predicted Revenue</TableHead>
                          <TableHead>Confidence</TableHead>
                          <TableHead>Model</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {forecasts.slice(0, 50).map((forecast) => (
                          <TableRow key={forecast.forecast_id}>
                            <TableCell className="font-medium">
                              {formatDate(forecast.forecast_date)}
                            </TableCell>
                            <TableCell className="font-semibold text-green-600">
                              {formatCurrency(forecast.predicted_revenue)}
                            </TableCell>
                            <TableCell>
                              {forecast.confidence_score ? (
                                <span className={`font-medium ${
                                  forecast.confidence_score > 70 ? 'text-green-600' :
                                  forecast.confidence_score > 50 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {forecast.confidence_score.toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-muted-foreground italic">N/A</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                {forecast.model_used || "Unknown"}
                              </span>
                            </TableCell>
                            <TableCell className="capitalize">
                              {forecast.prediction_type || "daily"}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {forecast.created_at 
                                ? new Date(forecast.created_at).toLocaleDateString()
                                : "N/A"
                              }
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics">
            <Card>
              <CardHeader>
                <CardTitle>Actual Revenue Metrics</CardTitle>
                <CardDescription>
                  Historical performance data for model training
                </CardDescription>
              </CardHeader>
              <CardContent>
                {metrics.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No metrics collected yet. Click "Collect Today's Metrics" to start tracking actual performance.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Actual Revenue</TableHead>
                          <TableHead>Bookings</TableHead>
                          <TableHead>Passengers</TableHead>
                          <TableHead>Avg Ticket</TableHead>
                          <TableHead>Flights</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {metrics.slice(0, 50).map((metric) => (
                          <TableRow key={metric.metric_id}>
                            <TableCell className="font-medium">
                              {formatDate(metric.date)}
                            </TableCell>
                            <TableCell className="font-semibold text-blue-600">
                              {formatCurrency(metric.actual_revenue)}
                            </TableCell>
                            <TableCell>{metric.booking_count}</TableCell>
                            <TableCell>{metric.passenger_count}</TableCell>
                            <TableCell>
                              {metric.average_ticket_price 
                                ? formatCurrency(metric.average_ticket_price)
                                : "N/A"
                              }
                            </TableCell>
                            <TableCell>{metric.flight_count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
