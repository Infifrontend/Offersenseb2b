import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plane,
  Search,
  FileText,
  Users,
  DollarSign,
  Package,
  Eye,
  Trash2,
  Filter,
  Calendar,
  MapPin,
  Crown,
  Tag,
  Percent,
  Gift,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Modal,
  Form as AntForm,
  Input as AntInput,
  Select as AntSelect,
  DatePicker,
  InputNumber,
  Button as AntButton,
  Row,
  Col,
  Card as AntCard,
  Tag as AntTag,
  Descriptions,
  Divider,
  Timeline,
  Statistic,
} from "antd";
import dayjs from "dayjs";
import { cn, formatDate } from "@/lib/utils";

// Form schemas
const offerComposeSchema = z.object({
  origin: z.string().length(3, "Origin must be 3 characters"),
  destination: z.string().length(3, "Destination must be 3 characters"),
  tripType: z.enum(["ONE_WAY", "ROUND_TRIP", "MULTI_CITY"]),
  cabinClass: z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"]),
  departDate: z.string(),
  returnDate: z.string().optional(),
  adultCount: z.number().min(1, "At least 1 adult required"),
  childCount: z.number().min(0),
  infantCount: z.number().min(0),
  channel: z.enum(["API", "PORTAL", "MOBILE"]),
  agentId: z.string().min(1, "Agent ID is required"),
});

type OfferComposeData = z.infer<typeof offerComposeSchema>;

