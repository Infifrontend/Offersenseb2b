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
  Badge,
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
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  purchased: number;
  revenueUplift: number;
  attachRate: number;
  roi: number;
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

  // Table columns
  const campaignColumns = [
    {
      title: "Campaign",
      key: "campaign",
      render: (record: Campaign) => (
        <div>
          <div className="font-medium">{record.campaignName}</div>
          <div className="text-sm text-gray-500">{record.campaignCode}</div>
        </div>
      ),
    },
    {
      title: "Target",
      key: "target",
      render: (record: Campaign) => (
        <div className="space-y-1">
          {record.target.agentTiers && record.target.agentTiers.length > 0 && (
            <div className="flex gap-1">
              {record.target.agentTiers.slice(0, 2).map((tier) => (
                <Tag key={tier} size="small">
                  {tier}
                </Tag>
              ))}
              {record.target.agentTiers.length > 2 && (
                <Tag size="small">+{record.target.agentTiers.length - 2}</Tag>
              )}
            </div>
          )}
          {record.target.cohorts && record.target.cohorts.length > 0 && (
            <div className="flex gap-1">
              {record.target.cohorts.slice(0, 2).map((cohort) => (
                <Tag key={cohort} color="blue" size="small">
                  {cohort}
                </Tag>
              ))}
              {record.target.cohorts.length > 2 && (
                <Tag color="blue" size="small">
                  +{record.target.cohorts.length - 2}
                </Tag>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Products",
      key: "products",
      render: (record: Campaign) => (
        <div className="space-y-1">
          {record.products.ancillaries &&
            record.products.ancillaries.length > 0 && (
              <div className="flex gap-1">
                {record.products.ancillaries.slice(0, 2).map((product) => (
                  <Tag key={product} color="green" size="small">
                    {product}
                  </Tag>
                ))}
                {record.products.ancillaries.length > 2 && (
                  <Tag color="green" size="small">
                    +{record.products.ancillaries.length - 2}
                  </Tag>
                )}
              </div>
            )}
          {record.products.bundles && record.products.bundles.length > 0 && (
            <div className="flex gap-1">
              {record.products.bundles.slice(0, 2).map((bundle) => (
                <Tag key={bundle} color="purple" size="small">
                  {bundle}
                </Tag>
              ))}
              {record.products.bundles.length > 2 && (
                <Tag color="purple" size="small">
                  +{record.products.bundles.length - 2}
                </Tag>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Offer",
      key: "offer",
      render: (record: Campaign) => {
        const { offer } = record;
        if (offer.type === "PERCENT") {
          return <Tag color="orange">{offer.value}% Off</Tag>;
        } else if (offer.type === "AMOUNT") {
          return <Tag color="orange">${offer.value} Off</Tag>;
        } else if (offer.type === "SPECIAL_PRICE") {
          return <Tag color="red">Special: ${offer.specialPrice}</Tag>;
        }
        return "-";
      },
    },
    {
      title: "Duration",
      key: "duration",
      render: (record: Campaign) => (
        <div className="text-sm">
          <div>{dayjs(record.lifecycle.startDate).format("MMM DD, YYYY")}</div>
          <div className="text-gray-500">
            to {dayjs(record.lifecycle.endDate).format("MMM DD, YYYY")}
          </div>
        </div>
      ),
    },
    {
      title: "Channels",
      key: "channels",
      render: (record: Campaign) => (
        <div className="flex gap-1">
          {record.comms.portalBanner && (
            <Tag icon={<Globe className="w-3 h-3" />} size="small">
              Portal
            </Tag>
          )}
          {record.comms.emailTemplateId && (
            <Tag icon={<Mail className="w-3 h-3" />} size="small">
              Email
            </Tag>
          )}
          {record.comms.whatsappTemplateId && (
            <Tag icon={<MessageSquare className="w-3 h-3" />} size="small">
              WhatsApp
            </Tag>
          )}
          {record.comms.apiPush && (
            <Tag icon={<Send className="w-3 h-3" />} size="small">
              API
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Badge status={getStatusColor(status) as any} text={status} />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: Campaign) => (
        <Space>
          <Tooltip title="View Performance">
            <AntButton
              icon={<BarChart3 className="w-4 h-4" />}
              size="small"
              onClick={() => handleViewPerformance(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Campaign">
            <AntButton
              icon={<Edit className="w-4 h-4" />}
              size="small"
              onClick={() => handleEditCampaign(record)}
            />
          </Tooltip>
          {record.status === "DRAFT" || record.status === "PAUSED" ? (
            <Tooltip title="Activate Campaign">
              <AntButton
                icon={<Play className="w-4 h-4" />}
                size="small"
                type="primary"
                onClick={() => handleStatusChange(record, "ACTIVE")}
              />
            </Tooltip>
          ) : record.status === "ACTIVE" ? (
            <Tooltip title="Pause Campaign">
              <AntButton
                icon={<Pause className="w-4 h-4" />}
                size="small"
                onClick={() => handleStatusChange(record, "PAUSED")}
              />
            </Tooltip>
          ) : null}
          <Popconfirm
            title="Are you sure you want to delete this campaign?"
            onConfirm={() => deleteCampaignMutation.mutate(record.id)}
          >
            <Tooltip title="Delete Campaign">
              <AntButton
                icon={<Trash2 className="w-4 h-4" />}
                size="small"
                danger
              />
            </Tooltip>
          </Popconfirm>
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

  return (
    <div className="space-y-6">
      {/* Header */}

      {/* Statistics Cards */}
      <Row gutter={16}>
        <Col span={6}>
          <AntCard>
            <Statistic
              title="Total Campaigns"
              value={campaigns.length}
              prefix={<Megaphone className="w-4 h-4" />}
              valueStyle={{ color: "#3f8600" }}
            />
          </AntCard>
        </Col>
        <Col span={6}>
          <AntCard>
            <Statistic
              title="Active Campaigns"
              value={activeCampaigns.length}
              prefix={<Play className="w-4 h-4" />}
              valueStyle={{ color: "#1890ff" }}
            />
          </AntCard>
        </Col>
        <Col span={6}>
          <AntCard>
            <Statistic
              title="Draft Campaigns"
              value={campaignStats.DRAFT || 0}
              prefix={<Edit className="w-4 h-4" />}
              valueStyle={{ color: "#722ed1" }}
            />
          </AntCard>
        </Col>
        <Col span={6}>
          <AntCard>
            <Statistic
              title="Completed Campaigns"
              value={campaignStats.COMPLETED || 0}
              prefix={<CheckCircle className="w-4 h-4" />}
              valueStyle={{ color: "#52c41a" }}
            />
          </AntCard>
        </Col>
      </Row>

      {/* Main Content */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="bg-white p-4 rounded-lg"
      >
        <TabPane tab="Campaign Management" key="campaigns">
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
            />
          </div>
        </TabPane>

        <TabPane tab="Performance Dashboard" key="performance">
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
                          <Badge status="success" text={campaign.status} />
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
                                ? `$${campaign.offer.value} Off`
                                : `$${campaign.offer.specialPrice}`}
                          </Tag>
                        </div>
                      </div>
                    </AntCard>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </TabPane>
      </Tabs>

      {/* Campaign Modal */}
      <Modal
        title={editingCampaign ? "Edit Campaign" : "Create New Campaign"}
        open={isCampaignModalVisible}
        onCancel={() => {
          setIsCampaignModalVisible(false);
          setEditingCampaign(null);
          campaignForm.resetFields();
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
                  options={[
                    {
                      label: "POST_BOOKING_WINDOW",
                      value: "POST_BOOKING_WINDOW",
                    },
                    {
                      label: "FREQUENT_TRAVELERS",
                      value: "FREQUENT_TRAVELERS",
                    },
                    {
                      label: "BUSINESS_TRAVELERS",
                      value: "BUSINESS_TRAVELERS",
                    },
                  ]}
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
                  options={ancillaryProducts.map((product) => ({
                    label: product,
                    value: product,
                  }))}
                />
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
                  options={bundleProducts.map((bundle) => ({
                    label: bundle,
                    value: bundle,
                  }))}
                />
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
                  placeholder="10 (for 10% or $10)"
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
            <Col span={6}>
              <AntForm.Item
                name={["comms", "emailTemplateId"]}
                label="Email Template"
              >
                <Input placeholder="TMP_BAG10" />
              </AntForm.Item>
            </Col>
            <Col span={6}>
              <AntForm.Item
                name={["comms", "whatsappTemplateId"]}
                label="WhatsApp Template"
              >
                <Input placeholder="WA_UPSELL_01" />
              </AntForm.Item>
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
                        value={formatCurrency(
                          campaignMetrics.aggregated.revenueUplift,
                        )}
                        prefix={<DollarSign className="w-4 h-4" />}
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
                          ? `$${selectedCampaign.offer.value} Off`
                          : `$${selectedCampaign.offer.specialPrice}`}
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
    </div>
  );
}
