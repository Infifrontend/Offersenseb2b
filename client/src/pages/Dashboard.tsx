import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  ShoppingCart,
  Percent,
  Gift,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Award,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Filter,
  RefreshCw,
  Download,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
];

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["dashboard-metrics", timeRange, selectedRegion],
    queryFn: async () => {
      // Mock data - in real implementation, this would call actual API endpoints
      return {
        summary: {
          totalRevenue: 2450000,
          revenueGrowth: 12.5,
          activeOffers: 1247,
          offersGrowth: 8.2,
          activeAgents: 524,
          agentsGrowth: 5.1,
          avgConversion: 4.2,
          conversionGrowth: -2.1,
        },
        topOffers: [
          {
            id: 1,
            fareCode: "EK_PREM_DXB_LHR",
            type: "Negotiated",
            conversions: 1250,
            revenue: 125000,
            attachRate: 34.5,
          },
          {
            id: 2,
            fareCode: "QR_BUS_DOH_JFK",
            type: "API",
            conversions: 980,
            revenue: 98000,
            attachRate: 28.2,
          },
          {
            id: 3,
            fareCode: "EY_ECO_AUH_SYD",
            type: "Negotiated",
            conversions: 856,
            revenue: 85600,
            attachRate: 42.1,
          },
          {
            id: 4,
            fareCode: "LH_BUS_FRA_BOM",
            type: "API",
            conversions: 742,
            revenue: 74200,
            attachRate: 31.8,
          },
          {
            id: 5,
            fareCode: "BA_PREM_LHR_LAX",
            type: "Negotiated",
            conversions: 689,
            revenue: 68900,
            attachRate: 38.7,
          },
        ],
        ruleImpact: [
          {
            rule: "DISC_GCC_GOLD",
            avgDiscount: -8.5,
            marginImpact: -2.1,
            volume: 1250,
            uplift: 15.2,
          },
          {
            rule: "DISC_ASIA_PLAT",
            avgDiscount: -12.0,
            marginImpact: -3.2,
            volume: 890,
            uplift: 22.8,
          },
          {
            rule: "MARKUP_EU_SILVER",
            avgDiscount: 5.5,
            marginImpact: 1.8,
            volume: 567,
            uplift: 8.4,
          },
          {
            rule: "DISC_AMERICAS_GOLD",
            avgDiscount: -6.2,
            marginImpact: -1.5,
            volume: 445,
            uplift: 12.1,
          },
          {
            rule: "BUNDLE_FREQ_FLYER",
            avgDiscount: -15.0,
            marginImpact: 2.5,
            volume: 334,
            uplift: 28.5,
          },
        ],
        ancillaryRates: [
          {
            category: "Baggage",
            airAttach: 45.2,
            nonAirAttach: 0,
            totalRevenue: 450000,
          },
          {
            category: "Seats",
            airAttach: 38.7,
            nonAirAttach: 0,
            totalRevenue: 280000,
          },
          {
            category: "Meals",
            airAttach: 22.1,
            nonAirAttach: 0,
            totalRevenue: 120000,
          },
          {
            category: "Insurance",
            airAttach: 15.8,
            nonAirAttach: 42.3,
            totalRevenue: 340000,
          },
          {
            category: "Hotels",
            airAttach: 0,
            nonAirAttach: 28.9,
            totalRevenue: 890000,
          },
          {
            category: "Transfers",
            airAttach: 0,
            nonAirAttach: 18.5,
            totalRevenue: 220000,
          },
        ],
        agentPerformance: [
          {
            tier: "PLATINUM",
            agents: 45,
            avgValue: 125000,
            conversion: 6.8,
            growth: 18.5,
          },
          {
            tier: "GOLD",
            agents: 128,
            avgValue: 85000,
            conversion: 4.9,
            growth: 12.2,
          },
          {
            tier: "SILVER",
            agents: 210,
            avgValue: 45000,
            conversion: 3.2,
            growth: 8.1,
          },
          {
            tier: "BRONZE",
            agents: 141,
            avgValue: 18000,
            conversion: 2.1,
            growth: 5.3,
          },
        ],
        campaignROI: [
          {
            campaign: "Pre-Travel Baggage",
            sent: 15000,
            purchased: 1250,
            roi: 4.2,
            channel: "EMAIL",
            cohort: "FREQUENT_FLYER",
          },
          {
            campaign: "Seat Selection Promo",
            sent: 12000,
            purchased: 840,
            roi: 3.1,
            channel: "PORTAL",
            cohort: "LAST_MINUTE",
          },
          {
            campaign: "Lounge Access Offer",
            sent: 8500,
            purchased: 680,
            roi: 2.8,
            channel: "WHATSAPP",
            cohort: "BUSINESS_TRAVELER",
          },
          {
            campaign: "Insurance Upsell",
            sent: 20000,
            purchased: 1400,
            roi: 2.2,
            channel: "EMAIL",
            cohort: "FAMILY_TRAVELER",
          },
          {
            campaign: "Hotel Bundle Deal",
            sent: 18000,
            purchased: 1080,
            roi: 1.9,
            channel: "API",
            cohort: "LEISURE_TRAVELER",
          },
        ],
        trendData: [
          { date: "2024-01", revenue: 2100000, conversion: 3.8, margin: 12.5 },
          { date: "2024-02", revenue: 2200000, conversion: 4.1, margin: 13.2 },
          { date: "2024-03", revenue: 2350000, conversion: 4.3, margin: 12.8 },
          { date: "2024-04", revenue: 2400000, conversion: 4.2, margin: 13.5 },
          { date: "2024-05", revenue: 2450000, conversion: 4.2, margin: 13.1 },
        ],
        alerts: [
          {
            type: "warning",
            message:
              "Conversion rate for BRONZE tier agents down 5.2% this week",
            priority: "high",
          },
          {
            type: "info",
            message:
              "New negotiated fare EK_PREM_DXB_BKK performing above forecast",
            priority: "medium",
          },
          {
            type: "warning",
            message: "Baggage ancillary attach rate below 40% threshold",
            priority: "medium",
          },
        ],
      };
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <ArrowUpRight className="h-4 w-4 text-emerald-500" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-500" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? "text-emerald-500" : "text-red-500";
  };

  const getTierColor = (tier: string) => {
    const colors = {
      PLATINUM:
        "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300",
      GOLD: "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300",
      SILVER:
        "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300",
      BRONZE:
        "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300",
    };
    return (
      colors[tier as keyof typeof colors] ||
      "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300"
    );
  };

  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="text-lg font-medium text-gray-600">
            Loading dashboard metrics...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold cls-primary-clr bg-clip-text text-transparent">
            Executive Dashboard
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Performance metrics across fares, agents, cohorts, and ancillaries
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36 bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-36 bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="gcc">GCC</SelectItem>
              <SelectItem value="asia">Asia</SelectItem>
              <SelectItem value="europe">Europe</SelectItem>
              <SelectItem value="americas">Americas</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-md transition-all duration-200"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-md transition-all duration-200"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {metrics?.alerts && metrics.alerts.length > 0 && (
        <div className="space-y-3">
          {metrics.alerts.map((alert, index) => (
            <Alert
              key={index}
              className={`${alert.type === "warning" ? "border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50" : "border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50"} shadow-sm hover:shadow-md transition-all duration-200`}
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="font-medium">
                {alert.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold opacity-90">
              Total Revenue
            </CardTitle>
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {formatCurrency(metrics?.summary.totalRevenue || 0)}
            </div>
            <div className="flex items-center text-sm">
              {getGrowthIcon(metrics?.summary.revenueGrowth || 0)}
              <span
                className={`ml-1 font-medium ${metrics?.summary.revenueGrowth >= 0 ? "text-green-200" : "text-red-200"}`}
              >
                {formatPercent(metrics?.summary.revenueGrowth || 0)} from last
                period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold opacity-90">
              Active Offers
            </CardTitle>
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Gift className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {metrics?.summary.activeOffers?.toLocaleString()}
            </div>
            <div className="flex items-center text-sm">
              {getGrowthIcon(metrics?.summary.offersGrowth || 0)}
              <span
                className={`ml-1 font-medium ${metrics?.summary.offersGrowth >= 0 ? "text-green-200" : "text-red-200"}`}
              >
                {formatPercent(metrics?.summary.offersGrowth || 0)} from last
                period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold opacity-90">
              Active Agents
            </CardTitle>
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {metrics?.summary.activeAgents}
            </div>
            <div className="flex items-center text-sm">
              {getGrowthIcon(metrics?.summary.agentsGrowth || 0)}
              <span
                className={`ml-1 font-medium ${metrics?.summary.agentsGrowth >= 0 ? "text-green-200" : "text-red-200"}`}
              >
                {formatPercent(metrics?.summary.agentsGrowth || 0)} from last
                period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold opacity-90">
              Avg Conversion
            </CardTitle>
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Target className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {formatPercent(metrics?.summary.avgConversion || 0)}
            </div>
            <div className="flex items-center text-sm">
              {getGrowthIcon(metrics?.summary.conversionGrowth || 0)}
              <span
                className={`ml-1 font-medium ${metrics?.summary.conversionGrowth >= 0 ? "text-green-200" : "text-red-200"}`}
              >
                {formatPercent(metrics?.summary.conversionGrowth || 0)} from
                last period
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white/60 backdrop-blur-sm p-1 rounded-xl shadow-sm">
          <TabsTrigger
            value="overview"
            className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="offers"
            className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Top Offers
          </TabsTrigger>
          <TabsTrigger
            value="rules"
            className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Rule Impact
          </TabsTrigger>
          <TabsTrigger
            value="ancillaries"
            className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Ancillaries
          </TabsTrigger>
          <TabsTrigger
            value="agents"
            className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Agents & Campaigns
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={metrics?.trendData}>
                    <defs>
                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#6366f1"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#6366f1"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis
                      tickFormatter={(value) => formatCurrency(value)}
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(Number(value)),
                        "Revenue",
                      ]}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#6366f1"
                      fill="url(#revenueGradient)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Conversion & Margin */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  Conversion & Margin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={metrics?.trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="conversion"
                      stroke="#8b5cf6"
                      name="Conversion %"
                      strokeWidth={3}
                      dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="margin"
                      stroke="#10b981"
                      name="Margin %"
                      strokeWidth={3}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top Offers Tab */}
        <TabsContent value="offers" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
                <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                  <Award className="h-5 w-5 text-white" />
                </div>
                Top Converting Offers
              </CardTitle>
              <CardDescription className="text-base text-slate-600">
                Best performing fare and ancillary combinations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics?.topOffers.map((offer, index) => (
                  <div
                    key={offer.id}
                    className="group flex items-center justify-between p-6 border border-slate-200 rounded-xl bg-gradient-to-r from-white to-slate-50 hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-white text-sm font-bold shadow-md">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-lg text-slate-800">
                          {offer.fareCode}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <Badge
                            variant="outline"
                            className="border-indigo-200 text-indigo-700 bg-indigo-50 font-medium"
                          >
                            {offer.type}
                          </Badge>
                          <span className="font-medium">
                            {offer.conversions.toLocaleString()} conversions
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xl text-slate-800">
                        {formatCurrency(offer.revenue)}
                      </div>
                      <div className="text-sm text-slate-600 font-medium">
                        {formatPercent(offer.attachRate)} attach rate
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rule Impact Tab */}
        <TabsContent value="rules" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
                <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                Rule Impact Heatmap
              </CardTitle>
              <CardDescription className="text-base text-slate-600">
                Discount/markup impact vs margin analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={metrics?.ruleImpact}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="rule"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="avgDiscount"
                    fill="#6366f1"
                    name="Avg Discount %"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="marginImpact"
                    fill="#10b981"
                    name="Margin Impact %"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-8 space-y-3">
                {metrics?.ruleImpact.map((rule) => (
                  <div
                    key={rule.rule}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="font-bold text-slate-800">{rule.rule}</div>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="font-medium text-slate-600">
                        Volume: {rule.volume.toLocaleString()}
                      </span>
                      <span className="text-emerald-600 font-bold">
                        Uplift: +{formatPercent(rule.uplift)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ancillaries Tab */}
        <TabsContent value="ancillaries" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attach Rates Chart */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
                  <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                    <PieChartIcon className="h-5 w-5 text-white" />
                  </div>
                  Ancillary Attach Rates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics?.ancillaryRates}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="category" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="airAttach"
                      fill="#6366f1"
                      name="Air Attach %"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="nonAirAttach"
                      fill="#10b981"
                      name="Non-Air Attach %"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue Breakdown */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  Ancillary Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metrics?.ancillaryRates}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percent }) =>
                        `${category}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalRevenue"
                    >
                      {metrics?.ancillaryRates.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Ancillary Performance Table */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-bold text-slate-800">
                Ancillary Performance Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics?.ancillaryRates.map((ancillary) => (
                  <div
                    key={ancillary.category}
                    className="flex items-center justify-between p-6 border border-slate-200 rounded-xl bg-gradient-to-r from-white to-slate-50 hover:shadow-md transition-all duration-200"
                  >
                    <div>
                      <div className="font-bold text-lg text-slate-800">
                        {ancillary.category}
                      </div>
                      <div className="text-sm text-slate-600 font-medium">
                        Air: {formatPercent(ancillary.airAttach)} | Non-Air:{" "}
                        {formatPercent(ancillary.nonAirAttach)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xl text-slate-800">
                        {formatCurrency(ancillary.totalRevenue)}
                      </div>
                      <div className="text-sm text-slate-600 font-medium">
                        Total Revenue
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agents & Campaigns Tab */}
        <TabsContent value="agents" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agent Tier Performance */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  Agent Tier Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.agentPerformance.map((tier) => (
                    <div
                      key={tier.tier}
                      className="flex items-center justify-between p-6 border border-slate-200 rounded-xl bg-gradient-to-r from-white to-slate-50 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <Badge
                          className={`${getTierColor(tier.tier)} border font-bold px-3 py-1`}
                        >
                          {tier.tier}
                        </Badge>
                        <div>
                          <div className="font-bold text-lg text-slate-800">
                            {tier.agents} agents
                          </div>
                          <div className="text-sm text-slate-600 font-medium">
                            {formatPercent(tier.conversion)} conversion
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-xl text-slate-800">
                          {formatCurrency(tier.avgValue)}
                        </div>
                        <div
                          className={`text-sm flex items-center gap-1 font-medium ${getGrowthColor(tier.growth)}`}
                        >
                          {getGrowthIcon(tier.growth)}
                          {formatPercent(tier.growth)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Campaign ROI */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
                  <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  Campaign ROI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.campaignROI.map((campaign, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-6 border border-slate-200 rounded-xl bg-gradient-to-r from-white to-slate-50 hover:shadow-md transition-all duration-200"
                    >
                      <div>
                        <div className="font-bold text-lg text-slate-800">
                          {campaign.campaign}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Badge
                            variant="outline"
                            className="border-blue-200 text-blue-700 bg-blue-50 font-medium"
                          >
                            {campaign.channel}
                          </Badge>
                          <span className="font-medium">{campaign.cohort}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-xl text-slate-800">
                          {campaign.roi}x ROI
                        </div>
                        <div className="text-sm text-slate-600 font-medium">
                          {campaign.purchased.toLocaleString()}/
                          {campaign.sent.toLocaleString()} (
                          {formatPercent(
                            (campaign.purchased / campaign.sent) * 100,
                          )}
                          )
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agent Performance Chart */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-bold text-slate-800">
                Agent Value vs Conversion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics?.agentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="tier" stroke="#64748b" fontSize={12} />
                  <YAxis
                    yAxisId="left"
                    tickFormatter={(value) => formatCurrency(value)}
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="avgValue"
                    fill="#6366f1"
                    name="Avg Value"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="conversion"
                    fill="#10b981"
                    name="Conversion %"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