interface OfferTrace {
  id: string;
  traceId: string;
  agentId: string;
  searchParams: {
    origin: string;
    destination: string;
    tripType: string;
    pax: { type: string; count: number }[];
    cabinClass: string;
    dates: { depart: string; return?: string };
    channel: string;
  };
  agentTier: string;
  cohorts: string[];
  fareSource: string;
  basePrice: string;
  adjustments: { rule: string; type: string; value: number }[];
  ancillaries: {
    code: string;
    base: number;
    discount?: number;
    sell: number;
  }[];
  bundles: { code: string; sell: number; saveVsIndiv?: number }[];
  finalOfferPrice: string;
  commission: string;
  auditTraceId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ComposedOffer {
  traceId: string;
  agentTier: string;
  cohorts: string[];
  fareSource: string;
  basePrice: number;
  adjustments: { rule: string; type: string; value: number }[];
  ancillaries: {
    code: string;
    base: number;
    discount?: number;
    sell: number;
  }[];
  bundles: { code: string; sell: number; saveVsIndiv?: number }[];
  finalOfferPrice: number;
  commission: number;
  auditTraceId: string;
}

const airports = [
  { code: "BOM", name: "Mumbai" },
  { code: "DXB", name: "Dubai" },
  { code: "DEL", name: "Delhi" },
  { code: "SHJ", name: "Sharjah" },
  { code: "MAA", name: "Chennai" },
  { code: "SIN", name: "Singapore" },
  { code: "KUL", name: "Kuala Lumpur" },
  { code: "LHR", name: "London" },
  { code: "JFK", name: "New York" },
  { code: "LAX", name: "Los Angeles" },
];

export default function OfferComposer() {
  const [activeTab, setActiveTab] = useState("compose");
  const [filters, setFilters] = useState({});
  const [composedOffer, setComposedOffer] = useState<ComposedOffer | null>(
    null,
  );
  const [isTraceModalOpen, setIsTraceModalOpen] = useState(false);
  const [selectedTrace, setSelectedTrace] = useState<OfferTrace | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<OfferComposeData>({
    resolver: zodResolver(offerComposeSchema),
    defaultValues: {
      tripType: "ROUND_TRIP",
      cabinClass: "ECONOMY",
      adultCount: 1,
      childCount: 0,
      infantCount: 0,
      channel: "PORTAL",
    },
  });

  // Fetch offer traces
  const { data: traces = [], isLoading: tracesLoading } = useQuery({
    queryKey: ["offer-traces", filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/offer/traces?${params}`);
      if (!response.ok) throw new Error("Failed to fetch offer traces");
      return response.json();
    },
  });

  // Compose offer mutation
  const composeOfferMutation = useMutation({
    mutationFn: async (data: OfferComposeData) => {
      const pax = [];
      if (data.adultCount > 0)
        pax.push({ type: "ADT", count: data.adultCount });
      if (data.childCount > 0)
        pax.push({ type: "CHD", count: data.childCount });
      if (data.infantCount > 0)
        pax.push({ type: "INF", count: data.infantCount });

      const requestData = {
        origin: data.origin,
        destination: data.destination,
        tripType: data.tripType,
        pax,
        cabinClass: data.cabinClass,
        dates: {
          depart: data.departDate,
          return: data.returnDate,
        },
        channel: data.channel,
        agentId: data.agentId,
      };

      const response = await fetch("/api/offer/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    onSuccess: (data) => {
      setComposedOffer(data);
      queryClient.invalidateQueries({ queryKey: ["offer-traces"] });
    },
  });

  // Delete trace mutation
  const deleteTraceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/offer/traces/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete trace");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offer-traces"] });
    },
  });

  const onSubmit = (data: OfferComposeData) => {
    composeOfferMutation.mutate(data);
  };

  const handleViewTrace = async (trace: OfferTrace) => {
    setSelectedTrace(trace);
    setIsTraceModalOpen(true);
  };

  const handleDeleteTrace = (id: string) => {
    deleteTraceMutation.mutate(id);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "PLATINUM":
        return "purple";
      case "GOLD":
        return "gold";
      case "SILVER":
        return "default";
      case "BRONZE":
        return "orange";
      default:
        return "default";
    }
  };

  const getFareSourceColor = (source: string) => {
    return source === "NEGOTIATED" ? "green" : "blue";
  };

  if (tracesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="text-lg font-medium text-gray-600">
            Loading offer data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Compose Offer
          </TabsTrigger>
          <TabsTrigger value="traces" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Offer Traces
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Offer Composition Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Search Parameters
                </CardTitle>
                <CardDescription>
                  Enter flight details to compose personalized offer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="origin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Origin</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select origin" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {airports.map((airport) => (
                                  <SelectItem
                                    key={airport.code}
                                    value={airport.code}
                                  >
                                    {airport.code} - {airport.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="destination"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Destination</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select destination" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {airports.map((airport) => (
                                  <SelectItem
                                    key={airport.code}
                                    value={airport.code}
                                  >
                                    {airport.code} - {airport.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="tripType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Trip Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ONE_WAY">One Way</SelectItem>
                                <SelectItem value="ROUND_TRIP">
                                  Round Trip
                                </SelectItem>
                                <SelectItem value="MULTI_CITY">
                                  Multi City
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cabinClass"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cabin Class</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ECONOMY">Economy</SelectItem>
                                <SelectItem value="PREMIUM_ECONOMY">
                                  Premium Economy
                                </SelectItem>
                                <SelectItem value="BUSINESS">
                                  Business
                                </SelectItem>
                                <SelectItem value="FIRST">First</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="departDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Departure Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {form.watch("tripType") === "ROUND_TRIP" && (
                        <FormField
                          control={form.control}
                          name="returnDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Return Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="adultCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adults</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="childCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Children</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="infantCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Infants</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="channel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Channel</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="API">API</SelectItem>
                                <SelectItem value="PORTAL">Portal</SelectItem>
                                <SelectItem value="MOBILE">Mobile</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="agentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Agent ID</FormLabel>
                            <FormControl>
                              <Input placeholder="AGT12345" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={composeOfferMutation.isPending}
                    >
                      {composeOfferMutation.isPending
                        ? "Composing..."
                        : "Compose Offer"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Composed Offer Display */}
            {composedOffer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5" />
                    Composed Offer
                  </CardTitle>
                  <CardDescription>
                    Trace ID: {composedOffer.traceId}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Agent Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">Agent Tier:</span>
                        <Badge variant="secondary">
                          {composedOffer.agentTier}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Fare Source:</span>
                        <Badge
                          variant={
                            composedOffer.fareSource === "NEGOTIATED"
                              ? "default"
                              : "outline"
                          }
                        >
                          {composedOffer.fareSource}
                        </Badge>
                      </div>
                    </div>

                    {/* Cohorts */}
                    {composedOffer.cohorts?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-green-500" />
                          <span className="font-medium">Cohorts:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {composedOffer.cohorts.map((cohort, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {cohort}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pricing Breakdown */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Base Fare:</span>
                        <span className="font-medium">
                          ₹{composedOffer.basePrice}
                        </span>
                      </div>

                      {/* Adjustments */}
                      {composedOffer.adjustments?.length > 0 && (
                        <>
                          <div className="text-sm font-medium text-gray-600">
                            Applied Adjustments:
                          </div>
                          {composedOffer.adjustments.map((adj, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center text-sm"
                            >
                              <span className="flex items-center gap-1">
                                <Percent className="h-3 w-3" />
                                {adj.rule}
                              </span>
                              <span className="text-green-600">
                                {adj.type === "PERCENT"
                                  ? `+${adj.value}%`
                                  : `+₹${adj.value}`}
                              </span>
                            </div>
                          ))}
                        </>
                      )}

                      {/* Ancillaries */}
                      {composedOffer.ancillaries?.length > 0 && (
                        <>
                          <div className="text-sm font-medium text-gray-600">
                            Ancillaries:
                          </div>
                          {composedOffer.ancillaries.map((anc, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center text-sm"
                            >
                              <span className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                {anc.code}
                              </span>
                              <div className="text-right">
                                {anc.discount && anc.discount > 0 ? (
                                  <>
                                    <span className="line-through text-gray-400 mr-2">
                                      ₹{anc.base}
                                    </span>
                                    <span className="text-green-600">
                                      ₹{anc.sell}
                                    </span>
                                  </>
                                ) : (
                                  <span>₹{anc.sell}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </>
                      )}

                      {/* Bundles */}
                      {composedOffer.bundles?.length > 0 && (
                        <>
                          <div className="text-sm font-medium text-gray-600">
                            Bundles:
                          </div>
                          {composedOffer.bundles.map((bundle, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center text-sm"
                            >
                              <span className="flex items-center gap-1">
                                <Gift className="h-3 w-3" />
                                {bundle.code}
                              </span>
                              <div className="text-right">
                                <span className="text-blue-600">
                                  ₹{bundle.sell}
                                </span>
                                {bundle.saveVsIndiv &&
                                  bundle.saveVsIndiv > 0 && (
                                    <div className="text-xs text-green-600">
                                      Save ₹{bundle.saveVsIndiv}
                                    </div>
                                  )}
                              </div>
                            </div>
                          ))}
                        </>
                      )}

                      <div className="border-t pt-3 flex justify-between items-center font-bold text-lg">
                        <span>Total Offer Price:</span>
                        <span className="text-blue-600">
                          ₹{composedOffer.finalOfferPrice}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span>Commission (3%):</span>
                        <span className="font-medium text-green-600">
                          ₹{composedOffer.commission}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="traces" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Offer Traces</h2>
              <p className="text-muted-foreground">
                View historical offer compositions
              </p>
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all-status">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              {tracesLoading ? (
                <div className="flex items-center justify-center p-12">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-gray-600">Loading traces...</span>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trace ID</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Fare Source</TableHead>
                      <TableHead>Final Price</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {traces.map((trace: OfferTrace) => (
                      <TableRow key={trace.id}>
                        <TableCell className="font-mono text-sm">
                          {trace.traceId}
                        </TableCell>
                        <TableCell>{trace.agentId}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span>{trace.searchParams.origin}</span>
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span>{trace.searchParams.destination}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{trace.agentTier}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              trace.fareSource === "NEGOTIATED"
                                ? "default"
                                : "outline"
                            }
                          >
                            {trace.fareSource}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{parseFloat(trace.finalOfferPrice).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(trace.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewTrace(trace)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTrace(trace.id)}
                              disabled={deleteTraceMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Trace Details Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Offer Trace Details
              </h3>
              <p className="text-sm text-gray-500">{selectedTrace?.traceId}</p>
            </div>
          </div>
        }
        open={isTraceModalOpen}
        onCancel={() => {
          setIsTraceModalOpen(false);
          setSelectedTrace(null);
        }}
        footer={[
          <AntButton
            key="close"
            type="primary"
            onClick={() => {
              setIsTraceModalOpen(false);
              setSelectedTrace(null);
            }}
          >
            Close
          </AntButton>,
        ]}
        width={900}
      >
        {selectedTrace && (
          <div className="space-y-6 pt-4">
            {/* Search Parameters */}
            <AntCard title="Search Parameters" size="small">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Route">
                  {selectedTrace.searchParams.origin} →{" "}
                  {selectedTrace.searchParams.destination}
                </Descriptions.Item>
                <Descriptions.Item label="Trip Type">
                  {selectedTrace.searchParams.tripType.replace("_", " ")}
                </Descriptions.Item>
                <Descriptions.Item label="Cabin Class">
                  {selectedTrace.searchParams.cabinClass.replace("_", " ")}
                </Descriptions.Item>
                <Descriptions.Item label="Channel">
                  {selectedTrace.searchParams.channel}
                </Descriptions.Item>
                <Descriptions.Item label="Passengers">
                  {selectedTrace.searchParams.pax
                    .map((p) => `${p.count} ${p.type}`)
                    .join(", ")}
                </Descriptions.Item>
                <Descriptions.Item label="Dates">
                  {selectedTrace.searchParams.dates.depart}
                  {selectedTrace.searchParams.dates.return &&
                    ` - ${selectedTrace.searchParams.dates.return}`}
                </Descriptions.Item>
              </Descriptions>
            </AntCard>

            {/* Agent Information */}
            <AntCard title="Agent Information" size="small">
              <div className="grid grid-cols-3 gap-4">
                <Statistic
                  title="Agent ID"
                  value={selectedTrace.agentId}
                  valueStyle={{ fontSize: "16px" }}
                />
                <Statistic
                  title="Agent Tier"
                  value={selectedTrace.agentTier}
                  valueStyle={{ fontSize: "16px" }}
                />
                <Statistic
                  title="Fare Source"
                  value={selectedTrace.fareSource}
                  valueStyle={{ fontSize: "16px" }}
                />
              </div>
              {selectedTrace.cohorts && selectedTrace.cohorts.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Cohorts:</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedTrace.cohorts.map((cohort, index) => (
                      <AntTag key={index} color="blue">
                        {cohort}
                      </AntTag>
                    ))}
                  </div>
                </div>
              )}
            </AntCard>

            {/* Pricing Breakdown */}
            <AntCard title="Pricing Breakdown" size="small">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Base Fare:</span>
                  <span className="font-medium">
                    ₹{parseFloat(selectedTrace.basePrice).toLocaleString()}
                  </span>
                </div>

                {selectedTrace.adjustments &&
                  selectedTrace.adjustments.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">
                        Applied Adjustments:
                      </div>
                      {selectedTrace.adjustments.map((adj, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-sm"
                        >
                          <span>{adj.rule}</span>
                          <span className="text-green-600">
                            {adj.type === "PERCENT"
                              ? `+${adj.value}%`
                              : `+₹${adj.value}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                {selectedTrace.ancillaries &&
                  selectedTrace.ancillaries.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">
                        Ancillaries:
                      </div>
                      {selectedTrace.ancillaries.map((anc, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-sm"
                        >
                          <span>{anc.code}</span>
                          <span>₹{anc.sell}</span>
                        </div>
                      ))}
                    </div>
                  )}

                {selectedTrace.bundles && selectedTrace.bundles.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Bundles:</div>
                    {selectedTrace.bundles.map((bundle, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm"
                      >
                        <span>{bundle.code}</span>
                        <span>₹{bundle.sell}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Divider />

                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Final Offer Price:</span>
                  <span className="text-blue-600">
                    ₹
                    {parseFloat(selectedTrace.finalOfferPrice).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Commission:</span>
                  <span className="text-green-600 font-medium">
                    ₹{parseFloat(selectedTrace.commission).toLocaleString()}
                  </span>
                </div>
              </div>
            </AntCard>

            {/* Audit Information */}
            <AntCard title="Audit Information" size="small">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Audit Trace ID">
                  {selectedTrace.auditTraceId}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <AntTag
                    color={selectedTrace.status === "ACTIVE" ? "green" : "red"}
                  >
                    {selectedTrace.status}
                  </AntTag>
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                  {dayjs(selectedTrace.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                </Descriptions.Item>
                <Descriptions.Item label="Updated At">
                  {dayjs(selectedTrace.updatedAt).format("YYYY-MM-DD HH:mm:ss")}
                </Descriptions.Item>
              </Descriptions>
            </AntCard>
          </div>
        )}
      </Modal>
    </div>
  );
}
