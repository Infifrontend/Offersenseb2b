
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Area
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
  Settings
} from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

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
          conversionGrowth: -2.1
        },
        topOffers: [
          { id: 1, fareCode: "EK_PREM_DXB_LHR", type: "Negotiated", conversions: 1250, revenue: 125000, attachRate: 34.5 },
          { id: 2, fareCode: "QR_BUS_DOH_JFK", type: "API", conversions: 980, revenue: 98000, attachRate: 28.2 },
          { id: 3, fareCode: "EY_ECO_AUH_SYD", type: "Negotiated", conversions: 856, revenue: 85600, attachRate: 42.1 },
          { id: 4, fareCode: "LH_BUS_FRA_BOM", type: "API", conversions: 742, revenue: 74200, attachRate: 31.8 },
          { id: 5, fareCode: "BA_PREM_LHR_LAX", type: "Negotiated", conversions: 689, revenue: 68900, attachRate: 38.7 }
        ],
        ruleImpact: [
          { rule: "DISC_GCC_GOLD", avgDiscount: -8.5, marginImpact: -2.1, volume: 1250, uplift: 15.2 },
          { rule: "DISC_ASIA_PLAT", avgDiscount: -12.0, marginImpact: -3.2, volume: 890, uplift: 22.8 },
          { rule: "MARKUP_EU_SILVER", avgDiscount: 5.5, marginImpact: 1.8, volume: 567, uplift: 8.4 },
          { rule: "DISC_AMERICAS_GOLD", avgDiscount: -6.2, marginImpact: -1.5, volume: 445, uplift: 12.1 },
          { rule: "BUNDLE_FREQ_FLYER", avgDiscount: -15.0, marginImpact: 2.5, volume: 334, uplift: 28.5 }
        ],
        ancillaryRates: [
          { category: "Baggage", airAttach: 45.2, nonAirAttach: 0, totalRevenue: 450000 },
          { category: "Seats", airAttach: 38.7, nonAirAttach: 0, totalRevenue: 280000 },
          { category: "Meals", airAttach: 22.1, nonAirAttach: 0, totalRevenue: 120000 },
          { category: "Insurance", airAttach: 15.8, nonAirAttach: 42.3, totalRevenue: 340000 },
          { category: "Hotels", airAttach: 0, nonAirAttach: 28.9, totalRevenue: 890000 },
          { category: "Transfers", airAttach: 0, nonAirAttach: 18.5, totalRevenue: 220000 }
        ],
        agentPerformance: [
          { tier: "PLATINUM", agents: 45, avgValue: 125000, conversion: 6.8, growth: 18.5 },
          { tier: "GOLD", agents: 128, avgValue: 85000, conversion: 4.9, growth: 12.2 },
          { tier: "SILVER", agents: 210, avgValue: 45000, conversion: 3.2, growth: 8.1 },
          { tier: "BRONZE", agents: 141, avgValue: 18000, conversion: 2.1, growth: 5.3 }
        ],
        campaignROI: [
          { campaign: "Pre-Travel Baggage", sent: 15000, purchased: 1250, roi: 4.2, channel: "EMAIL", cohort: "FREQUENT_FLYER" },
          { campaign: "Seat Selection Promo", sent: 12000, purchased: 840, roi: 3.1, channel: "PORTAL", cohort: "LAST_MINUTE" },
          { campaign: "Lounge Access Offer", sent: 8500, purchased: 680, roi: 2.8, channel: "WHATSAPP", cohort: "BUSINESS_TRAVELER" },
          { campaign: "Insurance Upsell", sent: 20000, purchased: 1400, roi: 2.2, channel: "EMAIL", cohort: "FAMILY_TRAVELER" },
          { campaign: "Hotel Bundle Deal", sent: 18000, purchased: 1080, roi: 1.9, channel: "API", cohort: "LEISURE_TRAVELER" }
        ],
        trendData: [
          { date: "2024-01", revenue: 2100000, conversion: 3.8, margin: 12.5 },
          { date: "2024-02", revenue: 2200000, conversion: 4.1, margin: 13.2 },
          { date: "2024-03", revenue: 2350000, conversion: 4.3, margin: 12.8 },
          { date: "2024-04", revenue: 2400000, conversion: 4.2, margin: 13.5 },
          { date: "2024-05", revenue: 2450000, conversion: 4.2, margin: 13.1 }
        ],
        alerts: [
          { type: "warning", message: "Conversion rate for BRONZE tier agents down 5.2% this week", priority: "high" },
          { type: "info", message: "New negotiated fare EK_PREM_DXB_BKK performing above forecast", priority: "medium" },
          { type: "warning", message: "Baggage ancillary attach rate below 40% threshold", priority: "medium" }
        ]
      };
    }
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? "text-green-600" : "text-red-600";
  };

  const getTierColor = (tier: string) => {
    const colors = {
      PLATINUM: "bg-purple-100 text-purple-800",
      GOLD: "bg-yellow-100 text-yellow-800",
      SILVER: "bg-gray-100 text-gray-800",
      BRONZE: "bg-orange-100 text-orange-800"
    };
    return colors[tier as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Executive Dashboard</h2>
          <p className="text-muted-foreground">
            Performance metrics across fares, agents, cohorts, and ancillaries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
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
            <SelectTrigger className="w-32">
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
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {metrics?.alerts && metrics.alerts.length > 0 && (
        <div className="space-y-2">
          {metrics.alerts.map((alert, index) => (
            <Alert key={index} className={alert.type === 'warning' ? 'border-orange-200 bg-orange-50' : ''}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics?.summary.totalRevenue || 0)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getGrowthIcon(metrics?.summary.revenueGrowth || 0)}
              <span className={`ml-1 ${getGrowthColor(metrics?.summary.revenueGrowth || 0)}`}>
                {formatPercent(metrics?.summary.revenueGrowth || 0)} from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.summary.activeOffers?.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getGrowthIcon(metrics?.summary.offersGrowth || 0)}
              <span className={`ml-1 ${getGrowthColor(metrics?.summary.offersGrowth || 0)}`}>
                {formatPercent(metrics?.summary.offersGrowth || 0)} from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.summary.activeAgents}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getGrowthIcon(metrics?.summary.agentsGrowth || 0)}
              <span className={`ml-1 ${getGrowthColor(metrics?.summary.agentsGrowth || 0)}`}>
                {formatPercent(metrics?.summary.agentsGrowth || 0)} from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Conversion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercent(metrics?.summary.avgConversion || 0)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getGrowthIcon(metrics?.summary.conversionGrowth || 0)}
              <span className={`ml-1 ${getGrowthColor(metrics?.summary.conversionGrowth || 0)}`}>
                {formatPercent(metrics?.summary.conversionGrowth || 0)} from last period
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="offers">Top Offers</TabsTrigger>
          <TabsTrigger value="rules">Rule Impact</TabsTrigger>
          <TabsTrigger value="ancillaries">Ancillaries</TabsTrigger>
          <TabsTrigger value="agents">Agents & Campaigns</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={metrics?.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Revenue"]} />
                    <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Conversion & Margin */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Conversion & Margin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics?.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line yAxisId="left" type="monotone" dataKey="conversion" stroke="#8884d8" name="Conversion %" />
                    <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#82ca9d" name="Margin %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top Offers Tab */}
        <TabsContent value="offers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Top Converting Offers
              </CardTitle>
              <CardDescription>
                Best performing fare and ancillary combinations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics?.topOffers.map((offer, index) => (
                  <div key={offer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{offer.fareCode}</div>
                        <div className="text-sm text-muted-foreground">
                          <Badge variant="outline" className="mr-2">{offer.type}</Badge>
                          {offer.conversions} conversions
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(offer.revenue)}</div>
                      <div className="text-sm text-muted-foreground">
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
        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Rule Impact Heatmap
              </CardTitle>
              <CardDescription>
                Discount/markup impact vs margin analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={metrics?.ruleImpact} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rule" angle={-45} textAnchor="end" height={80} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="avgDiscount" fill="#8884d8" name="Avg Discount %" />
                  <Bar yAxisId="right" dataKey="marginImpact" fill="#82ca9d" name="Margin Impact %" />
                </BarChart>
              </ResponsiveContainer>
              
              <div className="mt-6 space-y-3">
                {metrics?.ruleImpact.map((rule) => (
                  <div key={rule.rule} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="font-medium">{rule.rule}</div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>Volume: {rule.volume}</span>
                      <span className="text-green-600">Uplift: +{formatPercent(rule.uplift)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ancillaries Tab */}
        <TabsContent value="ancillaries" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attach Rates Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Ancillary Attach Rates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics?.ancillaryRates}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="airAttach" fill="#8884d8" name="Air Attach %" />
                    <Bar dataKey="nonAirAttach" fill="#82ca9d" name="Non-Air Attach %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
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
                      label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalRevenue"
                    >
                      {metrics?.ancillaryRates.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Ancillary Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Ancillary Performance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics?.ancillaryRates.map((ancillary) => (
                  <div key={ancillary.category} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{ancillary.category}</div>
                      <div className="text-sm text-muted-foreground">
                        Air: {formatPercent(ancillary.airAttach)} | Non-Air: {formatPercent(ancillary.nonAirAttach)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(ancillary.totalRevenue)}</div>
                      <div className="text-sm text-muted-foreground">Total Revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agents & Campaigns Tab */}
        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agent Tier Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Agent Tier Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.agentPerformance.map((tier) => (
                    <div key={tier.tier} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={getTierColor(tier.tier)}>{tier.tier}</Badge>
                        <div>
                          <div className="font-medium">{tier.agents} agents</div>
                          <div className="text-sm text-muted-foreground">
                            {formatPercent(tier.conversion)} conversion
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(tier.avgValue)}</div>
                        <div className={`text-sm flex items-center gap-1 ${getGrowthColor(tier.growth)}`}>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Campaign ROI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.campaignROI.map((campaign, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{campaign.campaign}</div>
                        <div className="text-sm text-muted-foreground">
                          <Badge variant="outline" className="mr-2">{campaign.channel}</Badge>
                          {campaign.cohort}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{campaign.roi}x ROI</div>
                        <div className="text-sm text-muted-foreground">
                          {campaign.purchased}/{campaign.sent} ({formatPercent((campaign.purchased / campaign.sent) * 100)})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agent Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Value vs Conversion</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics?.agentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tier" />
                  <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="avgValue" fill="#8884d8" name="Avg Value" />
                  <Bar yAxisId="right" dataKey="conversion" fill="#82ca9d" name="Conversion %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
