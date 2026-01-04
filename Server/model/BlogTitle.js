import mongoose from "mongoose";

const blogTitleSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    titles: {
      type: String, // ya Array agar multiple titles generate ho
      required: true,
    },
    plan: {
      type: String,
      default: "free",
    },
  },
  { timestamps: true }
);

export const BlogTitle = mongoose.model("BlogTitle", blogTitleSchema);
