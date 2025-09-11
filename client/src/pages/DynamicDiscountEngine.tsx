import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Form as AntForm,
  Input as AntInput,
  Select as AntSelect,
  DatePicker as AntDatePicker,
  InputNumber as AntInputNumber,
  Switch as AntSwitch,
  Button as AntButton,
  Modal,
  Row,
  Col,
  Upload,
  message,
} from "antd";
import {
  TrendingUp,
  Plus,
  Upload as UploadIcon,
  Filter,
  Eye,
  Edit,
  Calculator,
} from "lucide-react";
import type { DynamicDiscountRule } from "../../../shared/schema";
import dayjs from "dayjs";

const { RangePicker } = AntDatePicker;

interface RuleFormData {
  ruleCode: string;
  fareSource: string;
  origin: string;
  destination: string;
  cabinClass: string;
  tripType: string;
  pos: string[];
  marketRegion?: string;
  agentTier: string[];
  cohortCodes?: string[];
  channel: string;
  bookingWindowMin?: number;
  bookingWindowMax?: number;
  travelWindowMin?: number;
  travelWindowMax?: number;
  seasonCode?: string;
  adjustmentType: string;
  adjustmentValue: number;
  stackable: boolean;
  priority: number;
  validFrom: string;
  validTo: string;
}

const ruleFormSchema = z.object({
  ruleCode: z.string().min(1, "Rule code is required"),
  fareSource: z.enum(["API_GDS_NDC"]),
  origin: z.string().min(3, "Origin must be 3 characters"),
  destination: z.string().min(3, "Destination must be 3 characters"),
  cabinClass: z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"]),
  tripType: z.enum(["ONE_WAY", "ROUND_TRIP", "MULTI_CITY"]),
  pos: z.array(z.string()).min(1, "At least one POS required"),
  marketRegion: z.string().optional(),
  agentTier: z
    .array(z.enum(["PLATINUM", "GOLD", "SILVER", "BRONZE"]))
    .min(1, "At least one agent tier required"),
  cohortCodes: z.array(z.string()).optional(),
  channel: z.enum(["API", "PORTAL", "MOBILE"]),
  bookingWindowMin: z.number().optional(),
  bookingWindowMax: z.number().optional(),
  travelWindowMin: z.number().optional(),
  travelWindowMax: z.number().optional(),
  seasonCode: z.string().optional(),
  adjustmentType: z.enum(["PERCENT", "AMOUNT"]),
  adjustmentValue: z.number(),
  stackable: z.boolean(),
  priority: z.number().min(1),
  validFrom: z.string(),
  validTo: z.string(),
});

const agentTiers = ["PLATINUM", "GOLD", "SILVER", "BRONZE"];
const fareSources = ["API_GDS_NDC"];
const cabinClasses = ["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"];
const tripTypes = ["ONE_WAY", "ROUND_TRIP", "MULTI_CITY"];
const channels = ["API", "PORTAL", "MOBILE"];
const adjustmentTypes = ["PERCENT", "AMOUNT"];

