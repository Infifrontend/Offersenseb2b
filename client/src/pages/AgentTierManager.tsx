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
  InputNumber,
  message,
  Tabs,
  Tag,
  Tooltip,
  Row,
  Col,
  Switch,
  Popconfirm,
  Progress,
  Statistic,
  Timeline,
  Badge,
  Alert,
  Descriptions,
  DatePicker,
} from "antd";
import {
  TrophyOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  DownloadOutlined,
  ReloadOutlined,
  CrownOutlined,
  UserOutlined,
  SettingOutlined,
  CalendarOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Trophy, Crown, Award, Medal } from "lucide-react";
import dayjs from "dayjs";
import { z } from "zod";

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

// Form validation schemas
const tierFormSchema = z.object({
  tierCode: z.enum(["PLATINUM", "GOLD", "SILVER", "BRONZE"]),
  displayName: z.string().min(1, "Display name is required"),
  kpiWindow: z.enum(["MONTHLY", "QUARTERLY"]),
  kpiThresholds: z.object({
    totalBookingValueMin: z.number().min(0),
    totalBookingsMin: z.number().min(0),
    avgBookingsPerMonthMin: z.number().min(0),
    avgSearchesPerMonthMin: z.number().min(0),
    conversionPctMin: z.number().min(0).max(100),
  }),
  defaultPricingPolicy: z
    .object({
      type: z.enum(["PERCENT", "AMOUNT"]),
      value: z.number(),
    })
    .optional(),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  createdBy: z.string().default("current-user"),
});

const engineFormSchema = z.object({
  engineCode: z.string().min(1, "Engine code is required"),
  schedule: z.string().min(1, "Schedule is required"),
  reassignmentMode: z.enum(["AUTO", "REVIEW"]),
  overrideAllowed: z.enum(["true", "false"]).default("true"),
  createdBy: z.string().default("current-user"),
});

const overrideFormSchema = z.object({
  agentId: z.string().min(1, "Agent ID is required"),
  tierCode: z.enum(["PLATINUM", "GOLD", "SILVER", "BRONZE"]),
  effectiveFrom: z.string(),
  justification: z
    .string()
    .min(10, "Justification must be at least 10 characters"),
  assignedBy: z.string().default("current-user"),
});

