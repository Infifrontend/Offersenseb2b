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
  DatePicker,
  InputNumber,
  message,
  Tabs,
  Tag,
  Tooltip,
  Row,
  Col,
  Switch,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { z } from "zod";

// Form validation schemas
const agentFormSchema = z.object({
  agentId: z.string().min(1, "Agent ID is required"),
  agencyName: z.string().min(1, "Agency name is required"),
  iataCode: z.string().optional(),
  tier: z.enum(["PLATINUM", "GOLD", "SILVER", "BRONZE"]),
  allowedChannels: z
    .array(z.enum(["API", "PORTAL", "MOBILE"]))
    .min(1, "At least one channel required"),
  commissionProfileId: z.string().optional(),
  pos: z.array(z.string()).min(1, "At least one POS required"),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

const overrideFormSchema = z.object({
  overrideCode: z.string().min(1, "Override code is required"),
  channel: z.enum(["API", "PORTAL", "MOBILE"]),
  pos: z.array(z.string()).min(1, "At least one POS required"),
  productScope: z.enum(["FARE", "ANCILLARY", "BUNDLE"]),
  adjustmentType: z.enum(["PERCENT", "AMOUNT"]),
  adjustmentValue: z.string().min(1, "Adjustment value is required"),
  priority: z.number().min(1, "Priority must be at least 1"),
  validFrom: z.string().min(1, "Valid from date is required"),
  validTo: z.string().min(1, "Valid to date is required"),
});

type AgentFormData = z.infer<typeof agentFormSchema>;
type OverrideFormData = z.infer<typeof overrideFormSchema>;

// Interfaces
interface Agent {
  id: string;
  agentId: string;
  agencyName: string;
  iataCode?: string;
  tier: string;
  allowedChannels: string[];
  commissionProfileId?: string;
  pos: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ChannelOverride {
  id: string;
  overrideCode: string;
  channel: string;
  pos: string[];
  productScope: string;
  adjustmentType: string;
  adjustmentValue: string;
  priority: number;
  status: string;
  validFrom: string;
  validTo: string;
  createdAt: string;
  updatedAt: string;
}

// Constants
const agentTiers = ["PLATINUM", "GOLD", "SILVER", "BRONZE"];
const channels = ["API", "PORTAL", "MOBILE"];
const productScopes = ["FARE", "ANCILLARY", "BUNDLE"];
const adjustmentTypes = ["PERCENT", "AMOUNT"];
const posList = ["IN", "AE", "SA", "KW", "BH", "OM", "QA", "US", "UK", "CA"];

const getTierColor = (tier: string) => {
  switch (tier) {
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

const getChannelIcon = (channel: string) => {
  switch (channel) {
    case "API":
      return "🔗";
    case "PORTAL":
      return "🌐";
    case "MOBILE":
      return "📱";
    default:
      return "📱";
  }
};

export default function AgentChannelManager() {
  const [agentForm] = AntForm.useForm();
  const [overrideForm] = AntForm.useForm();
  const [isAgentModalVisible, setIsAgentModalVisible] = useState(false);
  const [isOverrideModalVisible, setIsOverrideModalVisible] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [editingOverride, setEditingOverride] =
    useState<ChannelOverride | null>(null);
  const [activeTab, setActiveTab] = useState("agents");
  const queryClient = useQueryClient();

  // API calls
  const {
    data: agents = [],
    isLoading: loadingAgents,
    refetch: refetchAgents,
  } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const response = await fetch("/api/agents");
      if (!response.ok) throw new Error("Failed to fetch agents");
      return response.json();
    },
  });

  const {
    data: overrides = [],
    isLoading: loadingOverrides,
    refetch: refetchOverrides,
  } = useQuery({
    queryKey: ["channel-overrides"],
    queryFn: async () => {
      const response = await fetch("/api/channel-overrides");
      if (!response.ok) throw new Error("Failed to fetch channel overrides");
      return response.json();
    },
  });

  // Mutations
  const createAgentMutation = useMutation({
    mutationFn: async (data: AgentFormData) => {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create agent");
      }
      return response.json();
    },
    onSuccess: () => {
      message.success("Agent created successfully");
      setIsAgentModalVisible(false);
      agentForm.resetFields();
      refetchAgents();
    },
    onError: (error: any) => {
      message.error(error.message || "Failed to create agent");
    },
  });

  const updateAgentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AgentFormData }) => {
      const response = await fetch(`/api/agents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update agent");
      return response.json();
    },
    onSuccess: () => {
      message.success("Agent updated successfully");
      setIsAgentModalVisible(false);
      setEditingAgent(null);
      agentForm.resetFields();
      refetchAgents();
    },
    onError: (error: any) => {
      message.error(error.message || "Failed to update agent");
    },
  });

  const deleteAgentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/agents/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete agent");
    },
    onSuccess: () => {
      message.success("Agent deleted successfully");
      refetchAgents();
    },
    onError: (error: any) => {
      message.error(error.message || "Failed to delete agent");
    },
  });

  const createOverrideMutation = useMutation({
    mutationFn: async (data: OverrideFormData) => {
      const response = await fetch("/api/channel-overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create channel override");
      }
      return response.json();
    },
    onSuccess: () => {
      message.success("Channel override created successfully");
      setIsOverrideModalVisible(false);
      overrideForm.resetFields();
      refetchOverrides();
    },
    onError: (error: any) => {
      message.error(error.message || "Failed to create channel override");
    },
  });

  const updateOverrideMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: OverrideFormData;
    }) => {
      const response = await fetch(`/api/channel-overrides/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update channel override");
      return response.json();
    },
    onSuccess: () => {
      message.success("Channel override updated successfully");
      setIsOverrideModalVisible(false);
      setEditingOverride(null);
      overrideForm.resetFields();
      refetchOverrides();
    },
    onError: (error: any) => {
      message.error(error.message || "Failed to update channel override");
    },
  });

  const deleteOverrideMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/channel-overrides/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete channel override");
    },
    onSuccess: () => {
      message.success("Channel override deleted successfully");
      refetchOverrides();
    },
    onError: (error: any) => {
      message.error(error.message || "Failed to delete channel override");
    },
  });

  // Handlers
  const handleCreateAgent = () => {
    setEditingAgent(null);
    agentForm.resetFields();
    setIsAgentModalVisible(true);
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    agentForm.setFieldsValue({
      ...agent,
    });
    setIsAgentModalVisible(true);
  };

  const handleCreateOverride = () => {
    setEditingOverride(null);
    overrideForm.resetFields();
    setIsOverrideModalVisible(true);
  };

  const handleEditOverride = (override: ChannelOverride) => {
    setEditingOverride(override);
    overrideForm.setFieldsValue({
      ...override,
      validFrom: override.validFrom,
      validTo: override.validTo,
    });
    setIsOverrideModalVisible(true);
  };

  const handleAgentSubmit = async (values: any) => {
    try {
      const validatedData = agentFormSchema.parse(values);
      if (editingAgent) {
        await updateAgentMutation.mutateAsync({
          id: editingAgent.id,
          data: validatedData,
        });
      } else {
        await createAgentMutation.mutateAsync(validatedData);
      }
    } catch (error: any) {
      if (error.errors) {
        error.errors.forEach((err: any) => {
          message.error(`${err.path.join(".")}: ${err.message}`);
        });
      }
    }
  };

  const handleOverrideSubmit = async (values: any) => {
    try {
      const validatedData = overrideFormSchema.parse(values);
      if (editingOverride) {
        await updateOverrideMutation.mutateAsync({
          id: editingOverride.id,
          data: validatedData,
        });
      } else {
        await createOverrideMutation.mutateAsync(validatedData);
      }
    } catch (error: any) {
      if (error.errors) {
        error.errors.forEach((err: any) => {
          message.error(`${err.path.join(".")}: ${err.message}`);
        });
      }
    }
  };

  // Agent table columns
  const agentColumns = [
    {
      title: "Agent ID",
      dataIndex: "agentId",
      key: "agentId",
      width: 120,
      render: (text: string) => <span className="font-mono">{text}</span>,
    },
    {
      title: "Agency Name",
      dataIndex: "agencyName",
      key: "agencyName",
      ellipsis: true,
    },
    {
      title: "IATA Code",
      dataIndex: "iataCode",
      key: "iataCode",
      width: 100,
      render: (text: string) => text || "-",
    },
    {
      title: "Tier",
      dataIndex: "tier",
      key: "tier",
      width: 100,
      render: (tier: string) => <Tag color={getTierColor(tier)}>{tier}</Tag>,
    },
    {
      title: "Channels",
      dataIndex: "allowedChannels",
      key: "allowedChannels",
      width: 120,
      render: (channels: string[]) => (
        <Space size={4}>
          {channels.map((channel) => (
            <Tooltip key={channel} title={channel}>
              <span>{getChannelIcon(channel)}</span>
            </Tooltip>
          ))}
        </Space>
      ),
    },
    {
      title: "POS",
      dataIndex: "pos",
      key: "pos",
      width: 120,
      render: (pos: string[]) => (
        <Space size={4} wrap>
          {pos.slice(0, 3).map((p) => (
            <Tag key={p} size="small">
              {p}
            </Tag>
          ))}
          {pos.length > 3 && <Tag size="small">+{pos.length - 3}</Tag>}
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={status === "ACTIVE" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: any, record: Agent) => (
        <Space size="small">
          <Tooltip title="Edit">
            <AntButton
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditAgent(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Agent"
            description="Are you sure you want to delete this agent?"
            onConfirm={() => deleteAgentMutation.mutate(record.id)}
          >
            <Tooltip title="Delete">
              <AntButton type="text" icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Override table columns
  const overrideColumns = [
    {
      title: "Override Code",
      dataIndex: "overrideCode",
      key: "overrideCode",
      width: 140,
      render: (text: string) => <span className="font-mono">{text}</span>,
    },
    {
      title: "Channel",
      dataIndex: "channel",
      key: "channel",
      width: 100,
      render: (channel: string) => (
        <Space>
          <span>{getChannelIcon(channel)}</span>
          <span>{channel}</span>
        </Space>
      ),
    },
    {
      title: "Product Scope",
      dataIndex: "productScope",
      key: "productScope",
      width: 120,
      render: (scope: string) => (
        <Tag
          color={
            scope === "FARE"
              ? "blue"
              : scope === "ANCILLARY"
                ? "orange"
                : "purple"
          }
        >
          {scope}
        </Tag>
      ),
    },
    {
      title: "Adjustment",
      key: "adjustment",
      width: 140,
      render: (record: ChannelOverride) => (
        <span>
          {record.adjustmentType === "PERCENT" ? "%" : "$"}
          {record.adjustmentValue}
        </span>
      ),
    },
    {
      title: "POS",
      dataIndex: "pos",
      key: "pos",
      width: 120,
      render: (pos: string[]) => (
        <Space size={4} wrap>
          {pos.slice(0, 3).map((p) => (
            <Tag key={p} size="small">
              {p}
            </Tag>
          ))}
          {pos.length > 3 && <Tag size="small">+{pos.length - 3}</Tag>}
        </Space>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 80,
      render: (priority: number) => <Tag color="blue">{priority}</Tag>,
    },
    {
      title: "Valid Period",
      key: "validPeriod",
      width: 180,
      render: (record: ChannelOverride) => (
        <div>
          <div className="text-xs text-gray-500">
            {dayjs(record.validFrom).format("MMM DD, YYYY")}
          </div>
          <div className="text-xs text-gray-500">
            {dayjs(record.validTo).format("MMM DD, YYYY")}
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={status === "ACTIVE" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: any, record: ChannelOverride) => (
        <Space size="small">
          <Tooltip title="Edit">
            <AntButton
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditOverride(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Override"
            description="Are you sure you want to delete this override?"
            onConfirm={() => deleteOverrideMutation.mutate(record.id)}
          >
            <Tooltip title="Delete">
              <AntButton type="text" icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "agents",
            label: "👥 Agent Directory",
            children: (
              <AntCard
                title="Agent Directory & Channel Access"
                extra={
                  <AntButton
                    className="bg-primary text-white"
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreateAgent}
                  >
                    Add Agent
                  </AntButton>
                }
              >
                <Table
                  columns={agentColumns}
                  dataSource={agents}
                  rowKey="id"
                  loading={loadingAgents}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} agents`,
                  }}
                  scroll={{ x: 1000 }}
                />
              </AntCard>
            ),
          },
          {
            key: "overrides",
            label: "💰 Channel Overrides",
            children: (
              <AntCard
                title="Channel Pricing Overrides"
                extra={
                  <AntButton
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreateOverride}
                  >
                    Add Override
                  </AntButton>
                }
              >
                <Table
                  columns={overrideColumns}
                  dataSource={overrides}
                  rowKey="id"
                  loading={loadingOverrides}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} overrides`,
                  }}
                  scroll={{ x: 1200 }}
                />
              </AntCard>
            ),
          },
        ]}
      />

      {/* Agent Modal */}
      <Modal
        title={editingAgent ? "Edit Agent" : "Create New Agent"}
        open={isAgentModalVisible}
        onCancel={() => {
          setIsAgentModalVisible(false);
          setEditingAgent(null);
          agentForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <AntForm
          form={agentForm}
          layout="vertical"
          onFinish={handleAgentSubmit}
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                name="agentId"
                label="Agent ID"
                rules={[{ required: true, message: "Agent ID is required" }]}
              >
                <Input placeholder="AGT12345" />
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                name="tier"
                label="Agent Tier"
                rules={[{ required: true, message: "Tier is required" }]}
              >
                <AntSelect placeholder="Select tier">
                  {agentTiers.map((tier) => (
                    <AntSelect.Option key={tier} value={tier}>
                      <Tag color={getTierColor(tier)}>{tier}</Tag>
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
          </Row>

          <AntForm.Item
            name="agencyName"
            label="Agency Name"
            rules={[{ required: true, message: "Agency name is required" }]}
          >
            <Input placeholder="Cleartrip Partner DXB" />
          </AntForm.Item>

          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item name="iataCode" label="IATA Code (Optional)">
                <Input placeholder="1234567" />
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                name="commissionProfileId"
                label="Commission Profile (Optional)"
              >
                <Input placeholder="COMM_GCC_HIGH" />
              </AntForm.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                name="allowedChannels"
                label="Allowed Channels"
                rules={[
                  { required: true, message: "At least one channel required" },
                ]}
              >
                <AntSelect mode="multiple" placeholder="Select channels">
                  {channels.map((channel) => (
                    <AntSelect.Option key={channel} value={channel}>
                      <Space>
                        <span>{getChannelIcon(channel)}</span>
                        <span>{channel}</span>
                      </Space>
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                name="pos"
                label="Point of Sale"
                rules={[
                  { required: true, message: "At least one POS required" },
                ]}
              >
                <AntSelect mode="multiple" placeholder="Select regions">
                  {posList.map((pos) => (
                    <AntSelect.Option key={pos} value={pos}>
                      {pos}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
          </Row>

          <div className="flex justify-end space-x-2">
            <AntButton onClick={() => setIsAgentModalVisible(false)}>
              Cancel
            </AntButton>
            <AntButton
              type="primary"
              htmlType="submit"
              loading={
                createAgentMutation.isPending || updateAgentMutation.isPending
              }
            >
              {editingAgent ? "Update" : "Create"} Agent
            </AntButton>
          </div>
        </AntForm>
      </Modal>

      {/* Channel Override Modal */}
      <Modal
        title={
          editingOverride
            ? "Edit Channel Override"
            : "Create New Channel Override"
        }
        open={isOverrideModalVisible}
        onCancel={() => {
          setIsOverrideModalVisible(false);
          setEditingOverride(null);
          overrideForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <AntForm
          form={overrideForm}
          layout="vertical"
          onFinish={handleOverrideSubmit}
          className="mt-4"
        >
          <AntForm.Item
            name="overrideCode"
            label="Override Code"
            rules={[{ required: true, message: "Override code is required" }]}
          >
            <Input placeholder="OVERRIDE_API_AE_001" />
          </AntForm.Item>

          <Row gutter={16}>
            <Col span={8}>
              <AntForm.Item
                name="channel"
                label="Channel"
                rules={[{ required: true, message: "Channel is required" }]}
              >
                <AntSelect placeholder="Select channel">
                  {channels.map((channel) => (
                    <AntSelect.Option key={channel} value={channel}>
                      <Space>
                        <span>{getChannelIcon(channel)}</span>
                        <span>{channel}</span>
                      </Space>
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
            <Col span={8}>
              <AntForm.Item
                name="productScope"
                label="Product Scope"
                rules={[
                  { required: true, message: "Product scope is required" },
                ]}
              >
                <AntSelect placeholder="Select scope">
                  {productScopes.map((scope) => (
                    <AntSelect.Option key={scope} value={scope}>
                      {scope}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
            <Col span={8}>
              <AntForm.Item
                name="priority"
                label="Priority"
                rules={[{ required: true, message: "Priority is required" }]}
              >
                <InputNumber
                  placeholder="1"
                  min={1}
                  style={{ width: "100%" }}
                />
              </AntForm.Item>
            </Col>
          </Row>

          <AntForm.Item
            name="pos"
            label="Point of Sale"
            rules={[{ required: true, message: "At least one POS required" }]}
          >
            <AntSelect mode="multiple" placeholder="Select regions">
              {posList.map((pos) => (
                <AntSelect.Option key={pos} value={pos}>
                  {pos}
                </AntSelect.Option>
              ))}
            </AntSelect>
          </AntForm.Item>

          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                name="adjustmentType"
                label="Adjustment Type"
                rules={[
                  { required: true, message: "Adjustment type is required" },
                ]}
              >
                <AntSelect placeholder="Select type">
                  {adjustmentTypes.map((type) => (
                    <AntSelect.Option key={type} value={type}>
                      {type === "PERCENT"
                        ? "Percentage (%)"
                        : "Fixed Amount ($)"}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                name="adjustmentValue"
                label="Adjustment Value"
                rules={[
                  { required: true, message: "Adjustment value is required" },
                ]}
              >
                <Input placeholder="10.50" />
              </AntForm.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                name="validFrom"
                label="Valid From"
                rules={[
                  { required: true, message: "Valid from date is required" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                name="validTo"
                label="Valid To"
                rules={[
                  { required: true, message: "Valid to date is required" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </AntForm.Item>
            </Col>
          </Row>

          <div className="flex justify-end space-x-2">
            <AntButton onClick={() => setIsOverrideModalVisible(false)}>
              Cancel
            </AntButton>
            <AntButton
              type="primary"
              htmlType="submit"
              loading={
                createOverrideMutation.isPending ||
                updateOverrideMutation.isPending
              }
            >
              {editingOverride ? "Update" : "Create"} Override
            </AntButton>
          </div>
        </AntForm>
      </Modal>
    </div>
  );
}
