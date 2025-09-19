import mongoose, { Schema } from "mongoose";

const VendorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      trim: true,
   
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
   
    },
    address: { type: String, required: true },
    gstin: { type: String, required: true, trim: true, unique: true },
    paymentDays: { type: Number, required: true, min: 0 },
    active: { type: Boolean, default: true },
    notes: { type: String },
  },
  { timestamps: true }
);
 
 
 
export type VendorDocument = mongoose.InferSchemaType<typeof VendorSchema>;

 
export default mongoose.model<VendorDocument>("Vendor", VendorSchema);
