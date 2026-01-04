import mongoose from "mongoose";

const creationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    type: String,
    prompt: String,
    result: String,

    // ✅ ADD THESE
    publish: {
      type: Boolean,
      default: false,
    },
    likes: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Creation", creationSchema);
