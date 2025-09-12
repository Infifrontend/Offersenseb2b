import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart3,
  Play,
  Search,
  TrendingUp,
  TrendingDown,
  Brain,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  Eye,
  Edit,
  Trash2,
  MessageCircle,
  Target,
  DollarSign,
  Percent,
  BarChart,
  PieChart,
  LineChart,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type {
  Simulation,
  InsertSimulation,
  InsightQuery,
} from "../../../shared/schema";

const simulationFormSchema = z.object({
  scenarioName: z.string().min(1, "Scenario name is required"),
  scope: z.object({
    origin: z.string().optional(),
    destination: z.string().optional(),
    pos: z.array(z.string()).optional(),
    agentTier: z.array(z.string()).optional(),
    cohorts: z.array(z.string()).optional(),
    channel: z.array(z.string()).optional(),
  }).optional(),
  change: z.object({
    ruleType: z.enum(["DISCOUNT", "MARKUP", "ANCILLARY", "BUNDLE"]),
    adjustment: z.object({
      type: z.enum(["PERCENT", "AMOUNT"]),
      value: z.number().min(-100, "Value must be greater than -100").max(1000, "Value must be less than 1000"),
    }),
    description: z.string().optional(),
  }),
  forecast: z.object({
    revenueChangePct: z.string().regex(/^[+-]?\d+\.?\d*$/, "Invalid percentage format (use +1.5 or -2.0)"),
    conversionChangePct: z.string().regex(/^[+-]?\d+\.?\d*$/, "Invalid percentage format (use +1.5 or -2.0)"),
    marginImpactPct: z.string().regex(/^[+-]?\d+\.?\d*$/, "Invalid percentage format (use +1.5 or -2.0)"),
    attachRateChangePct: z.string().regex(/^[+-]?\d+\.?\d*$/, "Invalid percentage format (use +1.5 or -2.0)").optional(),
  }),
});

const queryFormSchema = z.object({
  queryText: z.string().min(1, "Query is required"),
  filters: z
    .object({
      timeRange: z
        .object({
          start: z.string(),
          end: z.string(),
        })
        .optional(),
      pos: z.array(z.string()).optional(),
      agentTier: z.array(z.string()).optional(),
      cohorts: z.array(z.string()).optional(),
      channel: z.array(z.string()).optional(),
    })
    .optional(),
});

const countriesData = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "AU", name: "Australia" },
  { code: "JP", name: "Japan" },
  { code: "IN", name: "India" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
];

const agentTiers = ["PLATINUM", "GOLD", "SILVER", "BRONZE"];
const channels = ["API", "PORTAL", "MOBILE"];

