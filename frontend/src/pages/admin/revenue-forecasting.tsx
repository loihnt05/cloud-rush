import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { FaChartLine, FaCalendar, FaDollarSign, FaCog } from "react-icons/fa";
import { getAllForecasts } from "@/api/revenue";
import type { RevenueForecast } from "@/types/revenue";
import useSettingStore from "@/stores/setting-store";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function RevenueForecastingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth0();
  const { accessToken } = useSettingStore();

  const [forecasts, setForecasts] = useState<RevenueForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  useEffect(() => {
    const loadForecasts = async () => {
      console.log("=== Revenue Forecasting Page Debug ===");
      console.log("authLoading:", authLoading);
      console.log("isAuthenticated:", isAuthenticated);
      console.log("user:", user);
      console.log("accessToken:", accessToken ? "Present" : "Missing");
      console.log("isAdmin:", isAdmin);

      if (authLoading) {
        console.log("Waiting for authentication...");
        return;
      }

      if (!isAuthenticated || !user?.sub) {
        console.error("User not authenticated");
        setError("Please log in to view this page");
        setLoading(false);
        return;
      }

      if (!isAdmin) {
        console.error("User does not have admin role");
        setError("Access Denied: Admin privileges required");
        setLoading(false);
        return;
      }

      if (!accessToken) {
        console.error("Access token not available yet, waiting...");
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching revenue forecasts...");

        const data = await getAllForecasts();
        console.log("Revenue forecasts:", data);

        setForecasts(data);
        setError(null);
      } catch (err: unknown) {
        console.error("Error loading revenue forecasts:", err);
        
        // Check if it's an authorization error
        const error = err as { response?: { status?: number }; message?: string };
        if (error.response?.status === 403) {
          setError("Access Denied: Admin privileges required");
        } else if (error.response?.status === 401) {
          setError("Authentication failed. Please log in again.");
        } else {
          setError(error.message || "Failed to load revenue forecasts");
        }
      } finally {
        setLoading(false);
      }
    };

    loadForecasts();
  }, [user, authLoading, isAuthenticated, accessToken, isAdmin]);

  // Format currency
  const formatCurrency = (amount: string | number): string => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate statistics
  const statistics = {
    totalForecasts: forecasts.length,
    totalRevenue: forecasts.reduce((sum, f) => {
      const revenue = typeof f.predicted_revenue === "string" 
        ? parseFloat(f.predicted_revenue) 
        : f.predicted_revenue;
      return sum + revenue;
    }, 0),
    averageRevenue: forecasts.length > 0 
      ? forecasts.reduce((sum, f) => {
          const revenue = typeof f.predicted_revenue === "string" 
            ? parseFloat(f.predicted_revenue) 
            : f.predicted_revenue;
          return sum + revenue;
        }, 0) / forecasts.length
      : 0,
  };

  // Prepare chart data (sorted by date)
  const chartData = [...forecasts]
    .sort((a, b) => new Date(a.forecast_date).getTime() - new Date(b.forecast_date).getTime())
    .map((forecast) => ({
      date: formatDate(forecast.forecast_date),
      revenue: typeof forecast.predicted_revenue === "string" 
        ? parseFloat(forecast.predicted_revenue) 
        : forecast.predicted_revenue,
      model: forecast.model_used || "Unknown",
    }));

  // Pagination logic
  const totalPages = Math.ceil(forecasts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedForecasts = forecasts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading revenue forecasts...</p>
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
    <div className="min-h-screen bg-linear-to-br from-[#07401F]/5 via-[#224A33]/5 to-[#357D52]/5 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FaChartLine className="text-primary text-xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Revenue Forecasting</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  View and analyze revenue predictions (Admin Only)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Forecasts</CardTitle>
              <FaCalendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalForecasts}</div>
              <p className="text-xs text-muted-foreground">
                Revenue predictions available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Predicted Revenue</CardTitle>
              <FaDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(statistics.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                Sum of all predictions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Revenue</CardTitle>
              <FaCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(statistics.averageRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                Average per forecast
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        {forecasts.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Line Chart - Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend Over Time</CardTitle>
                <CardDescription>
                  Predicted revenue progression
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10b981" 
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart - Revenue Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Comparison</CardTitle>
                <CardDescription>
                  Forecast amounts by date
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.slice(-10)}>
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
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Predicted Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Forecasts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Forecast Details</CardTitle>
            <CardDescription>
              Detailed breakdown of all revenue predictions (Page {currentPage} of {totalPages})
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
                  There are no revenue forecasts to display at this time.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Forecast ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Predicted Revenue</TableHead>
                        <TableHead>Model Used</TableHead>
                        <TableHead>Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedForecasts.map((forecast) => (
                        <TableRow key={forecast.forecast_id}>
                          <TableCell className="font-medium">
                            #{forecast.forecast_id}
                          </TableCell>
                          <TableCell>{formatDate(forecast.forecast_date)}</TableCell>
                          <TableCell className="font-semibold text-green-600">
                            {formatCurrency(forecast.predicted_revenue)}
                          </TableCell>
                          <TableCell>
                            {forecast.model_used || <span className="text-muted-foreground italic">N/A</span>}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {forecast.created_at 
                              ? new Date(forecast.created_at).toLocaleString("en-US")
                              : <span className="italic">N/A</span>
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 1) handlePageChange(currentPage - 1);
                            }}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        
                        {/* Page Numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Show first page, last page, current page, and pages around current
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handlePageChange(page);
                                  }}
                                  isActive={currentPage === page}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          } else if (
                            page === currentPage - 2 ||
                            page === currentPage + 2
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          return null;
                        })}

                        <PaginationItem>
                          <PaginationNext 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage < totalPages) handlePageChange(currentPage + 1);
                            }}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
