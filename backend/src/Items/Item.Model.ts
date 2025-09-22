import mongoose, { Schema } from "mongoose";

const STATUS_TYPES = ["active", "inactive"] as const;

const ItemSchema = new Schema(
  {
    itemId: { type: String, unique: true }, 
    name: { type: String, required: true },
    unit: { type: String, required: true },
    status: { type: String, enum: ["active", "deleted"], default: "active" },
    vendors: [
      {
        vendor: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
        name:{type:String},
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

ItemSchema.pre("save", async function (next) {
  if (this.isNew) {
    const lastItem = await mongoose.model("Item").findOne({}, {}, { sort: { createdAt: -1 } });
    let newId = "ITM-001";

    if (lastItem && lastItem.itemId) {
      const lastNumber = parseInt(lastItem.itemId.split("-")[1], 10);
      const nextNumber = lastNumber + 1;
      newId = `ITM-${String(nextNumber).padStart(3, "0")}`;
    }

    this.itemId = newId;
  }
  next();
});

export type ItemDocument = mongoose.InferSchemaType<typeof ItemSchema>;

export default mongoose.model<ItemDocument>("Item", ItemSchema);
