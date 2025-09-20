import mongoose, { Schema } from "mongoose";

const STATUS_TYPES = ["draft","comfimed","active","deleted"] as const;

const BoqSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    boqName: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    notes: { type: String, trim: true },
    status:{type: String, enum:STATUS_TYPES},
    items: [
      {
        item: {
          type: Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        plannedQty: { type: Number, required: true },
        unit: { type: String, required: true },
        rate: { type: Number }, 
      },
    ],
  },
  { timestamps: true }
);

export type BoqDocument = mongoose.InferSchemaType<typeof BoqSchema>;

export default mongoose.model<BoqDocument>("Boq", BoqSchema);
