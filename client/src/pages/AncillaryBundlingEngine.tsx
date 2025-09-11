import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Package,
  Edit,
  Trash2,
  Eye,
  Filter,
  DollarSign,
  Calculator,
  Settings,
  Play,
  Calendar,
} from "lucide-react";
import {
  Form as AntForm,
  Select as AntSelect,
  Input as AntInput,
  InputNumber as AntInputNumber,
  DatePicker,
  Switch,
  Button as AntButton,
  Space,
  Modal,
  Table as AntTable,
  Tag,
} from "antd";
const { RangePicker } = DatePicker;
import dayjs from "dayjs";

// Types
interface Bundle {
  id: string;
  bundleCode: string;
  bundleName: string;
  components: string[];
  bundleType: string;
  pos: string[];
  agentTier: string[];
  cohortCodes?: string[];
  channel: string;
  seasonCode?: string;
  validFrom: string;
  validTo: string;
  inventoryCap?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface BundlePricingRule {
  id: string;
  ruleCode: string;
  bundleCode: string;
  discountType: string;
  discountValue: string;
  tieredPromo?: { qty: number; discount: number }[];
  priority: number;
  status: string;
  validFrom: string;
  validTo: string;
  createdAt: string;
  updatedAt: string;
}

// Form schemas
const bundleFormSchema = z.object({
  bundleCode: z.string().min(1, "Bundle code is required"),
  bundleName: z.string().min(1, "Bundle name is required"),
  components: z.array(z.string()).min(1, "At least one component is required"),
  bundleType: z.enum(["AIR_AIR", "AIR_NONAIR", "NONAIR_NONAIR"]),
  pos: z.array(z.string()).min(1, "At least one POS is required"),
  agentTier: z.array(z.string()).min(1, "At least one agent tier is required"),
  cohortCodes: z.array(z.string()).optional(),
  channel: z.enum(["API", "PORTAL", "MOBILE"]),
  seasonCode: z.string().optional(),
  validDates: z.array(z.any()).length(2),
  inventoryCap: z.number().optional(),
});

const pricingRuleFormSchema = z.object({
  ruleCode: z.string().min(1, "Rule code is required"),
  bundleCode: z.string().min(1, "Bundle code is required"),
  discountType: z.enum(["PERCENT", "AMOUNT"]),
  discountValue: z.number().min(0, "Discount value must be non-negative"),
  priority: z.number().min(1, "Priority must be at least 1"),
  validDates: z.array(z.any()).length(2),
});

type BundleFormData = z.infer<typeof bundleFormSchema>;
type PricingRuleFormData = z.infer<typeof pricingRuleFormSchema>;

// Constants
const bundleTypes = [
  { label: "Air + Air", value: "AIR_AIR" },
  { label: "Air + Non-Air", value: "AIR_NONAIR" },
  { label: "Non-Air + Non-Air", value: "NONAIR_NONAIR" },
];

const agentTiers = ["PLATINUM", "GOLD", "SILVER", "BRONZE"];
const channels = ["API", "PORTAL", "MOBILE"];
const discountTypes = ["PERCENT", "AMOUNT"];
const posList = ["IN", "AE", "SA", "KW", "BH", "OM", "QA", "US", "UK", "CA"];

// Sample components based on bundle type
const componentOptions = {
  AIR_AIR: [
    "SEAT_STD",
    "SEAT_XL",
    "BAG20",
    "BAG30",
    "MEAL_STD",
    "WIFI_STD",
    "LOUNGE_PASS",
  ],
  AIR_NONAIR: ["SEAT_STD", "BAG20", "INS_STD", "HOTEL_STD", "TRANSFER_STD"],
  NONAIR_NONAIR: [
    "INS_STD",
    "HOTEL_STD",
    "TRANSFER_STD",
    "VISA_STD",
    "FOREX_STD",
  ],
};

const getBundleTypeIcon = (type: string) => {
  switch (type) {
    case "AIR_AIR":
      return "✈️";
    case "AIR_NONAIR":
      return "🛫";
    case "NONAIR_NONAIR":
      return "🏨";
    default:
      return "📦";
  }
};

const getBundleTypeLabel = (type: string) => {
  const bundle = bundleTypes.find((b) => b.value === type);
  return bundle?.label || type;
};

const formatDate = (dateString: string) => {
  return dayjs(dateString).format("MMM DD, YYYY");
};

export default function AncillaryBundlingEngine() {
  const [activeTab, setActiveTab] = useState("bundles");
  const [filters, setFilters] = useState({});
  const [pricingFilters, setPricingFilters] = useState({});
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [selectedPricingRule, setSelectedPricingRule] =
    useState<BundlePricingRule | null>(null);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const queryClient = useQueryClient();
  const [antForm] = AntForm.useForm();
  const [editForm] = AntForm.useForm();
  const [pricingForm] = AntForm.useForm();
  const [editPricingForm] = AntForm.useForm();
  const [simulateForm] = AntForm.useForm();
  const { toast } = useToast();

  // State for bundle pricing rules
  const [selectedBundlePricingRule, setSelectedBundlePricingRule] =
    useState<BundlePricingRule | null>(null);
  const [isCreateBundleModalOpen, setIsCreateBundleModalOpen] = useState(false);
  const [isCreatePricingModalOpen, setIsCreatePricingModalOpen] =
    useState(false);
  const [isViewBundleModalOpen, setIsViewBundleModalOpen] = useState(false);
  const [isViewPricingModalOpen, setIsViewPricingModalOpen] = useState(false);
  const [isEditBundleModalOpen, setIsEditBundleModalOpen] = useState(false);
  const [isEditPricingModalOpen, setIsEditPricingModalOpen] = useState(false);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isCreateBundlePricingModalOpen, setIsCreateBundlePricingModalOpen] =
    useState(false);
  const [isEditBundlePricingModalOpen, setIsEditBundlePricingModalOpen] =
    useState(false);
  const [
    isSimulateBundlePricingModalOpen,
    setIsSimulateBundlePricingModalOpen,
  ] = useState(false);

