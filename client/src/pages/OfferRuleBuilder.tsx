
import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  GitBranch,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  FileEdit,
  Trash2,
  AlertTriangle,
  Settings,
  Zap,
  Target,
  Layers,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Modal,
  Form as AntForm,
  Input as AntInput,
  Select as AntSelect,
  DatePicker,
  Checkbox as AntCheckbox,
  InputNumber,
  Button as AntButton,
  Row,
  Col,
  Switch,
  Card as AntCard,
  Divider,
  Space,
  Tag,
  Tooltip,
  Steps,
} from "antd";
import dayjs from "dayjs";
import { cn, formatDate } from "@/lib/utils";

interface OfferRule {
  id: string;
  ruleCode: string;
  ruleName: string;
  ruleType: string;
  conditions: any;
  actions: any[];
  priority: number;
  status: string;
  validFrom: string;
  validTo: string;
  justification?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const ruleTypes = [
  { value: "FARE_DISCOUNT", label: "Fare Discount", icon: "💰" },
  { value: "ANCILLARY_DISCOUNT", label: "Ancillary Discount", icon: "🎒" },
  { value: "BUNDLE_OFFER", label: "Bundle Offer", icon: "📦" },
  { value: "MARKUP", label: "Markup Rule", icon: "📈" },
];

const actionTypes = [
  { value: "DISCOUNT", label: "Apply Discount", icon: "💸" },
  { value: "MARKUP", label: "Apply Markup", icon: "📈" },
  { value: "ADD_ANCILLARY", label: "Add Ancillary", icon: "➕" },
  { value: "ACTIVATE_BUNDLE", label: "Activate Bundle", icon: "📦" },
  { value: "SUPPRESS_PRODUCT", label: "Suppress Product", icon: "🚫" },
  { value: "ADD_BANNER", label: "Add Banner", icon: "🏷️" },
];

const channels = ["API", "PORTAL", "MOBILE"];
const agentTiers = ["PLATINUM", "GOLD", "SILVER", "BRONZE"];
const cabinClasses = ["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"];
const tripTypes = ["ONE_WAY", "ROUND_TRIP", "MULTI_CITY"];
const countries = ["US", "GB", "DE", "FR", "IN", "AU", "CA", "SG", "AE", "SA"];

export default function OfferRuleBuilder() {
  const [filters, setFilters] = useState({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<OfferRule | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const queryClient = useQueryClient();
  const [createForm] = AntForm.useForm();
  const [editForm] = AntForm.useForm();
  const [simulateForm] = AntForm.useForm();

  // Dummy data for development
  const dummyRules = [
    {
      id: "1",
      ruleCode: "RULE_FESTIVE_SEATFREE_PLAT",
      ruleName: "Festive Free Seat for Platinum",
      ruleType: "ANCILLARY_DISCOUNT",
      conditions: {
        pos: ["IN"],
        agentTier: ["PLATINUM"],
        cohortCodes: ["FESTIVE_2025"],
        channel: ["PORTAL"]
      },
      actions: [
        {
          type: "ADD_ANCILLARY",
          ancillaryCode: "SEAT_STD",
          pricing: { type: "FREE" }
        }
      ],
      priority: 50,
      status: "ACTIVE",
      validFrom: "2025-10-15",
      validTo: "2025-11-15",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      ruleCode: "RULE_WEEKEND_DISCOUNT_GOLD",
      ruleName: "Weekend 10% Discount for Gold",
      ruleType: "FARE_DISCOUNT",
      conditions: {
        pos: ["US", "CA"],
        agentTier: ["GOLD"],
        channel: ["API", "PORTAL"],
        seasonCode: "WEEKEND"
      },
      actions: [
        {
          type: "DISCOUNT",
          scope: "NEGOTIATED",
          valueType: "PERCENT",
          value: 10
        }
      ],
      priority: 30,
      status: "PENDING_APPROVAL",
      validFrom: "2024-12-01",
      validTo: "2024-12-31",
      justification: "Boost weekend bookings for Gold tier agents",
      createdBy: "manager",
      createdAt: "2024-01-02T00:00:00Z",
      updatedAt: "2024-01-02T00:00:00Z",
    },
    {
      id: "3",
      ruleCode: "RULE_BUNDLE_COMFORT_PACK",
      ruleName: "Comfort Bundle Activation",
      ruleType: "BUNDLE_OFFER",
      conditions: {
        pos: ["IN", "AE"],
        agentTier: ["PLATINUM", "GOLD"],
        cabinClass: ["PREMIUM_ECONOMY", "BUSINESS"],
        channel: ["PORTAL"]
      },
      actions: [
        {
          type: "ACTIVATE_BUNDLE",
          bundleCode: "COMFORT_PACK",
          pricing: { type: "PERCENT", value: 15 }
        }
      ],
      priority: 40,
      status: "DRAFT",
      validFrom: "2025-01-01",
      validTo: "2025-03-31",
      createdBy: "product_manager",
      createdAt: "2024-01-03T00:00:00Z",
      updatedAt: "2024-01-03T00:00:00Z",
    }
  ];

  // API calls
  const { data: rules, isLoading } = useQuery({
    queryKey: ["/api/offer-rules", filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/offer-rules?${params}`);
      if (!response.ok) throw new Error("Failed to fetch rules");
      return response.json();
    },
  });

  const displayRules = rules || dummyRules;

  const createRuleMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/offer-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offer-rules"] });
      setIsCreateModalOpen(false);
      createForm.resetFields();
      setCurrentStep(0);
    },
  });

  const updateRuleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/offer-rules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offer-rules"] });
      setIsEditModalOpen(false);
      setSelectedRule(null);
      editForm.resetFields();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, approver }: { id: string; status: string; approver?: string }) => {
      const response = await fetch(`/api/offer-rules/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, approver }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offer-rules"] });
    },
  });

  const simulateRuleMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/offer-rules/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Simulation failed");
      return response.json();
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "INACTIVE":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "PENDING_APPROVAL":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "DRAFT":
        return <FileEdit className="w-4 h-4 text-gray-600" />;
      default:
        return <Settings className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-red-100 text-red-800";
      case "PENDING_APPROVAL":
        return "bg-yellow-100 text-yellow-800";
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRuleTypeIcon = (ruleType: string) => {
    const type = ruleTypes.find(t => t.value === ruleType);
    return type ? type.icon : "⚙️";
  };

  const handleViewRule = (rule: OfferRule) => {
    setSelectedRule(rule);
    setIsViewModalOpen(true);
  };

  const handleEditRule = (rule: OfferRule) => {
    setSelectedRule(rule);
    editForm.setFieldsValue({
      ruleCode: rule.ruleCode,
      ruleName: rule.ruleName,
      ruleType: rule.ruleType,
      priority: rule.priority,
      validFrom: dayjs(rule.validFrom),
      validTo: dayjs(rule.validTo),
      justification: rule.justification,
      // Conditions
      "conditions.pos": rule.conditions?.pos || [],
      "conditions.agentTier": rule.conditions?.agentTier || [],
      "conditions.cohortCodes": rule.conditions?.cohortCodes || [],
      "conditions.channel": rule.conditions?.channel || [],
      "conditions.cabinClass": rule.conditions?.cabinClass || [],
      "conditions.tripType": rule.conditions?.tripType || [],
      "conditions.origin": rule.conditions?.origin,
      "conditions.destination": rule.conditions?.destination,
      "conditions.seasonCode": rule.conditions?.seasonCode,
      // Actions would be handled separately for complex structure
    });
    setIsEditModalOpen(true);
  };

  const handleSimulateRule = (rule: OfferRule) => {
    setSelectedRule(rule);
    setIsSimulateModalOpen(true);
  };

  const handleStatusChange = (rule: OfferRule, newStatus: string) => {
    const approver = newStatus === "ACTIVE" ? "admin" : undefined;
    updateStatusMutation.mutate({ id: rule.id, status: newStatus, approver });
  };

  const onCreateSubmit = (values: any) => {
    const formattedData = {
      ruleCode: values.ruleCode,
      ruleName: values.ruleName,
      ruleType: values.ruleType,
      conditions: {
        origin: values["conditions.origin"],
        destination: values["conditions.destination"],
        pos: values["conditions.pos"] || [],
        agentTier: values["conditions.agentTier"] || [],
        cohortCodes: values["conditions.cohortCodes"] || [],
        channel: values["conditions.channel"] || [],
        cabinClass: values["conditions.cabinClass"] || [],
        tripType: values["conditions.tripType"] || [],
        seasonCode: values["conditions.seasonCode"],
        bookingWindow: values["conditions.bookingWindowMin"] && values["conditions.bookingWindowMax"] ? {
          min: values["conditions.bookingWindowMin"],
          max: values["conditions.bookingWindowMax"]
        } : undefined,
        travelWindow: values["conditions.travelWindowMin"] && values["conditions.travelWindowMax"] ? {
          min: values["conditions.travelWindowMin"],
          max: values["conditions.travelWindowMax"]
        } : undefined,
      },
      actions: values.actions || [],
      priority: values.priority || 1,
      validFrom: values.validFrom?.format("YYYY-MM-DD"),
      validTo: values.validTo?.format("YYYY-MM-DD"),
      justification: values.justification,
      createdBy: "admin", // This would come from auth context
    };
    createRuleMutation.mutate(formattedData);
  };

  const onEditSubmit = (values: any) => {
    if (!selectedRule) return;

    const formattedData = {
      ruleCode: values.ruleCode,
      ruleName: values.ruleName,
      ruleType: values.ruleType,
      conditions: {
        origin: values["conditions.origin"],
        destination: values["conditions.destination"],
        pos: values["conditions.pos"] || [],
        agentTier: values["conditions.agentTier"] || [],
        cohortCodes: values["conditions.cohortCodes"] || [],
        channel: values["conditions.channel"] || [],
        cabinClass: values["conditions.cabinClass"] || [],
        tripType: values["conditions.tripType"] || [],
        seasonCode: values["conditions.seasonCode"],
      },
      actions: selectedRule.actions, // Keep existing actions for now
      priority: values.priority || 1,
      validFrom: values.validFrom?.format("YYYY-MM-DD"),
      validTo: values.validTo?.format("YYYY-MM-DD"),
      justification: values.justification,
      createdBy: selectedRule.createdBy,
    };
    updateRuleMutation.mutate({ id: selectedRule.id, data: formattedData });
  };

  const onSimulateSubmit = (values: any) => {
    if (!selectedRule) return;
    simulateRuleMutation.mutate({
      ruleId: selectedRule.id,
      context: values
    });
  };

  const steps = [
    {
      title: 'Basic Info',
      description: 'Rule identification and type',
    },
    {
      title: 'Conditions',
      description: 'When should this rule apply',
    },
    {
      title: 'Actions',
      description: 'What should happen',
    },
    {
      title: 'Review',
      description: 'Validate and submit',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Offer Rule Builder</h1>
                <p className="text-gray-600">Create and manage no-code discount, markup, and ancillary rules</p>
              </div>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              disabled={createRuleMutation.isPending}
              className="cls-primary-bg hover:bg-blue-700 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Rule
            </Button>
          </div>

          {/* Filter Section */}
          <div className="flex gap-3">
            <div className="flex-1">
              <Input placeholder="Search rules..." className="w-full" />
            </div>
            <Select defaultValue="all-types">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Rule Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-types">All Types</SelectItem>
                {ruleTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select defaultValue="all-status">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PENDING_APPROVAL">Pending</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="bg-white rounded-lg border">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading rules...</span>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Rule</TableHead>
                <TableHead className="w-[150px]">Type</TableHead>
                <TableHead className="w-[120px]">Priority</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[200px]">Validity</TableHead>
                <TableHead className="w-[120px]">Created By</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayRules?.map((rule: OfferRule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <span className="text-lg">{getRuleTypeIcon(rule.ruleType)}</span>
                        {rule.ruleCode}
                      </div>
                      <div className="text-sm text-gray-500">{rule.ruleName}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {rule.ruleType.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3 text-gray-400" />
                      <span className="font-medium">{rule.priority}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium gap-1 ${getStatusColor(rule.status)}`}>
                      {getStatusIcon(rule.status)}
                      {rule.status.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <div>{formatDate(rule.validFrom)}</div>
                      <div className="text-gray-500">to {formatDate(rule.validTo)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{rule.createdBy}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Tooltip title="View Details">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1"
                          onClick={() => handleViewRule(rule)}
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </Button>
                      </Tooltip>
                      <Tooltip title="Edit Rule">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1"
                          onClick={() => handleEditRule(rule)}
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </Button>
                      </Tooltip>
                      <Tooltip title="Simulate">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1"
                          onClick={() => handleSimulateRule(rule)}
                        >
                          <Play className="w-4 h-4 text-gray-500" />
                        </Button>
                      </Tooltip>
                      {rule.status === "PENDING_APPROVAL" && (
                        <Tooltip title="Approve">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1"
                            onClick={() => handleStatusChange(rule, "ACTIVE")}
                          >
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </Button>
                        </Tooltip>
                      )}
                      {rule.status === "ACTIVE" && (
                        <div
                          className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors bg-blue-600`}
                          onClick={() => handleStatusChange(rule, "INACTIVE")}
                        >
                          <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm transition-transform`}></div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create Rule Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <GitBranch className="w-5 h-5 text-blue-600" />
            <span>Create New Offer Rule</span>
          </div>
        }
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          createForm.resetFields();
          setCurrentStep(0);
        }}
        footer={null}
        width={900}
        destroyOnClose
      >
        <div className="mt-6">
          <Steps current={currentStep} items={steps} className="mb-8" />
          
          <AntForm
            form={createForm}
            layout="vertical"
            onFinish={onCreateSubmit}
            autoComplete="off"
          >
            {currentStep === 0 && (
              <div className="space-y-4">
                <Row gutter={16}>
                  <Col span={12}>
                    <AntForm.Item
                      label="Rule Code"
                      name="ruleCode"
                      rules={[{ required: true, message: "Please enter rule code" }]}
                    >
                      <AntInput placeholder="RULE_WEEKEND_DISCOUNT" />
                    </AntForm.Item>
                  </Col>
                  <Col span={12}>
                    <AntForm.Item
                      label="Rule Name"
                      name="ruleName"
                      rules={[{ required: true, message: "Please enter rule name" }]}
                    >
                      <AntInput placeholder="Weekend Discount for Gold Agents" />
                    </AntForm.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <AntForm.Item
                      label="Rule Type"
                      name="ruleType"
                      rules={[{ required: true, message: "Please select rule type" }]}
                    >
                      <AntSelect placeholder="Select rule type">
                        {ruleTypes.map((type) => (
                          <AntSelect.Option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </AntSelect.Option>
                        ))}
                      </AntSelect>
                    </AntForm.Item>
                  </Col>
                  <Col span={12}>
                    <AntForm.Item
                      label="Priority"
                      name="priority"
                      rules={[{ required: true, message: "Please enter priority" }]}
                    >
                      <InputNumber min={1} max={100} placeholder="1-100" style={{ width: "100%" }} />
                    </AntForm.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <AntForm.Item
                      label="Valid From"
                      name="validFrom"
                      rules={[{ required: true, message: "Please select start date" }]}
                    >
                      <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                    </AntForm.Item>
                  </Col>
                  <Col span={12}>
                    <AntForm.Item
                      label="Valid To"
                      name="validTo"
                      rules={[{ required: true, message: "Please select end date" }]}
                    >
                      <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                    </AntForm.Item>
                  </Col>
                </Row>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <AntCard title="🌍 Geographic Conditions" size="small">
                  <Row gutter={16}>
                    <Col span={8}>
                      <AntForm.Item label="Origin" name="conditions.origin">
                        <AntInput placeholder="NYC" maxLength={3} />
                      </AntForm.Item>
                    </Col>
                    <Col span={8}>
                      <AntForm.Item label="Destination" name="conditions.destination">
                        <AntInput placeholder="LAX" maxLength={3} />
                      </AntForm.Item>
                    </Col>
                    <Col span={8}>
                      <AntForm.Item label="Point of Sale" name="conditions.pos">
                        <AntSelect mode="multiple" placeholder="Select countries">
                          {countries.map((country) => (
                            <AntSelect.Option key={country} value={country}>
                              {country}
                            </AntSelect.Option>
                          ))}
                        </AntSelect>
                      </AntForm.Item>
                    </Col>
                  </Row>
                </AntCard>

                <AntCard title="👥 Agent & Channel Conditions" size="small">
                  <Row gutter={16}>
                    <Col span={12}>
                      <AntForm.Item label="Agent Tiers" name="conditions.agentTier">
                        <AntSelect mode="multiple" placeholder="Select agent tiers">
                          {agentTiers.map((tier) => (
                            <AntSelect.Option key={tier} value={tier}>
                              {tier}
                            </AntSelect.Option>
                          ))}
                        </AntSelect>
                      </AntForm.Item>
                    </Col>
                    <Col span={12}>
                      <AntForm.Item label="Channels" name="conditions.channel">
                        <AntSelect mode="multiple" placeholder="Select channels">
                          {channels.map((channel) => (
                            <AntSelect.Option key={channel} value={channel}>
                              {channel}
                            </AntSelect.Option>
                          ))}
                        </AntSelect>
                      </AntForm.Item>
                    </Col>
                  </Row>
                  <AntForm.Item label="Cohort Codes (Optional)" name="conditions.cohortCodes">
                    <AntSelect
                      mode="tags"
                      placeholder="Enter cohort codes (e.g., FESTIVE_2025, VIP_CORP)"
                      style={{ width: "100%" }}
                    />
                  </AntForm.Item>
                </AntCard>

                <AntCard title="✈️ Travel Conditions" size="small">
                  <Row gutter={16}>
                    <Col span={12}>
                      <AntForm.Item label="Cabin Classes" name="conditions.cabinClass">
                        <AntSelect mode="multiple" placeholder="Select cabin classes">
                          {cabinClasses.map((cabin) => (
                            <AntSelect.Option key={cabin} value={cabin}>
                              {cabin.replace('_', ' ')}
                            </AntSelect.Option>
                          ))}
                        </AntSelect>
                      </AntForm.Item>
                    </Col>
                    <Col span={12}>
                      <AntForm.Item label="Trip Types" name="conditions.tripType">
                        <AntSelect mode="multiple" placeholder="Select trip types">
                          {tripTypes.map((type) => (
                            <AntSelect.Option key={type} value={type}>
                              {type.replace('_', ' ')}
                            </AntSelect.Option>
                          ))}
                        </AntSelect>
                      </AntForm.Item>
                    </Col>
                  </Row>
                  <AntForm.Item label="Season Code (Optional)" name="conditions.seasonCode">
                    <AntInput placeholder="PEAK_SUMMER, WEEKEND, HOLIDAY" />
                  </AntForm.Item>
                </AntCard>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    Actions define what happens when conditions are met. You can configure multiple actions per rule.
                  </AlertDescription>
                </Alert>
                <div className="text-center py-8">
                  <Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Action Builder</h3>
                  <p className="text-gray-500 mb-4">Complex action configuration will be available in the next iteration</p>
                  <Button variant="outline">Configure Actions</Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <AntForm.Item label="Justification (Required for approval)" name="justification">
                  <AntInput.TextArea 
                    placeholder="Explain the business rationale for this rule..." 
                    rows={4} 
                  />
                </AntForm.Item>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This rule will be created in DRAFT status and require approval before activation.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-4 border-t">
              <AntButton
                disabled={currentStep === 0}
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Previous
              </AntButton>
              
              <div className="flex gap-2">
                <AntButton onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </AntButton>
                
                {currentStep < steps.length - 1 ? (
                  <AntButton type="primary" onClick={() => setCurrentStep(currentStep + 1)}>
                    Next
                  </AntButton>
                ) : (
                  <AntButton
                    type="primary"
                    htmlType="submit"
                    loading={createRuleMutation.isPending}
                  >
                    {createRuleMutation.isPending ? "Creating..." : "Create Rule"}
                  </AntButton>
                )}
              </div>
            </div>
          </AntForm>
        </div>
      </Modal>

      {/* View Rule Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Rule Details</h3>
              <p className="text-sm text-gray-500">Complete rule configuration and status</p>
            </div>
          </div>
        }
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          setSelectedRule(null);
        }}
        footer={[
          <AntButton
            key="close"
            type="primary"
            onClick={() => {
              setIsViewModalOpen(false);
              setSelectedRule(null);
            }}
          >
            Close
          </AntButton>,
        ]}
        width={900}
      >
        {selectedRule && (
          <div className="space-y-6 pt-4">
            {/* Status and Basic Info */}
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{getRuleTypeIcon(selectedRule.ruleType)}</span>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{selectedRule.ruleCode}</h4>
                    <p className="text-gray-600">{selectedRule.ruleName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium gap-2 ${getStatusColor(selectedRule.status)}`}>
                    {getStatusIcon(selectedRule.status)}
                    {selectedRule.status.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-500">Priority: {selectedRule.priority}</span>
                  <span className="text-sm text-gray-500">Type: {selectedRule.ruleType.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            {/* Validity Period */}
            <AntCard title="📅 Validity Period" size="small">
              <div className="flex justify-between">
                <div>
                  <Label className="text-xs text-gray-500">From</Label>
                  <div className="font-medium">{formatDate(selectedRule.validFrom)}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">To</Label>
                  <div className="font-medium">{formatDate(selectedRule.validTo)}</div>
                </div>
              </div>
            </AntCard>

            {/* Conditions */}
            <AntCard title="🎯 Conditions" size="small">
              <div className="grid grid-cols-2 gap-4">
                {selectedRule.conditions?.pos && (
                  <div>
                    <Label className="text-xs text-gray-500">Point of Sale</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedRule.conditions.pos.map((pos: string, index: number) => (
                        <Tag key={index} color="blue">{pos}</Tag>
                      ))}
                    </div>
                  </div>
                )}
                {selectedRule.conditions?.agentTier && (
                  <div>
                    <Label className="text-xs text-gray-500">Agent Tiers</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedRule.conditions.agentTier.map((tier: string, index: number) => (
                        <Tag key={index} color="gold">{tier}</Tag>
                      ))}
                    </div>
                  </div>
                )}
                {selectedRule.conditions?.channel && (
                  <div>
                    <Label className="text-xs text-gray-500">Channels</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedRule.conditions.channel.map((channel: string, index: number) => (
                        <Tag key={index} color="green">{channel}</Tag>
                      ))}
                    </div>
                  </div>
                )}
                {selectedRule.conditions?.cohortCodes && (
                  <div>
                    <Label className="text-xs text-gray-500">Cohorts</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedRule.conditions.cohortCodes.map((cohort: string, index: number) => (
                        <Tag key={index} color="purple">{cohort}</Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AntCard>

            {/* Actions */}
            <AntCard title="⚡ Actions" size="small">
              <div className="space-y-2">
                {selectedRule.actions?.map((action: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{action.type.replace('_', ' ')}</span>
                      {action.ancillaryCode && <Tag color="cyan">{action.ancillaryCode}</Tag>}
                      {action.bundleCode && <Tag color="orange">{action.bundleCode}</Tag>}
                      {action.pricing?.type === "FREE" && <Tag color="green">FREE</Tag>}
                      {action.value && <Tag color="blue">{action.valueType === "PERCENT" ? `${action.value}%` : `$${action.value}`}</Tag>}
                    </div>
                  </div>
                ))}
              </div>
            </AntCard>

            {/* Justification */}
            {selectedRule.justification && (
              <AntCard title="📝 Justification" size="small">
                <p className="text-gray-700">{selectedRule.justification}</p>
              </AntCard>
            )}

            {/* Approval Info */}
            {selectedRule.approvedBy && (
              <AntCard title="✅ Approval Details" size="small">
                <div className="flex justify-between">
                  <div>
                    <Label className="text-xs text-gray-500">Approved By</Label>
                    <div className="font-medium">{selectedRule.approvedBy}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Approved At</Label>
                    <div className="font-medium">{selectedRule.approvedAt ? formatDate(selectedRule.approvedAt) : "-"}</div>
                  </div>
                </div>
              </AntCard>
            )}

            {/* Metadata */}
            <AntCard title="ℹ️ Metadata" size="small">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Created By</Label>
                  <div className="font-medium">{selectedRule.createdBy}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Created At</Label>
                  <div className="font-medium">{formatDate(selectedRule.createdAt)}</div>
                </div>
              </div>
            </AntCard>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Offer Rule"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedRule(null);
          editForm.resetFields();
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <AntForm
          form={editForm}
          layout="vertical"
          onFinish={onEditSubmit}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                label="Rule Code"
                name="ruleCode"
                rules={[{ required: true, message: "Please enter rule code" }]}
              >
                <AntInput />
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                label="Rule Name"
                name="ruleName"
                rules={[{ required: true, message: "Please enter rule name" }]}
              >
                <AntInput />
              </AntForm.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <AntForm.Item
                label="Rule Type"
                name="ruleType"
                rules={[{ required: true, message: "Please select rule type" }]}
              >
                <AntSelect>
                  {ruleTypes.map((type) => (
                    <AntSelect.Option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
            <Col span={8}>
              <AntForm.Item
                label="Priority"
                name="priority"
                rules={[{ required: true, message: "Please enter priority" }]}
              >
                <InputNumber min={1} max={100} style={{ width: "100%" }} />
              </AntForm.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                label="Valid From"
                name="validFrom"
                rules={[{ required: true, message: "Please select start date" }]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                label="Valid To"
                name="validTo"
                rules={[{ required: true, message: "Please select end date" }]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </AntForm.Item>
            </Col>
          </Row>

          <AntForm.Item label="Justification" name="justification">
            <AntInput.TextArea rows={3} />
          </AntForm.Item>

          <AntForm.Item>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <AntButton onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </AntButton>
              <AntButton
                type="primary"
                htmlType="submit"
                loading={updateRuleMutation.isPending}
              >
                {updateRuleMutation.isPending ? "Updating..." : "Update Rule"}
              </AntButton>
            </div>
          </AntForm.Item>
        </AntForm>
      </Modal>

      {/* Simulate Modal */}
      <Modal
        title="Rule Simulation"
        open={isSimulateModalOpen}
        onCancel={() => setIsSimulateModalOpen(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <div className="mb-4">
          <Alert>
            <Play className="h-4 w-4" />
            <AlertDescription>
              Test how this rule would behave with specific conditions and context.
            </AlertDescription>
          </Alert>
        </div>

        <AntForm
          form={simulateForm}
          layout="vertical"
          onFinish={onSimulateSubmit}
        >
          <AntForm.Item label="Test Context" name="testContext">
            <AntInput.TextArea 
              placeholder='{"pos": "IN", "agentTier": "GOLD", "baseFare": 500}'
              rows={4}
            />
          </AntForm.Item>

          {simulateRuleMutation.data && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Simulation Result</h4>
              <pre className="text-sm text-green-700">
                {JSON.stringify(simulateRuleMutation.data, null, 2)}
              </pre>
            </div>
          )}

          <AntForm.Item>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <AntButton onClick={() => setIsSimulateModalOpen(false)}>
                Close
              </AntButton>
              <AntButton
                type="primary"
                htmlType="submit"
                loading={simulateRuleMutation.isPending}
                icon={<Play className="w-4 h-4" />}
              >
                Run Simulation
              </AntButton>
            </div>
          </AntForm.Item>
        </AntForm>
      </Modal>
    </div>
  );
}
