import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Handshake,
  Upload,
  Plus,
  Search,
  Filter,
  Download,
  AlertCircle,
  Eye,
  Edit,
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
} from "antd";
import dayjs from "dayjs";

// Form schemas
const fareFormSchema = z.object({
  airlineCode: z.string().length(2, "Airline code must be 2 characters"),
  fareCode: z.string().min(1, "Fare code is required"),
  origin: z.string().length(3, "Origin must be 3 characters"),
  destination: z.string().length(3, "Destination must be 3 characters"),
  tripType: z.enum(["ONE_WAY", "ROUND_TRIP", "MULTI_CITY"]),
  cabinClass: z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"]),
  baseNetFare: z.string().min(1, "Base fare is required"),
  currency: z.string().length(3, "Currency must be 3 characters"),
  bookingStartDate: z.string(),
  bookingEndDate: z.string(),
  travelStartDate: z.string(),
  travelEndDate: z.string(),
  pos: z.array(z.string()).min(1, "At least one POS is required"),
  seatAllotment: z.string().optional(),
  minStay: z.string().optional(),
  maxStay: z.string().optional(),
  blackoutDates: z.array(z.string()).optional(),
  eligibleAgentTiers: z
    .array(z.enum(["PLATINUM", "GOLD", "SILVER", "BRONZE"]))
    .min(1, "Select at least one tier"),
  eligibleCohorts: z.array(z.string()).optional(),
  remarks: z.string().optional(),
});

type FareFormData = z.infer<typeof fareFormSchema>;