export default function DynamicDiscountEngine() {
  const [filters, setFilters] = useState({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<DynamicDiscountRule | null>(
    null,
  );
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const queryClient = useQueryClient();
  const [antForm] = AntForm.useForm();
  const [editForm] = AntForm.useForm();
  const [simulateForm] = AntForm.useForm();
  const { toast } = useToast();

  const form = useForm<RuleFormData>({
    resolver: zodResolver(ruleFormSchema),
    defaultValues: {
      pos: [],
      agentTier: [],
      cohortCodes: [],
      stackable: false,
      priority: 1,
      adjustmentType: "PERCENT",
    },
  });

  // Fetch dynamic discount rules
  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["dynamic-discount-rules", filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/dynamic-discount-rules?${params}`);
      if (!response.ok) throw new Error("Failed to fetch rules");
      return response.json();
    },
  });

  // Create rule mutation
  const createRuleMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/dynamic-discount-rules", {
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
      queryClient.invalidateQueries({ queryKey: ["dynamic-discount-rules"] });
      setIsCreateModalOpen(false);
      antForm.resetFields();
      toast({ title: "Rule created successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update rule mutation
  const updateRuleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/dynamic-discount-rules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update rule");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dynamic-discount-rules"] });
      setIsEditModalOpen(false);
      setSelectedRule(null);
      editForm.resetFields();
      toast({ title: "Rule updated successfully" });
    },
  });

  // Status toggle mutation
  const statusToggleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/dynamic-discount-rules/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dynamic-discount-rules"] });
      toast({ title: "Status updated successfully" });
    },
  });

  // Simulate rule mutation
  const simulateRuleMutation = useMutation({
    mutationFn: async (data: {
      baseFare: number;
      currency: string;
      ruleId: string;
    }) => {
      const response = await fetch("/api/dynamic-discount-rules/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to simulate rule");
      return response.json();
    },
    onSuccess: (data) => {
      setSimulationResult(data);
      toast({ title: "Simulation completed successfully" });
    },
  });

  const handleCreateRule = (values: any) => {
    const formattedData = {
      ...values,
      validFrom: values.validDates[0].format("YYYY-MM-DD"),
      validTo: values.validDates[1].format("YYYY-MM-DD"),
      stackable: values.stackable ? "true" : "false",
      cohortCodes: values.cohortCodes || [],
    };
    delete formattedData.validDates;
    createRuleMutation.mutate(formattedData);
  };

  const handleEditRule = (values: any) => {
    const formattedData = {
      ...values,
      validFrom: values.validDates[0].format("YYYY-MM-DD"),
      validTo: values.validDates[1].format("YYYY-MM-DD"),
      stackable: values.stackable ? "true" : "false",
      cohortCodes: values.cohortCodes || [],
    };
    delete formattedData.validDates;
    updateRuleMutation.mutate({ id: selectedRule!.id, data: formattedData });
  };

  const handleViewRule = (rule: DynamicDiscountRule) => {
    setSelectedRule(rule);
    setIsViewModalOpen(true);
  };

  const handleEditRuleClick = (rule: DynamicDiscountRule) => {
    setSelectedRule(rule);
    editForm.setFieldsValue({
      ...rule,
      validDates: [dayjs(rule.validFrom), dayjs(rule.validTo)],
      stackable: rule.stackable === "true",
      agentTier: Array.isArray(rule.agentTier) ? rule.agentTier : [],
      pos: Array.isArray(rule.pos) ? rule.pos : [],
      cohortCodes: Array.isArray(rule.cohortCodes) ? rule.cohortCodes : [],
    });
    setIsEditModalOpen(true);
  };

  const handleStatusToggle = (rule: DynamicDiscountRule) => {
    const newStatus = rule.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    statusToggleMutation.mutate({ id: rule.id, status: newStatus });
  };

  const handleSimulate = (values: any) => {
    simulateRuleMutation.mutate({
      baseFare: values.baseFare,
      currency: values.currency,
      ruleId: selectedRule!.id,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards  */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rules.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                rules.filter(
                  (rule: DynamicDiscountRule) => rule.status === "ACTIVE",
                ).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Stackable Rules
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                rules.filter(
                  (rule: DynamicDiscountRule) => rule.stackable === "true",
                ).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                rules.filter((rule: DynamicDiscountRule) => rule.priority >= 5)
                  .length
              }
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Filter Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input placeholder="Rule Code" />
            <Input placeholder="Origin" />
            <Input placeholder="Destination" />
            <Input placeholder="Channel" />
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Discount Rules</CardTitle>
          <CardDescription>
            Manage dynamic discount and markup rules for real-time fare
            adjustments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule Code</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Adjustment</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule: DynamicDiscountRule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <div className="font-medium">{rule.ruleCode}</div>
                    <div className="text-sm text-gray-500">
                      {rule.stackable === "true" && (
                        <Badge variant="outline" className="text-xs">
                          Stackable
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">
                        {rule.origin} → {rule.destination}
                      </div>
                      <div className="text-gray-500">
                        {rule.cabinClass} • {rule.tripType.replace("_", " ")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{rule.fareSource}</TableCell>
                  <TableCell className="text-sm">{rule.channel}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div
                        className={`font-medium ${parseFloat(rule.adjustmentValue) >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {rule.adjustmentType === "PERCENT"
                          ? `${parseFloat(rule.adjustmentValue) >= 0 ? "+" : ""}${rule.adjustmentValue}%`
                          : `${parseFloat(rule.adjustmentValue) >= 0 ? "+" : ""}${rule.adjustmentValue}`}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{rule.priority}</TableCell>
                  <TableCell>
                    <span
                      className={`text-sm font-medium ${
                        rule.status === "ACTIVE"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {rule.status === "ACTIVE" ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1"
                        onClick={() => handleViewRule(rule)}
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1"
                        onClick={() => handleEditRuleClick(rule)}
                      >
                        <Edit className="w-4 h-4 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1"
                        onClick={() => {
                          setSelectedRule(rule);
                          setIsSimulateModalOpen(true);
                        }}
                      >
                        <Calculator className="w-4 h-4 text-gray-500" />
                      </Button>
                      <div
                        className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${
                          rule.status === "ACTIVE"
                            ? "bg-blue-600"
                            : "bg-gray-300"
                        }`}
                        onClick={() => handleStatusToggle(rule)}
                      >
                        <div
                          className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${
                            rule.status === "ACTIVE"
                              ? "translate-x-4"
                              : "translate-x-0.5"
                          }`}
                        />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Rule Modal */}
      <Modal
        title="Create Discount Rule"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          antForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <AntForm
          form={antForm}
          layout="vertical"
          onFinish={handleCreateRule}
          className="space-y-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                label="Rule Code"
                name="ruleCode"
                rules={[{ required: true }]}
              >
                <AntInput placeholder="e.g., DISCOUNT_001" />
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                label="Fare Source"
                name="fareSource"
                rules={[{ required: true }]}
              >
                <AntSelect placeholder="Select fare source">
                  {fareSources.map((source) => (
                    <AntSelect.Option key={source} value={source}>
                      {source}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <AntForm.Item
                label="Origin"
                name="origin"
                rules={[{ required: true }]}
              >
                <AntInput placeholder="LHR" maxLength={3} />
              </AntForm.Item>
            </Col>
            <Col span={8}>
              <AntForm.Item
                label="Destination"
                name="destination"
                rules={[{ required: true }]}
              >
                <AntInput placeholder="JFK" maxLength={3} />
              </AntForm.Item>
            </Col>
            <Col span={8}>
              <AntForm.Item
                label="Channel"
                name="channel"
                rules={[{ required: true }]}
              >
                <AntSelect placeholder="Select channel">
                  {channels.map((channel) => (
                    <AntSelect.Option key={channel} value={channel}>
                      {channel}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                label="Cabin Class"
                name="cabinClass"
                rules={[{ required: true }]}
              >
                <AntSelect placeholder="Select cabin class">
                  {cabinClasses.map((cabin) => (
                    <AntSelect.Option key={cabin} value={cabin}>
                      {cabin}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                label="Trip Type"
                name="tripType"
                rules={[{ required: true }]}
              >
                <AntSelect placeholder="Select trip type">
                  {tripTypes.map((type) => (
                    <AntSelect.Option key={type} value={type}>
                      {type.replace("_", " ")}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                label="Point of Sale"
                name="pos"
                rules={[{ required: true }]}
              >
                <AntSelect
                  mode="tags"
                  placeholder="Enter country codes (e.g., US, GB)"
                ></AntSelect>
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                label="Agent Tiers"
                name="agentTier"
                rules={[{ required: true }]}
              >
                <AntSelect mode="multiple" placeholder="Select agent tiers">
                  {agentTiers.map((tier) => (
                    <AntSelect.Option key={tier} value={tier}>
                      {tier}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
          </Row>

          <AntForm.Item label="Eligible Cohorts (Optional)" name="cohortCodes">
            <AntSelect mode="tags" placeholder="Enter cohort codes"></AntSelect>
          </AntForm.Item>

          <Row gutter={16}>
            <Col span={8}>
              <AntForm.Item
                label="Adjustment Type"
                name="adjustmentType"
                rules={[{ required: true }]}
              >
                <AntSelect placeholder="Select type">
                  {adjustmentTypes.map((type) => (
                    <AntSelect.Option key={type} value={type}>
                      {type}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
            <Col span={8}>
              <AntForm.Item
                label="Adjustment Value"
                name="adjustmentValue"
                rules={[{ required: true }]}
              >
                <AntInputNumber placeholder="10" style={{ width: "100%" }} />
              </AntForm.Item>
            </Col>
            <Col span={8}>
              <AntForm.Item
                label="Priority"
                name="priority"
                rules={[{ required: true }]}
              >
                <AntInputNumber
                  min={1}
                  placeholder="1"
                  style={{ width: "100%" }}
                />
              </AntForm.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                label="Valid Dates"
                name="validDates"
                rules={[{ required: true }]}
              >
                <RangePicker style={{ width: "100%" }} />
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                label="Stackable"
                name="stackable"
                valuePropName="checked"
              >
                <AntSwitch />
              </AntForm.Item>
            </Col>
          </Row>

          <AntForm.Item>
            <div className="flex justify-end gap-2">
              <AntButton
                onClick={() => {
                  setIsCreateModalOpen(false);
                  antForm.resetFields();
                }}
              >
                Cancel
              </AntButton>
              <AntButton
                type="primary"
                htmlType="submit"
                loading={createRuleMutation.isPending}
              >
                Create Rule
              </AntButton>
            </div>
          </AntForm.Item>
        </AntForm>
      </Modal>

      {/* Edit Rule Modal */}
      <Modal
        title="Edit Discount Rule"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedRule(null);
          editForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <AntForm
          form={editForm}
          layout="vertical"
          onFinish={handleEditRule}
          className="space-y-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                label="Rule Code"
                name="ruleCode"
                rules={[{ required: true }]}
              >
                <AntInput placeholder="e.g., DISCOUNT_001" />
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                label="Fare Source"
                name="fareSource"
                rules={[{ required: true }]}
              >
                <AntSelect placeholder="Select fare source">
                  {fareSources.map((source) => (
                    <AntSelect.Option key={source} value={source}>
                      {source}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <AntForm.Item
                label="Origin"
                name="origin"
                rules={[{ required: true }]}
              >
                <AntInput placeholder="LHR" maxLength={3} />
              </AntForm.Item>
            </Col>
            <Col span={8}>
              <AntForm.Item
                label="Destination"
                name="destination"
                rules={[{ required: true }]}
              >
                <AntInput placeholder="JFK" maxLength={3} />
              </AntForm.Item>
            </Col>
            <Col span={8}>
              <AntForm.Item
                label="Channel"
                name="channel"
                rules={[{ required: true }]}
              >
                <AntSelect placeholder="Select channel">
                  {channels.map((channel) => (
                    <AntSelect.Option key={channel} value={channel}>
                      {channel}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                label="Cabin Class"
                name="cabinClass"
                rules={[{ required: true }]}
              >
                <AntSelect placeholder="Select cabin class">
                  {cabinClasses.map((cabin) => (
                    <AntSelect.Option key={cabin} value={cabin}>
                      {cabin}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                label="Trip Type"
                name="tripType"
                rules={[{ required: true }]}
              >
                <AntSelect placeholder="Select trip type">
                  {tripTypes.map((type) => (
                    <AntSelect.Option key={type} value={type}>
                      {type.replace("_", " ")}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                label="Point of Sale"
                name="pos"
                rules={[{ required: true }]}
              >
                <AntSelect
                  mode="tags"
                  placeholder="Enter country codes (e.g., US, GB)"
                ></AntSelect>
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                label="Agent Tiers"
                name="agentTier"
                rules={[{ required: true }]}
              >
                <AntSelect mode="multiple" placeholder="Select agent tiers">
                  {agentTiers.map((tier) => (
                    <AntSelect.Option key={tier} value={tier}>
                      {tier}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
          </Row>

          <AntForm.Item label="Eligible Cohorts (Optional)" name="cohortCodes">
            <AntSelect mode="tags" placeholder="Enter cohort codes"></AntSelect>
          </AntForm.Item>

          <Row gutter={16}>
            <Col span={8}>
              <AntForm.Item
                label="Adjustment Type"
                name="adjustmentType"
                rules={[{ required: true }]}
              >
                <AntSelect placeholder="Select type">
                  {adjustmentTypes.map((type) => (
                    <AntSelect.Option key={type} value={type}>
                      {type}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
            <Col span={8}>
              <AntForm.Item
                label="Adjustment Value"
                name="adjustmentValue"
                rules={[{ required: true }]}
              >
                <AntInputNumber placeholder="10" style={{ width: "100%" }} />
              </AntForm.Item>
            </Col>
            <Col span={8}>
              <AntForm.Item
                label="Priority"
                name="priority"
                rules={[{ required: true }]}
              >
                <AntInputNumber
                  min={1}
                  placeholder="1"
                  style={{ width: "100%" }}
                />
              </AntForm.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                label="Valid Dates"
                name="validDates"
                rules={[{ required: true }]}
              >
                <RangePicker style={{ width: "100%" }} />
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                label="Stackable"
                name="stackable"
                valuePropName="checked"
              >
                <AntSwitch />
              </AntForm.Item>
            </Col>
          </Row>

          <AntForm.Item>
            <div className="flex justify-end gap-2">
              <AntButton
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedRule(null);
                  editForm.resetFields();
                }}
              >
                Cancel
              </AntButton>
              <AntButton
                type="primary"
                htmlType="submit"
                loading={updateRuleMutation.isPending}
              >
                Update Rule
              </AntButton>
            </div>
          </AntForm.Item>
        </AntForm>
      </Modal>

      {/* View Rule Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Rule Details
              </h3>
              <p className="text-sm text-gray-500">
                Complete discount rule information
              </p>
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
            {/* Status Badge */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedRule.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      selectedRule.status === "ACTIVE"
                        ? "bg-green-400"
                        : "bg-red-400"
                    }`}
                  ></div>
                  {selectedRule.status}
                </span>
                {selectedRule.stackable === "true" && (
                  <Badge variant="outline">Stackable</Badge>
                )}
              </div>
              <div className="text-sm text-gray-500">ID: {selectedRule.id}</div>
            </div>

            {/* Main Rule Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Rule Information
              </h4>
              <Row gutter={[24, 16]}>
                <Col span={8}>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Rule Code
                    </label>
                    <div className="text-lg font-bold text-gray-900">
                      {selectedRule.ruleCode}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Fare Source
                    </label>
                    <div className="text-lg font-bold text-blue-600">
                      {selectedRule.fareSource}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Priority
                    </label>
                    <div className="text-lg font-bold text-green-600">
                      {selectedRule.priority}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Route Information */}
            <div className="bg-gray-50 rounded-lg p-6 border">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Route & Travel Details
              </h4>
              <Row gutter={[24, 16]}>
                <Col span={12}>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedRule.origin}
                      </div>
                      <div className="text-xs text-gray-500">Origin</div>
                    </div>
                    <div className="flex-1 flex items-center">
                      <div className="w-full h-px bg-gray-300 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white px-2 py-1 rounded-full border text-xs text-gray-600">
                            {selectedRule.tripType.replace("_", " ")}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedRule.destination}
                      </div>
                      <div className="text-xs text-gray-500">Destination</div>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cabin:</span>
                      <span className="font-medium">
                        {selectedRule.cabinClass}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Channel:</span>
                      <span className="font-medium">
                        {selectedRule.channel}
                      </span>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Adjustment Information */}
            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Adjustment Details
              </h4>
              <Row gutter={[24, 16]}>
                <Col span={12}>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Type
                    </label>
                    <div className="text-lg font-bold text-gray-900">
                      {selectedRule.adjustmentType}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Value
                    </label>
                    <div
                      className={`text-lg font-bold ${parseFloat(selectedRule.adjustmentValue) >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {parseFloat(selectedRule.adjustmentValue) >= 0 ? "+" : ""}
                      {selectedRule.adjustmentValue}
                      {selectedRule.adjustmentType === "PERCENT" ? "%" : ""}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Eligibility & Restrictions */}
            <div className="bg-white rounded-lg p-6 border">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Eligibility & Restrictions
              </h4>
              <Row gutter={[24, 16]}>
                <Col span={12}>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Point of Sale
                      </label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedRule.pos?.map((country, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {country}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Agent Tiers
                      </label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedRule.agentTier?.map((tier, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                              tier === "PLATINUM"
                                ? "bg-gray-100 text-gray-800"
                                : tier === "GOLD"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : tier === "SILVER"
                                    ? "bg-gray-100 text-gray-700"
                                    : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {tier}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Valid Period
                      </label>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">From:</span>
                          <span className="font-medium">
                            {formatDate(selectedRule.validFrom)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">To:</span>
                          <span className="font-medium">
                            {formatDate(selectedRule.validTo)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        )}
      </Modal>

      {/* Simulate Rule Modal */}
      <Modal
        title="Simulate Discount Rule"
        open={isSimulateModalOpen}
        onCancel={() => {
          setIsSimulateModalOpen(false);
          setSelectedRule(null);
          setSimulationResult(null);
          simulateForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <AntForm
          form={simulateForm}
          layout="vertical"
          onFinish={handleSimulate}
        >
          <AntForm.Item
            label="Base Fare"
            name="baseFare"
            rules={[{ required: true }]}
          >
            <AntInputNumber
              placeholder="Enter base fare amount"
              style={{ width: "100%" }}
              min={0}
              precision={2}
            />
          </AntForm.Item>

          <AntForm.Item
            label="Currency"
            name="currency"
            rules={[{ required: true }]}
          >
            <AntSelect placeholder="Select currency">
              <AntSelect.Option value="USD">USD</AntSelect.Option>
              <AntSelect.Option value="EUR">EUR</AntSelect.Option>
              <AntSelect.Option value="GBP">GBP</AntSelect.Option>
            </AntSelect>
          </AntForm.Item>

          {simulationResult && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold mb-2">Simulation Result</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Fare:</span>
                  <span>
                    {simulationResult.currency} {simulationResult.baseFare}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Adjustment:</span>
                  <span>
                    {simulationResult.adjustment.type === "PERCENT"
                      ? `${simulationResult.adjustment.value}%`
                      : `${simulationResult.currency} ${simulationResult.adjustment.value}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Final Fare:</span>
                  <span
                    className={
                      simulationResult.adjustedFare > simulationResult.baseFare
                        ? "text-red-600"
                        : "text-green-600"
                    }
                  >
                    {simulationResult.currency} {simulationResult.adjustedFare}
                  </span>
                </div>
              </div>
            </div>
          )}

          <AntForm.Item>
            <div className="flex justify-end gap-2">
              <AntButton
                onClick={() => {
                  setIsSimulateModalOpen(false);
                  setSelectedRule(null);
                  setSimulationResult(null);
                  simulateForm.resetFields();
                }}
              >
                Cancel
              </AntButton>
              <AntButton
                type="primary"
                htmlType="submit"
                loading={simulateRuleMutation.isPending}
              >
                Simulate
              </AntButton>
            </div>
          </AntForm.Item>
        </AntForm>
      </Modal>
    </div>
  );
}
