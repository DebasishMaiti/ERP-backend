import mongoose, { Schema } from "mongoose";

const STATUS_TYPES = ["draft", "compare", "approval", "approved"] as const;

const IndentSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    boq: { type: Schema.Types.ObjectId, ref: "Boq", required: true },
    location: { type: String, required: true, trim: true },
    neededBy: { type: Date, required: true },
    requester: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },

    items: [
      {
        itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
        quantity: { type: Number, required: true, min: 1 },
        remarks: { type: String, trim: true },

        selectedVendor: {
          vendor: { type: Schema.Types.ObjectId, ref: "Vendor" },
          pricePerUnit: { type: Number, min: 0 },
          gstAmount: { type: Number, min: 0 },
          totalPrice: { type: Number, min: 0 },
          overrideReason: { type: String, trim: true }, 
        },
      },
    ],

    status: { type: String, enum: STATUS_TYPES, required: true },
    comment: { type: String },
  },
  { timestamps: true }
);

export type IndentDocument = mongoose.InferSchemaType<typeof IndentSchema>;

export default mongoose.model<IndentDocument>("Indent", IndentSchema);