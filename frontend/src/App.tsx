import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";

// Page imports
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Indent pages
import IndentDetail from "./pages/indent/IndentDetail";
import IndentList from "./pages/indent/IndentList";
import IndentCreate from "./pages/indent/IndentCreate";
import IndentEdit from "./pages/indent/IndentEdit";
import IndentCompare from "./pages/indent/IndentCompare";
import IndentApproval from "./pages/indent/IndentApproval";
import IndentApprovalDetail from "./pages/indent/IndentApprovalDetail";
import IndentPOsView from "./pages/indent/IndentPOsView";

// PO pages
import POList from "./pages/po/POList";
import POOpen from "./pages/po/POOpen";
import PODetail from "./pages/po/PODetail";
import POReceipt from "./pages/po/POReceipt";

// Items pages
import ItemList from "./pages/items/ItemList";
import ItemEdit from "./pages/items/ItemEdit";

// Vendors pages
import VendorList from "./pages/vendors/VendorList";
import VendorCreate from "./pages/vendors/VendorCreate";
import VendorDetail from "./pages/vendors/VendorDetail";
import VendorAccountLedger from "./pages/vendors/VendorAccountLedger";
import VendorLedger from "./pages/vendors/VendorLedger";
import VendorPayment from "./pages/vendors/VendorPayment";

// Team pages
import TeamList from "./pages/team/TeamList";
import TeamEdit from "./pages/team/TeamEdit";
import ProjectList from "./pages/team/ProjectList";
import ProjectEdit from "./pages/team/ProjectEdit";
import ProjectDetail from "./pages/team/ProjectDetail";

// BOQ pages
import BOQList from "./pages/boq/BOQList";
import BOQCreate from "./pages/boq/BOQCreate";
import BOQDetail from "./pages/boq/BOQDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Indent Routes */}
          <Route path="/indent/:id" element={<IndentDetail />} />
          <Route path="/indent/list" element={<IndentList />} />
            <Route path="/indent/create" element={<IndentCreate />} />
            <Route path="/indent/edit/:id" element={<IndentEdit />} />
            <Route path="/indent/compare" element={<IndentCompare />} />
            <Route path="/indent/approval" element={<IndentApproval />} />
            <Route path="/indent/approval/:boqId" element={<IndentApprovalDetail />} />
            <Route path="/indent/:boqId/pos" element={<IndentPOsView />} />
            
            {/* Purchase Order Routes */}
            <Route path="/po/list" element={<POList />} />
            <Route path="/po/open" element={<POOpen />} />
            <Route path="/po/:poId" element={<PODetail />} />
            <Route path="/po/:poId/receipt" element={<POReceipt />} />
            
            {/* Items Routes */}
            <Route path="/items/list" element={<ItemList />} />
            <Route path="/items/edit" element={<ItemEdit />} />
            
            {/* Vendors Routes */}
            <Route path="/vendors/list" element={<VendorList />} />
            <Route path="/vendors/create" element={<VendorCreate />} />
            <Route path="/vendors/detail" element={<VendorDetail />} />
            <Route path="/vendors/ledger" element={<VendorAccountLedger />} />
            <Route path="/vendors/account-ledger" element={<VendorAccountLedger />} />
            <Route path="/vendors/ledger-detail" element={<VendorLedger />} />
            <Route path="/vendors/payment" element={<VendorPayment />} />
            
            {/* Team Routes */}
            <Route path="/team/list" element={<TeamList />} />
            <Route path="/team/edit" element={<TeamEdit />} />
            <Route path="/team/projects" element={<ProjectList />} />
            <Route path="/team/project-edit" element={<ProjectEdit />} />
            <Route path="/team/project/:id" element={<ProjectDetail />} />
            
            {/* BOQ Routes */}
            <Route path="/boq/list" element={<BOQList />} />
            <Route path="/boq/create" element={<BOQCreate />} />
            <Route path="/boq/:boqId" element={<BOQDetail />} />
            <Route path="/boq/edit/:boqId" element={<BOQCreate />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;