// Types
interface AgentTier {
  id: string;
  tierCode: string;
  displayName: string;
  kpiWindow: string;
  kpiThresholds: {
    totalBookingValueMin: number;
    totalBookingsMin: number;
    avgBookingsPerMonthMin: number;
    avgSearchesPerMonthMin: number;
    conversionPctMin: number;
  };
  defaultPricingPolicy?: {
    type: string;
    value: number;
  };
  description?: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface TierAssignment {
  id: string;
  agentId: string;
  tierCode: string;
  assignmentType: string;
  effectiveFrom: string;
  effectiveTo?: string;
  kpiData?: any;
  assignedBy: string;
  justification?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface AssignmentEngine {
  id: string;
  engineCode: string;
  schedule: string;
  reassignmentMode: string;
  overrideAllowed: string;
  lastRunAt?: string;
  nextRunAt?: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

type TierFormData = z.infer<typeof tierFormSchema>;
type EngineFormData = z.infer<typeof engineFormSchema>;
type OverrideFormData = z.infer<typeof overrideFormSchema>;

// Constants
const tierCodes = ["PLATINUM", "GOLD", "SILVER", "BRONZE"];
const kpiWindows = ["MONTHLY", "QUARTERLY"];
const reassignmentModes = ["AUTO", "REVIEW"];

const getTierIcon = (tierCode: string) => {
  switch (tierCode) {
    case "PLATINUM":
      return <Crown className="w-4 h-4" style={{ color: "#722ed1" }} />;
    case "GOLD":
      return <Trophy className="w-4 h-4" style={{ color: "#faad14" }} />;
    case "SILVER":
      return <Award className="w-4 h-4" style={{ color: "#8c8c8c" }} />;
    case "BRONZE":
      return <Medal className="w-4 h-4" style={{ color: "#d4380d" }} />;
    default:
      return <UserOutlined style={{ color: "#1890ff" }} />;
  }
};

const getTierColor = (tierCode: string) => {
  switch (tierCode) {
    case "PLATINUM":
      return "#722ed1";
    case "GOLD":
      return "#faad14";
    case "SILVER":
      return "#8c8c8c";
    case "BRONZE":
      return "#d4380d";
    default:
      return "#1890ff";
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

export default function AgentTierManager() {
  // State management
  const [activeTab, setActiveTab] = useState("tiers");
  const [isTierModalVisible, setIsTierModalVisible] = useState(false);
  const [isEngineModalVisible, setIsEngineModalVisible] = useState(false);
  const [isOverrideModalVisible, setIsOverrideModalVisible] = useState(false);
  const [isAssignmentModalVisible, setIsAssignmentModalVisible] =
    useState(false);
  const [isEvaluationModalVisible, setIsEvaluationModalVisible] =
    useState(false);
  const [editingTier, setEditingTier] = useState<AgentTier | null>(null);
  const [editingEngine, setEditingEngine] = useState<AssignmentEngine | null>(
    null,
  );
  const [selectedTier, setSelectedTier] = useState<AgentTier | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  const queryClient = useQueryClient();
  const [tierForm] = AntForm.useForm<TierFormData>();
  const [engineForm] = AntForm.useForm<EngineFormData>();
  const [overrideForm] = AntForm.useForm<OverrideFormData>();
  const [assignmentForm] = AntForm.useForm();
  const [evaluationForm] = AntForm.useForm();

  // Data fetching
  const {
    data: tiers = [],
    isLoading: tiersLoading,
    refetch: refetchTiers,
  } = useQuery({
    queryKey: ["/api/tiers"],
    queryFn: async () => {
      const response = await fetch("/api/tiers");
      if (!response.ok) throw new Error("Failed to fetch tiers");
      return response.json();
    },
  });

  const {
    data: assignments = [],
    isLoading: assignmentsLoading,
    error: assignmentsError,
    refetch: refetchAssignments,
  } = useQuery({
    queryKey: ["/api/tiers/assignments"],
    queryFn: async () => {
      console.log("Fetching tier assignments from API...");
      const response = await fetch("/api/tiers/assignments");
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch assignments:", errorText);
        throw new Error(
          `Failed to fetch assignments: ${response.status} ${response.statusText}`,
        );
      }
      const data = await response.json();
      console.log("Received tier assignments data:", data);
      return Array.isArray(data) ? data : [];
    },
    retry: 3,
    retryDelay: 1000,
  });

  const {
    data: engines = [],
    isLoading: enginesLoading,
    refetch: refetchEngines,
  } = useQuery({
    queryKey: ["/api/tiers/engines"],
    queryFn: async () => {
      const response = await fetch("/api/tiers/engines");
      if (!response.ok) throw new Error("Failed to fetch engines");
      return response.json();
    },
  });

  // Mutations
  const createTierMutation = useMutation({
    mutationFn: async (data: TierFormData) => {
      const response = await fetch("/api/tiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create tier");
      }
      return response.json();
    },
    onSuccess: () => {
      message.success("Tier created successfully");
      setIsTierModalVisible(false);
      tierForm.resetFields();
      refetchTiers();
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });

  const updateTierMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TierFormData }) => {
      const response = await fetch(`/api/tiers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update tier");
      }
      return response.json();
    },
    onSuccess: () => {
      message.success("Tier updated successfully");
      setIsTierModalVisible(false);
      setEditingTier(null);
      tierForm.resetFields();
      refetchTiers();
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });

  const deleteTierMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/tiers/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete tier");
    },
    onSuccess: () => {
      message.success("Tier deleted successfully");
      refetchTiers();
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });

  const createEngineMutation = useMutation({
    mutationFn: async (data: EngineFormData) => {
      const response = await fetch("/api/tiers/engines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create engine");
      return response.json();
    },
    onSuccess: () => {
      message.success("Assignment engine created successfully");
      setIsEngineModalVisible(false);
      engineForm.resetFields();
      refetchEngines();
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });

  const overrideTierMutation = useMutation({
    mutationFn: async (data: OverrideFormData) => {
      const response = await fetch("/api/tiers/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to override tier");
      return response.json();
    },
    onSuccess: () => {
      message.success("Tier override applied successfully");
      setIsOverrideModalVisible(false);
      overrideForm.resetFields();
      refetchAssignments();
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });

  const bulkAssignMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/tiers/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to assign tiers");
      return response.json();
    },
    onSuccess: (result) => {
      message.success(
        `Successfully processed ${result.assignments} tier assignments`,
      );
      setIsAssignmentModalVisible(false);
      assignmentForm.resetFields();
      refetchAssignments();
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });

  const evaluateTierMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/tiers/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to evaluate tier");
      return response.json();
    },
    onSuccess: (result) => {
      setEvaluationResult(result);
      message.success("Tier evaluation completed");
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });

  // Event handlers
  const handleTierSubmit = async (values: any) => {
    try {
      const validatedData = tierFormSchema.parse(values);
      if (editingTier) {
        updateTierMutation.mutate({ id: editingTier.id, data: validatedData });
      } else {
        createTierMutation.mutate(validatedData);
      }
    } catch (error: any) {
      message.error("Validation failed");
    }
  };

  const handleEngineSubmit = async (values: any) => {
    try {
      const validatedData = engineFormSchema.parse(values);
      if (editingEngine) {
        // Update engine logic here
      } else {
        createEngineMutation.mutate(validatedData);
      }
    } catch (error: any) {
      message.error("Validation failed");
    }
  };

  const handleOverrideSubmit = async (values: any) => {
    try {
      const validatedData = overrideFormSchema.parse({
        ...values,
        effectiveFrom: values.effectiveFrom.format("YYYY-MM-DD"),
      });
      overrideTierMutation.mutate(validatedData);
    } catch (error: any) {
      message.error("Validation failed");
    }
  };

  const handleBulkAssignment = async (values: any) => {
    try {
      const agentIds = values.agentIds
        .split("\n")
        .map((id: string) => id.trim())
        .filter(Boolean);
      bulkAssignMutation.mutate({
        agentIds,
        effectiveFrom: values.effectiveFrom.format("YYYY-MM-DD"),
        assignedBy: "current-user",
      });
    } catch (error: any) {
      message.error("Validation failed");
    }
  };

  const handleTierEvaluation = async (values: any) => {
    evaluateTierMutation.mutate(values);
  };

  const handleEditTier = (tier: AgentTier) => {
    setEditingTier(tier);
    tierForm.setFieldsValue({
      ...tier,
      kpiThresholds: tier.kpiThresholds,
      defaultPricingPolicy: tier.defaultPricingPolicy,
    });
    setIsTierModalVisible(true);
  };

  const handleViewTier = (tier: AgentTier) => {
    setSelectedTier(tier);
  };

  // Table columns
  const tierColumns = [
    {
      title: "Tier",
      dataIndex: "tierCode",
      key: "tierCode",
      render: (tierCode: string, record: AgentTier) => (
        <Space>
          {getTierIcon(tierCode)}
          <Tag color={getTierColor(tierCode)}>{record.displayName}</Tag>
        </Space>
      ),
    },
    {
      title: "KPI Window",
      dataIndex: "kpiWindow",
      key: "kpiWindow",
      render: (window: string) => (
        <Tag color={window === "MONTHLY" ? "blue" : "purple"}>{window}</Tag>
      ),
    },
    {
      title: "Min Booking Value",
      key: "minBookingValue",
      render: (record: AgentTier) =>
        formatCurrency(record.kpiThresholds.totalBookingValueMin),
    },
    {
      title: "Min Bookings",
      key: "minBookings",
      render: (record: AgentTier) =>
        record.kpiThresholds.totalBookingsMin.toLocaleString(),
    },
    {
      title: "Min Conversion %",
      key: "minConversion",
      render: (record: AgentTier) =>
        `${record.kpiThresholds.conversionPctMin}%`,
    },
    {
      title: "Default Policy",
      key: "defaultPolicy",
      render: (record: AgentTier) => {
        if (!record.defaultPricingPolicy) return "-";
        const { type, value } = record.defaultPricingPolicy;
        return (
          <Tag color={value < 0 ? "green" : value > 0 ? "red" : "blue"}>
            {value > 0 ? "+" : ""}
            {value}
            {type === "PERCENT" ? "%" : " INR"}
          </Tag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Badge
          status={status === "ACTIVE" ? "success" : "default"}
          text={status}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: AgentTier) => (
        <Space>
          <Tooltip title="View Details">
            <AntButton
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewTier(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Tier">
            <AntButton
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditTier(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this tier?"
            onConfirm={() => deleteTierMutation.mutate(record.id)}
          >
            <Tooltip title="Delete Tier">
              <AntButton icon={<DeleteOutlined />} size="small" danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const assignmentColumns = [
    {
      title: "Agent ID",
      dataIndex: "agentId",
      key: "agentId",
    },
    {
      title: "Tier",
      dataIndex: "tierCode",
      key: "tierCode",
      render: (tierCode: string) => (
        <Space>
          {getTierIcon(tierCode)}
          <Tag color={getTierColor(tierCode)}>{tierCode}</Tag>
        </Space>
      ),
    },
    {
      title: "Assignment Type",
      dataIndex: "assignmentType",
      key: "assignmentType",
      render: (type: string) => (
        <Tag color={type === "AUTO" ? "blue" : "orange"}>
          {type === "AUTO" ? "Automatic" : "Manual Override"}
        </Tag>
      ),
    },
    {
      title: "Effective From",
      dataIndex: "effectiveFrom",
      key: "effectiveFrom",
      render: (date: string) => dayjs(date).format("MMM DD, YYYY"),
    },
    {
      title: "Effective To",
      dataIndex: "effectiveTo",
      key: "effectiveTo",
      render: (date?: string) =>
        date ? dayjs(date).format("MMM DD, YYYY") : "Current",
    },
    {
      title: "Assigned By",
      dataIndex: "assignedBy",
      key: "assignedBy",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "12%",
      render: (status: string) => {
        const isActive = status === "ACTIVE";
        return (
          <Tag
            color={isActive ? "green" : "orange"}
            style={{
              fontWeight: 500,
              textAlign: "center",
              minWidth: "80px",
              display: "inline-block",
            }}
          >
            {status === "ACTIVE" ? "Active" : "Superseded"}
          </Tag>
        );
      },
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("MMM DD, YYYY HH:mm"),
    },
  ];

  const engineColumns = [
    {
      title: "Engine Code",
      dataIndex: "engineCode",
      key: "engineCode",
    },
    {
      title: "Schedule",
      dataIndex: "schedule",
      key: "schedule",
      render: (schedule: string) => (
        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
          {schedule}
        </code>
      ),
    },
    {
      title: "Mode",
      dataIndex: "reassignmentMode",
      key: "reassignmentMode",
      render: (mode: string) => (
        <Tag color={mode === "AUTO" ? "green" : "orange"}>{mode}</Tag>
      ),
    },
    {
      title: "Override Allowed",
      dataIndex: "overrideAllowed",
      key: "overrideAllowed",
      render: (allowed: string) => (
        <Badge
          status={allowed === "true" ? "success" : "error"}
          text={allowed === "true" ? "Yes" : "No"}
        />
      ),
    },
    {
      title: "Last Run",
      dataIndex: "lastRunAt",
      key: "lastRunAt",
      render: (date?: string) =>
        date ? dayjs(date).format("MMM DD, HH:mm") : "Never",
    },
    {
      title: "Next Run",
      dataIndex: "nextRunAt",
      key: "nextRunAt",
      render: (date?: string) =>
        date ? dayjs(date).format("MMM DD, HH:mm") : "Not Scheduled",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Badge
          status={status === "ACTIVE" ? "success" : "default"}
          text={status}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: AssignmentEngine) => (
        <Space>
          <Tooltip title="Edit Engine">
            <AntButton
              icon={<EditOutlined />}
              size="small"
              onClick={() => {
                setEditingEngine(record);
                engineForm.setFieldsValue(record);
                setIsEngineModalVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this engine?"
            onConfirm={() => {
              fetch(`/api/tiers/engines/${record.id}`, {
                method: "DELETE",
              }).then(() => {
                message.success("Engine deleted successfully");
                refetchEngines();
              });
            }}
          >
            <Tooltip title="Delete Engine">
              <AntButton icon={<DeleteOutlined />} size="small" danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Statistics
  const tierStats = tiers.reduce((acc: any, tier: AgentTier) => {
    acc[tier.tierCode] = (acc[tier.tierCode] || 0) + 1;
    return acc;
  }, {});

  const activeAssignments = assignments.filter(
    (a: TierAssignment) => a.status === "ACTIVE",
  );
  const assignmentStats = activeAssignments.reduce(
    (acc: any, assignment: TierAssignment) => {
      acc[assignment.tierCode] = (acc[assignment.tierCode] || 0) + 1;
      return acc;
    },
    {},
  );

  if (tiersLoading && assignmentsLoading && enginesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="text-lg font-medium text-gray-600">
            Loading agent tier data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Agent Tier Manager
          </h1>
          <p className="text-sm text-gray-600">
            Define agent tiers with eligibility rules based on KPIs and manage
            automatic tier assignments.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16}>
        <Col span={6}>
          <AntCard>
            <Statistic
              title="Total Tiers"
              value={tiers.length}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </AntCard>
        </Col>
        <Col span={6}>
          <AntCard>
            <Statistic
              title="Active Assignments"
              value={activeAssignments.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </AntCard>
        </Col>
        <Col span={6}>
          <AntCard>
            <Statistic
              title="Assignment Engines"
              value={engines.length}
              prefix={<SettingOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </AntCard>
        </Col>
        <Col span={6}>
          <AntCard>
            <Statistic
              title="Manual Overrides"
              value={
                assignments.filter(
                  (a: TierAssignment) => a.assignmentType === "MANUAL_OVERRIDE",
                ).length
              }
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </AntCard>
        </Col>
      </Row>

      {/* Main Content */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="bg-white p-4 rounded-lg"
        items={[
          {
            key: "tiers",
            label: "Tier Definitions",
            children: (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Agent Tier Definitions
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Define tier criteria and KPI thresholds for automatic
                      agent classification.
                    </p>
                  </div>
                  <AntButton
                    className="bg-primary text-white"
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingTier(null);
                      tierForm.resetFields();
                      setIsTierModalVisible(true);
                    }}
                  >
                    Add Tier
                  </AntButton>
                </div>

                <Table
                  columns={tierColumns}
                  dataSource={tiers}
                  loading={tiersLoading}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  size="middle"
                />
              </div>
            ),
          },
          {
            key: "assignments",
            label: "Tier Assignments",
            children: (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">Tier Assignments</h3>
                    <p className="text-sm text-muted-foreground">
                      View and manage current tier assignments for all agents.
                    </p>
                    {/* Debug info - remove in production */}
                    {process.env.NODE_ENV === "development" && (
                      <div className="text-xs text-gray-400 mt-1">
                        Debug: {assignments.length} total assignments,{" "}
                        {activeAssignments.length} active
                        {assignmentsError &&
                          ` | Error: ${assignmentsError.message}`}
                      </div>
                    )}
                  </div>
                  <Space>
                    <AntButton
                      icon={<PlayCircleOutlined />}
                      onClick={() => setIsAssignmentModalVisible(true)}
                    >
                      Bulk Assign
                    </AntButton>
                    <AntButton
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => setIsOverrideModalVisible(true)}
                    >
                      Manual Override
                    </AntButton>
                  </Space>
                </div>

                {/* Assignment Statistics */}
                <Row gutter={16} className="mb-4">
                  {tierCodes.map((tierCode) => (
                    <Col span={6} key={tierCode}>
                      <AntCard size="small">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getTierIcon(tierCode)}
                            <span className="font-medium">{tierCode}</span>
                          </div>
                          <Badge
                            count={assignmentStats[tierCode] || 0}
                            style={{ backgroundColor: getTierColor(tierCode) }}
                          />
                        </div>
                      </AntCard>
                    </Col>
                  ))}
                </Row>

                <Table
                  columns={assignmentColumns}
                  dataSource={assignments}
                  loading={assignmentsLoading}
                  rowKey="id"
                  pagination={{ pageSize: 15 }}
                  scroll={{ y: 400 }}
                  size="middle"
                />
              </div>
            ),
          },
          {
            key: "engines",
            label: "Assignment Engine",
            children: (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Tier Assignment Engines
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Configure automated tier assignment schedules and
                      policies.
                    </p>
                  </div>
                  <AntButton
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingEngine(null);
                      engineForm.resetFields();
                      setIsEngineModalVisible(true);
                    }}
                  >
                    Add Engine
                  </AntButton>
                </div>

                <Table
                  columns={engineColumns}
                  dataSource={engines}
                  loading={enginesLoading}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  scroll={{ y: 400 }}
                  size="middle"
                />
              </div>
            ),
          },
          {
            key: "evaluation",
            label: "Tier Evaluation",
            children: (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Agent Tier Evaluation
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Evaluate individual agents against tier criteria and preview
                    tier recommendations.
                  </p>
                </div>

                <AntCard>
                  <AntForm
                    form={evaluationForm}
                    layout="inline"
                    onFinish={handleTierEvaluation}
                    className="mb-4"
                  >
                    <AntForm.Item
                      name="agentId"
                      rules={[
                        { required: true, message: "Agent ID is required" },
                      ]}
                    >
                      <Input
                        placeholder="Enter Agent ID"
                        style={{ width: 200 }}
                      />
                    </AntForm.Item>
                    <AntForm.Item
                      name="window"
                      rules={[
                        { required: true, message: "KPI window is required" },
                      ]}
                    >
                      <AntSelect
                        placeholder="Select KPI Window"
                        style={{ width: 150 }}
                      >
                        <AntSelect.Option value="MONTHLY">
                          Monthly
                        </AntSelect.Option>
                        <AntSelect.Option value="QUARTERLY">
                          Quarterly
                        </AntSelect.Option>
                      </AntSelect>
                    </AntForm.Item>
                    <AntForm.Item>
                      <AntButton
                        type="primary"
                        htmlType="submit"
                        loading={evaluateTierMutation.isPending}
                        icon={<BarChartOutlined />}
                      >
                        Evaluate
                      </AntButton>
                    </AntForm.Item>
                  </AntForm>

                  {evaluationResult && (
                    <div className="space-y-4">
                      <Alert
                        message={
                          evaluationResult.tierChangeRequired
                            ? "Tier Change Recommended"
                            : "No Tier Change Needed"
                        }
                        description={
                          evaluationResult.tierChangeRequired
                            ? `Agent should be upgraded/downgraded from ${evaluationResult.currentTier || "No Tier"} to ${evaluationResult.recommendedTier}`
                            : `Agent remains in ${evaluationResult.currentTier} tier`
                        }
                        type={
                          evaluationResult.tierChangeRequired
                            ? "warning"
                            : "success"
                        }
                        showIcon
                      />

                      <Row gutter={16}>
                        <Col span={12}>
                          <AntCard title="Current KPI Performance" size="small">
                            <Descriptions column={1} size="small">
                              <Descriptions.Item label="Booking Value">
                                {formatCurrency(
                                  evaluationResult.kpiData.totalBookingValue,
                                )}
                              </Descriptions.Item>
                              <Descriptions.Item label="Total Bookings">
                                {evaluationResult.kpiData.totalBookings.toLocaleString()}
                              </Descriptions.Item>
                              <Descriptions.Item label="Avg Bookings/Month">
                                {evaluationResult.kpiData.avgBookingsPerMonth.toLocaleString()}
                              </Descriptions.Item>
                              <Descriptions.Item label="Avg Searches/Month">
                                {evaluationResult.kpiData.avgSearchesPerMonth.toLocaleString()}
                              </Descriptions.Item>
                              <Descriptions.Item label="Conversion Rate">
                                {evaluationResult.kpiData.conversionPct}%
                              </Descriptions.Item>
                            </Descriptions>
                          </AntCard>
                        </Col>
                        <Col span={12}>
                          <AntCard title="Tier Recommendation" size="small">
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className="text-sm text-gray-500 mb-1">
                                  Current
                                </div>
                                <div className="flex items-center gap-2">
                                  {evaluationResult.currentTier
                                    ? getTierIcon(evaluationResult.currentTier)
                                    : "-"}
                                  <Tag
                                    color={
                                      evaluationResult.currentTier
                                        ? getTierColor(
                                            evaluationResult.currentTier,
                                          )
                                        : "default"
                                    }
                                  >
                                    {evaluationResult.currentTier || "No Tier"}
                                  </Tag>
                                </div>
                              </div>
                              <div>→</div>
                              <div className="text-center">
                                <div className="text-sm text-gray-500 mb-1">
                                  Recommended
                                </div>
                                <div className="flex items-center gap-2">
                                  {getTierIcon(
                                    evaluationResult.recommendedTier,
                                  )}
                                  <Tag
                                    color={getTierColor(
                                      evaluationResult.recommendedTier,
                                    )}
                                  >
                                    {evaluationResult.recommendedTier}
                                  </Tag>
                                </div>
                              </div>
                            </div>
                          </AntCard>
                        </Col>
                      </Row>
                    </div>
                  )}
                </AntCard>
              </div>
            ),
          },
        ]}
      />

      {/* Tier Modal */}
      <Modal
        title={editingTier ? "Edit Agent Tier" : "Create New Agent Tier"}
        open={isTierModalVisible}
        onCancel={() => {
          setIsTierModalVisible(false);
          setEditingTier(null);
          tierForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <AntForm
          form={tierForm}
          layout="vertical"
          onFinish={handleTierSubmit}
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                name="tierCode"
                label="Tier Code"
                rules={[{ required: true, message: "Tier code is required" }]}
              >
                <AntSelect placeholder="Select tier code">
                  {tierCodes.map((code) => (
                    <AntSelect.Option key={code} value={code}>
                      <div className="flex items-center gap-2">
                        {getTierIcon(code)}
                        {code}
                      </div>
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                name="displayName"
                label="Display Name"
                rules={[
                  { required: true, message: "Display name is required" },
                ]}
              >
                <Input placeholder="e.g., Platinum Elite" />
              </AntForm.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                name="kpiWindow"
                label="KPI Window"
                rules={[{ required: true, message: "KPI window is required" }]}
              >
                <AntSelect placeholder="Select evaluation window">
                  {kpiWindows.map((window) => (
                    <AntSelect.Option key={window} value={window}>
                      {window}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Status is required" }]}
              >
                <AntSelect placeholder="Select status">
                  <AntSelect.Option value="ACTIVE">Active</AntSelect.Option>
                  <AntSelect.Option value="INACTIVE">Inactive</AntSelect.Option>
                </AntSelect>
              </AntForm.Item>
            </Col>
          </Row>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium mb-3">KPI Thresholds</h4>
            <Row gutter={16}>
              <Col span={12}>
                <AntForm.Item
                  name={["kpiThresholds", "totalBookingValueMin"]}
                  label="Min Total Booking Value (₹)"
                  rules={[{ required: true, message: "Required" }]}
                >
                  <InputNumber
                    placeholder="50000000"
                    min={0}
                    formatter={(value) =>
                      `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) =>
                      value!.replace(/[₹\s?|(,*)]/g, "") as any
                    }
                    style={{ width: "100%" }}
                  />
                </AntForm.Item>
              </Col>
              <Col span={12}>
                <AntForm.Item
                  name={["kpiThresholds", "totalBookingsMin"]}
                  label="Min Total Bookings"
                  rules={[{ required: true, message: "Required" }]}
                >
                  <InputNumber
                    placeholder="1500"
                    min={0}
                    style={{ width: "100%" }}
                  />
                </AntForm.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <AntForm.Item
                  name={["kpiThresholds", "avgBookingsPerMonthMin"]}
                  label="Min Avg Bookings/Month"
                  rules={[{ required: true, message: "Required" }]}
                >
                  <InputNumber
                    placeholder="400"
                    min={0}
                    style={{ width: "100%" }}
                  />
                </AntForm.Item>
              </Col>
              <Col span={12}>
                <AntForm.Item
                  name={["kpiThresholds", "avgSearchesPerMonthMin"]}
                  label="Min Avg Searches/Month"
                  rules={[{ required: true, message: "Required" }]}
                >
                  <InputNumber
                    placeholder="5000"
                    min={0}
                    style={{ width: "100%" }}
                  />
                </AntForm.Item>
              </Col>
            </Row>
            <Col span={12}>
              <AntForm.Item
                name={["kpiThresholds", "conversionPctMin"]}
                label="Min Conversion Rate (%)"
                rules={[{ required: true, message: "Required" }]}
              >
                <InputNumber
                  placeholder="8.0"
                  min={0}
                  max={100}
                  step={0.1}
                  style={{ width: "100%" }}
                />
              </AntForm.Item>
            </Col>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium mb-3">Default Pricing Policy</h4>
            <Row gutter={16}>
              <Col span={12}>
                <AntForm.Item
                  name={["defaultPricingPolicy", "type"]}
                  label="Adjustment Type"
                >
                  <AntSelect placeholder="Select type">
                    <AntSelect.Option value="PERCENT">
                      Percentage
                    </AntSelect.Option>
                    <AntSelect.Option value="AMOUNT">Amount</AntSelect.Option>
                  </AntSelect>
                </AntForm.Item>
              </Col>
              <Col span={12}>
                <AntForm.Item
                  name={["defaultPricingPolicy", "value"]}
                  label="Adjustment Value"
                >
                  <InputNumber
                    placeholder="-2 (discount) or +1 (markup)"
                    step={0.1}
                    style={{ width: "100%" }}
                  />
                </AntForm.Item>
              </Col>
            </Row>
          </div>

          <AntForm.Item name="description" label="Description">
            <Input.TextArea
              placeholder="Optional description of this tier..."
              rows={3}
            />
          </AntForm.Item>

          <AntForm.Item name="createdBy" initialValue="current-user" hidden>
            <Input />
          </AntForm.Item>

          <div className="flex justify-end gap-2">
            <AntButton onClick={() => setIsTierModalVisible(false)}>
              Cancel
            </AntButton>
            <AntButton
              type="primary"
              htmlType="submit"
              loading={
                editingTier
                  ? updateTierMutation.isPending
                  : createTierMutation.isPending
              }
            >
              {editingTier ? "Update Tier" : "Create Tier"}
            </AntButton>
          </div>
        </AntForm>
      </Modal>

      {/* Assignment Engine Modal */}
      <Modal
        title={
          editingEngine ? "Edit Assignment Engine" : "Create Assignment Engine"
        }
        open={isEngineModalVisible}
        onCancel={() => {
          setIsEngineModalVisible(false);
          setEditingEngine(null);
          engineForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <AntForm
          form={engineForm}
          layout="vertical"
          onFinish={handleEngineSubmit}
          className="mt-4"
        >
          <AntForm.Item
            name="engineCode"
            label="Engine Code"
            rules={[{ required: true, message: "Engine code is required" }]}
          >
            <Input placeholder="MONTHLY_AUTO_TIER" />
          </AntForm.Item>

          <AntForm.Item
            name="schedule"
            label="Schedule (Cron Expression)"
            rules={[{ required: true, message: "Schedule is required" }]}
          >
            <Input placeholder="0 0 1 * *" />
          </AntForm.Item>

          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                name="reassignmentMode"
                label="Reassignment Mode"
                rules={[{ required: true, message: "Mode is required" }]}
              >
                <AntSelect placeholder="Select mode">
                  {reassignmentModes.map((mode) => (
                    <AntSelect.Option key={mode} value={mode}>
                      {mode}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                name="overrideAllowed"
                label="Override Allowed"
                rules={[
                  { required: true, message: "Override setting is required" },
                ]}
              >
                <AntSelect placeholder="Select option">
                  <AntSelect.Option value="true">Yes</AntSelect.Option>
                  <AntSelect.Option value="false">No</AntSelect.Option>
                </AntSelect>
              </AntForm.Item>
            </Col>
          </Row>

          <AntForm.Item name="createdBy" initialValue="current-user" hidden>
            <Input />
          </AntForm.Item>

          <div className="flex justify-end gap-2">
            <AntButton onClick={() => setIsEngineModalVisible(false)}>
              Cancel
            </AntButton>
            <AntButton
              type="primary"
              htmlType="submit"
              loading={createEngineMutation.isPending}
            >
              {editingEngine ? "Update Engine" : "Create Engine"}
            </AntButton>
          </div>
        </AntForm>
      </Modal>

      {/* Override Modal */}
      <Modal
        title="Manual Tier Override"
        open={isOverrideModalVisible}
        onCancel={() => {
          setIsOverrideModalVisible(false);
          overrideForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <AntForm
          form={overrideForm}
          layout="vertical"
          onFinish={handleOverrideSubmit}
          className="mt-4"
        >
          <Alert
            message="Manual Override"
            description="Manual tier overrides will supersede automatic tier assignments and require justification for audit purposes."
            type="warning"
            showIcon
            className="mb-4"
          />

          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                name="agentId"
                label="Agent ID"
                rules={[{ required: true, message: "Agent ID is required" }]}
              >
                <Input placeholder="Enter Agent ID" />
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                name="tierCode"
                label="New Tier"
                rules={[{ required: true, message: "Tier is required" }]}
              >
                <AntSelect placeholder="Select tier">
                  {tierCodes.map((code) => (
                    <AntSelect.Option key={code} value={code}>
                      <div className="flex items-center gap-2">
                        {getTierIcon(code)}
                        {code}
                      </div>
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
          </Row>

          <AntForm.Item
            name="effectiveFrom"
            label="Effective From"
            rules={[{ required: true, message: "Effective date is required" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
            />
          </AntForm.Item>

          <AntForm.Item
            name="justification"
            label="Justification"
            rules={[
              { required: true, message: "Justification is required" },
              {
                min: 10,
                message: "Justification must be at least 10 characters",
              },
            ]}
          >
            <Input.TextArea
              placeholder="Provide detailed justification for this manual tier override..."
              rows={4}
            />
          </AntForm.Item>

          <AntForm.Item name="assignedBy" initialValue="current-user" hidden>
            <Input />
          </AntForm.Item>

          <div className="flex justify-end gap-2">
            <AntButton onClick={() => setIsOverrideModalVisible(false)}>
              Cancel
            </AntButton>
            <AntButton
              type="primary"
              htmlType="submit"
              loading={overrideTierMutation.isPending}
            >
              Apply Override
            </AntButton>
          </div>
        </AntForm>
      </Modal>

      {/* Bulk Assignment Modal */}
      <Modal
        title="Bulk Tier Assignment"
        open={isAssignmentModalVisible}
        onCancel={() => {
          setIsAssignmentModalVisible(false);
          assignmentForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <AntForm
          form={assignmentForm}
          layout="vertical"
          onFinish={handleBulkAssignment}
          className="mt-4"
        >
          <Alert
            message="Bulk Auto-Assignment"
            description="This will automatically evaluate all specified agents and assign appropriate tiers based on their current KPI performance."
            type="info"
            showIcon
            className="mb-4"
          />

          <AntForm.Item
            name="agentIds"
            label="Agent IDs"
            rules={[
              { required: true, message: "At least one Agent ID is required" },
            ]}
          >
            <Input.TextArea
              placeholder="Enter Agent IDs (one per line)&#10;AGT001&#10;AGT002&#10;AGT003"
              rows={6}
            />
          </AntForm.Item>

          <AntForm.Item
            name="effectiveFrom"
            label="Effective From"
            rules={[{ required: true, message: "Effective date is required" }]}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: "100%" }} />
          </AntForm.Item>

          <div className="flex justify-end gap-2">
            <AntButton onClick={() => setIsAssignmentModalVisible(false)}>
              Cancel
            </AntButton>
            <AntButton
              type="primary"
              htmlType="submit"
              loading={bulkAssignMutation.isPending}
            >
              Process Assignments
            </AntButton>
          </div>
        </AntForm>
      </Modal>

      {/* Tier Details Modal */}
      <Modal
        title="Tier Details"
        open={!!selectedTier}
        onCancel={() => setSelectedTier(null)}
        footer={[
          <AntButton key="close" onClick={() => setSelectedTier(null)}>
            Close
          </AntButton>,
        ]}
        width={700}
      >
        {selectedTier && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {getTierIcon(selectedTier.tierCode)}
              <div>
                <h3 className="text-lg font-semibold">
                  {selectedTier.displayName}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedTier.tierCode} • {selectedTier.kpiWindow} Evaluation
                </p>
              </div>
              <div className="ml-auto">
                <Badge
                  status={
                    selectedTier.status === "ACTIVE" ? "success" : "default"
                  }
                  text={selectedTier.status}
                />
              </div>
            </div>

            <Descriptions
              title="KPI Thresholds"
              column={2}
              bordered
              size="small"
            >
              <Descriptions.Item label="Min Booking Value">
                {formatCurrency(
                  selectedTier.kpiThresholds.totalBookingValueMin,
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Min Total Bookings">
                {selectedTier.kpiThresholds.totalBookingsMin.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Min Bookings/Month">
                {selectedTier.kpiThresholds.avgBookingsPerMonthMin.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Min Searches/Month">
                {selectedTier.kpiThresholds.avgSearchesPerMonthMin.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Min Conversion Rate">
                {selectedTier.kpiThresholds.conversionPctMin}%
              </Descriptions.Item>
              <Descriptions.Item label="Default Policy">
                {selectedTier.defaultPricingPolicy ? (
                  <Tag
                    color={
                      selectedTier.defaultPricingPolicy.value < 0
                        ? "green"
                        : selectedTier.defaultPricingPolicy.value > 0
                          ? "red"
                          : "blue"
                    }
                  >
                    {selectedTier.defaultPricingPolicy.value > 0 ? "+" : ""}
                    {selectedTier.defaultPricingPolicy.value}
                    {selectedTier.defaultPricingPolicy.type === "PERCENT"
                      ? "%"
                      : " INR"}
                  </Tag>
                ) : (
                  "-"
                )}
              </Descriptions.Item>
            </Descriptions>

            {selectedTier.description && (
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-gray-600">
                  {selectedTier.description}
                </p>
              </div>
            )}

            <Descriptions title="Metadata" column={2} size="small">
              <Descriptions.Item label="Created By">
                {selectedTier.createdBy}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {dayjs(selectedTier.createdAt).format("MMM DD, YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Updated At">
                {dayjs(selectedTier.updatedAt).format("MMM DD, YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Active Agents">
                {assignmentStats[selectedTier.tierCode] || 0}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}
