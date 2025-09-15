import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Button as AntButton,
  Modal,
  Row,
  Col,
  Upload,
  Tabs,
  message,
} from "antd";
import {
  TrendingUp,
  Plus,
  Filter,
  Eye,
  Edit,
  Calculator,
  Upload as UploadIcon,
  FileText,
  Shield,
  Hotel,
  Car,
  CreditCard,
  DollarSign,
} from "lucide-react";
import type { NonAirRate, NonAirMarkupRule } from "../../../shared/schema";
import dayjs from "dayjs";

const { RangePicker } = AntDatePicker;
const { TabPane } = Tabs;

interface RateFormData {
  supplierCode: string;
  productCode: string;
  productName: string;
  netRate: number;
  currency: string;
  region: string[];
  validFrom: string;
  validTo: string;
  inventory?: number;
}

interface RuleFormData {
  ruleCode: string;
  supplierCode?: string;
  productCode: string;
  pos: string[];
  agentTier: string[];
  cohortCodes?: string[];
  channel: string;
  adjustmentType: string;
  adjustmentValue: number;
  priority: number;
  validFrom: string;
  validTo: string;
}

const productCodes = [
  { value: "INS_STD", label: "Standard Travel Insurance", icon: "🛡️" },
  { value: "INS_PREMIUM", label: "Premium Travel Insurance", icon: "🛡️" },
  { value: "HOTEL_STD", label: "Standard Hotel", icon: "🏨" },
  { value: "HOTEL_LUXURY", label: "Luxury Hotel", icon: "🏨" },
  { value: "TRANSFER_STD", label: "Standard Transfer", icon: "🚗" },
  { value: "TRANSFER_PREMIUM", label: "Premium Transfer", icon: "🚗" },
  { value: "VISA_STD", label: "Standard Visa", icon: "📄" },
  { value: "VISA_EXPRESS", label: "Express Visa", icon: "📄" },
  { value: "FOREX_STD", label: "Standard Forex", icon: "💱" },
  { value: "FOREX_PREMIUM", label: "Premium Forex", icon: "💱" },
];

const agentTiers = ["PLATINUM", "GOLD", "SILVER", "BRONZE"];
const channels = ["API", "PORTAL", "MOBILE"];
const adjustmentTypes = ["PERCENT", "AMOUNT"];
const currencies = ["USD", "EUR", "GBP", "INR", "AED", "SAR"];
const regions = ["US", "EU", "UK", "IN", "AE", "SA", "KW", "QA", "BH", "OM"];

const getProductIcon = (code: string) => {
  const product = productCodes.find((p) => p.value === code);
  return product?.icon || "📦";
};

const getProductLabel = (code: string) => {
  const product = productCodes.find((p) => p.value === code);
  return product?.label || code;
};