  // Form instances
  const bundleForm = useForm<BundleFormData>({
    resolver: zodResolver(bundleFormSchema),
    defaultValues: {
      pos: [],
      agentTier: [],
      cohortCodes: [],
      components: [],
      bundleType: "AIR_AIR",
      channel: "API",
    },
  });

  const pricingRuleForm = useForm<PricingRuleFormData>({
    resolver: zodResolver(pricingRuleFormSchema),
    defaultValues: {
      discountType: "PERCENT",
      priority: 1,
    },
  });

  // Fetch cohorts
  const {
    data: availableCohorts = [],
    isLoading: isCohortsLoading,
    error: cohortsError,
  } = useQuery({
    queryKey: ["cohorts"],
    queryFn: async () => {
      const response = await fetch("/api/cohorts");
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch cohorts:", response.status, errorText);
        throw new Error(`Failed to fetch cohorts: ${response.statusText}`);
      }
      const data = await response.json();
      // Ensure the data is an array, handling potential API responses like { data: [...] }
      return Array.isArray(data) ? data : data.data || [];
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to load cohorts: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Fetch bundles
  const { data: bundles = [], isLoading: bundlesLoading } = useQuery({
    queryKey: ["bundles", filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/bundles?${params}`);
      if (!response.ok) throw new Error("Failed to fetch bundles");
      return response.json();
    },
  });

  // Fetch bundle pricing rules
  const {
    data: pricingRules = [],
    isLoading: pricingLoading,
    error: pricingError,
    refetch: refetchPricingRules,
  } = useQuery({
    queryKey: ["bundle-pricing-rules", pricingFilters],
    queryFn: async () => {
      console.log("Fetching bundle pricing rules from /api/bundles/pricing");
      const params = new URLSearchParams(pricingFilters);
      const response = await fetch(`/api/bundles/pricing?${params}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Failed to fetch bundle pricing rules:",
          response.status,
          errorText,
        );
        throw new Error(
          `Failed to fetch bundle pricing rules: ${response.statusText}`,
        );
      }
      const data = await response.json();
      console.log("Bundle pricing rules response:", data);
      // Ensure we always return an array, even if the response is not what we expect
      if (Array.isArray(data)) {
        return data;
      } else if (data && data.data && Array.isArray(data.data)) {
        return data.data;
      } else {
        console.warn(
          "Unexpected response format for bundle pricing rules:",
          data,
        );
        return [];
      }
    },
    retry: 3,
    retryDelay: 1000,
  });

