import mongoose, { Schema } from "mongoose";

const STATUS_TYPES = ["draft", "confirmed", "active", "deleted"] as const;

const BoqSchema = new Schema(
  {
    boqId: { type: String, unique: true }, 

    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    notes: { type: String, trim: true },
    status: { type: String, enum: STATUS_TYPES },
    projectName:{type:String},
    items: [
      {
        item: {
          type: Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        itemName:{type:String, required: true },
        plannedQty: { type: Number, required: true },
        unit: { type: String, required: true },
        rate: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

 
BoqSchema.pre("save", async function (next) {
  if (!this.boqId) {
    const lastBoq = await mongoose
      .model("Boq")
      .findOne({})
      .sort({ createdAt: -1 })
      .exec();

    let newIdNumber = 1;

    if (lastBoq && lastBoq.boqId) {
      const lastId = lastBoq.boqId.split("-")[1];
      newIdNumber = parseInt(lastId, 10) + 1;
    }

    this.boqId = `BQ-${newIdNumber.toString().padStart(3, "0")}`;
  }

  next();
});

export type BoqDocument = mongoose.InferSchemaType<typeof BoqSchema>;

export default mongoose.model<BoqDocument>("Boq", BoqSchema);