export default function NonAirAncillaries() {
  const [activeTab, setActiveTab] = useState("rates");
  const [filters, setFilters] = useState({});
  const [ruleFilters, setRuleFilters] = useState({});
  const [isCreateRateModalOpen, setIsCreateRateModalOpen] = useState(false);
  const [isCreateRuleModalOpen, setIsCreateRuleModalOpen] = useState(false);
  const [isViewRateModalOpen, setIsViewRateModalOpen] = useState(false);
  const [isViewRuleModalOpen, setIsViewRuleModalOpen] = useState(false);
  const [isEditRateModalOpen, setIsEditRateModalOpen] = useState(false);
  const [isEditRuleModalOpen, setIsEditRuleModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState<NonAirRate | null>(null);
  const [selectedRule, setSelectedRule] = useState<NonAirMarkupRule | null>(
    null,
  );
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const queryClient = useQueryClient();
  const [rateForm] = AntForm.useForm();
  const [ruleForm] = AntForm.useForm();
  const [editRateForm] = AntForm.useForm();
  const [editRuleForm] = AntForm.useForm();
  const [simulateForm] = AntForm.useForm();
  const { toast } = useToast();

  // Fetch non-air rates
  const { data: rates = [], isLoading: ratesLoading } = useQuery({
    queryKey: ["non-air-rates", filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/nonair/rates?${params}`);
      if (!response.ok) throw new Error("Failed to fetch rates");
      return response.json();
    },
  });

  // Fetch non-air markup rules
  const { data: rules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ["non-air-rules", ruleFilters],
    queryFn: async () => {
      const params = new URLSearchParams(ruleFilters);
      const response = await fetch(`/api/nonair/rules?${params}`);
      if (!response.ok) throw new Error("Failed to fetch rules");
      return response.json();
    },
  });

  // Fetch cohorts
  const { data: availableCohorts = [], isLoading: isCohortsLoading } = useQuery({
    queryKey: ["cohorts"],
    queryFn: async () => {
      const response = await fetch("/api/cohorts");
      if (!response.ok) throw new Error("Failed to fetch cohorts");
      return response.json();
    },
  });

  // Create rate mutation
  const createRateMutation = useMutation({
    mutationFn: async (data: RateFormData) => {
      const response = await fetch("/api/nonair/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create rate");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["non-air-rates"] });
      setIsCreateRateModalOpen(false);
      rateForm.resetFields();
      toast({ title: "Rate created successfully" });
    },
  });

  // Create rule mutation
  const createRuleMutation = useMutation({
    mutationFn: async (data: RuleFormData) => {
      const response = await fetch("/api/nonair/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create rule");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["non-air-rules"] });
      setIsCreateRuleModalOpen(false);
      ruleForm.resetFields();
      toast({ title: "Rule created successfully" });
    },
  });

  // Update rate mutation
  const updateRateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RateFormData }) => {
      const response = await fetch(`/api/nonair/rates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update rate");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["non-air-rates"] });
      setIsEditRateModalOpen(false);
      editRateForm.resetFields();
      toast({ title: "Rate updated successfully" });
    },
  });

  // Update rule mutation
  const updateRuleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RuleFormData }) => {
      const response = await fetch(`/api/nonair/rules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update rule");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["non-air-rules"] });
      setIsEditRuleModalOpen(false);
      editRuleForm.resetFields();
      toast({ title: "Rule updated successfully" });
    },
  });

  // Simulate rule mutation
  const simulateRuleMutation = useMutation({
    mutationFn: async (data: {
      baseRate: number;
      currency: string;
      ruleId: string;
    }) => {
      const response = await fetch("/api/nonair/rules/simulate", {
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

  // Upload rates mutation
  const uploadRatesMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/nonair/rates/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload rates");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["non-air-rates"] });
      setIsUploadModalOpen(false);
      toast({
        title: "Upload completed",
        description: `${data.inserted} rates uploaded, ${data.errors} errors`,
      });
    },
  });

  const handleCreateRate = (values: any) => {
    const formattedData = {
      ...values,
      validFrom: values.validDates[0].format("YYYY-MM-DD"),
      validTo: values.validDates[1].format("YYYY-MM-DD"),
      netRate: values.netRate.toString(),
    };
    delete formattedData.validDates;
    createRateMutation.mutate(formattedData);
  };

  const handleCreateRule = (values: any) => {
    const formattedData = {
      ...values,
      validFrom: values.validDates[0].format("YYYY-MM-DD"),
      validTo: values.validDates[1].format("YYYY-MM-DD"),
      cohortCodes: values.cohortCodes || [],
      adjustmentValue: values.adjustmentValue.toString(),
    };
    delete formattedData.validDates;
    createRuleMutation.mutate(formattedData);
  };

  const handleEditRate = (values: any) => {
    const formattedData = {
      ...values,
      validFrom: values.validDates[0].format("YYYY-MM-DD"),
      validTo: values.validDates[1].format("YYYY-MM-DD"),
      netRate: values.netRate.toString(),
    };
    delete formattedData.validDates;
    updateRateMutation.mutate({ id: selectedRate!.id, data: formattedData });
  };

  const handleEditRule = (values: any) => {
    const formattedData = {
      ...values,
      validFrom: values.validDates[0].format("YYYY-MM-DD"),
      validTo: values.validDates[1].format("YYYY-MM-DD"),
      cohortCodes: values.cohortCodes || [],
      adjustmentValue: values.adjustmentValue.toString(),
    };
    delete formattedData.validDates;
    updateRuleMutation.mutate({ id: selectedRule!.id, data: formattedData });
  };

  const handleSimulateRule = (values: any) => {
    simulateRuleMutation.mutate(values);
  };

  const openEditRateModal = (rate: NonAirRate) => {
    setSelectedRate(rate);
    editRateForm.setFieldsValue({
      ...rate,
      validDates: [dayjs(rate.validFrom), dayjs(rate.validTo)],
      netRate: parseFloat(rate.netRate),
    });
    setIsEditRateModalOpen(true);
  };

  const openEditRuleModal = (rule: NonAirMarkupRule) => {
    setSelectedRule(rule);
    editRuleForm.setFieldsValue({
      ...rule,
      validDates: [dayjs(rule.validFrom), dayjs(rule.validTo)],
      adjustmentValue: parseFloat(rule.adjustmentValue),
      cohortCodes: rule.cohortCodes || [],
    });
    setIsEditRuleModalOpen(true);
  };

  const openViewRateModal = (rate: NonAirRate) => {
    setSelectedRate(rate);
    setIsViewRateModalOpen(true);
  };

  const openViewRuleModal = (rule: NonAirMarkupRule) => {
    setSelectedRule(rule);
    setIsViewRuleModalOpen(true);
  };

  if (ratesLoading && rulesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="text-lg font-medium text-gray-600">
            Loading non-air data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Supplier Rates" key="rates">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Input
                  placeholder="Search by supplier or product..."
                  className="w-64"
                  onChange={(e) =>
                    setFilters({ ...filters, supplierCode: e.target.value })
                  }
                />
                <AntSelect
                  placeholder="Product Code"
                  style={{ width: 200 }}
                  allowClear
                  onChange={(value) =>
                    setFilters({ ...filters, productCode: value })
                  }
                >
                  {productCodes.map((product) => (
                    <AntSelect.Option key={product.value} value={product.value}>
                      {product.icon} {product.label}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setIsUploadModalOpen(true)}
                  variant="outline"
                >
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Upload CSV
                </Button>
                <Button onClick={() => setIsCreateRateModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Rate
                </Button>
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier & Product</TableHead>
                    <TableHead>Net Rate</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Valid Period</TableHead>
                    <TableHead>Inventory</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rates.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">
                            {getProductIcon(rate.productCode)}
                          </span>
                          <div>
                            <div className="font-medium">
                              {rate.supplierCode}
                            </div>
                            <div className="text-sm text-gray-500">
                              {getProductLabel(rate.productCode)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {rate.currency} {parseFloat(rate.netRate).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {Array.isArray(rate.region)
                            ? rate.region.join(", ")
                            : rate.region}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {rate.validFrom} to {rate.validTo}
                      </TableCell>
                      <TableCell className="text-sm">
                        {rate.inventory || "Unlimited"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            rate.status === "ACTIVE" ? "default" : "secondary"
                          }
                        >
                          {rate.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewRateModal(rate)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditRateModal(rate)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </TabPane>

        <TabPane tab="Markup Rules" key="rules">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Input
                  placeholder="Search by rule code..."
                  className="w-64"
                  onChange={(e) =>
                    setRuleFilters({ ...ruleFilters, ruleCode: e.target.value })
                  }
                />
                <AntSelect
                  placeholder="Product Code"
                  style={{ width: 200 }}
                  allowClear
                  onChange={(value) =>
                    setRuleFilters({ ...ruleFilters, productCode: value })
                  }
                >
                  {productCodes.map((product) => (
                    <AntSelect.Option key={product.value} value={product.value}>
                      {product.icon} {product.label}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setIsSimulateModalOpen(true)}
                  variant="outline"
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  Simulate
                </Button>
                <Button onClick={() => setIsCreateRuleModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Rule
                </Button>
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule Code</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Adjustment</TableHead>
                    <TableHead>Agent Tiers</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div className="font-medium">{rule.ruleCode}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">
                            {getProductIcon(rule.productCode)}
                          </span>
                          <div>
                            <div className="font-medium">
                              {rule.productCode}
                            </div>
                            <div className="text-sm text-gray-500">
                              {rule.supplierCode || "All Suppliers"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{rule.channel}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div
                            className={`font-medium ${
                              rule.adjustmentType === "PERCENT"
                                ? "text-blue-600"
                                : "text-orange-600"
                            }`}
                          >
                            {rule.adjustmentType === "PERCENT"
                              ? `+${rule.adjustmentValue}%`
                              : `+$${rule.adjustmentValue}`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(rule.agentTier) &&
                            rule.agentTier.map((tier) => (
                              <Badge
                                key={tier}
                                variant="outline"
                                className="text-xs"
                              >
                                {tier}
                              </Badge>
                            ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{rule.priority}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            rule.status === "ACTIVE" ? "default" : "secondary"
                          }
                        >
                          {rule.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewRuleModal(rule)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditRuleModal(rule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </TabPane>
      </Tabs>

      {/* Create Rate Modal */}
      <Modal
        title="Create New Rate"
        open={isCreateRateModalOpen}
        onCancel={() => setIsCreateRateModalOpen(false)}
        footer={null}
        width={800}
      >
        <AntForm form={rateForm} onFinish={handleCreateRate} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                name="supplierCode"
                label="Supplier Code"
                rules={[{ required: true, message: "Required" }]}
              >
                <AntInput placeholder="INSURECO" />
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                name="productCode"
                label="Product Code"
                rules={[{ required: true, message: "Required" }]}
              >
                <AntSelect placeholder="Select product">
                  {productCodes.map((product) => (
                    <AntSelect.Option key={product.value} value={product.value}>
                      {product.icon} {product.label}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
          </Row>
          <AntForm.Item
            name="productName"
            label="Product Name"
            rules={[{ required: true, message: "Required" }]}
          >
            <AntInput placeholder="Standard Travel Insurance" />
          </AntForm.Item>
          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                name="netRate"
                label="Net Rate"
                rules={[{ required: true, message: "Required" }]}
              >
                <AntInputNumber
                  style={{ width: "100%" }}
                  placeholder="500.00"
                  min={0}
                  precision={2}
                />
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                name="currency"
                label="Currency"
                rules={[{ required: true, message: "Required" }]}
              >
                <AntSelect placeholder="Select currency">
                  {currencies.map((curr) => (
                    <AntSelect.Option key={curr} value={curr}>
                      {curr}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                name="region"
                label="Region"
                rules={[{ required: true, message: "Required" }]}
              >
                <AntSelect mode="multiple" placeholder="Select regions">
                  {regions.map((region) => (
                    <AntSelect.Option key={region} value={region}>
                      {region}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item name="inventory" label="Inventory (Optional)">
                <AntInputNumber
                  style={{ width: "100%" }}
                  placeholder="100"
                  min={0}
                />
              </AntForm.Item>
            </Col>
          </Row>
          <AntForm.Item
            name="validDates"
            label="Valid Period"
            rules={[{ required: true, message: "Required" }]}
          >
            <RangePicker style={{ width: "100%" }} />
          </AntForm.Item>
          <div className="flex justify-end space-x-2">
            <AntButton onClick={() => setIsCreateRateModalOpen(false)}>
              Cancel
            </AntButton>
            <AntButton
              type="primary"
              htmlType="submit"
              loading={createRateMutation.isPending}
            >
              Create Rate
            </AntButton>
          </div>
        </AntForm>
      </Modal>

      {/* Create Rule Modal */}
      <Modal
        title="Create New Markup Rule"
        open={isCreateRuleModalOpen}
        onCancel={() => setIsCreateRuleModalOpen(false)}
        footer={null}
        width={800}
      >
        <AntForm form={ruleForm} onFinish={handleCreateRule} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                name="ruleCode"
                label="Rule Code"
                rules={[{ required: true, message: "Required" }]}
              >
                <AntInput placeholder="INS_MARKUP_GCC_GOLD" />
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                name="productCode"
                label="Product Code"
                rules={[{ required: true, message: "Required" }]}
              >
                <AntInput placeholder="INS_* (wildcards allowed)" />
              </AntForm.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                name="supplierCode"
                label="Supplier Code (Optional)"
              >
                <AntInput placeholder="INSURECO (optional)" />
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                name="channel"
                label="Channel"
                rules={[{ required: true, message: "Required" }]}
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
                name="pos"
                label="Point of Sale"
                rules={[{ required: true, message: "Required" }]}
              >
                <AntSelect mode="multiple" placeholder="Select regions">
                  {regions.map((region) => (
                    <AntSelect.Option key={region} value={region}>
                      {region}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                name="agentTier"
                label="Agent Tiers"
                rules={[{ required: true, message: "Required" }]}
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
          <AntForm.Item
            name="cohortCodes"
            label="Cohort Codes (Optional)"
            tooltip="Select cohorts that are eligible for this markup rule. Only users matching these cohorts will see this adjusted pricing."
          >
            <AntSelect
              mode="multiple"
              placeholder={
                isCohortsLoading
                  ? "Loading cohorts..."
                  : availableCohorts.length === 0
                    ? "No cohorts available"
                    : "Select cohorts"
              }
              style={{ width: "100%" }}
              dropdownStyle={{ zIndex: 9999 }}
              getPopupContainer={(trigger) => trigger.parentElement}
              virtual={false}
              showSearch
              loading={isCohortsLoading}
              disabled={isCohortsLoading}
              notFoundContent={
                isCohortsLoading ? "Loading..." : "No cohorts found"
              }
              filterOption={(input, option) => {
                const label =
                  option?.children?.props?.children?.[0]?.props?.children ||
                  option?.value ||
                  "";
                const code =
                  option?.children?.props?.children?.[1]?.props?.children ||
                  option?.value ||
                  "";
                return (
                  label.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
                  code.toLowerCase().indexOf(input.toLowerCase()) >= 0
                );
              }}
            >
              {availableCohorts.map((cohort: any) => (
                <AntSelect.Option key={cohort.id} value={cohort.cohortCode}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      padding: "2px 0",
                    }}
                  >
                    <div className="cls-cohort-dropdwon">
                      <p>{cohort.cohortName}</p>{" "}
                      <span className="text-gray-600">{cohort.cohortCode}</span>
                    </div>
                  </div>
                </AntSelect.Option>
              ))}
            </AntSelect>
          </AntForm.Item>
          <Row gutter={16}>
            <Col span={8}>
              <AntForm.Item
                name="adjustmentType"
                label="Adjustment Type"
                rules={[{ required: true, message: "Required" }]}
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
                name="adjustmentValue"
                label="Adjustment Value"
                rules={[{ required: true, message: "Required" }]}
              >
                <AntInputNumber
                  style={{ width: "100%" }}
                  placeholder="20"
                  min={0}
                  precision={2}
                />
              </AntForm.Item>
            </Col>
            <Col span={8}>
              <AntForm.Item
                name="priority"
                label="Priority"
                rules={[{ required: true, message: "Required" }]}
                initialValue={1}
              >
                <AntInputNumber style={{ width: "100%" }} min={1} max={100} />
              </AntForm.Item>
            </Col>
          </Row>
          <AntForm.Item
            name="validDates"
            label="Valid Period"
            rules={[{ required: true, message: "Required" }]}
          >
            <RangePicker style={{ width: "100%" }} />
          </AntForm.Item>
          <div className="flex justify-end space-x-2">
            <AntButton onClick={() => setIsCreateRuleModalOpen(false)}>
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
        </AntForm>
      </Modal>

      {/* Upload Modal */}
      <Modal
        title="Upload Non-Air Rates CSV"
        open={isUploadModalOpen}
        onCancel={() => setIsUploadModalOpen(false)}
        footer={null}
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Upload a CSV file with the following columns: supplierCode,
            productCode, productName, netRate, currency, region, validFrom,
            validTo, inventory
          </div>
          <Upload
            beforeUpload={(file) => {
              uploadRatesMutation.mutate(file);
              return false;
            }}
            accept=".csv"
          >
            <AntButton icon={<UploadIcon />}>Click to Upload</AntButton>
          </Upload>
        </div>
      </Modal>

      {/* Simulate Modal */}
      <Modal
        title="Simulate Markup Rule"
        open={isSimulateModalOpen}
        onCancel={() => setIsSimulateModalOpen(false)}
        footer={null}
      >
        <AntForm
          form={simulateForm}
          onFinish={handleSimulateRule}
          layout="vertical"
        >
          <AntForm.Item
            name="ruleId"
            label="Select Rule"
            rules={[{ required: true, message: "Required" }]}
          >
            <AntSelect placeholder="Select a rule to simulate">
              {rules.map((rule) => (
                <AntSelect.Option key={rule.id} value={rule.id}>
                  {rule.ruleCode} - {rule.productCode}
                </AntSelect.Option>
              ))}
            </AntSelect>
          </AntForm.Item>
          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                name="baseRate"
                label="Base Rate"
                rules={[{ required: true, message: "Required" }]}
              >
                <AntInputNumber
                  style={{ width: "100%" }}
                  placeholder="500.00"
                  min={0}
                  precision={2}
                />
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                name="currency"
                label="Currency"
                rules={[{ required: true, message: "Required" }]}
              >
                <AntSelect placeholder="Select currency">
                  {currencies.map((curr) => (
                    <AntSelect.Option key={curr} value={curr}>
                      {curr}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
          </Row>
          <div className="flex justify-end space-x-2">
            <AntButton onClick={() => setIsSimulateModalOpen(false)}>
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
        </AntForm>

        {simulationResult && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Simulation Result</h4>
            <div className="space-y-2 text-sm">
              <div>
                Base Rate: {simulationResult.currency}{" "}
                {simulationResult.baseRate}
              </div>
              <div>
                Markup: {simulationResult.currency} {simulationResult.markup}
              </div>
              <div className="font-semibold">
                Final Rate: {simulationResult.currency}{" "}
                {simulationResult.adjustedRate}
              </div>
              <div>Rule Applied: {simulationResult.ruleApplied}</div>
            </div>
          </div>
        )}
      </Modal>

      {/* View Rate Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-3">
            <span className="text-2xl">
              {selectedRate ? getProductIcon(selectedRate.productCode) : "📦"}
            </span>
            <div>
              <h3 className="text-lg font-semibold">Supplier Rate Details</h3>
              <p className="text-sm text-gray-500">
                {selectedRate ? selectedRate.supplierCode : ""}
              </p>
            </div>
          </div>
        }
        open={isViewRateModalOpen}
        onCancel={() => setIsViewRateModalOpen(false)}
        footer={[
          <AntButton key="close" onClick={() => setIsViewRateModalOpen(false)}>
            Close
          </AntButton>,
        ]}
        width={650}
      >
        {selectedRate && (
          <div className="space-y-6">
            {/* Product Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                <span className="mr-2">🏷️</span>
                Product Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Product Name
                  </label>
                  <div className="font-medium text-gray-900">
                    {selectedRate.productName || getProductLabel(selectedRate.productCode)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Code: {selectedRate.productCode}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Supplier
                  </label>
                  <div className="font-medium text-gray-900">
                    {selectedRate.supplierCode}
                  </div>
                  <div className="text-sm text-gray-500">
                    Supplier Code
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center">
                <DollarSign className="mr-2 h-4 w-4" />
                Pricing Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Net Rate
                  </label>
                  <div className="text-2xl font-bold text-green-600">
                    {selectedRate.currency} {parseFloat(selectedRate.netRate).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Base supplier rate
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Currency
                  </label>
                  <div className="font-medium text-gray-900">
                    {selectedRate.currency}
                  </div>
                  <div className="text-sm text-gray-500">
                    Pricing currency
                  </div>
                </div>
              </div>
            </div>

            {/* Availability & Coverage */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-purple-800 mb-3 flex items-center">
                <span className="mr-2">🌍</span>
                Availability & Coverage
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Regions Available
                  </label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(Array.isArray(selectedRate.region) 
                      ? selectedRate.region 
                      : [selectedRate.region]
                    ).map((region, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-purple-100 text-purple-800 border-purple-300"
                      >
                        {region}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Countries/regions where this rate applies
                  </div>
                </div>
                {selectedRate.inventory && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Inventory Available
                    </label>
                    <div className="font-medium text-gray-900">
                      {selectedRate.inventory} units
                    </div>
                    <div className="text-xs text-gray-500">
                      Available stock for booking
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Validity Period */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-orange-800 mb-3 flex items-center">
                <span className="mr-2">📅</span>
                Validity Period
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Valid From
                  </label>
                  <div className="font-medium text-gray-900">
                    {selectedRate.validFrom}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Valid To
                  </label>
                  <div className="font-medium text-gray-900">
                    {selectedRate.validTo}
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Rate is active between these dates (inclusive)
              </div>
            </div>

            {/* Status Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <span className="mr-2">ℹ️</span>
                Status & Metadata
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <div>
                    <Badge
                      variant={
                        selectedRate.status === "ACTIVE" ? "default" : "secondary"
                      }
                      className={
                        selectedRate.status === "ACTIVE" 
                          ? "bg-green-100 text-green-800 border-green-300" 
                          : ""
                      }
                    >
                      {selectedRate.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Rate ID
                  </label>
                  <div className="font-mono text-sm text-gray-600">
                    {selectedRate.id}
                  </div>
                </div>
              </div>
              {(selectedRate.createdAt || selectedRate.updatedAt) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    {selectedRate.createdAt && (
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <div className="text-gray-700">
                          {new Date(selectedRate.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                    {selectedRate.updatedAt && (
                      <div>
                        <span className="text-gray-500">Updated:</span>
                        <div className="text-gray-700">
                          {new Date(selectedRate.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* View Rule Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <span className="text-lg">📋</span>
            <span>Markup Rule Details</span>
          </div>
        }
        open={isViewRuleModalOpen}
        onCancel={() => setIsViewRuleModalOpen(false)}
        footer={[
          <AntButton key="close" onClick={() => setIsViewRuleModalOpen(false)}>
            Close
          </AntButton>,
        ]}
        width={600}
      >
        {selectedRule && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800 mb-3">
                Basic Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Rule Code
                  </label>
                  <div className="font-medium text-gray-900">
                    {selectedRule.ruleCode}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Priority
                  </label>
                  <div className="font-medium text-gray-900">
                    {selectedRule.priority}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Product Code
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {getProductIcon(selectedRule.productCode)}
                    </span>
                    <div>
                      <div className="font-medium text-gray-900">
                        {selectedRule.productCode}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getProductLabel(selectedRule.productCode)}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Supplier Code
                  </label>
                  <div className="font-medium text-gray-900">
                    {selectedRule.supplierCode || "All Suppliers"}
                  </div>
                </div>
              </div>
            </div>

            {/* Adjustment Details */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-green-800 mb-3">
                Adjustment Configuration
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Adjustment Type
                  </label>
                  <div className="font-medium text-gray-900">
                    {selectedRule.adjustmentType}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Adjustment Value
                  </label>
                  <div className={`font-bold text-lg ${
                    selectedRule.adjustmentType === "PERCENT"
                      ? "text-blue-600"
                      : "text-orange-600"
                  }`}>
                    {selectedRule.adjustmentType === "PERCENT"
                      ? `+${selectedRule.adjustmentValue}%`
                      : `+$${selectedRule.adjustmentValue}`}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Channel
                  </label>
                  <div className="font-medium text-gray-900">
                    {selectedRule.channel}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <Badge
                    variant={
                      selectedRule.status === "ACTIVE" ? "default" : "secondary"
                    }
                  >
                    {selectedRule.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Targeting Rules */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-purple-800 mb-3">
                Targeting Rules
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Agent Tiers
                  </label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Array.isArray(selectedRule.agentTier) &&
                      selectedRule.agentTier.map((tier) => (
                        <Badge
                          key={tier}
                          variant="outline"
                          className="bg-blue-100 text-blue-800"
                        >
                          {tier}
                        </Badge>
                      ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Point of Sale
                  </label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Array.isArray(selectedRule.pos) &&
                      selectedRule.pos.map((region) => (
                        <Badge
                          key={region}
                          variant="outline"
                          className="bg-green-100 text-green-800"
                        >
                          {region}
                        </Badge>
                      ))}
                  </div>
                </div>
                {selectedRule.cohortCodes && selectedRule.cohortCodes.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Eligible Cohorts
                    </label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedRule.cohortCodes.map((cohortCode, index) => {
                        const cohort = availableCohorts.find((c: any) => 
                          c.cohortName === cohortCode || c.cohortCode === cohortCode
                        );
                        return (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800"
                            title={cohort ? `${cohort.cohortName} (${cohort.cohortCode})` : cohortCode}
                          >
                            {cohort ? cohort.cohortCode : cohortCode}
                          </span>
                        );
                      })}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      This markup will only apply to users in these cohorts
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Validity Period */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-orange-800 mb-3">
                Validity Period
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Valid From
                  </label>
                  <div className="font-medium text-gray-900">
                    {selectedRule.validFrom}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Valid To
                  </label>
                  <div className="font-medium text-gray-900">
                    {selectedRule.validTo}
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Rule is active between these dates (inclusive)
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Rate Modal */}
      <Modal
        title="Edit Rate"
        open={isEditRateModalOpen}
        onCancel={() => setIsEditRateModalOpen(false)}
        footer={null}
        width={800}
      >
        <AntForm
          form={editRateForm}
          onFinish={handleEditRate}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                name="supplierCode"
                label="Supplier Code"
                rules={[{ required: true, message: "Required" }]}
              >
                <AntInput placeholder="INSURECO" />
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                name="productCode"
                label="Product Code"
                rules={[{ required: true, message: "Required" }]}
              >
                <AntSelect placeholder="Select product">
                  {productCodes.map((product) => (
                    <AntSelect.Option key={product.value} value={product.value}>
                      {product.icon} {product.label}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
          </Row>
          <AntForm.Item
            name="productName"
            label="Product Name"
            rules={[{ required: true, message: "Required" }]}
          >
            <AntInput placeholder="Standard Travel Insurance" />
          </AntForm.Item>
          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                name="netRate"
                label="Net Rate"
                rules={[{ required: true, message: "Required" }]}
              >
                <AntInputNumber
                  style={{ width: "100%" }}
                  placeholder="500.00"
                  min={0}
                  precision={2}
                />
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                name="currency"
                label="Currency"
                rules={[{ required: true, message: "Required" }]}
              >
                <AntSelect placeholder="Select currency">
                  {currencies.map((curr) => (
                    <AntSelect.Option key={curr} value={curr}>
                      {curr}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                name="region"
                label="Region"
                rules={[{ required: true, message: "Required" }]}
              >
                <AntSelect mode="multiple" placeholder="Select regions">
                  {regions.map((region) => (
                    <AntSelect.Option key={region} value={region}>
                      {region}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item name="inventory" label="Inventory (Optional)">
                <AntInputNumber
                  style={{ width: "100%" }}
                  placeholder="100"
                  min={0}
                />
              </AntForm.Item>
            </Col>
          </Row>
          <AntForm.Item
            name="validDates"
            label="Valid Period"
            rules={[{ required: true, message: "Required" }]}
          >
            <RangePicker style={{ width: "100%" }} />
          </AntForm.Item>
          <div className="flex justify-end space-x-2">
            <AntButton onClick={() => setIsEditRateModalOpen(false)}>
              Cancel
            </AntButton>
            <AntButton
              type="primary"
              htmlType="submit"
              loading={updateRateMutation.isPending}
            >
              Update Rate
            </AntButton>
          </div>
        </AntForm>
      </Modal>

      {/* Edit Rule Modal */}
      <Modal
        title="Edit Markup Rule"
        open={isEditRuleModalOpen}
        onCancel={() => setIsEditRuleModalOpen(false)}
        footer={null}
        width={800}
      >
        <AntForm
          form={editRuleForm}
          onFinish={handleEditRule}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                name="ruleCode"
                label="Rule Code"
                rules={[{ required: true, message: "Required" }]}
              >
                <AntInput placeholder="INS_MARKUP_GCC_GOLD" />
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                name="productCode"
                label="Product Code"
                rules={[{ required: true, message: "Required" }]}
              >
                <AntInput placeholder="INS_* (wildcards allowed)" />
              </AntForm.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                name="supplierCode"
                label="Supplier Code (Optional)"
              >
                <AntInput placeholder="INSURECO (optional)" />
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                name="channel"
                label="Channel"
                rules={[{ required: true, message: "Required" }]}
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
                name="pos"
                label="Point of Sale"
                rules={[{ required: true, message: "Required" }]}
              >
                <AntSelect mode="multiple" placeholder="Select regions">
                  {regions.map((region) => (
                    <AntSelect.Option key={region} value={region}>
                      {region}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                name="agentTier"
                label="Agent Tiers"
                rules={[{ required: true, message: "Required" }]}
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
          <AntForm.Item
            name="cohortCodes"
            label="Cohort Codes (Optional)"
            tooltip="Select cohorts that are eligible for this markup rule. Only users matching these cohorts will see this adjusted pricing."
          >
            <AntSelect
              mode="multiple"
              placeholder={
                isCohortsLoading
                  ? "Loading cohorts..."
                  : availableCohorts.length === 0
                    ? "No cohorts available"
                    : "Select cohorts"
              }
              style={{ width: "100%" }}
              dropdownStyle={{ zIndex: 9999 }}
              getPopupContainer={(trigger) => trigger.parentElement}
              virtual={false}
              showSearch
              loading={isCohortsLoading}
              disabled={isCohortsLoading}
              notFoundContent={
                isCohortsLoading ? "Loading..." : "No cohorts found"
              }
              filterOption={(input, option) => {
                const label =
                  option?.children?.props?.children?.[0]?.props?.children ||
                  option?.value ||
                  "";
                const code =
                  option?.children?.props?.children?.[1]?.props?.children ||
                  option?.value ||
                  "";
                return (
                  label.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
                  code.toLowerCase().indexOf(input.toLowerCase()) >= 0
                );
              }}
            >
              {availableCohorts.map((cohort: any) => (
                <AntSelect.Option key={cohort.id} value={cohort.cohortCode}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      padding: "2px 0",
                    }}
                  >
                    <div className="cls-cohort-dropdwon">
                      <p>{cohort.cohortName}</p>{" "}
                      <span className="text-gray-600">{cohort.cohortCode}</span>
                    </div>
                  </div>
                </AntSelect.Option>
              ))}
            </AntSelect>
          </AntForm.Item>
          <Row gutter={16}>
            <Col span={8}>
              <AntForm.Item
                name="adjustmentType"
                label="Adjustment Type"
                rules={[{ required: true, message: "Required" }]}
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
                name="adjustmentValue"
                label="Adjustment Value"
                rules={[{ required: true, message: "Required" }]}
              >
                <AntInputNumber
                  style={{ width: "100%" }}
                  placeholder="20"
                  min={0}
                  precision={2}
                />
              </AntForm.Item>
            </Col>
            <Col span={8}>
              <AntForm.Item
                name="priority"
                label="Priority"
                rules={[{ required: true, message: "Required" }]}
              >
                <AntInputNumber style={{ width: "100%" }} min={1} max={100} />
              </AntForm.Item>
            </Col>
          </Row>
          <AntForm.Item
            name="validDates"
            label="Valid Period"
            rules={[{ required: true, message: "Required" }]}
          >
            <RangePicker style={{ width: "100%" }} />
          </AntForm.Item>
          <div className="flex justify-end space-x-2">
            <AntButton onClick={() => setIsEditRuleModalOpen(false)}>
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
        </AntForm>
      </Modal>
    </div>
  );
}