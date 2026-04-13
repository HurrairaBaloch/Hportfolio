import mongoose, { Schema, Document } from "mongoose";

export interface IGame extends Document {
  type: "game" | "asset" | "project";
  title: string;
  description: string;
  imageUrl: string;
  imagePublicId: string;
  videoUrl?: string;
  tags: string[];
  link: string;
  dateAdded: Date;
}

const GameSchema = new Schema<IGame>(
  {
    type: { type: String, enum: ["game", "asset", "project"], default: "project" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    videoUrl: { type: String, default: "" },
    tags: [{ type: String }],
    link: { type: String, default: "" },
    dateAdded: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Game || mongoose.model<IGame>("Game", GameSchema);