export default function AnalyticsSimulation() {
  const [activeTab, setActiveTab] = useState("simulations");
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);
  const [selectedSimulation, setSelectedSimulation] =
    useState<Simulation | null>(null);
  const [isViewSimulationOpen, setIsViewSimulationOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);
  const [lastQuery, setLastQuery] = useState<InsightQuery | null>(null);
  const queryClient = useQueryClient();

  const simulationForm = useForm<z.infer<typeof simulationFormSchema>>({
    resolver: zodResolver(simulationFormSchema),
    defaultValues: {
      scenarioName: "",
      scope: {
        origin: "",
        destination: "",
        pos: [],
        agentTier: [],
        cohorts: [],
        channel: [],
      },
      change: {
        ruleType: "DISCOUNT",
        adjustment: { type: "PERCENT", value: 0 },
        description: "",
      },
      forecast: {
        revenueChangePct: "+0.0",
        conversionChangePct: "+0.0",
        marginImpactPct: "+0.0",
        attachRateChangePct: "+0.0",
      },
    },
  });

  // Fetch simulations
  const { data: simulations = [], isLoading: simulationsLoading } = useQuery({
    queryKey: ["simulations"],
    queryFn: async () => {
      const response = await fetch("/api/simulations");
      if (!response.ok) throw new Error("Failed to fetch simulations");
      return response.json() as Promise<Simulation[]>;
    },
  });

  // Fetch insight queries
  const { data: insightQueries = [], isLoading: queriesLoading } = useQuery({
    queryKey: ["insight-queries"],
    queryFn: async () => {
      const response = await fetch("/api/insights/queries");
      if (!response.ok) throw new Error("Failed to fetch insight queries");
      return response.json() as Promise<InsightQuery[]>;
    },
  });

  // Fetch available cohorts from the API
  const { data: availableCohorts = [] } = useQuery({
    queryKey: ["cohorts-list"],
    queryFn: async () => {
      const response = await fetch("/api/cohorts");
      if (!response.ok) throw new Error("Failed to fetch cohorts");
      return response.json();
    },
  });

  // Create simulation mutation
  const createSimulationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof simulationFormSchema>) => {
      console.log("Submitting simulation data:", data);
      
      const requestData = {
        ...data,
        createdBy: "analyst_user"
      };
      
      const response = await fetch("/api/simulations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user": "analyst_user",
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        console.error("Simulation creation failed:", errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to create simulation`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simulations"] });
      setIsSimulationModalOpen(false);
      simulationForm.reset();
    },
    onError: (error) => {
      console.error("Simulation creation error:", error);
      // You could add a toast notification here if you have one set up
    },
  });

  // Run simulation mutation
  const runSimulationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/simulations/${id}/run`, {
        method: "POST",
        headers: { "x-user": "analyst_user" },
      });
      if (!response.ok) throw new Error("Failed to run simulation");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simulations"] });
    },
  });

  // Submit query mutation
  const submitQueryMutation = useMutation({
    mutationFn: async (queryData: { queryText: string; filters?: any }) => {
      const response = await fetch("/api/insights/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user": "analyst_user",
        },
        body: JSON.stringify(queryData),
      });
      if (!response.ok) throw new Error("Failed to process query");
      return response.json();
    },
    onSuccess: (data) => {
      setLastQuery(data);
      queryClient.invalidateQueries({ queryKey: ["insight-queries"] });
    },
  });

  const handleSimulationSubmit = (
    data: z.infer<typeof simulationFormSchema>,
  ) => {
    createSimulationMutation.mutate(data);
  };

  const handleQuerySubmit = () => {
    if (!query.trim()) return;

    setIsQuerying(true);
    submitQueryMutation.mutate(
      { queryText: query },
      {
        onSettled: () => setIsQuerying(false),
      },
    );
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      DRAFT: "bg-gray-100 text-gray-800",
      RUNNING: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return (
      <Badge
        className={
          colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }
      >
        {status}
      </Badge>
    );
  };

  const getChangeIcon = (value: string) => {
    if (value.startsWith("+"))
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value.startsWith("-"))
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <BarChart className="h-4 w-4 text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="simulations" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Simulation Builder
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            NLP Insight Console
          </TabsTrigger>
        </TabsList>

        {/* Simulation Builder Tab */}
        <TabsContent value="simulations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">What-If Scenarios</h3>
            <Dialog
              open={isSimulationModalOpen}
              onOpenChange={setIsSimulationModalOpen}
            >
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Scenario
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Simulation</DialogTitle>
                  <DialogDescription>
                    Define a scenario to analyze potential business impact
                  </DialogDescription>
                </DialogHeader>

                <Form {...simulationForm}>
                  <form
                    onSubmit={simulationForm.handleSubmit(
                      handleSimulationSubmit,
                    )}
                    className="space-y-4"
                  >
                    <FormField
                      control={simulationForm.control}
                      name="scenarioName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scenario Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Gold discount +2% in GCC"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <h4 className="font-medium">Target Scope</h4>
                      

                      <FormField
                        control={simulationForm.control}
                        name="scope.origin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Origin</FormLabel>
                            <FormControl>
                              <Input placeholder="DXB" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={simulationForm.control}
                        name="scope.destination"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Destination</FormLabel>
                            <FormControl>
                              <Input placeholder="LHR" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={simulationForm.control}
                        name="scope.pos"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Point of Sale</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Select onValueChange={(value) => {
                                  const currentPos = field.value || [];
                                  if (!currentPos.includes(value)) {
                                    const newPos = [...currentPos, value];
                                    field.onChange(newPos);
                                  }
                                }}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select countries" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {countriesData.map((country) => (
                                      <SelectItem key={country.code} value={country.code}>
                                        {country.code} - {country.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {field.value && field.value.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {field.value.map((pos: string) => (
                                      <Badge key={pos} variant="secondary" className="flex items-center gap-1">
                                        {pos}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newPos = field.value.filter((p: string) => p !== pos);
                                            field.onChange(newPos);
                                          }}
                                          className="ml-1 text-xs hover:text-red-500"
                                        >
                                          ×
                                        </button>
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={simulationForm.control}
                        name="scope.agentTier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Agent Tiers</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Select onValueChange={(value) => {
                                  const currentTiers = field.value || [];
                                  if (!currentTiers.includes(value)) {
                                    const newTiers = [...currentTiers, value];
                                    field.onChange(newTiers);
                                  }
                                }}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select agent tiers" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {agentTiers.map((tier) => (
                                      <SelectItem key={tier} value={tier}>
                                        {tier}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {field.value && field.value.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {field.value.map((tier: string) => (
                                      <Badge key={tier} variant="secondary" className="flex items-center gap-1">
                                        {tier}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newTiers = field.value.filter((t: string) => t !== tier);
                                            field.onChange(newTiers);
                                          }}
                                          className="ml-1 text-xs hover:text-red-500"
                                        >
                                          ×
                                        </button>
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={simulationForm.control}
                        name="scope.cohorts"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Eligible Cohorts (Optional)</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Select onValueChange={(value) => {
                                  const currentCohorts = field.value || [];
                                  if (!currentCohorts.includes(value)) {
                                    const newCohorts = [...currentCohorts, value];
                                    field.onChange(newCohorts);
                                  }
                                }}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select cohorts" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableCohorts.map((cohort: any) => (
                                      <SelectItem key={cohort.id} value={cohort.cohortName}>
                                        <div className="flex flex-col">
                                          <div className="flex items-center gap-2">
                                            <span>{cohort.cohortName}</span>
                                            <span className="text-gray-600 text-sm">({cohort.cohortCode})</span>
                                          </div>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {field.value && field.value.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {field.value.map((cohortName: string) => {
                                      const cohort = availableCohorts.find((c: any) => c.cohortName === cohortName);
                                      return (
                                        <Badge key={cohortName} variant="outline" className="flex items-center gap-1">
                                          {cohort ? cohort.cohortCode : cohortName}
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const newCohorts = field.value.filter((c: string) => c !== cohortName);
                                              field.onChange(newCohorts);
                                            }}
                                            className="ml-1 text-xs hover:text-red-500"
                                          >
                                            ×
                                          </button>
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={simulationForm.control}
                        name="scope.channel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Channels</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Select onValueChange={(value) => {
                                  const currentChannels = field.value || [];
                                  if (!currentChannels.includes(value)) {
                                    const newChannels = [...currentChannels, value];
                                    field.onChange(newChannels);
                                  }
                                }}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select channels" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {channels.map((channel) => (
                                      <SelectItem key={channel} value={channel}>
                                        {channel}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {field.value && field.value.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {field.value.map((channel: string) => (
                                      <Badge key={channel} variant="secondary" className="flex items-center gap-1">
                                        {channel}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newChannels = field.value.filter((c: string) => c !== channel);
                                            field.onChange(newChannels);
                                          }}
                                          className="ml-1 text-xs hover:text-red-500"
                                        >
                                          ×
                                        </button>
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Proposed Change</h4>
                      <FormField
                        control={simulationForm.control}
                        name="change.ruleType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Change Type</FormLabel>
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
                                <SelectItem value="DISCOUNT">
                                  Discount
                                </SelectItem>
                                <SelectItem value="MARKUP">Markup</SelectItem>
                                <SelectItem value="ANCILLARY">
                                  Ancillary
                                </SelectItem>
                                <SelectItem value="BUNDLE">Bundle</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={simulationForm.control}
                        name="change.description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the proposed change..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={simulationForm.control}
                          name="change.adjustment.type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Adjustment Type</FormLabel>
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
                                  <SelectItem value="PERCENT">
                                    Percent
                                  </SelectItem>
                                  <SelectItem value="AMOUNT">Amount</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={simulationForm.control}
                          name="change.adjustment.value"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Value</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                                    field.onChange(isNaN(value) ? 0 : value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Forecast Metrics</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={simulationForm.control}
                          name="forecast.revenueChangePct"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Revenue Change %</FormLabel>
                              <FormControl>
                                <Input placeholder="+1.8" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={simulationForm.control}
                          name="forecast.conversionChangePct"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Conversion Change %</FormLabel>
                              <FormControl>
                                <Input placeholder="+4.2" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={simulationForm.control}
                          name="forecast.marginImpactPct"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Margin Impact %</FormLabel>
                              <FormControl>
                                <Input placeholder="-0.6" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={simulationForm.control}
                          name="forecast.attachRateChangePct"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Attach Rate Change %</FormLabel>
                              <FormControl>
                                <Input placeholder="+2.1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsSimulationModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createSimulationMutation.isPending}
                      >
                        {createSimulationMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Create Simulation
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {simulationsLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : simulations.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No simulations created yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              simulations.map((simulation) => (
                <Card
                  key={simulation.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {simulation.scenarioName}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Created{" "}
                          {new Date(simulation.createdAt!).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(simulation.status!)}
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSimulation(simulation);
                              setIsViewSimulationOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {simulation.status === "DRAFT" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                runSimulationMutation.mutate(simulation.id)
                              }
                              disabled={runSimulationMutation.isPending}
                            >
                              {runSimulationMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {(simulation.change as any)?.ruleType || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Percent className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {(simulation.change as any)?.adjustment?.value || 0}
                            %
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          {getChangeIcon(
                            (simulation.forecast as any)?.revenueChangePct,
                          )}
                          <div>
                            <div className="font-medium">Revenue</div>
                            <div className="text-muted-foreground">
                              {(simulation.forecast as any)?.revenueChangePct}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getChangeIcon(
                            (simulation.forecast as any)?.conversionChangePct,
                          )}
                          <div>
                            <div className="font-medium">Conversion</div>
                            <div className="text-muted-foreground">
                              {
                                (simulation.forecast as any)
                                  ?.conversionChangePct
                              }
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getChangeIcon(
                            (simulation.forecast as any)?.marginImpactPct,
                          )}
                          <div>
                            <div className="font-medium">Margin</div>
                            <div className="text-muted-foreground">
                              {(simulation.forecast as any)?.marginImpactPct}
                            </div>
                          </div>
                        </div>
                      </div>

                      {simulation.actualResults &&
                        simulation.status === "COMPLETED" && (
                          <>
                            <Separator />
                            <div className="space-y-2">
                              <div className="text-sm font-medium">
                                Actual vs Forecast
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <div className="text-muted-foreground">
                                    Revenue
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span>
                                      {
                                        (simulation.actualResults as any)
                                          ?.revenueChangePct
                                      }
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      vs{" "}
                                      {
                                        (simulation.forecast as any)
                                          ?.revenueChangePct
                                      }
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">
                                    Conversion
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span>
                                      {
                                        (simulation.actualResults as any)
                                          ?.conversionChangePct
                                      }
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      vs{" "}
                                      {
                                        (simulation.forecast as any)
                                          ?.conversionChangePct
                                      }
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">
                                    Margin
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span>
                                      {
                                        (simulation.actualResults as any)
                                          ?.marginImpactPct
                                      }
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      vs{" "}
                                      {
                                        (simulation.forecast as any)
                                          ?.marginImpactPct
                                      }
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* NLP Insight Console Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">
              Ask Anything About Your Business
            </h3>
            <p className="text-muted-foreground mb-4">
              Use natural language to query performance data, discover insights,
              and get answers to your business questions.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Query Console
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="e.g., What's the average discount rate for Gold tier agents in the GCC region?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-h-20"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleQuerySubmit();
                    }
                  }}
                />
                <Button
                  onClick={handleQuerySubmit}
                  disabled={isQuerying || !query.trim()}
                  className="self-end"
                >
                  {isQuerying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Sample Queries */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sample Queries:</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    "What's the total revenue growth this quarter?",
                    "How are Gold tier agents performing compared to Silver?",
                    "Which routes have the highest conversion rates?",
                    "What's the ROI of our recent campaigns?",
                    "Show me ancillary attachment rates by channel",
                    "Which discount rules are triggered most often?",
                  ].map((sampleQuery) => (
                    <Button
                      key={sampleQuery}
                      variant="outline"
                      size="sm"
                      className="text-left justify-start h-auto p-2 text-xs"
                      onClick={() => setQuery(sampleQuery)}
                    >
                      {sampleQuery}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Last Query Result */}
              {lastQuery && (
                <div className="space-y-4">
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Query Result</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {lastQuery.executionTimeMs}ms
                        {lastQuery.response && (
                          <>
                            <Separator orientation="vertical" className="h-4" />
                            <div className="flex items-center gap-1">
                              <Brain className="h-4 w-4" />
                              {Math.round(
                                ((lastQuery.response as any)?.confidence || 0) *
                                  100,
                              )}
                              % confidence
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <Alert>
                      <Brain className="h-4 w-4" />
                      <AlertDescription className="text-sm leading-relaxed">
                        {(lastQuery.response as any)?.answer ||
                          "No answer available"}
                      </AlertDescription>
                    </Alert>

                    {(lastQuery.response as any)?.data && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <PieChart className="h-4 w-4" />
                            Supporting Data
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
                            {JSON.stringify(
                              (lastQuery.response as any).data,
                              null,
                              2,
                            )}
                          </pre>
                        </CardContent>
                      </Card>
                    )}

                    {(lastQuery.response as any)?.sources && (
                      <div className="text-xs text-muted-foreground">
                        Sources:{" "}
                        {(lastQuery.response as any).sources.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Queries */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Queries</CardTitle>
            </CardHeader>
            <CardContent>
              {queriesLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : insightQueries.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No queries yet
                </p>
              ) : (
                <div className="space-y-3">
                  {insightQueries.slice(0, 5).map((query) => (
                    <div
                      key={query.id}
                      className="border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium truncate flex-1 mr-2">
                          {query.queryText}
                        </p>
                        <div className="flex items-center gap-2">
                          {query.status === "COMPLETED" && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                          {query.status === "ERROR" && (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          {query.status === "PROCESSING" && (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(query.createdAt!).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {query.response && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {(query.response as any).answer}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Simulation Dialog */}
      <Dialog
        open={isViewSimulationOpen}
        onOpenChange={setIsViewSimulationOpen}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSimulation?.scenarioName}</DialogTitle>
            <DialogDescription>
              Simulation details and results
            </DialogDescription>
          </DialogHeader>

          {selectedSimulation && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedSimulation.status!)}
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Created</Label>
                  <div className="mt-1 text-muted-foreground">
                    {new Date(selectedSimulation.createdAt!).toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <Label className="font-medium">Scope</Label>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <pre className="text-xs">
                    {JSON.stringify(selectedSimulation.scope, null, 2)}
                  </pre>
                </div>
              </div>

              <div>
                <Label className="font-medium">Change</Label>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <pre className="text-xs">
                    {JSON.stringify(selectedSimulation.change, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Forecast</Label>
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <pre className="text-xs">
                      {JSON.stringify(selectedSimulation.forecast, null, 2)}
                    </pre>
                  </div>
                </div>

                {selectedSimulation.actualResults && (
                  <div>
                    <Label className="font-medium">Actual Results</Label>
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <pre className="text-xs">
                        {JSON.stringify(
                          selectedSimulation.actualResults,
                          null,
                          2,
                        )}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