interface NegotiatedFare {
  id: string;
  airlineCode: string;
  fareCode: string;
  origin: string;
  destination: string;
  tripType: string;
  cabinClass: string;
  baseNetFare: string;
  currency: string;
  bookingStartDate: string;
  bookingEndDate: string;
  travelStartDate: string;
  travelEndDate: string;
  pos: string[];
  seatAllotment?: number;
  minStay?: number;
  maxStay?: number;
  blackoutDates?: string[];
  eligibleAgentTiers: string[];
  eligibleCohorts?: string[];
  remarks?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const currencies = ["USD", "EUR", "GBP", "INR", "AUD", "CAD", "SGD"];
const countries = ["US", "GB", "DE", "FR", "IN", "AU", "CA", "SG"];
const agentTiers = ["PLATINUM", "GOLD", "SILVER", "BRONZE"];

export default function NegotiatedFareManager() {
  const [filters, setFilters] = useState({});
  const [uploadResult, setUploadResult] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [antForm] = AntForm.useForm();

  const form = useForm<FareFormData>({
    resolver: zodResolver(fareFormSchema),
    defaultValues: {
      pos: [],
      eligibleAgentTiers: [],
      eligibleCohorts: [],
      blackoutDates: [],
    },
  });

  // Dummy data for default display
  const dummyFares = [
    {
      id: "1",
      airlineCode: "DE",
      fareCode: "FAREDYNAMICTRIGGER",
      origin: "DEL",
      destination: "SHJ",
      tripType: "ROUND_TRIP",
      cabinClass: "PREMIUM_ECONOMY",
      baseNetFare: "500.00",
      currency: "USD",
      bookingStartDate: "2024-01-01",
      bookingEndDate: "2024-12-31",
      travelStartDate: "2024-02-01",
      travelEndDate: "2024-11-30",
      pos: ["US", "IN"],
      eligibleAgentTiers: ["GOLD", "PLATINUM"],
      remarks: "Premium dynamic fare",
      status: "ACTIVE",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      airlineCode: "SH",
      fareCode: "SHJ-MAA-ECO-01",
      origin: "SHJ",
      destination: "MAA",
      tripType: "ONE_WAY",
      cabinClass: "ECONOMY",
      baseNetFare: "179.00",
      currency: "USD",
      bookingStartDate: "2024-01-01",
      bookingEndDate: "2024-12-31",
      travelStartDate: "2024-02-01",
      travelEndDate: "2024-11-30",
      pos: ["IN", "US"],
      eligibleAgentTiers: ["SILVER", "GOLD"],
      remarks: "Economy class special",
      status: "ACTIVE",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "3",
      airlineCode: "SI",
      fareCode: "SIN-KUL-ECO-01",
      origin: "SIN",
      destination: "KUL",
      tripType: "ONE_WAY",
      cabinClass: "ECONOMY",
      baseNetFare: "89.00",
      currency: "USD",
      bookingStartDate: "2024-01-01",
      bookingEndDate: "2024-12-31",
      travelStartDate: "2024-02-01",
      travelEndDate: "2024-11-30",
      pos: ["SG", "US"],
      eligibleAgentTiers: ["BRONZE", "SILVER"],
      remarks: "Regional economy fare",
      status: "ACTIVE",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
  ];

  // API calls
  const { data: fares, isLoading } = useQuery({
    queryKey: ["/api/negofares", filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/negofares?${params}`);
      if (!response.ok) throw new Error("Failed to fetch fares");
      return response.json();
    },
  });

  // Use dummy data if no API data is available
  const displayFares = fares || dummyFares;

  const createFareMutation = useMutation({
    mutationFn: async (data: FareFormData) => {
      const response = await fetch("/api/negofares", {
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
      queryClient.invalidateQueries({ queryKey: ["/api/negofares"] });
      setIsCreateModalOpen(false);
      antForm.resetFields();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/negofares/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    onSuccess: (data) => {
      setUploadResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/negofares"] });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      "airlineCode",
      "fareCode",
      "origin",
      "destination",
      "tripType",
      "cabinClass",
      "baseNetFare",
      "currency",
      "bookingStartDate",
      "bookingEndDate",
      "travelStartDate",
      "travelEndDate",
      "pos",
      "seatAllotment",
      "minStay",
      "maxStay",
      "blackoutDates",
      "eligibleAgentTiers",
      "eligibleCohorts",
      "remarks",
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      'AA,NEGO001,NYC,LAX,ROUND_TRIP,ECONOMY,299.00,USD,2024-01-01,2024-12-31,2024-02-01,2024-11-30,"[""US"",""CA""]",50,7,30,"[]","[""GOLD"",""SILVER""]","[]","Sample negotiated fare"';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "negotiated_fares_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onSubmit = (values: any) => {
    const formattedData = {
      ...values,
      bookingStartDate: values.bookingStartDate?.format("YYYY-MM-DD"),
      bookingEndDate: values.bookingEndDate?.format("YYYY-MM-DD"),
      travelStartDate: values.travelStartDate?.format("YYYY-MM-DD"),
      travelEndDate: values.travelEndDate?.format("YYYY-MM-DD"),
      baseNetFare: values.baseNetFare?.toString(),
      seatAllotment: values.seatAllotment?.toString(),
      minStay: values.minStay?.toString(),
      maxStay: values.maxStay?.toString(),
      blackoutDates: values.blackoutDates?.map((dateRange: any) => 
        Array.isArray(dateRange) 
          ? dateRange.map((date: any) => date.format("YYYY-MM-DD"))
          : [dateRange.format("YYYY-MM-DD")]
      ).flat() || [],
      eligibleCohorts: values.eligibleCohorts || [],
    };
    createFareMutation.mutate(formattedData);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              disabled={createFareMutation.isPending}
              className="cls-primary-bg hover:bg-blue-700 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Fare
            </Button>

            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download Sample CSV
            </Button>

            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload CSV
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="ml-auto">
              <Select defaultValue="all-status">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Fare Inventory Section */}
      <div className="px-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Fare Inventory</h2>
        </div>

        <div className="bg-white rounded-lg border">
          {isLoading ? (
            <div className="p-6">Loading fares...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Fare Code</TableHead>
                  <TableHead className="w-[120px]">Route</TableHead>
                  <TableHead className="w-[100px]">Class</TableHead>
                  <TableHead className="w-[100px]">Trip Type</TableHead>
                  <TableHead className="w-[100px]">Base Fare</TableHead>
                  <TableHead className="w-[100px]">Brand</TableHead>
                  <TableHead className="w-[80px]">Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayFares?.map((fare: NegotiatedFare) => (
                  <TableRow key={fare.id}>
                    <TableCell className="font-medium">
                      {fare.fareCode}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {fare.origin} →<br />
                        {fare.destination}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {fare.cabinClass === "PREMIUM_ECONOMY"
                        ? "Premium"
                        : fare.cabinClass === "ECONOMY"
                          ? "Economy"
                          : fare.cabinClass}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {fare.tripType === "ROUND_TRIP"
                          ? "Round Trip"
                          : fare.tripType === "ONE_WAY"
                            ? "One Way"
                            : fare.tripType}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{fare.currency}</div>
                        <div>{fare.baseNetFare}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {fare.remarks?.includes("Premium")
                          ? "none"
                          : fare.remarks?.includes("special")
                            ? "LITE"
                            : fare.remarks?.includes("Regional")
                              ? "SELL001"
                              : "none"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-green-600">
                        Active
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" className="p-1">
                          <Eye className="w-4 h-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-1">
                          <Edit className="w-4 h-4 text-gray-500" />
                        </Button>
                        <div className="w-8 h-4 bg-blue-600 rounded-full relative cursor-pointer">
                          <div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <Modal
        title="Create New Negotiated Fare"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <AntForm
          form={antForm}
          layout="vertical"
          onFinish={onSubmit}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col span={8}>
              <AntForm.Item
                label="Airline Code"
                name="airlineCode"
                rules={[
                  { required: true, message: "Please enter airline code" },
                  { len: 2, message: "Airline code must be 2 characters" },
                ]}
              >
                <AntInput placeholder="AA" maxLength={2} />
              </AntForm.Item>
            </Col>
            <Col span={8}>
              <AntForm.Item
                label="Fare Code"
                name="fareCode"
                rules={[{ required: true, message: "Please enter fare code" }]}
              >
                <AntInput placeholder="NEGO001" />
              </AntForm.Item>
            </Col>
            <Col span={8}>
              <AntForm.Item
                label="Currency"
                name="currency"
                rules={[{ required: true, message: "Please select currency" }]}
              >
                <AntSelect placeholder="Select currency">
                  {currencies.map((currency) => (
                    <AntSelect.Option key={currency} value={currency}>
                      {currency}
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
                rules={[
                  { required: true, message: "Please enter origin" },
                  { len: 3, message: "Origin must be 3 characters" },
                ]}
              >
                <AntInput placeholder="NYC" maxLength={3} />
              </AntForm.Item>
            </Col>
            <Col span={8}>
              <AntForm.Item
                label="Destination"
                name="destination"
                rules={[
                  { required: true, message: "Please enter destination" },
                  { len: 3, message: "Destination must be 3 characters" },
                ]}
              >
                <AntInput placeholder="LAX" maxLength={3} />
              </AntForm.Item>
            </Col>
            <Col span={8}>
              <AntForm.Item
                label="Base Net Fare"
                name="baseNetFare"
                rules={[{ required: true, message: "Please enter base fare" }]}
              >
                <InputNumber
                  placeholder="299.00"
                  min={0}
                  step={0.01}
                  style={{ width: "100%" }}
                />
              </AntForm.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                label="Trip Type"
                name="tripType"
                rules={[{ required: true, message: "Please select trip type" }]}
              >
                <AntSelect placeholder="Select trip type">
                  <AntSelect.Option value="ONE_WAY">One Way</AntSelect.Option>
                  <AntSelect.Option value="ROUND_TRIP">
                    Round Trip
                  </AntSelect.Option>
                  <AntSelect.Option value="MULTI_CITY">
                    Multi City
                  </AntSelect.Option>
                </AntSelect>
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                label="Cabin Class"
                name="cabinClass"
                rules={[
                  { required: true, message: "Please select cabin class" },
                ]}
              >
                <AntSelect placeholder="Select cabin class">
                  <AntSelect.Option value="ECONOMY">Economy</AntSelect.Option>
                  <AntSelect.Option value="PREMIUM_ECONOMY">
                    Premium Economy
                  </AntSelect.Option>
                  <AntSelect.Option value="BUSINESS">Business</AntSelect.Option>
                  <AntSelect.Option value="FIRST">First</AntSelect.Option>
                </AntSelect>
              </AntForm.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                label="Booking Start Date"
                name="bookingStartDate"
                rules={[
                  {
                    required: true,
                    message: "Please select booking start date",
                  },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                label="Booking End Date"
                name="bookingEndDate"
                rules={[
                  { required: true, message: "Please select booking end date" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </AntForm.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <AntForm.Item
                label="Travel Start Date"
                name="travelStartDate"
                rules={[
                  {
                    required: true,
                    message: "Please select travel start date",
                  },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </AntForm.Item>
            </Col>
            <Col span={12}>
              <AntForm.Item
                label="Travel End Date"
                name="travelEndDate"
                rules={[
                  { required: true, message: "Please select travel end date" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </AntForm.Item>
            </Col>
          </Row>

          <AntForm.Item
            label="Point of Sale (POS)"
            name="pos"
            rules={[
              { required: true, message: "Please select at least one POS" },
            ]}
          >
            <AntCheckbox.Group>
              <Row>
                {countries.map((country) => (
                  <Col span={6} key={country}>
                    <AntCheckbox value={country}>{country}</AntCheckbox>
                  </Col>
                ))}
              </Row>
            </AntCheckbox.Group>
          </AntForm.Item>

          <AntForm.Item
            label="Eligible Agent Tiers"
            name="eligibleAgentTiers"
            rules={[
              { required: true, message: "Please select at least one tier" },
            ]}
          >
            <AntCheckbox.Group>
              <Row>
                {agentTiers.map((tier) => (
                  <Col span={6} key={tier}>
                    <AntCheckbox value={tier}>{tier}</AntCheckbox>
                  </Col>
                ))}
              </Row>
            </AntCheckbox.Group>
          </AntForm.Item>

          <Row gutter={16}>
            <Col span={8}>
              <AntForm.Item label="Seat Allotment" name="seatAllotment">
                <InputNumber
                  placeholder="50"
                  min={0}
                  style={{ width: "100%" }}
                />
              </AntForm.Item>
            </Col>
            <Col span={8}>
              <AntForm.Item label="Min Stay (days)" name="minStay">
                <InputNumber
                  placeholder="7"
                  min={0}
                  style={{ width: "100%" }}
                />
              </AntForm.Item>
            </Col>
            <Col span={8}>
              <AntForm.Item label="Max Stay (days)" name="maxStay">
                <InputNumber
                  placeholder="30"
                  min={0}
                  style={{ width: "100%" }}
                />
              </AntForm.Item>
            </Col>
          </Row>

          <AntForm.Item label="Blackout Dates (Optional)" name="blackoutDates">
            <DatePicker.RangePicker 
              multiple
              style={{ width: "100%" }}
              placeholder={["Select blackout dates", ""]}
            />
          </AntForm.Item>

          <AntForm.Item label="Eligible Cohorts (Optional)" name="eligibleCohorts">
            <AntSelect
              mode="tags"
              placeholder="Enter cohort codes (e.g., CORP001, VIP002)"
              style={{ width: "100%" }}
              tokenSeparators={[',']}
            />
          </AntForm.Item>

          <AntForm.Item label="Remarks" name="remarks">
            <AntInput.TextArea placeholder="Additional notes..." rows={3} />
          </AntForm.Item>

          <AntForm.Item>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
              }}
            >
              <AntButton onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </AntButton>
              <AntButton
                type="primary"
                htmlType="submit"
                loading={createFareMutation.isPending}
              >
                {createFareMutation.isPending ? "Creating..." : "Create Fare"}
              </AntButton>
            </div>
          </AntForm.Item>
        </AntForm>
      </Modal>
    </div>
  );
}
