import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card as AntCard,
  Table,
  Button as AntButton,
  Space,
  Modal,
  Form as AntForm,
  Input,
  Select as AntSelect,
  Switch,
  DatePicker,
  InputNumber,
  message,
  Tabs,
  Tag,
  Tooltip,
  Row,
  Col,
  Popconfirm,
  Progress,
  Statistic,
  Badge as AntBadge, // Renamed to avoid conflict with shadcn/ui Badge
  Alert,
  Descriptions,
  Timeline,
  Divider,
  Radio,
  Checkbox,
} from "antd";
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  BarChart3,
  Send,
  Target,
  Calendar,
  MessageSquare,
  TrendingUp,
  Users,
  DollarSign,
  MousePointer,
  ShoppingCart,
  Mail,
  Smartphone,
  Globe,
  CheckCircle,
  Clock,
  AlertCircle,
  Square,
  IndianRupee,
} from "lucide-react";
import dayjs from "dayjs";
import { z } from "zod";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { SendOutlined } from "@ant-design/icons";

// Import shadcn/ui components
import { Badge } from "@/components/ui/badge";
import {
  Tabs as ShadcnTabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
);

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

// Form validation schema
const campaignFormSchema = z.object({
  campaignCode: z.string().min(1, "Campaign code is required"),
  campaignName: z.string().min(1, "Campaign name is required"),
  target: z.object({
    cohorts: z.array(z.string()).optional(),
    agentTiers: z
      .array(z.enum(["PLATINUM", "GOLD", "SILVER", "BRONZE"]))
      .optional(),
    pos: z.array(z.string()).optional(),
    channel: z.array(z.enum(["PORTAL", "API", "MOBILE"])).optional(),
  }),
  products: z.object({
    ancillaries: z.array(z.string()).optional(),
    bundles: z.array(z.string()).optional(),
  }),
  offer: z.object({
    type: z.enum(["PERCENT", "AMOUNT", "SPECIAL_PRICE"]),
    value: z.number().optional(),
    specialPrice: z.number().optional(),
  }),
  lifecycle: z.object({
    startDate: z.string(),
    endDate: z.string(),
    frequency: z.string().optional(),
    maxSends: z.number().optional(),
    capPerPNR: z.number().optional(),
  }),
  comms: z.object({
    portalBanner: z.boolean().optional(),
    emailTemplateId: z.string().optional(),
    whatsappTemplateId: z.string().optional(),
    apiPush: z.boolean().optional(),
  }),
  status: z
    .enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"])
    .default("DRAFT"),
  createdBy: z.string().default("current-user"),
});

// Types
interface Campaign {
  id: string;
  campaignCode: string;
  campaignName: string;
  target: {
    cohorts?: string[];
    agentTiers?: string[];
    pos?: string[];
    channel?: string[];
  };
  products: {
    ancillaries?: string[];
    bundles?: string[];
  };
  offer: {
    type: string;
    value?: number;
    specialPrice?: number;
  };
  lifecycle: {
    startDate: string;
    endDate: string;
    frequency?: string;
    maxSends?: number;
    capPerPNR?: number;
  };
  comms: {
    portalBanner?: boolean;
    emailTemplateId?: string;
    whatsappTemplateId?: string;
    apiPush?: boolean;
  };
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface CampaignMetrics {
  aggregated: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    purchased: number;
    revenueUplift: number;
    attachRate: number;
    roi: number;
  };
  daily: any[];
}

interface AncillaryRule {
  id: string;
  ancillaryCode: string;
  adjustmentType: "FREE" | "PERCENT" | "AMOUNT";
  adjustmentValue: number;
  pos?: string[];
  agentTier?: string[];
}

interface Bundle {
  id: string;
  bundleCode: string;
  bundleName: string;
  components: string[];
}

type CampaignFormData = z.infer<typeof campaignFormSchema>;

// Constants
const campaignStatuses = [
  "DRAFT",
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "CANCELLED",
];
const offerTypes = ["PERCENT", "AMOUNT", "SPECIAL_PRICE"];
const channels = ["PORTAL", "API", "MOBILE"];
const agentTiers = ["PLATINUM", "GOLD", "SILVER", "BRONZE"];
const ancillaryProducts = [
  "BAG20",
  "BAG32",
  "SEAT_STD",
  "SEAT_EXTRA",
  "MEAL_STD",
  "WIFI_STD",
  "LOUNGE_PASS",
];
const bundleProducts = ["COMFORT_PLUS", "BUSINESS_SELECT", "PREMIUM_PACKAGE"];

const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "DRAFT":
      return "default";
    case "PAUSED":
      return "warning";
    case "COMPLETED":
      return "blue";
    case "CANCELLED":
      return "error";
    default:
      return "default";
  }
};

