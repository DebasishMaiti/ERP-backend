import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useIsMobile } from "@/hooks/use-mobile";
import { Package, Camera, Check, RotateCcw, Plus, X } from "lucide-react";
import mockData from "@/data/mockData.json";
import { useToast } from "@/hooks/use-toast";

interface SelectedItem {
  itemId: string;
  name: string;
  unit: string;
  pending: number;
  receivedQty: string;
  remark: string;
  selected: boolean;
}

interface InvoiceData {
  number: string;
  date: string;
  photo: string | null;
}

export default function POReceipt() {
  const { poId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceData[]>([{ number: '', date: '', photo: null }]);
  const [receiptData, setReceiptData] = useState({
    receiptDate: new Date().toISOString().split('T')[0],
    receivedBy: 'Current User', // This would come from auth context
    notes: ''
  });
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentInvoiceIndex, setCurrentInvoiceIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Find PO
  const po = mockData.purchaseOrders.find(p => p.id === decodeURIComponent(poId || ""));

  // Initialize selected items from PO
  if (po && selectedItems.length === 0) {
    const items = po.items
      .filter(item => item.pending > 0)
      .map(item => ({
        itemId: item.itemId,
        name: item.name,
        unit: item.unit,
        pending: item.pending,
        receivedQty: '',
        remark: '',
        selected: false
      }));
    setSelectedItems(items);
  }

  if (!po) {
    return (
      <div>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">The requested purchase order could not be found.</p>
              <Button onClick={() => navigate("/po/list")} className="mt-4">
                Back to PO List
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isStep1Valid = selectedItems.some(item => 
    Number(item.receivedQty) > 0 && 
    Number(item.receivedQty) <= item.pending
  );

  const areInvoicesValid = invoices.every(inv => inv.number.trim() !== '' && inv.photo !== null);

  const handleItemSelect = (itemId: string, checked: boolean) => {
    // No longer needed but keeping for compatibility
  };

  const handleQuantityChange = (itemId: string, quantity: string) => {
    setSelectedItems(prev => prev.map(item => 
      item.itemId === itemId ? { ...item, receivedQty: quantity } : item
    ));
  };

  const handleRemarkChange = (itemId: string, remark: string) => {
    setSelectedItems(prev => prev.map(item => 
      item.itemId === itemId ? { ...item, remark } : item
    ));
  };

  const selectAllPending = () => {
    setSelectedItems(prev => prev.map(item => ({ 
      ...item, 
      receivedQty: item.pending.toString()
    })));
  };

  const receiveFullySelected = () => {
    setSelectedItems(prev => prev.map(item => 
      Number(item.receivedQty) > 0 ? { ...item, receivedQty: item.pending.toString() } : item
    ));
  };

  const addInvoice = () => {
    setInvoices(prev => [...prev, { number: '', date: '', photo: null }]);
  };

  const removeInvoice = (index: number) => {
    if (invoices.length > 1) {
      setInvoices(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateInvoice = (index: number, field: keyof InvoiceData, value: string) => {
    setInvoices(prev => prev.map((inv, i) => 
      i === index ? { ...inv, [field]: value } : inv
    ));
  };

  const startCamera = (invoiceIndex: number) => {
    setCurrentInvoiceIndex(invoiceIndex);
    navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    }).then(stream => {
      setIsCapturing(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    }).catch(() => {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    });
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0);
      
      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setInvoices(prev => prev.map((inv, i) => 
        i === currentInvoiceIndex ? { ...inv, photo: photoDataUrl } : inv
      ));

      // Stop camera
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCapturing(false);

      toast({
        title: "Invoice Photo Captured",
        description: "Invoice photo captured successfully"
      });
    }
  };

  const retakePhoto = () => {
    setInvoices(prev => prev.map((inv, i) => 
      i === currentInvoiceIndex ? { ...inv, photo: null } : inv
    ));
    startCamera(currentInvoiceIndex);
  };

  const stopCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
    setIsCapturing(false);
  };

  const confirmReceipt = () => {
    if (!areInvoicesValid) {
      toast({
        title: "Photos Required",
        description: "Please take photos of all invoices",
        variant: "destructive"
      });
      return;
    }

    const receivedItems = selectedItems.filter(item => Number(item.receivedQty) > 0);
    
    toast({
      title: "Receipt Recorded",
      description: `Successfully recorded receipt for ${receivedItems.length} items with ${invoices.length} invoice(s)`
    });

    navigate(`/po/${poId}`);
  };

  const proceedToInvoices = () => {
    if (isStep1Valid) {
      setStep(2);
    }
  };

  return (
    <div>
      
      <div className={`container mx-auto px-4 py-6 ${isMobile ? 'px-2 py-3' : ''}`}>
        <Card>
          <CardHeader className={isMobile ? 'p-3 pb-2' : ''}>
            <div className={`flex items-center justify-between ${isMobile ? 'flex-col gap-2' : ''}`}>
              <CardTitle className={isMobile ? 'text-lg text-center' : ''}>
                Step {step} of 2: {step === 1 ? "Select Items & Quantities" : "Invoices & Receipt Details"}
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant={step >= 1 ? "default" : "outline"}>Items</Badge>
                <Badge variant={step >= 2 ? "default" : "outline"}>Invoices</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className={`space-y-6 ${isMobile ? 'p-3 pt-2' : ''}`}>
            {step === 1 && (
              <>
                {/* Helper Buttons */}
                <div className={`flex gap-2 mb-4 ${isMobile ? 'flex-col' : ''}`}>
                  <Button variant="outline" size={isMobile ? "default" : "sm"} onClick={selectAllPending}>
                    Fill All Max Qty
                  </Button>
                  <Button variant="outline" size={isMobile ? "default" : "sm"} onClick={receiveFullySelected}>
                    Fill Max (With Qty)
                  </Button>
                </div>

                {/* Items Selection */}
                <div className={`space-y-4 ${isMobile ? 'space-y-3' : ''}`}>
                  {selectedItems.map((item) => (
                    <Card key={item.itemId}>
                      <CardContent className={isMobile ? "p-3" : "p-4"}>
                        <div className={`${isMobile ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-4 gap-4'}`}>
                          {/* Mobile: Item and Pending side by side */}
                          {isMobile ? (
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-sm font-medium">Item</label>
                                <div className="text-sm">
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-muted-foreground text-xs">{item.itemId}</div>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Pending</label>
                                <div className="text-sm">{item.pending} {item.unit}</div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div>
                                <label className="text-sm font-medium">Item</label>
                                <div className="text-sm">
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-muted-foreground">{item.itemId}</div>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Pending</label>
                                <div className="text-sm">{item.pending} {item.unit}</div>
                              </div>
                            </>
                          )}
                          
                          <div>
                            <label className="text-sm font-medium">Received Qty</label>
                            <Input
                              type="number"
                              max={item.pending}
                              placeholder={`Max ${item.pending}`}
                              value={item.receivedQty}
                              onChange={(e) => handleQuantityChange(item.itemId, e.target.value)}
                              className={isMobile ? "h-10" : ""}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Remark</label>
                            <Input
                              placeholder="Optional notes"
                              value={item.remark}
                              onChange={(e) => handleRemarkChange(item.itemId, e.target.value)}
                              className={isMobile ? "h-10" : ""}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className={`flex ${isMobile ? 'flex-col' : 'justify-end'}`}>
                  <Button 
                    onClick={proceedToInvoices}
                    disabled={!isStep1Valid}
                    size={isMobile ? "default" : "lg"}
                    className={isMobile ? "w-full" : ""}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Add Invoices & Photos
                  </Button>
                </div>
              </>
            )}

            {step === 2 && (
              <div className={`space-y-6 ${isMobile ? 'space-y-4' : ''}`}>
                {/* Receipt Summary */}
                <div className={`bg-muted p-4 rounded-lg ${isMobile ? 'p-3' : ''}`}>
                  <h3 className="font-medium mb-2">Receipt Summary</h3>
                  {selectedItems.filter(item => Number(item.receivedQty) > 0).map(item => (
                    <p key={item.itemId} className={`text-sm ${isMobile ? 'text-xs' : ''}`}>
                      {item.name}: {item.receivedQty} {item.unit}
                      {item.remark && ` (${item.remark})`}
                    </p>
                  ))}
                </div>

                {/* Receipt Details */}
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                  <div>
                    <label className="text-sm font-medium">Receipt Date</label>
                    <Input 
                      type="date"
                      value={receiptData.receiptDate}
                      onChange={(e) => setReceiptData(prev => ({ ...prev, receiptDate: e.target.value }))}
                      className={isMobile ? "h-10" : ""}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Received By</label>
                    <Input 
                      value={receiptData.receivedBy}
                      onChange={(e) => setReceiptData(prev => ({ ...prev, receivedBy: e.target.value }))}
                      className={isMobile ? "h-10" : ""}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Global Notes</label>
                  <Textarea 
                    placeholder="Delivery notes, condition, vehicle no., etc."
                    value={receiptData.notes}
                    onChange={(e) => setReceiptData(prev => ({ ...prev, notes: e.target.value }))}
                    className={isMobile ? "min-h-[80px]" : ""}
                  />
                </div>

                {/* Invoices */}
                <div className={`space-y-4 ${isMobile ? 'space-y-3' : ''}`}>
                  <div className={`flex items-center justify-between ${isMobile ? 'flex-col gap-2' : ''}`}>
                    <h3 className="font-medium">Invoices</h3>
                    <Button variant="outline" size={isMobile ? "default" : "sm"} onClick={addInvoice} className={isMobile ? "w-full" : ""}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Invoice
                    </Button>
                  </div>

                  {invoices.map((invoice, index) => (
                    <Card key={index}>
                      <CardContent className={isMobile ? "p-3" : "p-4"}>
                        <div className={`flex items-start justify-between mb-4 ${isMobile ? 'mb-3' : ''}`}>
                          <h4 className="font-medium">Invoice {index + 1}</h4>
                          {invoices.length > 1 && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeInvoice(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className={`grid gap-4 mb-4 ${isMobile ? 'grid-cols-1 mb-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                          <div>
                            <label className="text-sm font-medium">Invoice Number *</label>
                            <Input
                              placeholder="INV-XXX"
                              value={invoice.number}
                              onChange={(e) => updateInvoice(index, 'number', e.target.value)}
                              className={isMobile ? "h-10" : ""}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Invoice Date</label>
                            <Input
                              type="date"
                              value={invoice.date}
                              onChange={(e) => updateInvoice(index, 'date', e.target.value)}
                              className={isMobile ? "h-10" : ""}
                            />
                          </div>
                        </div>

                        {/* Camera/Photo Section */}
                        {isCapturing && currentInvoiceIndex === index ? (
                          <div className="space-y-4">
                            <div className="relative w-full max-w-md mx-auto">
                              <video
                                ref={videoRef}
                                className="w-full rounded-lg border"
                                autoPlay
                                playsInline
                                muted
                              />
                              <canvas ref={canvasRef} className="hidden" />
                            </div>
                            <div className="flex gap-2 justify-center">
                              <Button onClick={capturePhoto} size="lg">
                                <Camera className="w-4 h-4 mr-2" />
                                Capture Photo
                              </Button>
                              <Button variant="outline" onClick={stopCamera}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : invoice.photo ? (
                          <div className="space-y-4">
                            <div className="text-center">
                              <img
                                src={invoice.photo}
                                alt={`Invoice ${index + 1}`}
                                className="w-full max-w-md mx-auto rounded-lg border"
                              />
                            </div>
                            <div className="flex gap-2 justify-center">
                              <Button variant="outline" onClick={() => retakePhoto()}>
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Retake Photo
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center space-y-4">
                            <p className="text-muted-foreground">Invoice photo required</p>
                            <Button 
                              onClick={() => startCamera(index)} 
                              disabled={!invoice.number.trim()}
                              size={isMobile ? "default" : "lg"}
                              className={isMobile ? "w-full" : ""}
                            >
                              <Camera className="w-4 h-4 mr-2" />
                              Take Invoice Photo
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className={`flex justify-between ${isMobile ? 'flex-col gap-3' : ''}`}>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setStep(1);
                      stopCamera();
                    }}
                    className={isMobile ? "w-full order-2" : ""}
                  >
                    Back to Items
                  </Button>
                  <Button 
                    onClick={confirmReceipt}
                    disabled={!areInvoicesValid}
                    size={isMobile ? "default" : "lg"}
                    className={isMobile ? "w-full order-1" : ""}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Confirm Receipt
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}