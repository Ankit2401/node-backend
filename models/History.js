import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    user_id:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    paper_id:   { type: String, required: true },
    title:      { type: String, required: true },
    num_chunks: { type: Number, default: 0 },
    message:    { type: String, default: "" },
  },
  { timestamps: true }
);

// One entry per user+paper combo
historySchema.index({ user_id: 1, paper_id: 1 }, { unique: true });

export default mongoose.model("History", historySchema);
