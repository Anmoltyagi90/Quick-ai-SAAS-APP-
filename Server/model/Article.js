import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
      enum: ["free", "premium"],
      default: "free",
    },
  },
  { timestamps: true }
);

export const Article = mongoose.model("Article", articleSchema);
