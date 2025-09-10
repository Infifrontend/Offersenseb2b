
import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Handshake, Upload, Plus, Search, Filter, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
  eligibleAgentTiers: z.array(z.enum(["PLATINUM", "GOLD", "SILVER", "BRONZE"])).min(1, "Select at least one tier"),
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const form = useForm<FareFormData>({
    resolver: zodResolver(fareFormSchema),
    defaultValues: {
      pos: [],
      eligibleAgentTiers: [],
      eligibleCohorts: [],
      blackoutDates: [],
    },
  });

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
      setIsCreateDialogOpen(false);
      form.reset();
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
      "airlineCode", "fareCode", "origin", "destination", "tripType", "cabinClass",
      "baseNetFare", "currency", "bookingStartDate", "bookingEndDate",
      "travelStartDate", "travelEndDate", "pos", "seatAllotment", "minStay",
      "maxStay", "blackoutDates", "eligibleAgentTiers", "eligibleCohorts", "remarks"
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," + 
      headers.join(",") + "\n" +
      'AA,NEGO001,NYC,LAX,ROUND_TRIP,ECONOMY,299.00,USD,2024-01-01,2024-12-31,2024-02-01,2024-11-30,"[""US"",""CA""]",50,7,30,"[]","[""GOLD"",""SILVER""]","[]","Sample negotiated fare"';
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "negotiated_fares_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onSubmit = (data: FareFormData) => {
    createFareMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Negotiated Fare Manager</h1>
        <p className="text-muted-foreground">
          Manage and configure negotiated fares with airline partners.
        </p>
      </div>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Upload & Manage</TabsTrigger>
          <TabsTrigger value="create">Create Fare</TabsTrigger>
          <TabsTrigger value="list">View All Fares</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Negotiated Fares
                </CardTitle>
                <CardDescription>
                  Upload fares via CSV/Excel file. Download template for proper format.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={downloadTemplate} variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </Button>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadMutation.isPending}
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadMutation.isPending ? "Uploading..." : "Upload File"}
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                {uploadResult && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Upload completed: {uploadResult.inserted} inserted, 
                      {uploadResult.conflicts} conflicts, {uploadResult.errors} errors
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {fares?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Fares</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {fares?.filter(f => f.status === "ACTIVE").length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Fares</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Negotiated Fare</CardTitle>
              <CardDescription>
                Manually enter a new negotiated fare agreement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="airlineCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Airline Code</FormLabel>
                          <FormControl>
                            <Input placeholder="AA" maxLength={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="fareCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fare Code</FormLabel>
                          <FormControl>
                            <Input placeholder="NEGO001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {currencies.map((currency) => (
                                <SelectItem key={currency} value={currency}>
                                  {currency}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="origin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Origin</FormLabel>
                          <FormControl>
                            <Input placeholder="NYC" maxLength={3} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="destination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Destination</FormLabel>
                          <FormControl>
                            <Input placeholder="LAX" maxLength={3} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="baseNetFare"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base Net Fare</FormLabel>
                          <FormControl>
                            <Input placeholder="299.00" type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tripType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trip Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select trip type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ONE_WAY">One Way</SelectItem>
                              <SelectItem value="ROUND_TRIP">Round Trip</SelectItem>
                              <SelectItem value="MULTI_CITY">Multi City</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cabinClass"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cabin Class</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select cabin class" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ECONOMY">Economy</SelectItem>
                              <SelectItem value="PREMIUM_ECONOMY">Premium Economy</SelectItem>
                              <SelectItem value="BUSINESS">Business</SelectItem>
                              <SelectItem value="FIRST">First</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bookingStartDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Booking Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bookingEndDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Booking End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="travelStartDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Travel Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="travelEndDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Travel End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="pos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Point of Sale (POS)</FormLabel>
                          <div className="grid grid-cols-4 gap-2">
                            {countries.map((country) => (
                              <div key={country} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`pos-${country}`}
                                  checked={field.value?.includes(country)}
                                  onCheckedChange={(checked) => {
                                    const updatedPos = checked
                                      ? [...(field.value || []), country]
                                      : (field.value || []).filter((c) => c !== country);
                                    field.onChange(updatedPos);
                                  }}
                                />
                                <Label htmlFor={`pos-${country}`}>{country}</Label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="eligibleAgentTiers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Eligible Agent Tiers</FormLabel>
                          <div className="grid grid-cols-4 gap-2">
                            {agentTiers.map((tier) => (
                              <div key={tier} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`tier-${tier}`}
                                  checked={field.value?.includes(tier)}
                                  onCheckedChange={(checked) => {
                                    const updatedTiers = checked
                                      ? [...(field.value || []), tier]
                                      : (field.value || []).filter((t) => t !== tier);
                                    field.onChange(updatedTiers);
                                  }}
                                />
                                <Label htmlFor={`tier-${tier}`}>{tier}</Label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="seatAllotment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seat Allotment</FormLabel>
                          <FormControl>
                            <Input placeholder="50" type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="minStay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Stay (days)</FormLabel>
                          <FormControl>
                            <Input placeholder="7" type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxStay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Stay (days)</FormLabel>
                          <FormControl>
                            <Input placeholder="30" type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="remarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Remarks</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional notes..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={createFareMutation.isPending}>
                    {createFareMutation.isPending ? "Creating..." : "Create Fare"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Negotiated Fares</CardTitle>
              <CardDescription>
                View and manage all negotiated fare agreements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Loading fares...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Airline</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Cabin</TableHead>
                      <TableHead>Fare</TableHead>
                      <TableHead>Validity</TableHead>
                      <TableHead>Tiers</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fares?.map((fare: NegotiatedFare) => (
                      <TableRow key={fare.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{fare.airlineCode}</div>
                            <div className="text-sm text-muted-foreground">{fare.fareCode}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{fare.origin} → {fare.destination}</div>
                            <div className="text-sm text-muted-foreground">{fare.tripType}</div>
                          </div>
                        </TableCell>
                        <TableCell>{fare.cabinClass}</TableCell>
                        <TableCell>
                          <div className="font-medium">{fare.currency} {fare.baseNetFare}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Book: {fare.bookingStartDate} - {fare.bookingEndDate}</div>
                            <div>Travel: {fare.travelStartDate} - {fare.travelEndDate}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-x-1">
                            {fare.eligibleAgentTiers.map((tier) => (
                              <Badge key={tier} variant="secondary">{tier}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={fare.status === "ACTIVE" ? "default" : "destructive"}>
                            {fare.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
