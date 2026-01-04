import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    prompt: {
      type: String,
      required: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    style: {
      type: String,
      default: "realistic", // anime, ghibli, 3d, cartoon
    },

    size: {
      type: String,
      default: "1024x1024",
    },

    plan: {
      type: String,
      enum: ["free", "premium"],
      default: "free",
    },

    published: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Image = mongoose.model("Image", imageSchema);
