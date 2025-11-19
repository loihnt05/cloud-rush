import { useState } from "react";
import { FaBrain, FaChartLine, FaCalendarAlt, FaRocket } from "react-icons/fa";
import { quickPrediction, getRevenueAnalytics } from "@/api/revenue";
import type { RevenueForecast, RevenueAnalytics } from "@/types/revenue";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PredictionPanelProps {
  onPredictionGenerated: (predictions: RevenueForecast[], analytics: RevenueAnalytics | null) => void;
}

export default function PredictionPanel({ onPredictionGenerated }: PredictionPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState("30");
  const [modelType, setModelType] = useState("linear_regression");
  const [predictions, setPredictions] = useState<RevenueForecast[]>([]);
  const [analytics, setAnalytics] = useState<RevenueAnalytics | null>(null);

  const handleGeneratePrediction = async () => {
    setLoading(true);
    setError(null);

    try {
      // Generate predictions
      const daysNum = parseInt(days);
      const result = await quickPrediction(daysNum, modelType);
      
      // Get current analytics
      let analyticsData: RevenueAnalytics | null = null;
      try {
        analyticsData = await getRevenueAnalytics();
      } catch (err) {
        console.log("Could not fetch analytics:", err);
      }

      setPredictions(result);
      setAnalytics(analyticsData);
      onPredictionGenerated(result, analyticsData);
    } catch (err) {
      console.error("Error generating prediction:", err);
      setError(err instanceof Error ? err.message : "Failed to generate prediction");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string | number): string => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Prepare chart data
  const chartData = predictions.map((pred) => ({
    date: formatDate(pred.forecast_date),
    revenue: typeof pred.predicted_revenue === "string" 
      ? parseFloat(pred.predicted_revenue) 
      : pred.predicted_revenue,
    confidence: pred.confidence_score || 0,
  }));

  // Calculate statistics
  const totalPredicted = predictions.reduce((sum, p) => {
    const rev = typeof p.predicted_revenue === "string" 
      ? parseFloat(p.predicted_revenue) 
      : p.predicted_revenue;
    return sum + rev;
  }, 0);

  const avgConfidence = predictions.length > 0
    ? predictions.reduce((sum, p) => sum + (p.confidence_score || 0), 0) / predictions.length
    : 0;

  const avgDaily = predictions.length > 0 ? totalPredicted / predictions.length : 0;

  return (
    <div className="space-y-6">
      {/* Prediction Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FaBrain className="text-primary" />
            Generate Revenue Prediction
          </CardTitle>
          <CardDescription>
            Use AI models to predict future revenue based on historical data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Days Selection */}
            <div className="space-y-2">
              <Label htmlFor="days">Prediction Period</Label>
              <Select value={days} onValueChange={setDays}>
                <SelectTrigger id="days">
                  <SelectValue placeholder="Select days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Next 7 days</SelectItem>
                  <SelectItem value="14">Next 2 weeks</SelectItem>
                  <SelectItem value="30">Next 30 days</SelectItem>
                  <SelectItem value="60">Next 60 days</SelectItem>
                  <SelectItem value="90">Next 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="model">Prediction Model</Label>
              <Select value={modelType} onValueChange={setModelType}>
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear_regression">
                    Linear Regression (Most Accurate)
                  </SelectItem>
                  <SelectItem value="moving_average">
                    Moving Average (Stable)
                  </SelectItem>
                  <SelectItem value="growth_based">
                    Growth-Based (Trending)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                onClick={handleGeneratePrediction}
                disabled={loading}
                className="w-full flex items-center gap-2"
                size="lg"
              >
                <FaRocket />
                {loading ? "Generating..." : "Generate Prediction"}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {predictions.length > 0 && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Predicted Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(totalPredicted)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  For next {predictions.length} days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Daily Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(avgDaily)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Per day projection
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Prediction Confidence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {avgConfidence.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Model accuracy score
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaChartLine className="text-primary" />
                  Revenue Trend
                </CardTitle>
                <CardDescription>
                  Predicted revenue over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fill: 'currentColor' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'currentColor' }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem'
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Predicted Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      fillOpacity={1}
                      fill="url(#colorRev)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Confidence Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Prediction Confidence</CardTitle>
                <CardDescription>
                  Model confidence scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fill: 'currentColor' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'currentColor' }}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem'
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Confidence']}
                    />
                    <Bar dataKey="confidence" fill="#10b981" name="Confidence Score" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Summary */}
          {analytics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaCalendarAlt className="text-primary" />
                  Current Performance
                </CardTitle>
                <CardDescription>
                  Historical revenue analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-xl font-bold">{formatCurrency(analytics.total_revenue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Daily Revenue</p>
                    <p className="text-xl font-bold">{formatCurrency(analytics.average_daily_revenue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                    <p className="text-xl font-bold">{analytics.total_bookings}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Growth Rate</p>
                    <p className={`text-xl font-bold ${
                      (analytics.growth_rate || 0) > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {analytics.growth_rate?.toFixed(1) || 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