const getChannelIcon = (channel: string) => {
  switch (channel) {
    case "PORTAL":
      return <Globe className="w-4 h-4" />;
    case "API":
      return <SendOutlined className="w-4 h-4" />;
    case "MOBILE":
      return <Smartphone className="w-4 h-4" />;
    default:
      return <Globe className="w-4 h-4" />;
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function CampaignManager() {
  // State management
  const [activeTab, setActiveTab] = useState("campaigns");
  const [isCampaignModalVisible, setIsCampaignModalVisible] = useState(false);
  const [isPerformanceModalVisible, setIsPerformanceModalVisible] =
    useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );
  const [metricsDateRange, setMetricsDateRange] = useState<
    [dayjs.Dayjs, dayjs.Dayjs] | null
  >(null);

  // Template generation states
  const [templateGenerationState, setTemplateGenerationState] = useState({
    email: { loading: false, templates: [] as any[] },
    whatsapp: { loading: false, templates: [] as any[] },
  });
  const [emailPreviewVisible, setEmailPreviewVisible] = useState(false);
  const [whatsappPreviewVisible, setWhatsappPreviewVisible] = useState(false);
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<any>(null);
  const [selectedWhatsappTemplate, setSelectedWhatsappTemplate] =
    useState<any>(null);
  const [customEmailPrompt, setCustomEmailPrompt] = useState("");
  const [customWhatsappPrompt, setCustomWhatsappPrompt] = useState("");

  // Mail sending modal states
  const [mailModalVisible, setMailModalVisible] = useState(false);
  const [selectedCampaignForMail, setSelectedCampaignForMail] =
    useState<Campaign | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [sendingMail, setSendingMail] = useState(false);

  const queryClient = useQueryClient();
  const [campaignForm] = AntForm.useForm<CampaignFormData>();

  // Data fetching
  const {
    data: campaigns = [],
    isLoading: campaignsLoading,
    refetch: refetchCampaigns,
  } = useQuery({
    queryKey: ["/api/campaigns"],
    queryFn: async () => {
      const response = await fetch("/api/campaigns");
      if (!response.ok) throw new Error("Failed to fetch campaigns");
      return response.json();
    },
  });

  const { data: ancillaryRules = [] } = useQuery<AncillaryRule[]>({
    queryKey: ["/api/ancillary-rules"],
    queryFn: async () => {
      const response = await fetch("/api/ancillary-rules");
      if (!response.ok) throw new Error("Failed to fetch ancillary rules");
      return response.json();
    },
  });

  const { data: bundles = [] } = useQuery<Bundle[]>({
    queryKey: ["/api/bundles"],
    queryFn: async () => {
      const response = await fetch("/api/bundles");
      if (!response.ok) throw new Error("Failed to fetch bundles");
      return response.json();
    },
  });

  // Fetch available cohorts for dropdowns
  const { data: availableCohorts = [], isLoading: isCohortsLoading } = useQuery(
    {
      queryKey: ["cohorts"],
      queryFn: async () => {
        const response = await fetch("/api/cohorts");
        if (!response.ok) throw new Error("Failed to fetch cohorts");
        const data = await response.json();
        console.log("Available cohorts for dropdown:", data);
        return data;
      },
      staleTime: 1000 * 60 * 10, // 10 minutes
    },
  );

  // Fetch available ancillaries for dropdown
  const { data: availableAncillaries = [], isLoading: isAncillariesLoading } =
    useQuery<AncillaryRule[]>({
      queryKey: ["/api/ancillary-products"],
      queryFn: async () => {
        const response = await fetch("/api/ancillary-products");
        if (!response.ok) throw new Error("Failed to fetch ancillary products");
        return response.json();
      },
      staleTime: 1000 * 60 * 10, // 10 minutes
    });

  const { data: campaignMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: [
      "/api/campaigns/metrics",
      selectedCampaign?.campaignCode,
      metricsDateRange,
    ],
    queryFn: async () => {
      if (!selectedCampaign) return null;

      const params = new URLSearchParams();
      if (metricsDateRange) {
        params.append("startDate", metricsDateRange[0].format("YYYY-MM-DD"));
        params.append("endDate", metricsDateRange[1].format("YYYY-MM-DD"));
      }

      const response = await fetch(
        `/api/campaigns/${selectedCampaign.campaignCode}/metrics?${params}`,
      );
      if (!response.ok) throw new Error("Failed to fetch metrics");
      return response.json();
    },
    enabled: !!selectedCampaign,
  });

  // Mutations
  const createCampaignMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create campaign");
      }
      return response.json();
    },
    onSuccess: () => {
      message.success("Campaign created successfully");
      setIsCampaignModalVisible(false);
      campaignForm.resetFields();
      refetchCampaigns();
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });

  const updateCampaignMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: CampaignFormData;
    }) => {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update campaign");
      return response.json();
    },
    onSuccess: () => {
      message.success("Campaign updated successfully");
      setIsCampaignModalVisible(false);
      setEditingCampaign(null);
      campaignForm.resetFields();
      refetchCampaigns();
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete campaign");
    },
    onSuccess: () => {
      message.success("Campaign deleted successfully");
      refetchCampaigns();
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/campaigns/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update campaign status");
      return response.json();
    },
    onSuccess: () => {
      message.success("Campaign status updated successfully");
      refetchCampaigns();
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });

  // Event handlers
  const handleCampaignSubmit = async (values: any) => {
    try {
      const validatedData = campaignFormSchema.parse({
        ...values,
        lifecycle: {
          ...values.lifecycle,
          startDate: values.lifecycle.startDate.format("YYYY-MM-DD"),
          endDate: values.lifecycle.endDate.format("YYYY-MM-DD"),
        },
      });

      if (editingCampaign) {
        updateCampaignMutation.mutate({
          id: editingCampaign.id,
          data: validatedData,
        });
      } else {
        createCampaignMutation.mutate(validatedData);
      }
    } catch (error: any) {
      message.error("Validation failed");
    }
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    campaignForm.setFieldsValue({
      ...campaign,
      lifecycle: {
        ...campaign.lifecycle,
        startDate: dayjs(campaign.lifecycle.startDate),
        endDate: dayjs(campaign.lifecycle.endDate),
      },
    });
    setIsCampaignModalVisible(true);
  };

  const handleViewPerformance = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setMetricsDateRange([dayjs().subtract(30, "days"), dayjs()]);
    setIsPerformanceModalVisible(true);
  };

  const handleStatusChange = (campaign: Campaign, newStatus: string) => {
    updateStatusMutation.mutate({ id: campaign.id, status: newStatus });
  };

  // Template generation handler
  const handleGenerateTemplate = async (type: "email" | "whatsapp") => {
    setTemplateGenerationState((prev) => ({
      ...prev,
      [type]: { ...prev[type], loading: true },
    }));

    try {
      // Get current form values to use as context
      const formValues = campaignForm.getFieldsValue();

      // Build comprehensive context for AI generation
      const context = {
        campaignName: formValues.campaignName || "New Campaign",
        campaignCode: formValues.campaignCode || "CAMPAIGN_001",
        offerType: formValues.offer?.type || "PERCENT",
        offerValue: formValues.offer?.value || 10,
        specialPrice: formValues.offer?.specialPrice,
        products: {
          ancillaries: formValues.products?.ancillaries || [],
          bundles: formValues.products?.bundles || [],
        },
        target: {
          agentTiers: formValues.target?.agentTiers || [],
          cohorts: formValues.target?.cohorts || [],
          pos: formValues.target?.pos || [],
          channel: formValues.target?.channel || [],
        },
        lifecycle: {
          startDate: formValues.lifecycle?.startDate?.format("YYYY-MM-DD"),
          endDate: formValues.lifecycle?.endDate?.format("YYYY-MM-DD"),
        },
        companyName: "OfferSense",
        brandTone: type === "email" ? "professional" : "friendly",
        urgency: "medium",
        personalization: true,
        customPrompt:
          type === "email" ? customEmailPrompt : customWhatsappPrompt,
      };

      const response = await fetch("/api/ai/generate-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, context }),
      });

      if (!response.ok) throw new Error("Failed to generate templates");

      const generatedTemplates = await response.json();

      setTemplateGenerationState((prev) => ({
        ...prev,
        [type]: { loading: false, templates: generatedTemplates },
      }));

      message.success(
        `Generated ${generatedTemplates.length} ${type} templates`,
      );

      // Auto-open preview modal if templates were generated
      if (generatedTemplates.length > 0) {
        if (type === "email") {
          setEmailPreviewVisible(true);
        } else {
          setWhatsappPreviewVisible(true);
        }
      }
    } catch (error: any) {
      message.error(error.message || "Failed to generate templates");
      setTemplateGenerationState((prev) => ({
        ...prev,
        [type]: { ...prev[type], loading: false },
      }));
    }
  };

  // Template selection handlers
  const handleSelectEmailTemplate = (template: any) => {
    setSelectedEmailTemplate(template);
    campaignForm.setFieldsValue({
      comms: {
        ...campaignForm.getFieldValue("comms"),
        emailTemplateId: template.id,
      },
    });
    setEmailPreviewVisible(false);
    message.success("Email template selected");
  };

  // Mail sending handlers
  const handleOpenMailModal = (campaign: Campaign) => {
    setSelectedCampaignForMail(campaign);
    setMailModalVisible(true);
    setRecipientEmail("");
  };

  const handleSendMail = async () => {
    if (!recipientEmail || !selectedCampaignForMail) {
      message.error("Please enter a valid email address");
      return;
    }

    setSendingMail(true);
    try {
      // In a real implementation, this would call your email API
      const response = await fetch("/api/campaigns/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignCode: selectedCampaignForMail.campaignCode,
          recipientEmail,
          templateId:
            selectedCampaignForMail.comms.emailTemplateId || "default",
        }),
      });

      if (response.ok) {
        const successData = await response.json();
        message.success(`Email sent successfully to ${recipientEmail}`);
        setMailModalVisible(false);
        setRecipientEmail("");
        setSelectedCampaignForMail(null);
      } else {
        const errorData = await response.json();
        console.error("Email sending error:", errorData);
        message.error(errorData.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      message.error("Failed to send email");
    } finally {
      setSendingMail(false);
    }
  };

  const handleSelectWhatsappTemplate = (template: any) => {
    setSelectedWhatsappTemplate(template);
    campaignForm.setFieldsValue({
      comms: {
        ...campaignForm.getFieldValue("comms"),
        whatsappTemplateId: template.id,
      },
    });
    setWhatsappPreviewVisible(false);
    message.success("WhatsApp template selected");
  };

  // Table columns
  const campaignColumns = [
    {
      title: "Campaign",
      key: "campaign",
      width: 220,
      render: (record: Campaign) => (
        <div>
          <div className="font-medium text-sm">{record.campaignName}</div>
          <div className="text-xs text-gray-500">{record.campaignCode}</div>
        </div>
      ),
    },
    {
      title: "Target",
      key: "target",
      width: 140,
      render: (record: Campaign) => (
        <div className="space-y-1">
          {record.target.agentTiers && record.target.agentTiers.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <Tag key={record.target.agentTiers[0]} size="small">
                {record.target.agentTiers[0]}
              </Tag>
              {record.target.agentTiers.length > 1 && (
                <Tag size="small">+{record.target.agentTiers.length - 1}</Tag>
              )}
            </div>
          )}
          {record.target.cohorts && record.target.cohorts.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <Tag color="blue" size="small">
                {record.target.cohorts.length} cohort
                {record.target.cohorts.length > 1 ? "s" : ""}
              </Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Products",
      key: "products",
      width: 120,
      render: (record: Campaign) => {
        const totalProducts =
          (record.products.ancillaries?.length || 0) +
          (record.products.bundles?.length || 0);
        if (totalProducts === 0)
          return <span className="text-gray-400">-</span>;

        return (
          <div className="text-sm">
            <Tag color="green" size="small">
              {totalProducts} product{totalProducts > 1 ? "s" : ""}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "Offer",
      key: "offer",
      width: 110,
      render: (record: Campaign) => {
        const { offer } = record;
        if (offer.type === "PERCENT") {
          return (
            <Tag color="orange" size="small">
              {offer.value}% Off
            </Tag>
          );
        } else if (offer.type === "AMOUNT") {
          return (
            <Tag color="orange" size="small">
              ₹{offer.value} Off
            </Tag>
          );
        } else if (offer.type === "SPECIAL_PRICE") {
          return (
            <Tag color="red" size="small">
              ₹{offer.specialPrice}
            </Tag>
          );
        }
        return <span className="text-gray-400">-</span>;
      },
    },
    {
      title: "Duration",
      key: "duration",
      width: 120,
      render: (record: Campaign) => (
        <div className="text-xs">
          <div>{dayjs(record.lifecycle.startDate).format("MMM DD")}</div>
          <div className="text-gray-500">
            to {dayjs(record.lifecycle.endDate).format("MMM DD")}
          </div>
        </div>
      ),
    },
    {
      title: "Channels",
      key: "channels",
      width: 100,
      render: (record: Campaign) => {
        const channels = [];
        if (record.comms.portalBanner) channels.push("Portal");
        if (record.comms.emailTemplateId) channels.push("Email");
        if (record.comms.whatsappTemplateId) channels.push("WhatsApp");
        if (record.comms.apiPush) channels.push("API");

        if (channels.length === 0)
          return <span className="text-gray-400">-</span>;

        return (
          <div className="text-xs">
            <Tag size="small">
              {channels.length} channel{channels.length > 1 ? "s" : ""}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (status: string) => (
        <AntBadge status={getStatusColor(status) as any} text={status} />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      fixed: "right" as const,
      render: (record: Campaign) => (
        <Space size="small">
          <Tooltip title="View Performance">
            <AntButton
              icon={<BarChart3 className="w-3 h-3" />}
              size="small"
              onClick={() => handleViewPerformance(record)}
            />
          </Tooltip>
          <Tooltip title="Send Email">
            <AntButton
              icon={<Mail className="w-3 h-3" />}
              size="small"
              onClick={() => handleOpenMailModal(record)}
              disabled={false}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <AntButton
              icon={<Edit className="w-3 h-3" />}
              size="small"
              onClick={() => handleEditCampaign(record)}
            />
          </Tooltip>
          {record.status === "DRAFT" || record.status === "PAUSED" ? (
            <Tooltip title="Activate">
              <AntButton
                icon={<Play className="w-3 h-3" />}
                size="small"
                type="primary"
                onClick={() => handleStatusChange(record, "ACTIVE")}
              />
            </Tooltip>
          ) : record.status === "ACTIVE" ? (
            <Tooltip title="Pause">
              <AntButton
                icon={<Pause className="w-3 h-3" />}
                size="small"
                onClick={() => handleStatusChange(record, "PAUSED")}
              />
            </Tooltip>
          ) : null}
        </Space>
      ),
    },
  ];

  // Statistics
  const campaignStats = campaigns.reduce((acc: any, campaign: Campaign) => {
    acc[campaign.status] = (acc[campaign.status] || 0) + 1;
    return acc;
  }, {});

  const activeCampaigns = campaigns.filter(
    (c: Campaign) => c.status === "ACTIVE",
  );

  if (campaignsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="text-lg font-medium text-gray-600">
            Loading campaigns...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ShadcnTabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="bg-white p-2 rounded-md">
          <TabsTrigger value="campaigns" className="px-4 py-2">
            Campaign Management
          </TabsTrigger>
          <TabsTrigger value="performance" className="px-4 py-2">
            Performance Dashboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Campaign Management</h3>
                <p className="text-sm text-muted-foreground">
                  Create, manage, and monitor ancillary upsell campaigns across
                  multiple channels.
                </p>
              </div>
              <AntButton
                className="bg-primary text-white"
                type="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  setEditingCampaign(null);
                  campaignForm.resetFields();
                  setIsCampaignModalVisible(true);
                }}
              >
                Create Campaign
              </AntButton>
            </div>

            <Table
              columns={campaignColumns}
              dataSource={campaigns}
              loading={campaignsLoading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">
                Campaign Performance Overview
              </h3>
              <p className="text-sm text-muted-foreground">
                Monitor campaign effectiveness, conversion rates, and revenue
                impact.
              </p>
            </div>

            {activeCampaigns.length === 0 ? (
              <Alert
                message="No Active Campaigns"
                description="Create and activate campaigns to view performance metrics."
                type="info"
                showIcon
              />
            ) : (
              <Row gutter={16}>
                {activeCampaigns.slice(0, 3).map((campaign: Campaign) => (
                  <Col span={8} key={campaign.id}>
                    <AntCard
                      title={campaign.campaignName}
                      extra={
                        <AntButton
                          size="small"
                          onClick={() => handleViewPerformance(campaign)}
                        >
                          View Details
                        </AntButton>
                      }
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <AntBadge status="success" text={campaign.status} />
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span className="text-sm">
                            {dayjs(campaign.lifecycle.startDate).format(
                              "MMM DD",
                            )}{" "}
                            -{" "}
                            {dayjs(campaign.lifecycle.endDate).format("MMM DD")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Offer:</span>
                          <Tag color="orange">
                            {campaign.offer.type === "PERCENT"
                              ? `${campaign.offer.value}% Off`
                              : campaign.offer.type === "AMOUNT"
                                ? `₹${campaign.offer.value} Off`
                                : `₹${campaign.offer.specialPrice}`}
                          </Tag>
                        </div>
                      </div>
                    </AntCard>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </TabsContent>
      </ShadcnTabs>

      {/* Campaign Modal */}
      <Modal
        title={editingCampaign ? "Edit Campaign" : "Create New Campaign"}
        open={isCampaignModalVisible}
        onCancel={() => {
          setIsCampaignModalVisible(false);
          setEditingCampaign(null);
          campaignForm.resetFields();
          setCustomEmailPrompt("");
          setCustomWhatsappPrompt("");
          setSelectedEmailTemplate(null);
          setSelectedWhatsappTemplate(null);
        }}
        footer={null}
        width={1000}
      >
        <AntForm
          form={campaignForm}
          layout="vertical"
          onFinish={handleCampaignSubmit}
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                name="campaignCode"
                label="Campaign Code"
                rules={[
                  { required: true, message: "Campaign code is required" },
                ]}
              >
                <Input placeholder="PRETRAVEL_BAG_PUSH" />
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                name="campaignName"
                label="Campaign Name"
                rules={[
                  { required: true, message: "Campaign name is required" },
                ]}
              >
                <Input placeholder="Pre-Travel Baggage Upsell" />
              </AntForm.Item>
            </Col>
          </Row>

          <Divider orientation="left">Target Audience</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item name={["target", "agentTiers"]} label="Agent Tiers">
                <AntSelect
                  mode="multiple"
                  placeholder="Select agent tiers"
                  options={agentTiers.map((tier) => ({
                    label: tier,
                    value: tier,
                  }))}
                />
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item name={["target", "channel"]} label="Channels">
                <AntSelect
                  mode="multiple"
                  placeholder="Select channels"
                  options={channels.map((channel) => ({
                    label: channel,
                    value: channel,
                  }))}
                />
              </AntForm.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item name={["target", "cohorts"]} label="Cohorts">
                <AntSelect
                  mode="multiple"
                  placeholder="Select cohorts"
                  loading={isCohortsLoading}
                  options={availableCohorts.map(
                    (cohort: { id: string; cohortName: string }) => ({
                      label: cohort.cohortName,
                      value: cohort.id,
                    }),
                  )}
                />
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item name={["target", "pos"]} label="Point of Sale">
                <AntSelect
                  mode="multiple"
                  placeholder="Select POS countries"
                  options={[
                    { label: "India (IN)", value: "IN" },
                    { label: "UAE (AE)", value: "AE" },
                    { label: "Singapore (SG)", value: "SG" },
                    { label: "USA (US)", value: "US" },
                  ]}
                />
              </AntForm.Item>
            </Col>
          </Row>

          <Divider orientation="left">Products & Offer</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                name={["products", "ancillaries"]}
                label="Ancillary Products"
              >
                <AntSelect
                  mode="multiple"
                  placeholder="Select ancillary products"
                  loading={isAncillariesLoading}
                  showSearch
                  filterOption={(input, option) =>
                    option?.children?.props?.children?.[0]?.props?.children?.[0]
                      ?.toLowerCase()
                      .includes(input.toLowerCase()) ||
                    option?.children?.props?.children?.[1]?.props?.children?.[0]
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {availableAncillaries.map((rule: any) => (
                    <AntSelect.Option key={rule.id} value={rule.ancillaryCode}>
                      <div>
                        <div className="font-medium">
                          {`${rule.ruleCode} / ${rule.ancillaryCode}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {rule.adjustmentType === "FREE"
                            ? "Free"
                            : rule.adjustmentType === "PERCENT"
                              ? `${rule.adjustmentValue}% discount`
                              : `₹${rule.adjustmentValue} discount`}{" "}
                          • {rule.pos?.join(", ")} •{" "}
                          {rule.agentTier?.join(", ")}
                        </div>
                      </div>
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                name={["products", "bundles"]}
                label="Bundle Products"
              >
                <AntSelect
                  mode="multiple"
                  placeholder="Select bundle products"
                  showSearch
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().indexOf(input.toLowerCase()) >=
                    0
                  }
                >
                  {bundles.map((bundle) => (
                    <AntSelect.Option key={bundle.id} value={bundle.bundleCode}>
                      <div>
                        <div className="font-medium">{bundle.bundleCode}</div>
                        <div className="text-xs text-gray-500">
                          {bundle.bundleName} •{" "}
                          {bundle.components?.slice(0, 3).join(", ")}
                          {bundle.components?.length > 3 &&
                            ` +${bundle.components.length - 3} more`}
                        </div>
                      </div>
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <AntForm.Item
                name={["offer", "type"]}
                label="Offer Type"
                rules={[{ required: true, message: "Offer type is required" }]}
              >
                <AntSelect placeholder="Select offer type">
                  {offerTypes.map((type) => (
                    <AntSelect.Option key={type} value={type}>
                      {type === "PERCENT"
                        ? "Percentage Discount"
                        : type === "AMOUNT"
                          ? "Amount Discount"
                          : "Special Price"}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
            <Col span={8}>
              <AntForm.Item name={["offer", "value"]} label="Discount Value">
                <InputNumber
                  placeholder="10 (for 10% or ₹10)"
                  style={{ width: "100%" }}
                  min={0}
                />
              </AntForm.Item>
            </Col>
            <Col span={8}>
              <AntForm.Item
                name={["offer", "specialPrice"]}
                label="Special Price"
              >
                <InputNumber
                  placeholder="99.99"
                  style={{ width: "100%" }}
                  min={0}
                  step={0.01}
                />
              </AntForm.Item>
            </Col>
          </Row>

          <Divider orientation="left">Campaign Lifecycle</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                name={["lifecycle", "startDate"]}
                label="Start Date"
                rules={[{ required: true, message: "Start date is required" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                name={["lifecycle", "endDate"]}
                label="End Date"
                rules={[{ required: true, message: "End date is required" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </AntForm.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <AntForm.Item
                name={["lifecycle", "frequency"]}
                label="Frequency (Cron)"
              >
                <Input placeholder="0 10 * * * (daily at 10 AM)" />
              </AntForm.Item>
            </Col>
            <Col span={8}>
              <AntForm.Item name={["lifecycle", "maxSends"]} label="Max Sends">
                <InputNumber
                  placeholder="3"
                  style={{ width: "100%" }}
                  min={1}
                />
              </AntForm.Item>
            </Col>
            <Col span={8}>
              <AntForm.Item
                name={["lifecycle", "capPerPNR"]}
                label="Cap Per PNR"
              >
                <InputNumber
                  placeholder="1"
                  style={{ width: "100%" }}
                  min={1}
                />
              </AntForm.Item>
            </Col>
          </Row>

          <Divider orientation="left">Communication Channels</Divider>

          <Row gutter={16}>
            <Col span={6}>
              <AntForm.Item
                name={["comms", "portalBanner"]}
                label="Portal Banner"
                valuePropName="checked"
              >
                <Switch />
              </AntForm.Item>
            </Col>
            <Col span={6}>
              <AntForm.Item
                name={["comms", "apiPush"]}
                label="API Push"
                valuePropName="checked"
              >
                <Switch />
              </AntForm.Item>
            </Col>
            <Col span={24}>
              <div className="space-y-6">
                {/* Email Template Section */}
                <AntCard
                  size="small"
                  title={
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>Email Templates</span>
                    </div>
                  }
                  className="border-l-4 border-l-blue-500"
                >
                  <div className="space-y-4">
                    {/* Template Selection Section */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium mb-3 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                        Select from Existing Templates
                      </h4>

                      {templateGenerationState.email.templates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {templateGenerationState.email.templates.map(
                            (template, index) => (
                              <div
                                key={index}
                                className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                  selectedEmailTemplate?.subject ===
                                  template.subject
                                    ? "border-blue-500 bg-blue-100"
                                    : "border-gray-200 bg-white hover:border-blue-300"
                                }`}
                                onClick={() =>
                                  handleSelectEmailTemplate(template)
                                }
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-sm text-gray-900 mb-1">
                                      {template.subject}
                                    </h5>
                                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                      {template.name}
                                    </p>
                                    <div className="flex gap-1">
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {template.tone}
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className="text-xs text-blue-600"
                                      >
                                        {template.estimatedOpenRate}
                                      </Badge>
                                    </div>
                                  </div>
                                  {selectedEmailTemplate?.subject ===
                                    template.subject && (
                                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2" />
                                  )}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <Mail className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">
                            No email templates available
                          </p>
                          <p className="text-xs">
                            Generate templates using AI below
                          </p>
                        </div>
                      )}
                    </div>

                    {/* AI Generation Section */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium mb-3 flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2 text-purple-600" />
                        Generate Templates with AI
                      </h4>

                      <div className="space-y-3">
                        <AntForm.Item
                          label="Custom AI Prompt (Optional)"
                          className="mb-2"
                        >
                          <TextArea
                            placeholder="e.g., 'Create a professional email template with urgency for last-minute bookings, focusing on comfort and convenience...'"
                            rows={3}
                            className="text-sm"
                            value={customEmailPrompt}
                            onChange={(e) =>
                              setCustomEmailPrompt(e.target.value)
                            }
                          />
                        </AntForm.Item>

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-600">
                            <strong>AI will use:</strong> Campaign details,
                            offers, products, and target audience
                          </div>
                          <AntButton
                            type="primary"
                            icon={<MessageSquare className="w-4 h-4" />}
                            onClick={() => handleGenerateTemplate("email")}
                            loading={templateGenerationState.email.loading}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 border-none"
                          >
                            {templateGenerationState.email.loading
                              ? "Generating..."
                              : "Generate AI Templates"}
                          </AntButton>
                        </div>
                      </div>
                    </div>

                    {/* Selected Template Display */}
                    {selectedEmailTemplate && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-green-800 mb-1">
                              ✓ Selected Email Template
                            </h4>
                            <p className="text-sm text-green-700">
                              {selectedEmailTemplate.subject}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              {selectedEmailTemplate.name}
                            </p>
                          </div>
                          <AntButton
                            size="small"
                            icon={<Eye className="w-3 h-3" />}
                            onClick={() => setEmailPreviewVisible(true)}
                          >
                            Preview
                          </AntButton>
                        </div>
                      </div>
                    )}
                  </div>
                </AntCard>

                {/* WhatsApp Template Section */}
                <AntCard
                  size="small"
                  title={
                    <div className="flex items-center space-x-2">
                      <Smartphone className="w-4 h-4 text-green-600" />
                      <span>WhatsApp Templates</span>
                    </div>
                  }
                  className="border-l-4 border-l-green-500"
                >
                  <div className="space-y-4">
                    {/* Template Selection Section */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium mb-3 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Select from Existing Templates
                      </h4>

                      {templateGenerationState.whatsapp.templates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {templateGenerationState.whatsapp.templates.map(
                            (template, index) => (
                              <div
                                key={index}
                                className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                  selectedWhatsappTemplate?.message ===
                                  template.message
                                    ? "border-green-500 bg-green-100"
                                    : "border-gray-200 bg-white hover:border-green-300"
                                }`}
                                onClick={() =>
                                  handleSelectWhatsappTemplate(template)
                                }
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-sm text-gray-900 mb-1">
                                      {template.name}
                                    </h5>
                                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                      {template.message.substring(0, 80)}...
                                    </p>
                                    <div className="flex gap-1">
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {template.style}
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className={`text-xs ${template.message.length <= 160 ? "text-green-600" : "text-orange-600"}`}
                                      >
                                        {template.message.length} chars
                                      </Badge>
                                    </div>
                                  </div>
                                  {selectedWhatsappTemplate?.message ===
                                    template.message && (
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 ml-2" />
                                  )}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <Smartphone className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">
                            No WhatsApp templates available
                          </p>
                          <p className="text-xs">
                            Generate templates using AI below
                          </p>
                        </div>
                      )}
                    </div>

                    {/* AI Generation Section */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium mb-3 flex items-center">
                        <Smartphone className="w-4 h-4 mr-2 text-green-600" />
                        Generate Templates with AI
                      </h4>

                      <div className="space-y-3">
                        <AntForm.Item
                          label="Custom AI Prompt (Optional)"
                          className="mb-2"
                        >
                          <TextArea
                            placeholder="e.g., 'Create a friendly WhatsApp message under 160 characters about baggage upgrades with emojis...'"
                            rows={3}
                            className="text-sm"
                            value={customWhatsappPrompt}
                            onChange={(e) =>
                              setCustomWhatsappPrompt(e.target.value)
                            }
                          />
                        </AntForm.Item>

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-600">
                            <strong>AI will optimize for:</strong> Character
                            limit, mobile format, and engagement
                          </div>
                          <AntButton
                            type="primary"
                            icon={<Smartphone className="w-4 h-4" />}
                            onClick={() => handleGenerateTemplate("whatsapp")}
                            loading={templateGenerationState.whatsapp.loading}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 border-none"
                          >
                            {templateGenerationState.whatsapp.loading
                              ? "Generating..."
                              : "Generate AI Templates"}
                          </AntButton>
                        </div>
                      </div>
                    </div>

                    {/* Selected Template Display */}
                    {selectedWhatsappTemplate && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-blue-800 mb-1">
                              ✓ Selected WhatsApp Template
                            </h4>
                            <p className="text-sm text-blue-700">
                              {selectedWhatsappTemplate.name}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              {selectedWhatsappTemplate.message.length}{" "}
                              characters • {selectedWhatsappTemplate.style}
                            </p>
                          </div>
                          <AntButton
                            size="small"
                            icon={<Eye className="w-3 h-3" />}
                            onClick={() => setWhatsappPreviewVisible(true)}
                          >
                            Preview
                          </AntButton>
                        </div>
                      </div>
                    )}
                  </div>
                </AntCard>
              </div>
            </Col>
          </Row>

          <AntForm.Item name="status" initialValue="DRAFT" hidden>
            <Input />
          </AntForm.Item>

          <AntForm.Item name="createdBy" initialValue="current-user" hidden>
            <Input />
          </AntForm.Item>

          <div className="flex justify-end gap-2">
            <AntButton onClick={() => setIsCampaignModalVisible(false)}>
              Cancel
            </AntButton>
            <AntButton
              type="primary"
              htmlType="submit"
              loading={
                editingCampaign
                  ? updateCampaignMutation.isPending
                  : createCampaignMutation.isPending
              }
            >
              {editingCampaign ? "Update Campaign" : "Create Campaign"}
            </AntButton>
          </div>
        </AntForm>
      </Modal>

      {/* Performance Modal */}
      <Modal
        title="Campaign Performance Dashboard"
        open={isPerformanceModalVisible}
        onCancel={() => {
          setIsPerformanceModalVisible(false);
          setSelectedCampaign(null);
        }}
        footer={[
          <AntButton
            key="close"
            onClick={() => setIsPerformanceModalVisible(false)}
          >
            Close
          </AntButton>,
        ]}
        width={1200}
      >
        {selectedCampaign && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {selectedCampaign.campaignName}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedCampaign.campaignCode}
                </p>
              </div>
              <RangePicker
                value={metricsDateRange}
                onChange={setMetricsDateRange}
                className="w-64"
              />
            </div>

            {campaignMetrics ? (
              <>
                {/* Key Metrics */}
                <Row gutter={16}>
                  <Col span={4}>
                    <AntCard size="small">
                      <Statistic
                        title="Sent"
                        value={campaignMetrics.aggregated.sent}
                        prefix={<Send className="w-4 h-4" />}
                        valueStyle={{ fontSize: "18px" }}
                      />
                    </AntCard>
                  </Col>
                  <Col span={4}>
                    <AntCard size="small">
                      <Statistic
                        title="Delivered"
                        value={campaignMetrics.aggregated.delivered}
                        prefix={<CheckCircle className="w-4 h-4" />}
                        valueStyle={{ fontSize: "18px", color: "#52c41a" }}
                      />
                    </AntCard>
                  </Col>
                  <Col span={4}>
                    <AntCard size="small">
                      <Statistic
                        title="Opened"
                        value={campaignMetrics.aggregated.opened}
                        prefix={<Eye className="w-4 h-4" />}
                        valueStyle={{ fontSize: "18px", color: "#1890ff" }}
                      />
                    </AntCard>
                  </Col>
                  <Col span={4}>
                    <AntCard size="small">
                      <Statistic
                        title="Clicked"
                        value={campaignMetrics.aggregated.clicked}
                        prefix={<MousePointer className="w-4 h-4" />}
                        valueStyle={{ fontSize: "18px", color: "#722ed1" }}
                      />
                    </AntCard>
                  </Col>
                  <Col span={4}>
                    <AntCard size="small">
                      <Statistic
                        title="Purchased"
                        value={campaignMetrics.aggregated.purchased}
                        prefix={<ShoppingCart className="w-4 h-4" />}
                        valueStyle={{ fontSize: "18px", color: "#fa8c16" }}
                      />
                    </AntCard>
                  </Col>
                  <Col span={4}>
                    <AntCard size="small">
                      <Statistic
                        title="Revenue Uplift"
                        value={campaignMetrics.aggregated.revenueUplift}
                        prefix={<IndianRupee className="w-4 h-4" />}
                        valueStyle={{ fontSize: "18px", color: "#52c41a" }}
                      />
                    </AntCard>
                  </Col>
                </Row>

                {/* Performance Rates */}
                <Row gutter={16}>
                  <Col span={8}>
                    <AntCard title="Delivery Rate" size="small">
                      <Progress
                        percent={
                          campaignMetrics.aggregated.sent > 0
                            ? Math.round(
                                (campaignMetrics.aggregated.delivered /
                                  campaignMetrics.aggregated.sent) *
                                  100,
                              )
                            : 0
                        }
                        status="active"
                      />
                    </AntCard>
                  </Col>
                  <Col span={8}>
                    <AntCard title="Open Rate" size="small">
                      <Progress
                        percent={
                          campaignMetrics.aggregated.delivered > 0
                            ? Math.round(
                                (campaignMetrics.aggregated.opened /
                                  campaignMetrics.aggregated.delivered) *
                                  100,
                              )
                            : 0
                        }
                        status="active"
                        strokeColor="#1890ff"
                      />
                    </AntCard>
                  </Col>
                  <Col span={8}>
                    <AntCard title="Attach Rate" size="small">
                      <Progress
                        percent={Math.round(
                          campaignMetrics.aggregated.attachRate,
                        )}
                        status="active"
                        strokeColor="#fa8c16"
                      />
                    </AntCard>
                  </Col>
                </Row>

                {/* Campaign Details */}
                <AntCard title="Campaign Configuration">
                  <Descriptions column={3} size="small">
                    <Descriptions.Item label="Target Tiers">
                      {selectedCampaign.target.agentTiers?.join(", ") || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Channels">
                      {selectedCampaign.target.channel?.join(", ") || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Offer">
                      {selectedCampaign.offer.type === "PERCENT"
                        ? `${selectedCampaign.offer.value}% Off`
                        : selectedCampaign.offer.type === "AMOUNT"
                          ? `₹${selectedCampaign.offer.value} Off`
                          : `₹${selectedCampaign.offer.specialPrice}`}
                    </Descriptions.Item>
                    <Descriptions.Item label="Products">
                      {[
                        ...(selectedCampaign.products.ancillaries || []),
                        ...(selectedCampaign.products.bundles || []),
                      ].join(", ") || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Duration">
                      {dayjs(selectedCampaign.lifecycle.startDate).format(
                        "MMM DD, YYYY",
                      )}{" "}
                      -{" "}
                      {dayjs(selectedCampaign.lifecycle.endDate).format(
                        "MMM DD, YYYY",
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Max Sends">
                      {selectedCampaign.lifecycle.maxSends || "Unlimited"}
                    </Descriptions.Item>
                  </Descriptions>
                </AntCard>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading campaign metrics...</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Email Template Preview Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <span>Email Template Preview & Selection</span>
          </div>
        }
        open={emailPreviewVisible}
        onCancel={() => setEmailPreviewVisible(false)}
        footer={[
          <AntButton key="cancel" onClick={() => setEmailPreviewVisible(false)}>
            Cancel
          </AntButton>,
          <AntButton
            key="regenerate"
            icon={<MessageSquare className="w-4 h-4" />}
            onClick={() => handleGenerateTemplate("email")}
            loading={templateGenerationState.email.loading}
          >
            Generate New Templates
          </AntButton>,
        ]}
        width={900}
        className="email-template-modal"
      >
        {templateGenerationState.email.templates.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Email Templates Generated
            </h3>
            <p className="text-gray-500 mb-4">
              Generate AI-powered email templates based on your campaign details
            </p>
            <AntButton
              type="primary"
              size="large"
              icon={<MessageSquare className="w-4 h-4" />}
              onClick={() => handleGenerateTemplate("email")}
              loading={templateGenerationState.email.loading}
            >
              Generate Email Templates
            </AntButton>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {templateGenerationState.email.templates.length} templates
                available
              </span>
            </div>

            <ShadcnTabs defaultValue="0" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {templateGenerationState.email.templates.map(
                  (template, index) => (
                    <TabsTrigger
                      key={index}
                      value={index.toString()}
                      className="flex items-center space-x-2"
                    >
                      <span>Template {index + 1}</span>
                      {selectedEmailTemplate?.subject === template.subject && (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      )}
                    </TabsTrigger>
                  ),
                )}
              </TabsList>

              {templateGenerationState.email.templates.map(
                (template, index) => (
                  <TabsContent
                    key={index}
                    value={index.toString()}
                    className="mt-6"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-lg mb-2">
                            {template.subject}
                          </h4>
                          <div className="flex items-center space-x-2 mb-3">
                            <Badge
                              variant="outline"
                              className="text-blue-600 border-blue-600"
                            >
                              {template.tone}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-purple-600 border-purple-600"
                            >
                              {template.estimatedOpenRate} open rate
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-orange-600 border-orange-600"
                            >
                              {template.estimatedClickRate} click rate
                            </Badge>
                          </div>
                        </div>
                        <AntButton
                          type={
                            selectedEmailTemplate?.subject === template.subject
                              ? "default"
                              : "primary"
                          }
                          size="large"
                          onClick={() => handleSelectEmailTemplate(template)}
                          icon={
                            selectedEmailTemplate?.subject ===
                            template.subject ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : null
                          }
                        >
                          {selectedEmailTemplate?.subject === template.subject
                            ? "Selected"
                            : "Select This Template"}
                        </AntButton>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <strong className="text-sm text-gray-600">
                            Subject Line:
                          </strong>
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm font-medium">
                            {template.subject}
                          </div>
                        </div>
                        <div>
                          <strong className="text-sm text-gray-600">
                            Template Details:
                          </strong>
                          <div className="mt-2 text-sm text-gray-700 space-y-2">
                            <div>
                              Tone:{" "}
                              <span className="font-medium capitalize">
                                {template.tone}
                              </span>
                            </div>
                            <div>
                              Call to Action:{" "}
                              <span className="font-medium">
                                {template.callToAction}
                              </span>
                            </div>
                            <div>
                              Reading Time:{" "}
                              <span className="font-medium">30-45 seconds</span>
                            </div>
                            <div>
                              Variables:{" "}
                              <span className="font-medium">
                                {template.variables?.length || 0} dynamic fields
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-xs text-gray-500">
                              Personalization Level
                            </div>
                            <div className="font-medium text-green-600">
                              High
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">
                              Mobile Optimized
                            </div>
                            <div className="font-medium text-green-600">
                              Yes
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">
                              Spam Score
                            </div>
                            <div className="font-medium text-green-600">
                              Low
                            </div>
                          </div>
                        </div>
                      </div>

                      {template.variables && template.variables.length > 0 && (
                        <div>
                          <strong className="text-sm text-gray-600">
                            Dynamic Variables:
                          </strong>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {template.variables.map(
                              (variable: string, i: number) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="text-blue-600 border-blue-600"
                                >
                                  {variable}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <strong className="text-sm text-gray-600">
                            Email Preview:
                          </strong>
                          <div className="flex space-x-2">
                            <AntButton
                              size="small"
                              ghost
                              icon={<Eye className="w-3 h-3" />}
                            >
                              Full Preview
                            </AntButton>
                            <AntButton
                              size="small"
                              ghost
                              icon={<Send className="w-3 h-3" />}
                            >
                              Test Send
                            </AntButton>
                          </div>
                        </div>
                        <div className="p-4 bg-white border rounded-lg shadow-sm max-h-80 overflow-y-auto">
                          <div
                            className="email-preview"
                            dangerouslySetInnerHTML={{
                              __html: template.htmlContent,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                ),
              )}
            </ShadcnTabs>
          </div>
        )}
      </Modal>

      {/* Mail Sending Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <span>Send Campaign Email</span>
          </div>
        }
        open={mailModalVisible}
        onCancel={() => {
          setMailModalVisible(false);
          setSelectedCampaignForMail(null);
          setRecipientEmail("");
        }}
        footer={[
          <AntButton key="cancel" onClick={() => setMailModalVisible(false)}>
            Cancel
          </AntButton>,
          <AntButton
            key="send"
            type="primary"
            icon={<Send className="w-4 h-4" />}
            onClick={handleSendMail}
            loading={sendingMail}
            disabled={!recipientEmail}
          >
            Send Mail
          </AntButton>,
        ]}
        width={800}
      >
        {selectedCampaignForMail && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                Campaign Details
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Campaign:</span>
                  <div className="font-medium">
                    {selectedCampaignForMail.campaignName}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Code:</span>
                  <div className="font-medium">
                    {selectedCampaignForMail.campaignCode}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Offer:</span>
                  <div className="font-medium">
                    {selectedCampaignForMail.offer.type === "PERCENT"
                      ? `${selectedCampaignForMail.offer.value}% Off`
                      : selectedCampaignForMail.offer.type === "AMOUNT"
                        ? `₹${selectedCampaignForMail.offer.value} Off`
                        : `₹${selectedCampaignForMail.offer.specialPrice}`}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <AntBadge
                    status={
                      getStatusColor(selectedCampaignForMail.status) as any
                    }
                    text={selectedCampaignForMail.status}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <strong className="text-sm text-gray-600 mb-3 block">
                  Email Template Preview:
                </strong>
                <div className="border rounded-lg p-4 bg-white max-h-80 overflow-y-auto">
                  <div className="mb-4 pb-3 border-b">
                    <div className="text-sm text-gray-500 mb-1">Subject:</div>
                    <div className="font-medium text-gray-900">
                      🎯 Exclusive{" "}
                      {selectedCampaignForMail.offer.type === "PERCENT"
                        ? `${selectedCampaignForMail.offer.value}% discount`
                        : selectedCampaignForMail.offer.type === "AMOUNT"
                          ? `₹${selectedCampaignForMail.offer.value} off`
                          : `special price of ₹${selectedCampaignForMail.offer.specialPrice}`}{" "}
                      on{" "}
                      {[
                        ...(selectedCampaignForMail.products.ancillaries || []),
                        ...(selectedCampaignForMail.products.bundles || []),
                      ].length > 0
                        ? [
                            ...(selectedCampaignForMail.products.ancillaries ||
                              []),
                            ...(selectedCampaignForMail.products.bundles || []),
                          ]
                            .slice(0, 2)
                            .join(", ")
                        : "travel services"}{" "}
                      - Limited Time!
                    </div>
                  </div>
                  <div
                    className="email-preview-content"
                    dangerouslySetInnerHTML={{
                      __html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
                            <h1 style="margin: 0; font-size: 24px;">${selectedCampaignForMail.campaignName}</h1>
                            <p style="margin: 10px 0 0; font-size: 16px;">Exclusive offer just for you!</p>
                          </div>
                          <div style="padding: 30px 20px;">
                            <h2 style="color: #333; margin-bottom: 20px;">Don't miss out on this amazing deal!</h2>
                            <div style="background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0;">
                              <h3 style="color: #667eea; margin: 0 0 10px;">🎉 Special Offer</h3>
                              <p style="font-size: 18px; font-weight: bold; color: #333; margin: 0;">
                                Get ${
                                  selectedCampaignForMail.offer.type ===
                                  "PERCENT"
                                    ? `${selectedCampaignForMail.offer.value}% discount`
                                    : selectedCampaignForMail.offer.type ===
                                        "AMOUNT"
                                      ? `₹${selectedCampaignForMail.offer.value} off`
                                      : `special price of ₹${selectedCampaignForMail.offer.specialPrice}`
                                } on ${
                                  [
                                    ...(selectedCampaignForMail.products
                                      .ancillaries || []),
                                    ...(selectedCampaignForMail.products
                                      .bundles || []),
                                  ].length > 0
                                    ? [
                                        ...(selectedCampaignForMail.products
                                          .ancillaries || []),
                                        ...(selectedCampaignForMail.products
                                          .bundles || []),
                                      ].join(", ")
                                    : "our premium travel services"
                                }
                              </p>
                            </div>
                            <p style="color: #666; line-height: 1.6;">
                              We're excited to offer you this exclusive deal on our premium travel services. 
                              This limited-time offer is specially curated for valued customers like you.
                            </p>
                            <div style="text-align: center; margin: 30px 0;">
                              <a href="#" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                                Claim Your Offer Now →
                              </a>
                            </div>
                            <p style="color: #888; font-size: 14px; margin-top: 30px;">
                              Valid from ${selectedCampaignForMail.lifecycle.startDate} to ${selectedCampaignForMail.lifecycle.endDate}. Terms and conditions apply.
                            </p>
                          </div>
                          <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 14px;">
                            <p>Best regards,<br>The OfferSense Team</p>
                          </div>
                        </div>
                      `,
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <AntForm.Item
                label="Mail ID (Recipient Email Address)"
                className="mb-0"
                required
              >
                <Input
                  placeholder="Enter recipient email address"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  type="email"
                  size="large"
                  prefix={<Mail className="w-4 h-4 text-gray-400" />}
                />
              </AntForm.Item>
              <div className="text-xs text-gray-500 mt-1">
                The campaign email template will be sent to this email address
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* WhatsApp Template Preview Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-green-600" />
            <span>WhatsApp Template Preview & Selection</span>
          </div>
        }
        open={whatsappPreviewVisible}
        onCancel={() => setWhatsappPreviewVisible(false)}
        footer={[
          <AntButton
            key="cancel"
            onClick={() => setWhatsappPreviewVisible(false)}
          >
            Cancel
          </AntButton>,
          <AntButton
            key="regenerate"
            icon={<Smartphone className="w-4 h-4" />}
            onClick={() => handleGenerateTemplate("whatsapp")}
            loading={templateGenerationState.whatsapp.loading}
          >
            Generate New Templates
          </AntButton>,
        ]}
        width={700}
        className="whatsapp-template-modal"
      >
        {templateGenerationState.whatsapp.templates.length === 0 ? (
          <div className="text-center py-12">
            <Smartphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No WhatsApp Templates Generated
            </h3>
            <p className="text-gray-500 mb-4">
              Generate AI-powered WhatsApp templates optimized for mobile
              engagement
            </p>
            <AntButton
              type="primary"
              size="large"
              icon={<Smartphone className="w-4 h-4" />}
              onClick={() => handleGenerateTemplate("whatsapp")}
              loading={templateGenerationState.whatsapp.loading}
            >
              Generate WhatsApp Templates
            </AntButton>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {templateGenerationState.whatsapp.templates.length} templates
                available
              </span>
            </div>

            <ShadcnTabs defaultValue="0" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {templateGenerationState.whatsapp.templates.map(
                  (template, index) => (
                    <TabsTrigger
                      key={index}
                      value={index.toString()}
                      className="flex items-center space-x-2"
                    >
                      <span>Template {index + 1}</span>
                      {selectedWhatsappTemplate?.message ===
                        template.message && (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      )}
                    </TabsTrigger>
                  ),
                )}
              </TabsList>

              {templateGenerationState.whatsapp.templates.map(
                (template, index) => (
                  <TabsContent
                    key={index}
                    value={index.toString()}
                    className="mt-6"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-lg mb-2">
                            {template.name}
                          </h4>
                          <div className="flex items-center space-x-2 mb-3">
                            <Badge
                              variant="outline"
                              className="text-green-600 border-green-600"
                            >
                              {template.style}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-purple-600 border-purple-600"
                            >
                              {template.estimatedDeliveryRate} delivery
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-orange-600 border-orange-600"
                            >
                              {template.estimatedReadRate} read rate
                            </Badge>
                          </div>
                        </div>
                        <AntButton
                          type={
                            selectedWhatsappTemplate?.message ===
                            template.message
                              ? "default"
                              : "primary"
                          }
                          size="large"
                          onClick={() => handleSelectWhatsappTemplate(template)}
                          icon={
                            selectedWhatsappTemplate?.message ===
                            template.message ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : null
                          }
                        >
                          {selectedWhatsappTemplate?.message ===
                          template.message
                            ? "Selected"
                            : "Select This Template"}
                        </AntButton>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <strong className="text-sm text-gray-600">
                            Message Length:
                          </strong>
                          <div
                            className={`mt-2 p-3 bg-gray-50 rounded-lg text-sm ${template.message.length > 160 ? "border-l-4 border-orange-500" : "border-l-4 border-green-500"}`}
                          >
                            {template.message.length} characters
                            {template.message.length > 160 && (
                              <div className="text-orange-600 mt-1">
                                (May be split into multiple messages)
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <strong className="text-sm text-gray-600">
                            Template Details:
                          </strong>
                          <div className="mt-2 text-sm text-gray-700 space-y-2">
                            <div>
                              Style:{" "}
                              <span className="font-medium capitalize">
                                {template.style}
                              </span>
                            </div>
                            <div>
                              Delivery Rate:{" "}
                              <span className="font-medium">
                                {template.estimatedDeliveryRate}
                              </span>
                            </div>
                            <div>
                              Read Rate:{" "}
                              <span className="font-medium">
                                {template.estimatedReadRate}
                              </span>
                            </div>
                            <div>
                              Variables:{" "}
                              <span className="font-medium">
                                {template.variables?.length || 0} dynamic fields
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-xs text-gray-500">
                              Mobile Optimized
                            </div>
                            <div className="font-medium text-green-600">
                              Yes
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">
                              Character Limit
                            </div>
                            <div
                              className={`font-medium ${template.message.length > 160 ? "text-orange-600" : "text-green-600"}`}
                            >
                              {template.message.length <= 160
                                ? "Within Limit"
                                : "Over Limit"}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">
                              Engagement Score
                            </div>
                            <div className="font-medium text-green-600">
                              High
                            </div>
                          </div>
                        </div>
                      </div>

                      {template.variables && template.variables.length > 0 && (
                        <div>
                          <strong className="text-sm text-gray-600">
                            Dynamic Variables:
                          </strong>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {template.variables.map(
                              (variable: string, i: number) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="text-blue-600 border-blue-600"
                                >
                                  {variable}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <strong className="text-sm text-gray-600">
                            WhatsApp Preview:
                          </strong>
                          <div className="flex space-x-2">
                            <AntButton
                              size="small"
                              ghost
                              icon={<Eye className="w-3 h-3" />}
                            >
                              Full Preview
                            </AntButton>
                            <AntButton
                              size="small"
                              ghost
                              icon={<Send className="w-3 h-3" />}
                            >
                              Test Send
                            </AntButton>
                          </div>
                        </div>
                        {/* Mobile WhatsApp Preview */}
                        <div className="flex justify-center">
                          <div className="bg-gray-100 p-4 rounded-lg max-w-sm w-full">
                            <div className="bg-white rounded-lg shadow-sm">
                              {/* WhatsApp Header */}
                              <div className="bg-green-600 text-white p-2 rounded-t-lg flex items-center space-x-2">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-bold">OS</span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium">
                                    OfferSense
                                  </div>
                                  <div className="text-xs opacity-90">
                                    Online
                                  </div>
                                </div>
                              </div>

                              {/* Message Bubble */}
                              <div className="p-3">
                                <div className="bg-green-100 p-3 rounded-lg max-w-full">
                                  <div className="text-sm whitespace-pre-wrap text-gray-800">
                                    {template.message}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-2 text-right">
                                    {new Date().toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}{" "}
                                    ✓✓
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                ),
              )}
            </ShadcnTabs>
          </div>
        )}
      </Modal>
    </div>
  );
}
