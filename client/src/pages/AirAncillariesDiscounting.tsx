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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  message,
  Checkbox as AntCheckbox,
} from "antd";
import {
  TrendingUp,
  Plus,
  Filter,
  Eye,
  Edit,
  Calculator,
  Tags,
  Gift,
  Plane,
  Utensils,
  Wifi,
} from "lucide-react";
import type { AirAncillaryRule } from "../../../shared/schema";
import dayjs from "dayjs";

const { RangePicker } = AntDatePicker;

interface RuleFormData {
  ruleCode: string;
  ancillaryCode: string;
  airlineCode?: string;
  origin?: string;
  destination?: string;
  pos: string[];
  channel: string;
  agentTier: string[];
  cohortCodes?: string[];
  conditionBehavior?: string;
  adjustmentType: string;
  adjustmentValue?: number;
  priority: number;
  validFrom: string;
  validTo: string;
}

const ancillaryCodes = [
  { value: "BAG20", label: "Checked Bag 20kg", icon: "🧳" },
  { value: "BAG32", label: "Checked Bag 32kg", icon: "🧳" },
  { value: "SEAT_STD", label: "Standard Seat", icon: "💺" },
  { value: "SEAT_EXTRA", label: "Extra Legroom", icon: "💺" },
  { value: "MEAL_STD", label: "Standard Meal", icon: "🍽️" },
  { value: "MEAL_SPECIAL", label: "Special Meal", icon: "🍽️" },
  { value: "WIFI_STD", label: "Standard WiFi", icon: "📶" },
  { value: "WIFI_PREMIUM", label: "Premium WiFi", icon: "📶" },
  { value: "LOUNGE_PASS", label: "Lounge Access", icon: "🏨" },
  { value: "PRIORITY_BOARDING", label: "Priority Boarding", icon: "✈️" },
];

const agentTiers = ["PLATINUM", "GOLD", "SILVER", "BRONZE"];
const channels = ["API", "PORTAL", "MOBILE"];
const adjustmentTypes = ["PERCENT", "AMOUNT", "FREE"];
const conditionBehaviors = ["SKIPPED_ANCILLARY", "POST_BOOKING"];

// Placeholder for countries data, ideally fetched or imported
const countriesData = [
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "KW", name: "Kuwait" },
  { code: "BH", name: "Bahrain" },
  { code: "QA", name: "Qatar" },
  { code: "OM", name: "Oman" },
  { code: "EG", name: "Egypt" },
  { code: "LB", name: "Lebanon" },
  { code: "JO", name: "Jordan" },
  { code: "SY", name: "Syria" },
  { code: "IQ", name: "Iraq" },
  { code: "DZ", name: "Algeria" },
  { code: "MA", name: "Morocco" },
  { code: "TN", name: "Tunisia" },
  { code: "LY", name: "Libya" },
  { code: "SD", name: "Sudan" },
  { code: "YE", name: "Yemen" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "IN", name: "India" },
];


const getAncillaryIcon = (code: string) => {
  const ancillary = ancillaryCodes.find((a) => a.value === code);
  return ancillary?.icon || "📦";
};

const getAncillaryLabel = (code: string) => {
  const ancillary = ancillaryCodes.find((a) => a.value === code);
  return ancillary?.label || code;
};

