
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye, 
  Calendar,
  User,
  Settings,
  RefreshCw,
  FileText,
  Clock,
  Database,
  Activity
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "../components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";
import { format } from "date-fns";

// Form components from Ant Design for date range selection
import { 
  DatePicker, 
  Space,
  Tabs as AntTabs,
  Statistic,
  Row,
  Col,
  Empty
} from "antd";

const { RangePicker } = DatePicker;
const { TabPane } = AntTabs;

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  module: string;
  entityId: string;
  action: string;
  beforeData?: any;
  afterData?: any;
  diff?: Record<string, { from: any; to: any }>;
  justification?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  createdAt: string;
}

export default function LogsVersionHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [userFilter, setUserFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [entityHistoryOpen, setEntityHistoryOpen] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string>("");
  const [rollbackDialogOpen, setRollbackDialogOpen] = useState(false);
  const [rollbackJustification, setRollbackJustification] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Build filters object
  const filters = {
    ...(moduleFilter && moduleFilter !== "all" && { module: moduleFilter }),
    ...(actionFilter && actionFilter !== "all" && { action: actionFilter }),
    ...(userFilter && { user: userFilter }),
    ...(dateRange && { 
      startDate: dateRange[0], 
      endDate: dateRange[1] 
    }),
  };

  // Fetch audit logs
  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await fetch(`/api/audit-logs?${params}`);
      if (!response.ok) throw new Error("Failed to fetch audit logs");
      return response.json();
    },
  });

  // Fetch entity history
  const { data: entityHistory = [] } = useQuery({
    queryKey: ["audit-logs-entity", selectedEntityId],
    queryFn: async () => {
      if (!selectedEntityId) return [];
      const response = await fetch(`/api/audit-logs/entity/${selectedEntityId}`);
      if (!response.ok) throw new Error("Failed to fetch entity history");
      return response.json();
    },
    enabled: !!selectedEntityId,
  });

  // Export audit logs
  const exportLogsMutation = useMutation({
    mutationFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await fetch(`/api/audit-logs/export?${params}`);
      if (!response.ok) throw new Error("Failed to export logs");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Export Successful",
        description: "Audit logs have been exported to CSV.",
      });
    },
    onError: (error) => {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Rollback entity
  const rollbackMutation = useMutation({
    mutationFn: async ({ logId, justification }: { logId: string; justification: string }) => {
      const response = await fetch(`/api/audit-logs/${logId}/rollback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user": "admin", // In real app, this would come from auth context
        },
        body: JSON.stringify({ justification }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to rollback");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Rollback Successful",
        description: "Entity has been rolled back to the previous version.",
      });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      setViewDetailsOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Rollback Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter logs based on search term
  const filteredLogs = auditLogs.filter((log: AuditLog) =>
    log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.module.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get action badge variant
  const getActionVariant = (action: string) => {
    switch (action) {
      case "CREATED": return "default";
      case "UPDATED": return "secondary";
      case "DELETED": return "destructive";
      case "STATUS_CHANGED": return "outline";
      default: return "default";
    }
  };

  // Calculate statistics
  const totalLogs = filteredLogs.length;
  const uniqueUsers = new Set(filteredLogs.map((log: AuditLog) => log.user)).size;
  const uniqueModules = new Set(filteredLogs.map((log: AuditLog) => log.module)).size;
  const recentChanges = filteredLogs.filter((log: AuditLog) => {
    const logDate = new Date(log.timestamp);
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return logDate > dayAgo;
  }).length;

  const renderDiffDetails = (diff: Record<string, { from: any; to: any }>) => {
    if (!diff) return null;

    return (
      <div className="space-y-2">
        <h4 className="font-semibold text-sm">Changes:</h4>
        {Object.entries(diff).map(([field, change]) => (
          <div key={field} className="text-sm">
            <span className="font-medium">{field}:</span>
            <div className="ml-4">
              <div className="text-red-600">- {JSON.stringify(change.from)}</div>
              <div className="text-green-600">+ {JSON.stringify(change.to)}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Logs & Version History</h1>
          <p className="text-sm text-muted-foreground">
            Monitor system changes and maintain compliance records
          </p>
        </div>
        <Button onClick={() => exportLogsMutation.mutate()} disabled={exportLogsMutation.isPending}>
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <CardContent className="p-4">
              <Statistic
                title="Total Log Entries"
                value={totalLogs}
                prefix={<FileText className="w-4 h-4" />}
              />
            </CardContent>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <CardContent className="p-4">
              <Statistic
                title="Active Users"
                value={uniqueUsers}
                prefix={<User className="w-4 h-4" />}
              />
            </CardContent>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <CardContent className="p-4">
              <Statistic
                title="Modules Tracked"
                value={uniqueModules}
                prefix={<Database className="w-4 h-4" />}
              />
            </CardContent>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <CardContent className="p-4">
              <Statistic
                title="Recent Changes (24h)"
                value={recentChanges}
                prefix={<Activity className="w-4 h-4" />}
              />
            </CardContent>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="module">Module</Label>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All modules</SelectItem>
                  <SelectItem value="NegotiatedFare">Negotiated Fares</SelectItem>
                  <SelectItem value="DynamicDiscountRule">Dynamic Discounts</SelectItem>
                  <SelectItem value="AirAncillaryRule">Air Ancillaries</SelectItem>
                  <SelectItem value="NonAirRate">Non-Air Rates</SelectItem>
                  <SelectItem value="Bundle">Bundles</SelectItem>
                  <SelectItem value="OfferRule">Offer Rules</SelectItem>
                  <SelectItem value="Agent">Agents</SelectItem>
                  <SelectItem value="Cohort">Cohorts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="action">Action</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  <SelectItem value="CREATED">Created</SelectItem>
                  <SelectItem value="UPDATED">Updated</SelectItem>
                  <SelectItem value="DELETED">Deleted</SelectItem>
                  <SelectItem value="STATUS_CHANGED">Status Changed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="user">User</Label>
              <Input
                id="user"
                placeholder="Filter by user..."
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="daterange">Date Range</Label>
              <Space direction="vertical" style={{ width: '100%' }}>
                <RangePicker
                  style={{ width: '100%' }}
                  onChange={(dates) => {
                    if (dates && dates[0] && dates[1]) {
                      setDateRange([
                        dates[0].toISOString(),
                        dates[1].toISOString()
                      ]);
                    } else {
                      setDateRange(null);
                    }
                  }}
                />
              </Space>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <Empty description="No audit logs found" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Entity ID</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Justification</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log: AuditLog) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm:ss")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {log.user}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.module}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        className="p-0 h-auto font-mono text-sm"
                        onClick={() => {
                          setSelectedEntityId(log.entityId);
                          setEntityHistoryOpen(true);
                        }}
                      >
                        {log.entityId}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionVariant(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {log.justification || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedLog(log);
                            setViewDetailsOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {log.beforeData && log.action !== "CREATED" && log.action !== "ROLLBACK" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedLog(log);
                              setRollbackDialogOpen(true);
                            }}
                            title="Rollback to this version"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Log Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Timestamp</Label>
                  <p className="text-sm">{format(new Date(selectedLog.timestamp), "PPpp")}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">User</Label>
                  <p className="text-sm">{selectedLog.user}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Module</Label>
                  <p className="text-sm">{selectedLog.module}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Entity ID</Label>
                  <p className="text-sm font-mono">{selectedLog.entityId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Action</Label>
                  <Badge variant={getActionVariant(selectedLog.action)}>
                    {selectedLog.action}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">IP Address</Label>
                  <p className="text-sm">{selectedLog.ipAddress || "-"}</p>
                </div>
              </div>
              
              {selectedLog.justification && (
                <div>
                  <Label className="text-sm font-medium">Justification</Label>
                  <p className="text-sm">{selectedLog.justification}</p>
                </div>
              )}

              {selectedLog.diff && Object.keys(selectedLog.diff).length > 0 && (
                <div>
                  {renderDiffDetails(selectedLog.diff)}
                </div>
              )}

              <AntTabs defaultActiveKey="before">
                <TabPane tab="Before" key="before">
                  <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-60">
                    {JSON.stringify(selectedLog.beforeData, null, 2)}
                  </pre>
                </TabPane>
                <TabPane tab="After" key="after">
                  <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-60">
                    {JSON.stringify(selectedLog.afterData, null, 2)}
                  </pre>
                </TabPane>
              </AntTabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Entity History Dialog */}
      <Dialog open={entityHistoryOpen} onOpenChange={setEntityHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Entity Version History: {selectedEntityId}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {entityHistory.length === 0 ? (
              <Empty description="No history found for this entity" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Changes</TableHead>
                    <TableHead>Justification</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entityHistory.map((log: AuditLog) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm:ss")}
                      </TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>
                        <Badge variant={getActionVariant(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.diff ? Object.keys(log.diff).join(", ") : "-"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.justification || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Rollback Confirmation Dialog */}
      <Dialog open={rollbackDialogOpen} onOpenChange={setRollbackDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Rollback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to rollback this entity to its previous version? This action will create a new audit log entry.
            </p>
            {selectedLog && (
              <div className="bg-muted p-3 rounded text-sm">
                <div><strong>Entity:</strong> {selectedLog.entityId}</div>
                <div><strong>Module:</strong> {selectedLog.module}</div>
                <div><strong>Action:</strong> {selectedLog.action}</div>
                <div><strong>Date:</strong> {format(new Date(selectedLog.timestamp), "PPpp")}</div>
              </div>
            )}
            <div>
              <Label htmlFor="rollback-justification">Justification (required)</Label>
              <Input
                id="rollback-justification"
                placeholder="Explain why you are rolling back this change..."
                value={rollbackJustification}
                onChange={(e) => setRollbackJustification(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setRollbackDialogOpen(false);
                  setRollbackJustification("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedLog && rollbackJustification.trim()) {
                    rollbackMutation.mutate({
                      logId: selectedLog.id,
                      justification: rollbackJustification
                    });
                    setRollbackJustification("");
                  }
                }}
                disabled={!rollbackJustification.trim() || rollbackMutation.isPending}
              >
                {rollbackMutation.isPending ? "Rolling back..." : "Rollback"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
