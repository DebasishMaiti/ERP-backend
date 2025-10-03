import mongoose, { Schema } from "mongoose";

const VendorSchema = new Schema(
  {
    vendorId: { type: String, unique: true },  
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true,  },
    address: { type: String, required: true },
    gstin: { type: String, required: true, trim: true, unique: true },
    paymentDays: { type: Number, required: true, min: 0 },
   
    notes: { type: String },
    status: { type: String, enum: ["active","inactive","blocked","deleted"], default: "active" },
  },
  { timestamps: true }
);

VendorSchema.pre("save", async function (next) {
  if (!this.vendorId) {
    const lastVendor = await mongoose
      .model("Vendor")
      .findOne({})
      .sort({ createdAt: -1 })
      .exec();

    let newIdNumber = 1;

    if (lastVendor && lastVendor.vendorId) {
      const lastId = lastVendor.vendorId.split("-")[1]; 
      newIdNumber = parseInt(lastId, 10) + 1;
    }

    this.vendorId = `VND-${newIdNumber.toString().padStart(3, "0")}`;
  }

  next();
});

export type VendorDocument = mongoose.InferSchemaType<typeof VendorSchema>;

export default mongoose.model<VendorDocument>("Vendor", VendorSchema);