export default function AirAncillariesDiscounting() {
  const [filters, setFilters] = useState({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AirAncillaryRule | null>(
    null,
  );
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const queryClient = useQueryClient();
  const [antForm] = AntForm.useForm();
  const [editForm] = AntForm.useForm();
  const [simulateForm] = AntForm.useForm();
  const { toast } = useToast();

  // Fetch air ancillary rules
  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["air-ancillary-rules", filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/air-ancillary-rules?${params}`);
      if (!response.ok) throw new Error("Failed to fetch rules");
      return response.json();
    },
  });

  // Fetch cohort codes
  const { data: availableCohorts = [] } = useQuery({
    queryKey: ["cohorts"],
    queryFn: async () => {
      const response = await fetch("/api/cohorts");
      if (!response.ok) throw new Error("Failed to fetch cohorts");
      return response.json();
    },
  });

  // Create rule mutation
  const createRuleMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/air-ancillary-rules", {
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
      queryClient.invalidateQueries({ queryKey: ["air-ancillary-rules"] });
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
      const response = await fetch(`/api/air-ancillary-rules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update rule");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["air-ancillary-rules"] });
      setIsEditModalOpen(false);
      setSelectedRule(null);
      editForm.resetFields();
      toast({ title: "Rule updated successfully" });
    },
  });

  // Status toggle mutation
  const statusToggleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/air-ancillary-rules/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["air-ancillary-rules"] });
      toast({ title: "Status updated successfully" });
    },
  });

  // Simulate rule mutation
  const simulateRuleMutation = useMutation({
    mutationFn: async (data: {
      basePrice: number;
      currency: string;
      ruleId: string;
    }) => {
      const response = await fetch("/api/air-ancillary-rules/simulate", {
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
      cohortCodes: values.cohortCodes || [],
      adjustmentValue:
        values.adjustmentType === "FREE"
          ? null
          : values.adjustmentValue?.toString(),
      pos: values.pos || [],
      agentTier: values.agentTier || [],
    };
    delete formattedData.validDates;
    createRuleMutation.mutate(formattedData);
  };

  const handleEditRule = (values: any) => {
    const formattedData = {
      ...values,
      validFrom: values.validDates[0].format("YYYY-MM-DD"),
      validTo: values.validDates[1].format("YYYY-MM-DD"),
      cohortCodes: values.cohortCodes || [],
      adjustmentValue:
        values.adjustmentType === "FREE"
          ? null
          : values.adjustmentValue?.toString(),
      pos: values.pos || [],
      agentTier: values.agentTier || [],
    };
    delete formattedData.validDates;
    updateRuleMutation.mutate({ id: selectedRule!.id, data: formattedData });
  };

  const handleViewRule = (rule: AirAncillaryRule) => {
    setSelectedRule(rule);
    setIsViewModalOpen(true);
  };

  const handleEditRuleClick = (rule: AirAncillaryRule) => {
    setSelectedRule(rule);
    editForm.setFieldsValue({
      ...rule,
      validDates: [dayjs(rule.validFrom), dayjs(rule.validTo)],
      agentTier: Array.isArray(rule.agentTier) ? rule.agentTier : [],
      pos: Array.isArray(rule.pos) ? rule.pos : [],
      cohortCodes: Array.isArray(rule.cohortCodes) ? rule.cohortCodes : [],
    });
    setIsEditModalOpen(true);
  };

  const handleStatusToggle = (rule: AirAncillaryRule) => {
    const newStatus = rule.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    statusToggleMutation.mutate({ id: rule.id, status: newStatus });
  };

  const handleSimulate = (values: any) => {
    simulateRuleMutation.mutate({
      basePrice: values.basePrice,
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Rule
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {/*<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
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
                  (rule: AirAncillaryRule) => rule.status === "ACTIVE",
                ).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Free Ancillaries
            </CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                rules.filter(
                  (rule: AirAncillaryRule) => rule.adjustmentType === "FREE",
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
                rules.filter((rule: AirAncillaryRule) => rule.priority >= 5)
                  .length
              }
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Sticky Filter Icon */}
      <div className="fixed top-5 right-0 z-50 cls-filter-sticky cls-filter-sticky button">
        <Sheet open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg clr-bg-clr hover:bg-blue-700 text-white"
            >
              <Filter className="" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-96 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Filter ancillary discount rules by various criteria
              </SheetDescription>
            </SheetHeader>
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="rule-code">Rule Code</Label>
                  <Input
                    id="rule-code"
                    placeholder="Enter rule code..."
                    value={filters.ruleCode || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        ruleCode: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="ancillary-code">Ancillary Code</Label>
                  <Input
                    id="ancillary-code"
                    placeholder="Enter ancillary code..."
                    value={filters.ancillaryCode || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        ancillaryCode: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="airline-code">Airline Code</Label>
                  <Input
                    id="airline-code"
                    placeholder="Enter airline code..."
                    value={filters.airlineCode || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        airlineCode: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="origin">Origin</Label>
                  <Input
                    id="origin"
                    placeholder="Enter origin..."
                    value={filters.origin || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        origin: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    placeholder="Enter destination..."
                    value={filters.destination || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        destination: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="channel">Channel</Label>
                  <Select
                    value={filters.channel || "ALL"}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        channel: value === "ALL" ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Channels</SelectItem>
                      <SelectItem value="API">API</SelectItem>
                      <SelectItem value="PORTAL">PORTAL</SelectItem>
                      <SelectItem value="MOBILE">MOBILE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={filters.status || "ALL"}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: value === "ALL" ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Status</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="adjustment-type">Adjustment Type</Label>
                  <Select
                    value={filters.adjustmentType || "ALL"}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        adjustmentType: value === "ALL" ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select adjustment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="PERCENT">Percent</SelectItem>
                      <SelectItem value="AMOUNT">Amount</SelectItem>
                      <SelectItem value="FREE">Free</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <SheetFooter className="pt-4">
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={() => setFilters({})}
                  className="flex-1"
                >
                  Reset All
                </Button>
                <SheetClose asChild>
                  <Button className="flex-1">Apply Filters</Button>
                </SheetClose>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ancillary Discount Rules</CardTitle>
          <CardDescription>
            Manage discount rules for baggage, seats, meals, and other airline
            services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule Code</TableHead>
                <TableHead>Ancillary</TableHead>
                <TableHead>Airline</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule: AirAncillaryRule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <div className="font-medium">{rule.ruleCode}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getAncillaryIcon(rule.ancillaryCode)}
                      </span>
                      <div>
                        <div className="font-medium">{rule.ancillaryCode}</div>
                        <div className="text-sm text-gray-500">
                          {getAncillaryLabel(rule.ancillaryCode)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {rule.airlineCode || "All"}
                  </TableCell>
                  <TableCell className="text-sm">{rule.channel}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div
                        className={`font-medium ${
                          rule.adjustmentType === "FREE"
                            ? "text-green-600"
                            : rule.adjustmentType === "PERCENT"
                              ? "text-blue-600"
                              : "text-orange-600"
                        }`}
                      >
                        {rule.adjustmentType === "FREE"
                          ? "FREE"
                          : rule.adjustmentType === "PERCENT"
                            ? `${rule.adjustmentValue}% OFF`
                            : `$${rule.adjustmentValue} OFF`}
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
        title="Create Ancillary Discount Rule"
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
                <AntInput placeholder="e.g., BAG10_PLATINUM_GCC" />
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                label="Ancillary Code"
                name="ancillaryCode"
                rules={[{ required: true }]}
              >
                <AntSelect placeholder="Select ancillary service">
                  {ancillaryCodes.map((ancillary) => (
                    <AntSelect.Option
                      key={ancillary.value}
                      value={ancillary.value}
                    >
                      <span className="mr-2">{ancillary.icon}</span>
                      {ancillary.label}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <AntForm.Item label="Airline Code (Optional)" name="airlineCode">
                <AntInput placeholder="XY" maxLength={2} />
              </AntForm.Item>
            </Col>
            <Col span={8}>
              <AntForm.Item label="Origin (Optional)" name="origin">
                <AntInput placeholder="LHR" maxLength={3} />
              </AntForm.Item>
            </Col>
            <Col span={8}>
              <AntForm.Item label="Destination (Optional)" name="destination">
                <AntInput placeholder="JFK" maxLength={3} />
              </AntForm.Item>
            </Col>
          </Row>

          <div className="grid grid-cols-2 gap-4">
            <AntForm.Item
              label="Point of Sale"
              name="pos"
              rules={[
                { required: true, message: "At least one POS is required" },
              ]}
            >
              <AntSelect mode="multiple" placeholder="Select countries">
                {countriesData.map((country) => (
                  <AntSelect.Option key={country.code} value={country.code}>
                    {country.code} - {country.name}
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

          <Row gutter={16}>
            <Col span={12}>
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

          <AntForm.Item label="Eligible Cohorts (Optional)" name="cohortCodes">
            <AntSelect
              mode="multiple"
              placeholder="Select cohorts"
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

          <AntForm.Item
            label="Condition Behavior (Optional)"
            name="conditionBehavior"
          >
            <AntSelect placeholder="Select behavior condition">
              {conditionBehaviors.map((behavior) => (
                <AntSelect.Option key={behavior} value={behavior}>
                  {behavior}
                </AntSelect.Option>
              ))}
            </AntSelect>
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
              <AntForm.Item label="Adjustment Value" name="adjustmentValue">
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

          <AntForm.Item
            label="Valid Dates"
            name="validDates"
            rules={[{ required: true }]}
          >
            <RangePicker style={{ width: "100%" }} />
          </AntForm.Item>

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
        title="Edit Ancillary Discount Rule"
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
                <AntInput placeholder="e.g., BAG10_PLATINUM_GCC" />
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                label="Ancillary Code"
                name="ancillaryCode"
                rules={[{ required: true }]}
              >
                <AntSelect placeholder="Select ancillary service">
                  {ancillaryCodes.map((ancillary) => (
                    <AntSelect.Option
                      key={ancillary.value}
                      value={ancillary.value}
                    >
                      <span className="mr-2">{ancillary.icon}</span>
                      {ancillary.label}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <AntForm.Item label="Airline Code (Optional)" name="airlineCode">
                <AntInput placeholder="XY" maxLength={2} />
              </AntForm.Item>
            </Col>
            <Col span={8}>
              <AntForm.Item label="Origin (Optional)" name="origin">
                <AntInput placeholder="LHR" maxLength={3} />
              </AntForm.Item>
            </Col>
            <Col span={8}>
              <AntForm.Item label="Destination (Optional)" name="destination">
                <AntInput placeholder="JFK" maxLength={3} />
              </AntForm.Item>
            </Col>
          </Row>

          <div className="grid grid-cols-2 gap-4">
            <AntForm.Item
              label="Point of Sale"
              name="pos"
              rules={[
                { required: true, message: "At least one POS is required" },
              ]}
            >
              <AntSelect mode="multiple" placeholder="Select countries">
                {countriesData.map((country) => (
                  <AntSelect.Option key={country.code} value={country.code}>
                    {country.code} - {country.name}
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

          <Row gutter={16}>
            <Col span={12}>
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
            <Col span={12}>
              <AntForm.Item label="Eligible Cohorts (Optional)" name="cohortCodes">
                <AntSelect
                  mode="multiple"
                  placeholder="Select cohorts"
                  style={{ width: "100%" }}
                  dropdownStyle={{ zIndex: 9999 }}
                  getPopupContainer={(trigger) => trigger.parentElement}
                  virtual={false}
                  showSearch
                  filterOption={(input, option) =>
                    option?.children
                      ?.toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0 ||
                    option?.value?.toLowerCase().indexOf(input.toLowerCase()) >=
                      0
                  }
                >
                  {availableCohorts.map((cohort: any) => (
                    <AntSelect.Option key={cohort.id} value={cohort.cohortName}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <div className="cls-cohort-dropdwon">
                          <p>{cohort.cohortName}</p>{" "}
                          <span className="text-gray-600">
                            {cohort.cohortCode}
                          </span>
                        </div>
                      </div>
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </AntForm.Item>
            </Col>
          </Row>

          <AntForm.Item
            label="Condition Behavior (Optional)"
            name="conditionBehavior"
          >
            <AntSelect placeholder="Select behavior condition">
              {conditionBehaviors.map((behavior) => (
                <AntSelect.Option key={behavior} value={behavior}>
                  {behavior}
                </AntSelect.Option>
              ))}
            </AntSelect>
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
              <AntForm.Item label="Adjustment Value" name="adjustmentValue">
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

          <AntForm.Item
            label="Valid Dates"
            name="validDates"
            rules={[{ required: true }]}
          >
            <RangePicker style={{ width: "100%" }} />
          </AntForm.Item>

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
                Complete ancillary discount rule information
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
                {selectedRule.conditionBehavior && (
                  <Badge variant="outline">
                    {selectedRule.conditionBehavior}
                  </Badge>
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
                      Ancillary Service
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getAncillaryIcon(selectedRule.ancillaryCode)}
                      </span>
                      <div className="text-lg font-bold text-blue-600">
                        {selectedRule.ancillaryCode}
                      </div>
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

            {/* Discount Information */}
            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Discount Details
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
                      className={`text-lg font-bold ${
                        selectedRule.adjustmentType === "FREE"
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    >
                      {selectedRule.adjustmentType === "FREE"
                        ? "FREE"
                        : selectedRule.adjustmentType === "PERCENT"
                          ? `${selectedRule.adjustmentValue}%`
                          : `$${selectedRule.adjustmentValue}`}
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
                        Airline
                      </label>
                      <div className="mt-1 text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {selectedRule.airlineCode || "All Airlines"}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Route
                      </label>
                      <div className="mt-1 text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {selectedRule.origin && selectedRule.destination
                          ? `${selectedRule.origin} → ${selectedRule.destination}`
                          : "All Routes"}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Channel
                      </label>
                      <div className="mt-1">
                        <Badge variant="outline">{selectedRule.channel}</Badge>
                      </div>
                    </div>
                  </div>
                </Col>
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
                    {selectedRule.cohortCodes &&
                      selectedRule.cohortCodes.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Eligible Cohorts
                          </label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedRule.cohortCodes.map(
                              (cohortCode, index) => {
                                const cohort = availableCohorts.find(
                                  (c: any) =>
                                    c.cohortName === cohortCode ||
                                    c.cohortCode === cohortCode,
                                );
                                return (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800"
                                    title={
                                      cohort
                                        ? `${cohort.cohortName} (${cohort.cohortCode})`
                                        : cohortCode
                                    }
                                  >
                                    {cohort ? cohort.cohortCode : cohortCode}
                                  </span>
                                );
                              },
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            This discount will only apply to users in these
                            cohorts
                          </div>
                        </div>
                      )}
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
        title="Simulate Ancillary Discount Rule"
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
            label="Base Price"
            name="basePrice"
            rules={[{ required: true }]}
          >
            <AntInputNumber
              placeholder="Enter base ancillary price"
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
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">
                    {getAncillaryIcon(simulationResult.ancillaryCode)}
                  </span>
                  <span className="font-medium">
                    {simulationResult.ancillaryCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span>
                    {simulationResult.currency} {simulationResult.basePrice}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span className="text-red-600">
                    -{simulationResult.currency} {simulationResult.discount}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Final Price:</span>
                  <span
                    className={
                      simulationResult.adjustedPrice === 0
                        ? "text-green-600"
                        : "text-blue-600"
                    }
                  >
                    {simulationResult.adjustedPrice === 0
                      ? "FREE"
                      : `${simulationResult.currency} ${simulationResult.adjustedPrice}`}
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