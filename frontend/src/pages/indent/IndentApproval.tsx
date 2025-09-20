import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, FileText } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import mockData from "@/data/mockData.json";
export default function BoQApproval() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Mock user role - in real app this would come from auth context
  const userRole = "Admin" as "Admin" | "Purchaser" | "Accountant" | "Employee";

  // Filter BoQs - only show ones pending approval
  const pendingBoQs = mockData.boqs.filter(boq => {
    // Role-based filtering
    if (userRole === "Employee") return false; // Employees can't see approval queue

    // Only show BoQs that are actually pending approval
    return boq.status === "Approval";
  });
  const projects = mockData.projects || [];
  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || projectId;
  };
  const getExceptionSummary = (exceptions: any) => {
    if (!exceptions) return [];
    const chips = [];
    if (exceptions.nonLowest > 0) chips.push({
      label: `Non-lowest (${exceptions.nonLowest})`,
      variant: "outline" as const
    });
    if (exceptions.missingReason > 0) chips.push({
      label: `Missing Reason (${exceptions.missingReason})`,
      variant: "destructive" as const
    });
    return chips;
  };
  if (userRole === "Employee") {
    return <div>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-muted-foreground">Employees do not have access to the approval queue.</p>
          </div>
        </div>
      </div>;
  }
  return <div>
      <div className="container mx-auto px-4 py-6">

        {/* Results */}
        {pendingBoQs.length === 0 ? <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No BoQs are currently pending approval.</p>
            </CardContent>
          </Card> : <>
            {/* Desktop Table */}
            {!isMobile && <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>BoQ #</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Submitted By / On</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Exceptions</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingBoQs.map(boq => <TableRow key={boq.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="font-medium">{boq.number}</TableCell>
                          <TableCell>{getProjectName(boq.project)}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{boq.submittedBy || boq.createdBy}</div>
                              <div className="text-sm text-muted-foreground">
                                {boq.submittedOn || boq.createdOn}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{boq.itemCount} items</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {getExceptionSummary(boq.exceptions).map((chip, index) => <Badge key={index} variant={chip.variant} className="text-xs">
                                  {chip.label}
                                </Badge>)}
                              {getExceptionSummary(boq.exceptions).length === 0 && <Badge variant="secondary" className="text-xs">No exceptions</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => navigate(`/indent/approval/${boq.id}`)}>
                                Review
                              </Button>
                              
                            </div>
                          </TableCell>
                        </TableRow>)}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>}

            {/* Mobile Cards */}
            {isMobile && <div className="space-y-2">
                {pendingBoQs.map(boq => <Card key={boq.id}>
                    <CardContent className="p-2">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className="font-semibold text-sm">{boq.number}</p>
                          <p className="text-xs text-muted-foreground">{getProjectName(boq.project)}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">{boq.itemCount} items</Badge>
                      </div>
                      
                      <div className="space-y-1 mb-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Submitted by:</span> {boq.submittedBy || boq.createdBy}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date:</span> {boq.submittedOn || boq.createdOn}
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {getExceptionSummary(boq.exceptions).map((chip, index) => <Badge key={index} variant={chip.variant} className="text-xs">
                              {chip.label}
                            </Badge>)}
                          {getExceptionSummary(boq.exceptions).length === 0 && <Badge variant="secondary" className="text-xs">No exceptions</Badge>}
                        </div>
                      </div>
                      
                      <Button size="sm" onClick={() => navigate(`/indent/approval/${boq.id}`)}>
                        Review
                      </Button>
                    </CardContent>
                  </Card>)}
              </div>}
          </>}
      </div>
    </div>;
}