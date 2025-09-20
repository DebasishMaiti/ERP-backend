import mongoose, { Schema } from "mongoose";

const STATUS_TYPES = ["active", "inactive"] as const;

const ItemSchema = new Schema(
  {
    name: { type: String, required: true },
    unit: { type: String, required: true },
    status:{type:String, enum:["active","deleted"],default:"active"},
    vendors: [
      {
        vendor: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
        pricePerUnit: { type: Number, required: true, min: 0 },
        gstAmount: { type: Number, required: true, min: 0 },
        totalPrice: { type: Number, required: true, min: 0 },
        status: { type: String, enum: STATUS_TYPES, default: "active" },
        notes: { type: String, trim: true },
      },
    ],
  },
  { timestamps: true }
);

export type ItemDocument = mongoose.InferSchemaType<typeof ItemSchema>;

export default mongoose.model<ItemDocument>("Item", ItemSchema);
