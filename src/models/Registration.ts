import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const RegistrationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, required: true, trim: true, maxlength: 32 },
    city: { type: String, required: true, trim: true, maxlength: 80 },
    state: { type: String, trim: true, maxlength: 64 },

    // Google Sheets sync tracking
    sheetSynced: { type: Boolean, default: false },
    sheetSyncedAt: { type: Date },
    sheetSyncError: { type: String },

    // Light request metadata (useful for debugging / abuse checks)
    userAgent: { type: String, maxlength: 512 },
  },
  {
    timestamps: true, // createdAt / updatedAt
    collection: "registrations",
  },
);

RegistrationSchema.index({ email: 1 });
RegistrationSchema.index({ createdAt: -1 });
RegistrationSchema.index({ sheetSynced: 1 });

export type RegistrationDoc = InferSchemaType<typeof RegistrationSchema> & {
  _id: mongoose.Types.ObjectId;
};

// Re-use the compiled model across hot reloads.
export const Registration: Model<RegistrationDoc> =
  (mongoose.models.Registration as Model<RegistrationDoc> | undefined) ??
  mongoose.model<RegistrationDoc>("Registration", RegistrationSchema);
