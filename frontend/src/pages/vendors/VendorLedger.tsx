import { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, CreditCard, FileText, AlertTriangle, Eye, Calendar, ArrowUpDown, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import mockData from "@/data/mockData.json";
interface LedgerEntry {
  id: string;
  date: string;
  type: "PO Add" | "Payment" | "Credit Note" | "Overbill Approved" | "Adjustment";
  refNo: string;
  description: string;
  debit: number;
  credit: number;
  balanceAfter: number;
  enteredBy: string;
  createdAt: string;
}
export default function VendorLedger() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const isMobile = useIsMobile();
  const vendorId = searchParams.get("id");
  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    date: new Date().toISOString().split('T')[0],
    method: "NEFT",
    refNo: "",
    notes: ""
  });

  // Credit Note form state
  const [creditNoteForm, setCreditNoteForm] = useState({
    cnNo: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    reason: "Quality issue - Return/Replacement",
    notes: ""
  });

  // Check permissions
  const currentUser = mockData.users[0]; // In real app, get from auth context
  const canView = ["Purchaser", "Admin", "Accountant"].includes(currentUser.role);
  const canAddPayment = ["Admin", "Accountant"].includes(currentUser.role);
  const canAddCreditNote = ["Purchaser", "Admin"].includes(currentUser.role);
  if (!canView) {
    return <div className="container mx-auto px-4 py-6">
        <div className="bg-card rounded-lg p-6 shadow-card text-center">
          <p className="text-destructive">Access denied. You don't have permission to view vendor ledgers.</p>
        </div>
      </div>;
  }

  // Find vendor
  const vendor = mockData.vendors.find(v => v.id === vendorId);
  if (!vendor) {
    return <div className="container mx-auto px-4 py-6">
        <div className="bg-card rounded-lg p-6 shadow-card text-center">
          <p className="text-destructive">Vendor not found.</p>
          <Button onClick={() => navigate("/vendors/account-ledger")} className="mt-4">
            Back to Account Ledger
          </Button>
        </div>
      </div>;
  }

  // Get ledger entries for this vendor
  const allLedgerEntries = mockData.vendorLedgerEntries.filter(entry => entry.vendorId === vendorId);

  // Filter and sort entries
  const filteredEntries = useMemo(() => {
    let filtered = [...allLedgerEntries];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.refNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();
      switch (dateFilter) {
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "3months":
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case "6months":
          filterDate.setMonth(now.getMonth() - 6);
          break;
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      if (dateFilter !== "all") {
        filtered = filtered.filter(entry => new Date(entry.date) >= filterDate);
      }
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(entry => entry.type === typeFilter);
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
    return filtered;
  }, [allLedgerEntries, dateFilter, typeFilter, sortOrder, searchTerm]);

  // Calculate summary
  const summary = useMemo(() => {
    const entries = dateFilter === "all" ? allLedgerEntries : filteredEntries;
    const totalPOAmounts = entries.filter(e => e.type === "PO Add").reduce((sum, e) => sum + e.debit, 0);
    const totalPayments = entries.filter(e => e.type === "Payment").reduce((sum, e) => sum + e.credit, 0);
    const totalCreditNotes = entries.filter(e => e.type === "Credit Note").reduce((sum, e) => sum + e.credit, 0);
    const approvedOverbills = entries.filter(e => e.type === "Overbill Approved").reduce((sum, e) => sum + e.debit, 0);
    const outstanding = totalPOAmounts + approvedOverbills - totalPayments - totalCreditNotes;
    return {
      totalPOAmounts,
      totalPayments,
      totalCreditNotes,
      approvedOverbills,
      outstanding
    };
  }, [allLedgerEntries, filteredEntries, dateFilter]);

  // Get pending overbill cases
  const pendingOverbills = mockData.overbillCases.filter(ob => ob.vendorId === vendorId && ob.status === "Open");
  const handleAddPayment = () => {
    // In real app, make API call
    toast({
      title: "Payment Added",
      description: `Payment of ₹${parseInt(paymentForm.amount).toLocaleString('en-IN')} has been recorded.`
    });

    // Reset form
    setPaymentForm({
      amount: "",
      date: new Date().toISOString().split('T')[0],
      method: "NEFT",
      refNo: "",
      notes: ""
    });
  };
  const handleAddCreditNote = () => {
    // In real app, make API call
    toast({
      title: "Credit Note Added",
      description: `Credit note ${creditNoteForm.cnNo} for ₹${parseInt(creditNoteForm.amount).toLocaleString('en-IN')} has been recorded.`
    });

    // Reset form
    setCreditNoteForm({
      cnNo: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      reason: "Quality issue - Return/Replacement",
      notes: ""
    });
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "Inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "Blocked":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  const getTypeColor = (type: string) => {
    switch (type) {
      case "PO Add":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Payment":
        return "bg-green-100 text-green-800 border-green-200";
      case "Credit Note":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Overbill Approved":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  return <div>
      
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {canAddPayment && <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Payment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Amount (₹)</Label>
                      <Input id="amount" type="number" value={paymentForm.amount} onChange={e => setPaymentForm(prev => ({
                    ...prev,
                    amount: e.target.value
                  }))} placeholder="Enter amount" />
                    </div>
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" type="date" value={paymentForm.date} onChange={e => setPaymentForm(prev => ({
                    ...prev,
                    date: e.target.value
                  }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="method">Method</Label>
                      <Select value={paymentForm.method} onValueChange={value => setPaymentForm(prev => ({
                    ...prev,
                    method: value
                  }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NEFT">NEFT</SelectItem>
                          <SelectItem value="RTGS">RTGS</SelectItem>
                          <SelectItem value="IMPS">IMPS</SelectItem>
                          <SelectItem value="Cheque">Cheque</SelectItem>
                          <SelectItem value="Cash">Cash</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="refNo">Reference No.</Label>
                      <Input id="refNo" value={paymentForm.refNo} onChange={e => setPaymentForm(prev => ({
                    ...prev,
                    refNo: e.target.value
                  }))} placeholder="UTR/Cheque No." />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" value={paymentForm.notes} onChange={e => setPaymentForm(prev => ({
                  ...prev,
                  notes: e.target.value
                }))} placeholder="Additional notes (optional)" />
                  </div>
                  <Button onClick={handleAddPayment} className="w-full">
                    Add Payment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>}

          {canAddCreditNote && <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Add Credit Note
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Credit Note</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cnNo">Credit Note No.</Label>
                      <Input id="cnNo" value={creditNoteForm.cnNo} onChange={e => setCreditNoteForm(prev => ({
                    ...prev,
                    cnNo: e.target.value
                  }))} placeholder="CN/2024/001" />
                    </div>
                    <div>
                      <Label htmlFor="cnAmount">Amount (₹)</Label>
                      <Input id="cnAmount" type="number" value={creditNoteForm.amount} onChange={e => setCreditNoteForm(prev => ({
                    ...prev,
                    amount: e.target.value
                  }))} placeholder="Enter amount" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cnDate">Date</Label>
                      <Input id="cnDate" type="date" value={creditNoteForm.date} onChange={e => setCreditNoteForm(prev => ({
                    ...prev,
                    date: e.target.value
                  }))} />
                    </div>
                    <div>
                      <Label htmlFor="reason">Reason</Label>
                      <Select value={creditNoteForm.reason} onValueChange={value => setCreditNoteForm(prev => ({
                    ...prev,
                    reason: value
                  }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Quality issue - Return/Replacement">Quality Issue</SelectItem>
                          <SelectItem value="Discount">Discount</SelectItem>
                          <SelectItem value="Return">Return</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cnNotes">Notes</Label>
                    <Textarea id="cnNotes" value={creditNoteForm.notes} onChange={e => setCreditNoteForm(prev => ({
                  ...prev,
                  notes: e.target.value
                }))} placeholder="Reason for credit note" />
                  </div>
                  <Button onClick={handleAddCreditNote} className="w-full">
                    Add Credit Note
                  </Button>
                </div>
              </DialogContent>
            </Dialog>}

          {pendingOverbills.length > 0 && <Button variant="outline">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Overbilling Queue ({pendingOverbills.length})
            </Button>}
        </div>

        {/* Summary Cards - Mobile Optimized */}
        {isMobile ? (
          <div className="space-y-3">
            {/* Row 1: Total Vendors, Outstanding Balance */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background p-3 rounded-lg border">
                <div className="text-xs text-muted-foreground mb-1">PO Amounts</div>
                <div className="text-lg font-bold text-blue-600">
                  {formatCurrency(summary.totalPOAmounts)}
                </div>
              </div>
              <div className="bg-background p-3 rounded-lg border">
                <div className="text-xs text-muted-foreground mb-1">Outstanding</div>
                <div className={cn("text-lg font-bold", summary.outstanding > 0 ? "text-red-600" : summary.outstanding === 0 ? "text-green-600" : "text-blue-600")}>
                  {formatCurrency(summary.outstanding)}
                </div>
              </div>
            </div>
            
            {/* Row 2: Vendors with Outstanding and Settled */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background p-3 rounded-lg border">
                <div className="text-xs text-muted-foreground mb-1">Payments</div>
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(summary.totalPayments)}
                </div>
              </div>
              <div className="bg-background p-3 rounded-lg border">
                <div className="text-xs text-muted-foreground mb-1">Credit Notes</div>
                <div className="text-lg font-bold text-purple-600">
                  {formatCurrency(summary.totalCreditNotes)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">PO Amounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-blue-600">
                  {formatCurrency(summary.totalPOAmounts)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(summary.totalPayments)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Approved Overbills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-orange-600">
                  {formatCurrency(summary.approvedOverbills)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Credit Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-purple-600">
                  {formatCurrency(summary.totalCreditNotes)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn("text-xl font-bold", summary.outstanding > 0 ? "text-red-600" : summary.outstanding === 0 ? "text-green-600" : "text-blue-600")}>
                  {formatCurrency(summary.outstanding)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        {isMobile ? (
          <div className="flex gap-2">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Filter Transactions</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-6 space-y-4">
                  <div>
                    <Label>Date Range</Label>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="month">Last Month</SelectItem>
                        <SelectItem value="3months">Last 3 Months</SelectItem>
                        <SelectItem value="6months">Last 6 Months</SelectItem>
                        <SelectItem value="year">Last Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Transaction Type</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="PO Add">PO Add</SelectItem>
                        <SelectItem value="Payment">Payment</SelectItem>
                        <SelectItem value="Credit Note">Credit Note</SelectItem>
                        <SelectItem value="Overbill Approved">Overbill Approved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="PO Add">PO Add</SelectItem>
                  <SelectItem value="Payment">Payment</SelectItem>
                  <SelectItem value="Credit Note">Credit Note</SelectItem>
                  <SelectItem value="Overbill Approved">Overbill Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Ledger Content */}
          
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No transactions found for the selected filters.</p>
          </div>
        ) : isMobile ? (
          <div className="space-y-2">
            {filteredEntries.map(entry => (
              <div key={entry.id} className="bg-background p-3 rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-sm">{formatDate(entry.date)}</div>
                    <Badge className={cn("text-xs", getTypeColor(entry.type))}>
                      {entry.type}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs">{entry.refNo}</div>
                    <div className="text-xs text-muted-foreground">{entry.enteredBy}</div>
                  </div>
                </div>
                <div className="text-sm mb-2 line-clamp-2">{entry.description}</div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Debit</span>
                    <div className="font-medium">
                      {entry.debit > 0 ? (
                        <span className="text-red-600">{formatCurrency(entry.debit)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Credit</span>
                    <div className="font-medium">
                      {entry.credit > 0 ? (
                        <span className="text-green-600">{formatCurrency(entry.credit)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Balance</span>
                    <div className={cn("font-medium", 
                      entry.balanceAfter > 0 ? "text-red-600" : 
                      entry.balanceAfter === 0 ? "text-green-600" : "text-blue-600"
                    )}>
                      {formatCurrency(entry.balanceAfter)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Ref/Doc No.</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Debit (₹)</TableHead>
                      <TableHead className="text-right">Credit (₹)</TableHead>
                      <TableHead className="text-right">Balance (₹)</TableHead>
                      <TableHead>Entered By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map(entry => (
                      <TableRow key={entry.id}>
                        <TableCell>{formatDate(entry.date)}</TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(entry.type)}>
                            {entry.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{entry.refNo}</TableCell>
                        <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                        <TableCell className="text-right">
                          {entry.debit > 0 && (
                            <span className="text-red-600 font-medium">
                              {formatCurrency(entry.debit)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.credit > 0 && (
                            <span className="text-green-600 font-medium">
                              {formatCurrency(entry.credit)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={cn("font-medium", 
                            entry.balanceAfter > 0 ? "text-red-600" : 
                            entry.balanceAfter === 0 ? "text-green-600" : "text-blue-600"
                          )}>
                            {formatCurrency(entry.balanceAfter)}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {entry.enteredBy}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>;
}