  // Create bundle mutation
  const createBundleMutation = useMutation({
    mutationFn: async (values: any) => {
      const formattedData = {
        ...values,
        validFrom: values.validDates[0].format("YYYY-MM-DD"),
        validTo: values.validDates[1].format("YYYY-MM-DD"),
      };
      delete formattedData.validDates;

      const response = await fetch("/api/bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create bundle");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bundles"] });
      setIsCreateBundleModalOpen(false);
      antForm.resetFields();
      toast({ title: "Success", description: "Bundle created successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create pricing rule mutation
  const createPricingMutation = useMutation({
    mutationFn: async (values: any) => {
      const formattedData = {
        ...values,
        validFrom: values.validDates[0].format("YYYY-MM-DD"),
        validTo: values.validDates[1].format("YYYY-MM-DD"),
        discountValue: values.discountValue.toString(),
      };
      delete formattedData.validDates;

      const response = await fetch("/api/bundles/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create pricing rule");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bundle-pricing-rules"] });
      refetchPricingRules();
      setIsCreatePricingModalOpen(false);
      pricingForm.resetFields();
      toast({
        title: "Success",
        description: "Pricing rule created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update bundle mutation
  const updateBundleMutation = useMutation({
    mutationFn: async (values: any) => {
      const formattedData = {
        ...values,
        validFrom: values.validDates[0].format("YYYY-MM-DD"),
        validTo: values.validDates[1].format("YYYY-MM-DD"),
      };
      delete formattedData.validDates;

      const response = await fetch(`/api/bundles/${selectedBundle!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update bundle");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bundles"] });
      setIsEditBundleModalOpen(false);
      setSelectedBundle(null);
      toast({ title: "Success", description: "Bundle updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update pricing rule mutation
  const updatePricingMutation = useMutation({
    mutationFn: async (values: any) => {
      const formattedData = {
        ...values,
        validFrom: values.validDates[0].format("YYYY-MM-DD"),
        validTo: values.validDates[1].format("YYYY-MM-DD"),
        discountValue: values.discountValue.toString(),
      };
      delete formattedData.validDates;

      const response = await fetch(
        `/api/bundles/pricing/${selectedPricingRule!.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formattedData),
        },
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update pricing rule");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bundle-pricing-rules"] });
      refetchPricingRules();
      setIsEditPricingModalOpen(false);
      setSelectedPricingRule(null);
      toast({
        title: "Success",
        description: "Pricing rule updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Simulate pricing mutation
  const simulatePricingMutation = useMutation({
    mutationFn: async (values: any) => {
      const response = await fetch("/api/bundles/pricing/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Failed to simulate pricing");
      return response.json();
    },
    onSuccess: (data) => {
      setSimulationResult(data);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete bundle pricing rule mutation
  const deleteBundlePricingMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/bundles/pricing/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete bundle pricing rule");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bundle-pricing-rules"] });
      refetchPricingRules();
      toast({
        title: "Success",
        description: "Pricing rule deleted successfully",
      });
    },
  });

  // Handle create bundle form submit
  const handleCreateBundle = (values: any) => {
    createBundleMutation.mutate(values);
  };

  // Handle create pricing rule form submit
  const handleCreatePricing = (values: any) => {
    createPricingMutation.mutate(values);
  };

  // Handle edit bundle form submit
  const handleEditBundle = (values: any) => {
    updateBundleMutation.mutate(values);
  };

  // Handle edit pricing rule form submit
  const handleEditPricing = (values: any) => {
    updatePricingMutation.mutate(values);
  };

  // Handle simulate pricing
  const handleSimulate = (values: any) => {
    simulatePricingMutation.mutate(values);
  };

  // Open edit modal with pre-filled data
  const openEditBundleModal = (bundle: Bundle) => {
    setSelectedBundle(bundle);
    editForm.setFieldsValue({
      ...bundle,
      validDates: [dayjs(bundle.validFrom), dayjs(bundle.validTo)],
    });
    setIsEditBundleModalOpen(true);
  };

  // Open edit pricing modal with pre-filled data
  const openEditPricingModal = (rule: BundlePricingRule) => {
    setSelectedPricingRule(rule);
    editPricingForm.setFieldsValue({
      ...rule,
      discountValue: parseFloat(rule.discountValue),
      validDates: [dayjs(rule.validFrom), dayjs(rule.validTo)],
    });
    setIsEditPricingModalOpen(true);
  };

  // Bundle columns for table
  const bundleColumns = [
    {
      title: "Bundle Code",
      dataIndex: "bundleCode",
      key: "bundleCode",
      render: (text: string, record: Bundle) => (
        <div className="flex items-center gap-2">
          <span>{getBundleTypeIcon(record.bundleType)}</span>
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: "Bundle Name",
      dataIndex: "bundleName",
      key: "bundleName",
    },
    {
      title: "Type",
      dataIndex: "bundleType",
      key: "bundleType",
      render: (type: string) => (
        <Badge variant="outline">{getBundleTypeLabel(type)}</Badge>
      ),
    },
    {
      title: "Components",
      dataIndex: "components",
      key: "components",
      render: (components: string[]) => (
        <div className="flex flex-wrap gap-1">
          {components.slice(0, 3).map((component) => (
            <Tag key={component} color="blue">
              {component}
            </Tag>
          ))}
          {components.length > 3 && <Tag>+{components.length - 3} more</Tag>}
        </div>
      ),
    },
    {
      title: "Channel",
      dataIndex: "channel",
      key: "channel",
      render: (channel: string) => <Badge variant="secondary">{channel}</Badge>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Badge variant={status === "ACTIVE" ? "default" : "secondary"}>
          {status}
        </Badge>
      ),
    },
    {
      title: "Valid Period",
      key: "validPeriod",
      render: (_: any, record: Bundle) => (
        <span className="text-sm">
          {dayjs(record.validFrom).format("MMM DD")} -{" "}
          {dayjs(record.validTo).format("MMM DD, YYYY")}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Bundle) => (
        <Space size="small">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedBundle(record);
              setIsViewBundleModalOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openEditBundleModal(record)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </Space>
      ),
    },
  ];

  // Pricing rule columns for table
  const pricingColumns = [
    {
      title: "Rule Code",
      dataIndex: "ruleCode",
      key: "ruleCode",
      render: (text: string) => (
        <span className="font-medium">{text || "N/A"}</span>
      ),
    },
    {
      title: "Bundle Code",
      dataIndex: "bundleCode",
      key: "bundleCode",
      render: (text: string) => <span>{text || "N/A"}</span>,
    },
    {
      title: "Discount",
      key: "discount",
      render: (_: any, record: any) => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4" />
          <span>
            {record.discountType === "PERCENT"
              ? `${record.discountValue}%`
              : `$${record.discountValue}`}
          </span>
        </div>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority: number) => (
        <Badge variant="outline">P{priority || 1}</Badge>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Badge variant={status === "ACTIVE" ? "default" : "secondary"}>
          {status || "INACTIVE"}
        </Badge>
      ),
    },
    {
      title: "Valid Period",
      key: "validPeriod",
      render: (_: any, record: any) => (
        <span className="text-sm">
          {record.validFrom && record.validTo ? (
            <>
              {dayjs(record.validFrom).format("MMM DD")} -{" "}
              {dayjs(record.validTo).format("MMM DD, YYYY")}
            </>
          ) : (
            "N/A"
          )}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedPricingRule(record);
              setIsViewPricingModalOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openEditPricingModal(record)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              simulateForm.setFieldsValue({ ruleId: record.id });
              setIsSimulateModalOpen(true);
            }}
          >
            <Calculator className="h-4 w-4" />
          </Button>
        </Space>
      ),
    },
  ];

  // Handler functions for bundle pricing rules
  const handleSimulateBundlePricing = (rule: BundlePricingRule) => {
    setSelectedBundlePricingRule(rule);
    setIsSimulateBundlePricingModalOpen(true);
  };

  const handleEditBundlePricingRule = (rule: BundlePricingRule) => {
    setSelectedBundlePricingRule(rule);
    setIsEditBundlePricingModalOpen(true);
  };

  const handleDeleteBundlePricingRule = (id: string) => {
    deleteBundlePricingMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bundles" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Bundle Definition
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Pricing Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bundles" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Bundle Management</h2>
              <p className="text-muted-foreground">
                Create and manage ancillary bundles
              </p>
            </div>
            <Button onClick={() => setIsCreateBundleModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Bundle
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <AntTable
                columns={bundleColumns}
                dataSource={bundles}
                loading={bundlesLoading}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Bundle Pricing Rules</h2>
              <p className="text-muted-foreground">
                Manage bundle pricing and discount rules
              </p>
            </div>
            <Button onClick={() => setIsCreatePricingModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Bundle Pricing Rule
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              {pricingLoading ? (
                <div className="flex items-center justify-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : pricingError ? (
                <div className="text-center py-12 text-red-500">
                  Error loading pricing rules: {pricingError.message}
                  <Button onClick={refetchPricingRules} className="ml-4">
                    Retry
                  </Button>
                </div>
              ) : pricingRules.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Bundle Pricing Rules Found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create your first bundle pricing rule to get started
                  </p>
                  <Button onClick={() => setIsCreatePricingModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Bundle Pricing Rule
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rule Code</TableHead>
                        <TableHead>Bundle Code</TableHead>
                        <TableHead>Discount Type</TableHead>
                        <TableHead>Discount Value</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Valid Period</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pricingRules.map((rule: BundlePricingRule) => (
                        <TableRow key={rule.id}>
                          <TableCell className="font-medium">
                            {rule.ruleCode || "N/A"}
                          </TableCell>
                          <TableCell>{rule.bundleCode || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {rule.discountType
                                ? rule.discountType.toLowerCase()
                                : "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {rule.discountType === "PERCENT"
                              ? `${rule.discountValue || 0}%`
                              : `$${rule.discountValue || 0}`}
                          </TableCell>
                          <TableCell>{rule.priority || 1}</TableCell>
                          <TableCell className="text-sm">
                            {rule.validFrom && rule.validTo ? (
                              <>
                                <div>{formatDate(rule.validFrom)}</div>
                                <div className="text-gray-500">
                                  to {formatDate(rule.validTo)}
                                </div>
                              </>
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                rule.status === "ACTIVE"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {rule.status || "INACTIVE"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleSimulateBundlePricing(rule)
                                }
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleEditBundlePricingRule(rule)
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteBundlePricingRule(rule.id)
                                }
                                disabled={deleteBundlePricingMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
      </Tabs>

      {/* Create Bundle Modal */}
      <Modal
        title="Create Bundle"
        open={isCreateBundleModalOpen}
        onCancel={() => setIsCreateBundleModalOpen(false)}
        footer={null}
        width={800}
      >
        <AntForm
          form={antForm}
          onFinish={handleCreateBundle}
          layout="vertical"
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <AntForm.Item
              label="Bundle Code"
              name="bundleCode"
              rules={[{ required: true, message: "Bundle code is required" }]}
            >
              <AntInput placeholder="e.g., COMFORT_PACK" />
            </AntForm.Item>

            <AntForm.Item
              label="Bundle Type"
              name="bundleType"
              rules={[{ required: true, message: "Bundle type is required" }]}
            >
              <AntSelect>
                {bundleTypes.map((type) => (
                  <AntSelect.Option key={type.value} value={type.value}>
                    {getBundleTypeIcon(type.value)} {type.label}
                  </AntSelect.Option>
                ))}
              </AntSelect>
            </AntForm.Item>
          </div>

          <AntForm.Item
            label="Bundle Name"
            name="bundleName"
            rules={[{ required: true, message: "Bundle name is required" }]}
          >
            <AntInput placeholder="e.g., Seat + Bag Comfort Pack" />
          </AntForm.Item>

          <AntForm.Item
            label="Components"
            name="components"
            rules={[
              { required: true, message: "At least one component is required" },
            ]}
          >
            <AntSelect mode="multiple" placeholder="Select bundle components">
              {Object.values(componentOptions)
                .flat()
                .map((component) => (
                  <AntSelect.Option key={component} value={component}>
                    {component}
                  </AntSelect.Option>
                ))}
            </AntSelect>
          </AntForm.Item>

          <div className="grid grid-cols-2 gap-4">
            <AntForm.Item
              label="Channel"
              name="channel"
              rules={[{ required: true, message: "Channel is required" }]}
            >
              <AntSelect>
                {channels.map((channel) => (
                  <AntSelect.Option key={channel} value={channel}>
                    {channel}
                  </AntSelect.Option>
                ))}
              </AntSelect>
            </AntForm.Item>

            <AntForm.Item label="Season Code" name="seasonCode">
              <AntInput placeholder="e.g., SUMMER2025" />
            </AntForm.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <AntForm.Item
              label="Point of Sale"
              name="pos"
              rules={[
                { required: true, message: "At least one POS is required" },
              ]}
            >
              <AntSelect mode="multiple" placeholder="Select countries">
                {posList.map((pos) => (
                  <AntSelect.Option key={pos} value={pos}>
                    {pos}
                  </AntSelect.Option>
                ))}
              </AntSelect>
            </AntForm.Item>

            <AntForm.Item
              label="Agent Tier"
              name="agentTier"
              rules={[
                {
                  required: true,
                  message: "At least one agent tier is required",
                },
              ]}
            >
              <AntSelect mode="multiple" placeholder="Select agent tiers">
                {agentTiers.map((tier) => (
                  <AntSelect.Option key={tier} value={tier}>
                    {tier}
                  </AntSelect.Option>
                ))}
              </AntSelect>
            </AntForm.Item>
          </div>

          <AntForm.Item label="Cohort Codes (Optional)" name="cohortCodes">
            <AntSelect
              mode="tags"
              placeholder="Enter cohort codes"
              style={{ width: "100%" }}
              dropdownStyle={{ zIndex: 9999 }}
              getPopupContainer={(trigger) => trigger.parentElement}
              virtual={false}
              showSearch
              filterOption={(input, option) =>
                option?.children?.toLowerCase().indexOf(input.toLowerCase()) >=
                  0 ||
                option?.value?.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {availableCohorts.map((cohort: any) => (
                <AntSelect.Option key={cohort.id} value={cohort.cohortName}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div className="cls-cohort-dropdwon">
                      <p>{cohort.cohortName}</p>{" "}
                      <span className="text-gray-600">{cohort.cohortCode}</span>
                    </div>
                  </div>
                </AntSelect.Option>
              ))}
            </AntSelect>
          </AntForm.Item>

          <AntForm.Item label="Inventory Cap" name="inventoryCap">
            <AntInputNumber
              placeholder="Optional inventory limit"
              style={{ width: "100%" }}
            />
          </AntForm.Item>

          <AntForm.Item
            label="Valid Period"
            name="validDates"
            rules={[{ required: true, message: "Valid period is required" }]}
          >
            <RangePicker style={{ width: "100%" }} />
          </AntForm.Item>

          <div className="flex justify-end gap-2">
            <AntButton onClick={() => setIsCreateBundleModalOpen(false)}>
              Cancel
            </AntButton>
            <AntButton
              type="primary"
              htmlType="submit"
              loading={createBundleMutation.isPending}
            >
              Create Bundle
            </AntButton>
          </div>
        </AntForm>
      </Modal>

      {/* Create Pricing Rule Modal */}
      <Modal
        title="Create Pricing Rule"
        open={isCreatePricingModalOpen}
        onCancel={() => setIsCreatePricingModalOpen(false)}
        footer={null}
        width={600}
      >
        <AntForm
          form={pricingForm}
          onFinish={handleCreatePricing}
          layout="vertical"
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <AntForm.Item
              label="Rule Code"
              name="ruleCode"
              rules={[{ required: true, message: "Rule code is required" }]}
            >
              <AntInput placeholder="e.g., BUNDLE_DISC_TIERED" />
            </AntForm.Item>

            <AntForm.Item
              label="Bundle Code"
              name="bundleCode"
              rules={[{ required: true, message: "Bundle code is required" }]}
            >
              <AntSelect placeholder="Select bundle">
                {bundles.map((bundle) => (
                  <AntSelect.Option
                    key={bundle.bundleCode}
                    value={bundle.bundleCode}
                  >
                    {bundle.bundleCode} - {bundle.bundleName}
                  </AntSelect.Option>
                ))}
              </AntSelect>
            </AntForm.Item>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <AntForm.Item
              label="Discount Type"
              name="discountType"
              rules={[{ required: true, message: "Discount type is required" }]}
            >
              <AntSelect>
                {discountTypes.map((type) => (
                  <AntSelect.Option key={type} value={type}>
                    {type}
                  </AntSelect.Option>
                ))}
              </AntSelect>
            </AntForm.Item>

            <AntForm.Item
              label="Discount Value"
              name="discountValue"
              rules={[
                { required: true, message: "Discount value is required" },
              ]}
            >
              <AntInputNumber placeholder="15" style={{ width: "100%" }} />
            </AntForm.Item>

            <AntForm.Item
              label="Priority"
              name="priority"
              rules={[{ required: true, message: "Priority is required" }]}
            >
              <AntInputNumber
                min={1}
                placeholder="1"
                style={{ width: "100%" }}
              />
            </AntForm.Item>
          </div>

          <AntForm.Item
            label="Valid Period"
            name="validDates"
            rules={[{ required: true, message: "Valid period is required" }]}
          >
            <RangePicker style={{ width: "100%" }} />
          </AntForm.Item>

          <div className="flex justify-end gap-2">
            <AntButton onClick={() => setIsCreatePricingModalOpen(false)}>
              Cancel
            </AntButton>
            <AntButton
              type="primary"
              htmlType="submit"
              loading={createPricingMutation.isPending}
            >
              Create Rule
            </AntButton>
          </div>
        </AntForm>
      </Modal>

      {/* Edit Bundle Modal */}
      <Modal
        title="Edit Bundle"
        open={isEditBundleModalOpen}
        onCancel={() => setIsEditBundleModalOpen(false)}
        footer={null}
        width={800}
      >
        <AntForm
          form={editForm}
          onFinish={handleEditBundle}
          layout="vertical"
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <AntForm.Item
              label="Bundle Code"
              name="bundleCode"
              rules={[{ required: true, message: "Bundle code is required" }]}
            >
              <AntInput placeholder="e.g., COMFORT_PACK" />
            </AntForm.Item>

            <AntForm.Item
              label="Bundle Type"
              name="bundleType"
              rules={[{ required: true, message: "Bundle type is required" }]}
            >
              <AntSelect>
                {bundleTypes.map((type) => (
                  <AntSelect.Option key={type.value} value={type.value}>
                    {getBundleTypeIcon(type.value)} {type.label}
                  </AntSelect.Option>
                ))}
              </AntSelect>
            </AntForm.Item>
          </div>

          <AntForm.Item
            label="Bundle Name"
            name="bundleName"
            rules={[{ required: true, message: "Bundle name is required" }]}
          >
            <AntInput placeholder="e.g., Seat + Bag Comfort Pack" />
          </AntForm.Item>

          <AntForm.Item
            label="Components"
            name="components"
            rules={[
              { required: true, message: "At least one component is required" },
            ]}
          >
            <AntSelect mode="multiple" placeholder="Select bundle components">
              {Object.values(componentOptions)
                .flat()
                .map((component) => (
                  <AntSelect.Option key={component} value={component}>
                    {component}
                  </AntSelect.Option>
                ))}
            </AntSelect>
          </AntForm.Item>

          <div className="grid grid-cols-2 gap-4">
            <AntForm.Item
              label="Channel"
              name="channel"
              rules={[{ required: true, message: "Channel is required" }]}
            >
              <AntSelect>
                {channels.map((channel) => (
                  <AntSelect.Option key={channel} value={channel}>
                    {channel}
                  </AntSelect.Option>
                ))}
              </AntSelect>
            </AntForm.Item>

            <AntForm.Item label="Season Code" name="seasonCode">
              <AntInput placeholder="e.g., SUMMER2025" />
            </AntForm.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <AntForm.Item
              label="Point of Sale"
              name="pos"
              rules={[
                { required: true, message: "At least one POS is required" },
              ]}
            >
              <AntSelect mode="multiple" placeholder="Select countries">
                {posList.map((pos) => (
                  <AntSelect.Option key={pos} value={pos}>
                    {pos}
                  </AntSelect.Option>
                ))}
              </AntSelect>
            </AntForm.Item>

            <AntForm.Item
              label="Agent Tier"
              name="agentTier"
              rules={[
                {
                  required: true,
                  message: "At least one agent tier is required",
                },
              ]}
            >
              <AntSelect mode="multiple" placeholder="Select agent tiers">
                {agentTiers.map((tier) => (
                  <AntSelect.Option key={tier} value={tier}>
                    {tier}
                  </AntSelect.Option>
                ))}
              </AntSelect>
            </AntForm.Item>
          </div>

          <AntForm.Item label="Cohort Codes (Optional)" name="cohortCodes">
            <AntSelect
              mode="tags"
              placeholder="Enter cohort codes"
              style={{ width: "100%" }}
              dropdownStyle={{ zIndex: 9999 }}
              getPopupContainer={(trigger) => trigger.parentElement}
              virtual={false}
              showSearch
              filterOption={(input, option) =>
                option?.children?.toLowerCase().indexOf(input.toLowerCase()) >=
                  0 ||
                option?.value?.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {availableCohorts.map((cohort: any) => (
                <AntSelect.Option key={cohort.id} value={cohort.cohortName}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div className="cls-cohort-dropdwon">
                      <p>{cohort.cohortName}</p>{" "}
                      <span className="text-gray-600">{cohort.cohortCode}</span>
                    </div>
                  </div>
                </AntSelect.Option>
              ))}
            </AntSelect>
          </AntForm.Item>

          <AntForm.Item label="Inventory Cap" name="inventoryCap">
            <AntInputNumber
              placeholder="Optional inventory limit"
              style={{ width: "100%" }}
            />
          </AntForm.Item>

          <AntForm.Item
            label="Valid Period"
            name="validDates"
            rules={[{ required: true, message: "Valid period is required" }]}
          >
            <RangePicker style={{ width: "100%" }} />
          </AntForm.Item>

          <div className="flex justify-end gap-2">
            <AntButton onClick={() => setIsEditBundleModalOpen(false)}>
              Cancel
            </AntButton>
            <AntButton
              type="primary"
              htmlType="submit"
              loading={updateBundleMutation.isPending}
            >
              Update Bundle
            </AntButton>
          </div>
        </AntForm>
      </Modal>

      {/* Edit Pricing Rule Modal */}
      <Modal
        title="Edit Pricing Rule"
        open={isEditPricingModalOpen}
        onCancel={() => setIsEditPricingModalOpen(false)}
        footer={null}
        width={600}
      >
        <AntForm
          form={editPricingForm}
          onFinish={handleEditPricing}
          layout="vertical"
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <AntForm.Item
              label="Rule Code"
              name="ruleCode"
              rules={[{ required: true, message: "Rule code is required" }]}
            >
              <AntInput placeholder="e.g., BUNDLE_DISC_TIERED" />
            </AntForm.Item>

            <AntForm.Item
              label="Bundle Code"
              name="bundleCode"
              rules={[{ required: true, message: "Bundle code is required" }]}
            >
              <AntSelect placeholder="Select bundle">
                {bundles.map((bundle) => (
                  <AntSelect.Option
                    key={bundle.bundleCode}
                    value={bundle.bundleCode}
                  >
                    {bundle.bundleCode} - {bundle.bundleName}
                  </AntSelect.Option>
                ))}
              </AntSelect>
            </AntForm.Item>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <AntForm.Item
              label="Discount Type"
              name="discountType"
              rules={[{ required: true, message: "Discount type is required" }]}
            >
              <AntSelect>
                {discountTypes.map((type) => (
                  <AntSelect.Option key={type} value={type}>
                    {type}
                  </AntSelect.Option>
                ))}
              </AntSelect>
            </AntForm.Item>

            <AntForm.Item
              label="Discount Value"
              name="discountValue"
              rules={[
                { required: true, message: "Discount value is required" },
              ]}
            >
              <AntInputNumber placeholder="15" style={{ width: "100%" }} />
            </AntForm.Item>

            <AntForm.Item
              label="Priority"
              name="priority"
              rules={[{ required: true, message: "Priority is required" }]}
            >
              <AntInputNumber
                min={1}
                placeholder="1"
                style={{ width: "100%" }}
              />
            </AntForm.Item>
          </div>

          <AntForm.Item
            label="Valid Period"
            name="validDates"
            rules={[{ required: true, message: "Valid period is required" }]}
          >
            <RangePicker style={{ width: "100%" }} />
          </AntForm.Item>

          <div className="flex justify-end gap-2">
            <AntButton onClick={() => setIsEditPricingModalOpen(false)}>
              Cancel
            </AntButton>
            <AntButton
              type="primary"
              htmlType="submit"
              loading={updatePricingMutation.isPending}
            >
              Update Rule
            </AntButton>
          </div>
        </AntForm>
      </Modal>

      {/* View Bundle Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Bundle Details</h3>
              <p className="text-sm text-gray-500">
                {selectedBundle?.bundleCode} - {selectedBundle?.bundleName}
              </p>
            </div>
          </div>
        }
        open={isViewBundleModalOpen}
        onCancel={() => setIsViewBundleModalOpen(false)}
        footer={[
          <div
            key="footer"
            className="flex justify-between items-center w-full"
          >
            <div className="text-xs text-gray-500">
              Created:{" "}
              {selectedBundle &&
                dayjs(selectedBundle.createdAt).format("MMM DD, YYYY HH:mm")}
            </div>
            <Space>
              <AntButton
                icon={<Edit className="h-4 w-4" />}
                onClick={() => {
                  setIsViewBundleModalOpen(false);
                  openEditBundleModal(selectedBundle!);
                }}
              >
                Edit Bundle
              </AntButton>
              <AntButton
                type="primary"
                onClick={() => setIsViewBundleModalOpen(false)}
              >
                Close
              </AntButton>
            </Space>
          </div>,
        ]}
        width={800}
        className="bundle-details-modal"
      >
        {selectedBundle && (
          <div className="space-y-6">
            {/* Header Section with Status */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {getBundleTypeIcon(selectedBundle.bundleType)}
                  </span>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {selectedBundle.bundleName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {selectedBundle.bundleCode}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      selectedBundle.status === "ACTIVE"
                        ? "default"
                        : "secondary"
                    }
                    className="text-sm px-3 py-1"
                  >
                    {selectedBundle.status}
                  </Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {getBundleTypeLabel(selectedBundle.bundleType)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Main Information Grid */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <Card className="p-4">
                  <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Configuration
                  </h5>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Channel
                      </label>
                      <div className="mt-1">
                        <Badge variant="secondary" className="text-sm">
                          {selectedBundle.channel}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Season Code
                      </label>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {selectedBundle.seasonCode || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Inventory Cap
                      </label>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {selectedBundle.inventoryCap
                          ? selectedBundle.inventoryCap.toLocaleString()
                          : "Unlimited"}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Components
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedBundle.components.map((component) => (
                      <Tag key={component} color="blue" className="text-sm">
                        {component}
                      </Tag>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <Card className="p-4">
                  <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Validity Period
                  </h5>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                      <div>
                        <label className="text-xs font-medium text-green-700 uppercase tracking-wide">
                          Valid From
                        </label>
                        <p className="text-sm font-semibold text-green-900">
                          {dayjs(selectedBundle.validFrom).format(
                            "MMMM DD, YYYY",
                          )}
                        </p>
                      </div>
                      <div className="text-green-600">
                        <Play className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                      <div>
                        <label className="text-xs font-medium text-red-700 uppercase tracking-wide">
                          Valid To
                        </label>
                        <p className="text-sm font-semibold text-red-900">
                          {dayjs(selectedBundle.validTo).format(
                            "MMMM DD, YYYY",
                          )}
                        </p>
                      </div>
                      <div className="text-red-600">
                        <DollarSign className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="text-center text-sm text-gray-500">
                      Duration:{" "}
                      {dayjs(selectedBundle.validTo).diff(
                        dayjs(selectedBundle.validFrom),
                        "days",
                      )}{" "}
                      days
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Targeting Section */}
            <Card className="p-4">
              <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Targeting Criteria
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Point of Sale
                  </label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedBundle.pos.map((pos) => (
                      <Tag key={pos} color="orange" className="text-sm">
                        {pos}
                      </Tag>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Agent Tiers
                  </label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedBundle.agentTier.map((tier) => (
                      <Tag key={tier} color="green" className="text-sm">
                        {tier}
                      </Tag>
                    ))}
                  </div>
                </div>
                {selectedBundle.cohortCodes &&
                  selectedBundle.cohortCodes.length > 0 && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Cohort Codes
                      </label>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedBundle.cohortCodes.map((cohort) => (
                          <Tag key={cohort} color="purple" className="text-sm">
                            {cohort}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </Card>

            {/* Additional Information */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Created
                </label>
                <p className="text-sm text-gray-900 font-medium">
                  {dayjs(selectedBundle.createdAt).format(
                    "MMMM DD, YYYY [at] HH:mm",
                  )}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Last Updated
                </label>
                <p className="text-sm text-gray-900 font-medium">
                  {dayjs(selectedBundle.updatedAt).format(
                    "MMMM DD, YYYY [at] HH:mm",
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* View Pricing Rule Modal */}
      <Modal
        title="Pricing Rule Details"
        open={isViewPricingModalOpen}
        onCancel={() => setIsViewPricingModalOpen(false)}
        footer={[
          <AntButton
            key="close"
            onClick={() => setIsViewPricingModalOpen(false)}
          >
            Close
          </AntButton>,
        ]}
        width={500}
      >
        {selectedPricingRule && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Rule Code</label>
                <p className="text-sm text-muted-foreground">
                  {selectedPricingRule.ruleCode}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Bundle Code</label>
                <p className="text-sm text-muted-foreground">
                  {selectedPricingRule.bundleCode}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Discount Type</label>
                <p className="text-sm text-muted-foreground">
                  {selectedPricingRule.discountType}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Discount Value</label>
                <p className="text-sm text-muted-foreground">
                  {selectedPricingRule.discountType === "PERCENT"
                    ? `${selectedPricingRule.discountValue}%`
                    : `$${selectedPricingRule.discountValue}`}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Badge variant="outline">P{selectedPricingRule.priority}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Valid From</label>
                <p className="text-sm text-muted-foreground">
                  {dayjs(selectedPricingRule.validFrom).format("MMMM DD, YYYY")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Valid To</label>
                <p className="text-sm text-muted-foreground">
                  {dayjs(selectedPricingRule.validTo).format("MMMM DD, YYYY")}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <div className="mt-1">
                <Badge
                  variant={
                    selectedPricingRule.status === "ACTIVE"
                      ? "default"
                      : "secondary"
                  }
                >
                  {selectedPricingRule.status}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Simulate Pricing Modal */}
      <Modal
        title="Simulate Bundle Pricing"
        open={isSimulateModalOpen}
        onCancel={() => {
          setIsSimulateModalOpen(false);
          setSimulationResult(null);
        }}
        footer={null}
        width={500}
      >
        <AntForm
          form={simulateForm}
          onFinish={handleSimulate}
          layout="vertical"
          className="space-y-4"
        >
          <AntForm.Item
            label="Rule ID"
            name="ruleId"
            rules={[{ required: true, message: "Rule ID is required" }]}
          >
            <AntSelect placeholder="Select pricing rule">
              {pricingRules.map((rule) => (
                <AntSelect.Option key={rule.id} value={rule.id}>
                  {rule.ruleCode} - {rule.bundleCode}
                </AntSelect.Option>
              ))}
            </AntSelect>
          </AntForm.Item>

          <div className="grid grid-cols-2 gap-4">
            <AntForm.Item
              label="Base Price"
              name="basePrice"
              rules={[{ required: true, message: "Base price is required" }]}
            >
              <AntInputNumber
                placeholder="100.00"
                style={{ width: "100%" }}
                precision={2}
              />
            </AntForm.Item>

            <AntForm.Item
              label="Currency"
              name="currency"
              rules={[{ required: true, message: "Currency is required" }]}
            >
              <AntSelect placeholder="Select currency">
                <AntSelect.Option value="USD">USD</AntSelect.Option>
                <AntSelect.Option value="EUR">EUR</AntSelect.Option>
                <AntSelect.Option value="INR">INR</AntSelect.Option>
                <AntSelect.Option value="AED">AED</AntSelect.Option>
              </AntSelect>
            </AntForm.Item>
          </div>

          <div className="flex justify-end gap-2">
            <AntButton
              onClick={() => {
                setIsSimulateModalOpen(false);
                setSimulationResult(null);
              }}
            >
              Cancel
            </AntButton>
            <AntButton
              type="primary"
              htmlType="submit"
              loading={simulatePricingMutation.isPending}
            >
              Simulate
            </AntButton>
          </div>
        </AntForm>

        {simulationResult && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Simulation Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span>
                    {simulationResult.currency} {simulationResult.basePrice}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span className="text-green-600">
                    -{simulationResult.currency} {simulationResult.discount}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Final Price:</span>
                  <span>
                    {simulationResult.currency} {simulationResult.adjustedPrice}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Rule Applied: {simulationResult.ruleApplied}
                </div>
                <div className="text-sm text-muted-foreground">
                  Bundle: {simulationResult.bundleCode}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </Modal>

      {/* Edit Pricing Rule Modal */}
      <Modal
        title="Edit Pricing Rule"
        open={isEditBundlePricingModalOpen}
        onCancel={() => setIsEditBundlePricingModalOpen(false)}
        footer={null}
        width={600}
      >
        <AntForm
          form={editPricingForm}
          onFinish={handleEditPricing}
          layout="vertical"
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <AntForm.Item
              label="Rule Code"
              name="ruleCode"
              rules={[{ required: true, message: "Rule code is required" }]}
            >
              <AntInput placeholder="e.g., BUNDLE_DISC_TIERED" />
            </AntForm.Item>

            <AntForm.Item
              label="Bundle Code"
              name="bundleCode"
              rules={[{ required: true, message: "Bundle code is required" }]}
            >
              <AntSelect placeholder="Select bundle">
                {bundles.map((bundle) => (
                  <AntSelect.Option
                    key={bundle.bundleCode}
                    value={bundle.bundleCode}
                  >
                    {bundle.bundleCode} - {bundle.bundleName}
                  </AntSelect.Option>
                ))}
              </AntSelect>
            </AntForm.Item>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <AntForm.Item
              label="Discount Type"
              name="discountType"
              rules={[{ required: true, message: "Discount type is required" }]}
            >
              <AntSelect>
                {discountTypes.map((type) => (
                  <AntSelect.Option key={type} value={type}>
                    {type}
                  </AntSelect.Option>
                ))}
              </AntSelect>
            </AntForm.Item>

            <AntForm.Item
              label="Discount Value"
              name="discountValue"
              rules={[
                { required: true, message: "Discount value is required" },
              ]}
            >
              <AntInputNumber placeholder="15" style={{ width: "100%" }} />
            </AntForm.Item>

            <AntForm.Item
              label="Priority"
              name="priority"
              rules={[{ required: true, message: "Priority is required" }]}
            >
              <AntInputNumber
                min={1}
                placeholder="1"
                style={{ width: "100%" }}
              />
            </AntForm.Item>
          </div>

          <AntForm.Item
            label="Valid Period"
            name="validDates"
            rules={[{ required: true, message: "Valid period is required" }]}
          >
            <RangePicker style={{ width: "100%" }} />
          </AntForm.Item>

          <div className="flex justify-end gap-2">
            <AntButton onClick={() => setIsEditBundlePricingModalOpen(false)}>
              Cancel
            </AntButton>
            <AntButton
              type="primary"
              htmlType="submit"
              loading={updatePricingMutation.isPending}
            >
              Update Rule
            </AntButton>
          </div>
        </AntForm>
      </Modal>

      {/* Simulate Pricing Modal */}
      <Modal
        title="Simulate Bundle Pricing"
        open={isSimulateBundlePricingModalOpen}
        onCancel={() => {
          setIsSimulateBundlePricingModalOpen(false);
          setSimulationResult(null);
        }}
        footer={null}
        width={500}
      >
        <AntForm
          form={simulateForm}
          onFinish={handleSimulate}
          layout="vertical"
          className="space-y-4"
        >
          <AntForm.Item
            label="Rule ID"
            name="ruleId"
            rules={[{ required: true, message: "Rule ID is required" }]}
          >
            <AntSelect placeholder="Select pricing rule">
              {pricingRules.map((rule) => (
                <AntSelect.Option key={rule.id} value={rule.id}>
                  {rule.ruleCode} - {rule.bundleCode}
                </AntSelect.Option>
              ))}
            </AntSelect>
          </AntForm.Item>

          <div className="grid grid-cols-2 gap-4">
            <AntForm.Item
              label="Base Price"
              name="basePrice"
              rules={[{ required: true, message: "Base price is required" }]}
            >
              <AntInputNumber
                placeholder="100.00"
                style={{ width: "100%" }}
                precision={2}
              />
            </AntForm.Item>

            <AntForm.Item
              label="Currency"
              name="currency"
              rules={[{ required: true, message: "Currency is required" }]}
            >
              <AntSelect placeholder="Select currency">
                <AntSelect.Option value="USD">USD</AntSelect.Option>
                <AntSelect.Option value="EUR">EUR</AntSelect.Option>
                <AntSelect.Option value="INR">INR</AntSelect.Option>
                <AntSelect.Option value="AED">AED</AntSelect.Option>
              </AntSelect>
            </AntForm.Item>
          </div>

          <div className="flex justify-end gap-2">
            <AntButton
              onClick={() => {
                setIsSimulateBundlePricingModalOpen(false);
                setSimulationResult(null);
              }}
            >
              Cancel
            </AntButton>
            <AntButton
              type="primary"
              htmlType="submit"
              loading={simulatePricingMutation.isPending}
            >
              Simulate
            </AntButton>
          </div>
        </AntForm>

        {simulationResult && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Simulation Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span>
                    {simulationResult.currency} {simulationResult.basePrice}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span className="text-green-600">
                    -{simulationResult.currency} {simulationResult.discount}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Final Price:</span>
                  <span>
                    {simulationResult.currency} {simulationResult.adjustedPrice}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Rule Applied: {simulationResult.ruleApplied}
                </div>
                <div className="text-sm text-muted-foreground">
                  Bundle: {simulationResult.bundleCode}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </Modal>
    </div>
  );
}
