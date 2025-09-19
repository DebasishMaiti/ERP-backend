import mongoose, { Schema } from "mongoose";

const STATUS_TYPES = ["planned", "in progress", "on hold", "completed"] as const;

const ProjectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    projectCode: { type: String, required: true, unique: true, trim: true },
     location:{type: String, required: true},
    startDate: { type: Date, required: true },
   
    targetCompletionDate: { type: Date, required: true },
    status: {
      type: String,
      enum: STATUS_TYPES,
      default: "planned",
      required: true,
    },
    notes: { type: String, trim: true },
    employees: [
      {
        type: Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],
  },
  { timestamps: true }
);
 
export type ProjectDocument = mongoose.InferSchemaType<typeof ProjectSchema>;
 
export default mongoose.model<ProjectDocument>("Project", ProjectSchema);
