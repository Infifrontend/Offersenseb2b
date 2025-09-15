import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Users,
  TestTube,
  Download,
  Upload,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../hooks/use-toast";

// Form components from Ant Design for complex forms
import {
  Form as AntForm,
  Input as AntInput,
  Select as AntSelect,
  Button as AntButton,
  Row,
  Col,
  InputNumber as AntInputNumber,
  Tabs as AntTabs,
  Card as AntCard,
  Space,
  Divider,
  Checkbox as AntCheckbox,
} from "antd";

interface Cohort {
  id: string;
  cohortCode: string;
  cohortName: string;
  type: string;
  criteria: any;
  description?: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface CohortFormData {
  cohortCode: string;
  cohortName: string;
  type: string;
  criteria: any;
  description?: string;
  createdBy: string;
}

const cohortTypes = ["MARKET", "CHANNEL", "SEASON", "BEHAVIOR"];
const channels = ["API", "PORTAL", "MOBILE"];
const devices = ["DESKTOP", "MOBILE", "TABLET"];
const cabinClasses = ["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"];
const bookingFrequencies = ["HIGH", "MEDIUM", "LOW"];

export default function CohortManager() {
  const [form] = AntForm.useForm();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);
  const [filters, setFilters] = useState({
    cohortCode: "",
    type: "all",
    status: "all",
  });
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Fetch cohorts
  const {
    data: cohorts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cohorts", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") params.append(key, value);
      });

      const response = await fetch(`/api/cohorts?${params}`);
      if (!response.ok) throw new Error("Failed to fetch cohorts");
      return response.json();
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch available cohorts for dropdowns
  const { data: availableCohorts = [] } = useQuery({
    queryKey: ["cohorts-list"],
    queryFn: async () => {
      const response = await fetch("/api/cohorts/list");
      if (!response.ok) throw new Error("Failed to fetch cohorts list");
      const data = await response.json();
      console.log("Available cohorts for dropdown:", data);
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Log cohorts data for debugging
  console.log("Cohorts data:", cohorts);
  console.log("Loading state:", isLoading);
  console.log("Error state:", error);

  // Create cohort mutation
  const createCohortMutation = useMutation({
    mutationFn: async (data: CohortFormData) => {
      const response = await fetch("/api/cohorts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create cohort");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cohorts"] });
      setIsDialogOpen(false);
      form.resetFields();
      toast({ title: "Success", description: "Cohort created successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update cohort mutation
  const updateCohortMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CohortFormData }) => {
      const response = await fetch(`/api/cohorts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.log("Response status:", response.status);
        console.log("Response text:", errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (parseError) {
          throw new Error(`Server error (${response.status}): ${errorText}`);
        }
        throw new Error(errorData.message || "Failed to update cohort");
      }

      let updatedCohort;
      try {
        updatedCohort = JSON.parse(await response.text());
      } catch (parseError) {
        throw new Error("Invalid JSON response from server");
      }
      return updatedCohort;
    },
    onSuccess: (updatedCohort) => {
      queryClient.invalidateQueries({ queryKey: ["cohorts"] });
      setIsDialogOpen(false);
      setSelectedCohort(null);
      form.resetFields();
      toast({ title: "Success", description: "Cohort updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete cohort mutation
  const deleteCohortMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/cohorts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete cohort");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cohorts"] });
      toast({ title: "Success", description: "Cohort deleted successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/cohorts/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cohorts"] });
      toast({ title: "Success", description: "Status updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Simulate cohort assignment mutation
  const simulateCohortMutation = useMutation({
    mutationFn: async (searchContext: any) => {
      const response = await fetch("/api/cohorts/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchContext }),
      });
      if (!response.ok) throw new Error("Failed to simulate cohort assignment");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Simulation Complete",
        description: `Matched ${data.matchedCount} cohorts: ${data.matchedCohorts.join(", ")}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateOrUpdate = (values: any) => {
    console.log("Form values received:", values);

    const formattedData: CohortFormData = {
      cohortCode: values.cohortCode,
      cohortName: values.cohortName,
      type: values.type,
      criteria: buildCriteria(values),
      description: values.description || null,
      createdBy: "admin", // In real app, get from auth context
    };

    console.log("Formatted data for API:", formattedData);

    if (selectedCohort) {
      updateCohortMutation.mutate({
        id: selectedCohort.id,
        data: formattedData,
      });
    } else {
      createCohortMutation.mutate(formattedData);
    }
  };

  const buildCriteria = (values: any) => {
    const criteria: any = {};

    if (values.pos && values.pos.length > 0) {
      criteria.pos = values.pos;
    }

    if (values.channel) {
      criteria.channel = Array.isArray(values.channel) ? values.channel : [values.channel];
    }

    if (values.device) {
      criteria.device = Array.isArray(values.device) ? values.device : [values.device];
    }

    if (values.season) {
      criteria.season = values.season;
    }

    if (
      values.bookingWindowMin !== undefined &&
      values.bookingWindowMax !== undefined
    ) {
      criteria.bookingWindow = {
        min: values.bookingWindowMin,
        max: values.bookingWindowMax,
      };
    }

    if (
      values.bookingFrequency ||
      values.avgBookingValueMin ||
      values.preferredCabinClass
    ) {
      criteria.behavior = {};

      if (values.bookingFrequency) {
        criteria.behavior.bookingFrequency = values.bookingFrequency;
      }

      if (
        values.avgBookingValueMin !== undefined &&
        values.avgBookingValueMax !== undefined
      ) {
        criteria.behavior.averageBookingValue = {
          min: values.avgBookingValueMin,
          max: values.avgBookingValueMax,
        };
      }

      if (values.preferredCabinClass && values.preferredCabinClass.length > 0) {
        criteria.behavior.preferredCabinClass = values.preferredCabinClass;
      }
    }

    // Add eligible cohorts if specified
    if (values.eligibleCohorts && values.eligibleCohorts.length > 0) {
      criteria.eligibleCohorts = values.eligibleCohorts;
    }

    return criteria;
  };

  const handleEdit = (cohort: Cohort) => {
    setSelectedCohort(cohort);
    const criteria = cohort.criteria as any;

    form.setFieldsValue({
      cohortCode: cohort.cohortCode,
      cohortName: cohort.cohortName,
      type: cohort.type,
      description: cohort.description,
      pos: criteria.pos || [],
      channel: criteria.channel,
      device: criteria.device,
      season: criteria.season,
      bookingWindowMin: criteria.bookingWindow?.min,
      bookingWindowMax: criteria.bookingWindow?.max,
      bookingFrequency: criteria.behavior?.bookingFrequency,
      avgBookingValueMin: criteria.behavior?.averageBookingValue?.min,
      avgBookingValueMax: criteria.behavior?.averageBookingValue?.max,
      preferredCabinClass: criteria.behavior?.preferredCabinClass || [],
      eligibleCohorts: criteria.eligibleCohorts || [],
    });
    setIsDialogOpen(true);
  };

  const handleSimulate = () => {
    const searchContext = {
      pos: "US",
      channel: "PORTAL",
      device: "DESKTOP",
      bookingDaysAhead: 14,
    };
    simulateCohortMutation.mutate(searchContext);
  };

  const getStatusBadge = (status: string) => {
    const variant = status === "ACTIVE" ? "default" : "secondary";
    return <Badge variant={variant}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      MARKET: "bg-blue-100 text-blue-800",
      CHANNEL: "bg-green-100 text-green-800",
      SEASON: "bg-yellow-100 text-yellow-800",
      BEHAVIOR: "bg-purple-100 text-purple-800",
    };
    return (
      <Badge className={colors[type] || "bg-gray-100 text-gray-800"}>
        {type}
      </Badge>
    );
  };

  // Add loading state check after all hooks and functions are defined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="text-lg font-medium text-gray-600">
            Loading cohorts...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setSelectedCohort(null);
                  form.resetFields();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Cohort
              </Button>
            </DialogTrigger>
            <Button variant="outline" onClick={handleSimulate}>
              <TestTube className="h-4 w-4 mr-2" />
              Test Assignment
            </Button>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedCohort ? "Edit Cohort" : "Create New Cohort"}
                </DialogTitle>
              </DialogHeader>

              <AntForm
                form={form}
                layout="vertical"
                onFinish={handleCreateOrUpdate}
                className="space-y-4"
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <AntForm.Item
                      name="cohortCode"
                      label="Cohort Code"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <AntInput placeholder="MOBILE_USERS" />
                    </AntForm.Item>
                  </Col>
                  <Col span={12}>
                    <AntForm.Item
                      name="cohortName"
                      label="Cohort Name"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <AntInput placeholder="Mobile Channel Users" />
                    </AntForm.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <AntForm.Item
                      name="type"
                      label="Cohort Type"
                      rules={[
                        {
                          required: true,
                          message: "Please select a cohort type",
                        },
                      ]}
                    >
                      <AntSelect
                        placeholder="Select cohort type"
                        style={{ width: "100%" }}
                        dropdownStyle={{ zIndex: 9999 }}
                        getPopupContainer={(trigger) => trigger.parentElement}
                        virtual={false}
                      >
                        {cohortTypes.map((type) => (
                          <AntSelect.Option key={type} value={type}>
                            {type}
                          </AntSelect.Option>
                        ))}
                      </AntSelect>
                    </AntForm.Item>
                  </Col>
                  <Col span={12}>
                    <AntForm.Item name="description" label="Description">
                      <AntInput placeholder="Optional description" />
                    </AntForm.Item>
                  </Col>
                </Row>

                <Divider>Eligibility Criteria</Divider>

                <AntTabs defaultActiveKey="1">
                  <AntTabs.TabPane tab="Basic Criteria" key="1">
                    <Row gutter={16}>
                      <Col span={24}>
                        <AntForm.Item name="pos" label="Point of Sale">
                          <AntCheckbox.Group style={{ width: "100%" }}>
                            <Row gutter={[16, 8]}>
                              <Col span={6}>
                                <AntCheckbox
                                  value="US"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    border: "1px solid #d9d9d9",
                                    marginBottom: "8px",
                                    fontSize: "14px",
                                  }}
                                >
                                  <span style={{ fontWeight: "500" }}>US</span>
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      color: "#666",
                                      marginLeft: "4px",
                                    }}
                                  >
                                    United States
                                  </span>
                                </AntCheckbox>
                              </Col>
                              <Col span={6}>
                                <AntCheckbox
                                  value="GB"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    border: "1px solid #d9d9d9",
                                    marginBottom: "8px",
                                    fontSize: "14px",
                                  }}
                                >
                                  <span style={{ fontWeight: "500" }}>GB</span>
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      color: "#666",
                                      marginLeft: "4px",
                                    }}
                                  >
                                    United Kingdom
                                  </span>
                                </AntCheckbox>
                              </Col>
                              <Col span={6}>
                                <AntCheckbox
                                  value="DE"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    border: "1px solid #d9d9d9",
                                    marginBottom: "8px",
                                    fontSize: "14px",
                                  }}
                                >
                                  <span style={{ fontWeight: "500" }}>DE</span>
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      color: "#666",
                                      marginLeft: "4px",
                                    }}
                                  >
                                    Germany
                                  </span>
                                </AntCheckbox>
                              </Col>
                              <Col span={6}>
                                <AntCheckbox
                                  value="FR"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    border: "1px solid #d9d9d9",
                                    marginBottom: "8px",
                                    fontSize: "14px",
                                  }}
                                >
                                  <span style={{ fontWeight: "500" }}>FR</span>
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      color: "#666",
                                      marginLeft: "4px",
                                    }}
                                  >
                                    France
                                  </span>
                                </AntCheckbox>
                              </Col>
                              <Col span={6}>
                                <AntCheckbox
                                  value="IN"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    border: "1px solid #d9d9d9",
                                    marginBottom: "8px",
                                    fontSize: "14px",
                                  }}
                                >
                                  <span style={{ fontWeight: "500" }}>IN</span>
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      color: "#666",
                                      marginLeft: "4px",
                                    }}
                                  >
                                    India
                                  </span>
                                </AntCheckbox>
                              </Col>
                              <Col span={6}>
                                <AntCheckbox
                                  value="AU"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    border: "1px solid #d9d9d9",
                                    marginBottom: "8px",
                                    fontSize: "14px",
                                  }}
                                >
                                  <span style={{ fontWeight: "500" }}>AU</span>
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      color: "#666",
                                      marginLeft: "4px",
                                    }}
                                  >
                                    Australia
                                  </span>
                                </AntCheckbox>
                              </Col>
                              <Col span={6}>
                                <AntCheckbox
                                  value="CA"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    border: "1px solid #d9d9d9",
                                    marginBottom: "8px",
                                    fontSize: "14px",
                                  }}
                                >
                                  <span style={{ fontWeight: "500" }}>CA</span>
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      color: "#666",
                                      marginLeft: "4px",
                                    }}
                                  >
                                    Canada
                                  </span>
                                </AntCheckbox>
                              </Col>
                              <Col span={6}>
                                <AntCheckbox
                                  value="SG"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    border: "1px solid #d9d9d9",
                                    marginBottom: "8px",
                                    fontSize: "14px",
                                  }}
                                >
                                  <span style={{ fontWeight: "500" }}>SG</span>
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      color: "#666",
                                      marginLeft: "4px",
                                    }}
                                  >
                                    Singapore
                                  </span>
                                </AntCheckbox>
                              </Col>
                            </Row>
                          </AntCheckbox.Group>
                        </AntForm.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={8}>
                        <AntForm.Item name="channel" label="Channel">
                          <AntSelect
                            mode="multiple"
                            placeholder="Select channels"
                            style={{ width: "100%" }}
                            dropdownStyle={{ zIndex: 9999 }}
                            getPopupContainer={(trigger) =>
                              trigger.parentElement
                            }
                            virtual={false}
                          >
                            {channels.map((channel) => (
                              <AntSelect.Option key={channel} value={channel}>
                                {channel}
                              </AntSelect.Option>
                            ))}
                          </AntSelect>
                        </AntForm.Item>
                      </Col>
                      <Col span={8}>
                        <AntForm.Item name="device" label="Device Type">
                          <AntSelect
                            mode="multiple"
                            placeholder="Select devices"
                            style={{ width: "100%" }}
                            dropdownStyle={{ zIndex: 9999 }}
                            getPopupContainer={(trigger) =>
                              trigger.parentElement
                            }
                            virtual={false}
                          >
                            {devices.map((device) => (
                              <AntSelect.Option key={device} value={device}>
                                {device}
                              </AntSelect.Option>
                            ))}
                          </AntSelect>
                        </AntForm.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={8}>
                        <AntForm.Item name="season" label="Season Code">
                          <AntInput placeholder="SUMMER_2025" />
                        </AntForm.Item>
                      </Col>
                      <Col span={8}>
                        <AntForm.Item
                          name="bookingWindowMin"
                          label="Booking Window Min (days)"
                        >
                          <AntInputNumber
                            style={{ width: "100%" }}
                            placeholder="7"
                            min={0}
                          />
                        </AntForm.Item>
                      </Col>
                      <Col span={8}>
                        <AntForm.Item
                          name="bookingWindowMax"
                          label="Booking Window Max (days)"
                        >
                          <AntInputNumber
                            style={{ width: "100%" }}
                            placeholder="90"
                            min={0}
                          />
                        </AntForm.Item>
                      </Col>
                    </Row>
                  </AntTabs.TabPane>

                  <AntTabs.TabPane tab="Behavior Criteria" key="2">
                    <Row gutter={16}>
                      <Col span={12}>
                        <AntForm.Item
                          name="bookingFrequency"
                          label="Booking Frequency"
                        >
                          <AntSelect
                            placeholder="Select frequency"
                            style={{ width: "100%" }}
                            dropdownStyle={{ zIndex: 9999 }}
                            getPopupContainer={(trigger) =>
                              trigger.parentElement
                            }
                            virtual={false}
                          >
                            {bookingFrequencies.map((freq) => (
                              <AntSelect.Option key={freq} value={freq}>
                                {freq}
                              </AntSelect.Option>
                            ))}
                          </AntSelect>
                        </AntForm.Item>
                      </Col>
                      <Col span={12}>
                        <AntForm.Item
                          name="preferredCabinClass"
                          label="Preferred Cabin Class"
                        >
                          <AntSelect
                            mode="multiple"
                            placeholder="Select cabin classes"
                            style={{ width: "100%" }}
                            dropdownStyle={{ zIndex: 9999 }}
                            getPopupContainer={(trigger) =>
                              trigger.parentElement
                            }
                            virtual={false}
                          >
                            {cabinClasses.map((cabin) => (
                              <AntSelect.Option key={cabin} value={cabin}>
                                {cabin}
                              </AntSelect.Option>
                            ))}
                          </AntSelect>
                        </AntForm.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <AntForm.Item
                          name="avgBookingValueMin"
                          label="Avg Booking Value Min"
                        >
                          <AntInputNumber
                            style={{ width: "100%" }}
                            placeholder="500"
                            min={0}
                            precision={2}
                          />
                        </AntForm.Item>
                      </Col>
                      <Col span={12}>
                        <AntForm.Item
                          name="avgBookingValueMax"
                          label="Avg Booking Value Max"
                        >
                          <AntInputNumber
                            style={{ width: "100%" }}
                            placeholder="5000"
                            min={0}
                            precision={2}
                          />
                        </AntForm.Item>
                      </Col>
                    </Row>
                  </AntTabs.TabPane>
                </AntTabs>

                <div className="flex justify-end gap-2 pt-4">
                  <AntButton onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </AntButton>
                  <AntButton
                    type="primary"
                    htmlType="submit"
                    loading={
                      createCohortMutation.isPending ||
                      updateCohortMutation.isPending
                    }
                  >
                    {selectedCohort ? "Update" : "Create"} Cohort
                  </AntButton>
                </div>
              </AntForm>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cohorts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cohorts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Badge variant="default" className="h-4">
              Active
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cohorts.filter((c: Cohort) => c.status === "ACTIVE").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Type</CardTitle>
            <Badge className="bg-blue-100 text-blue-800 h-4">Market</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cohorts.filter((c: Cohort) => c.type === "MARKET").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Behavior Type</CardTitle>
            <Badge className="bg-purple-100 text-purple-800 h-4">
              Behavior
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cohorts.filter((c: Cohort) => c.type === "BEHAVIOR").length}
            </div>
          </CardContent>
        </Card>
      </div>

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
                Filter cohorts by various criteria
              </SheetDescription>
            </SheetHeader>
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="cohort-code">Cohort Code</Label>
                  <Input
                    id="cohort-code"
                    placeholder="Search by code..."
                    value={filters.cohortCode || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        cohortCode: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={filters.type || "all"}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        type: value === "all" ? "all" : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="MARKET">Market</SelectItem>
                      <SelectItem value="CHANNEL">Channel</SelectItem>
                      <SelectItem value="SEASON">Season</SelectItem>
                      <SelectItem value="BEHAVIOR">Behavior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={filters.status || "all"}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: value === "all" ? "all" : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <SheetFooter className="pt-4">
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={() => setFilters({ cohortCode: "", type: "all", status: "all" })}
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

      {/* Cohorts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cohorts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Code</TableHead>
                  <TableHead className="min-w-[180px]">Name</TableHead>
                  <TableHead className="min-w-[100px]">Type</TableHead>
                  <TableHead className="min-w-[150px] hidden md:table-cell">Criteria</TableHead>
                  <TableHead className="min-w-[80px]">Status</TableHead>
                  <TableHead className="min-w-[100px] hidden lg:table-cell">Created</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading cohorts...
                    </TableCell>
                  </TableRow>
                ) : cohorts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No cohorts found
                    </TableCell>
                  </TableRow>
                ) : (
                  cohorts.map((cohort: Cohort) => (
                    <TableRow key={cohort.id}>
                      <TableCell className="font-medium">
                        <div className="truncate max-w-[120px]" title={cohort.cohortCode}>
                          {cohort.cohortCode}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="truncate max-w-[180px]" title={cohort.cohortName}>
                          {cohort.cohortName}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(cohort.type)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-xs text-muted-foreground truncate max-w-[150px]" title={JSON.stringify(cohort.criteria)}>
                          {Object.keys(cohort.criteria || {}).join(', ') || 'No criteria'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(cohort.status)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="text-sm">
                          {new Date(cohort.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(cohort)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: cohort.id,
                                  status:
                                    cohort.status === "ACTIVE"
                                      ? "INACTIVE"
                                      : "ACTIVE",
                                })
                              }
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {cohort.status === "ACTIVE"
                                ? "Deactivate"
                                : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                deleteCohortMutation.mutate(cohort.id)
                              }
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}