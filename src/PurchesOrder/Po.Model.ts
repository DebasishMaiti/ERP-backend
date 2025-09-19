import mongoose, { Schema } from "mongoose";

const PurchaseOrderSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    items: [
      {
        item: { type: Schema.Types.ObjectId, ref: "Item", required: true },
        description: { type: String },
        quantity: { type: Number, required: true },
        unit: { type: String },
        rate: { type: Number, required: true },
        gst: { type: Number, default: 0 },
        total: { type: Number, required: true },  
        receivedQty: { type: Number, default: 0 }, 
      },
    ],
    fleetCost: {
      type: Number,
      default: 0,
    },
    purchaserReason: {
      type: String, 
    },
    subtotal: {
      type: Number,
      required: true,
    },
    gstTotal: {
      type: Number,
      required: true,
    },
    finalTotal: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "partial", "closed"],
      default: "open",
    },
  },
  { timestamps: true }
);

export default mongoose.model("PurchaseOrder", PurchaseOrderSchema);
