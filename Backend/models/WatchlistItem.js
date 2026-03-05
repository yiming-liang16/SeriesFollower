import mongoose from "mongoose";

const watchlistItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    titleId: { type: mongoose.Schema.Types.ObjectId, ref: "Title", required: true, index: true },
    status: {
      type: String,
      enum: ["want_to_watch", "watching", "watched"],
      default: "want_to_watch",
      index: true,
    },

    // ✅ 你说的 progress 放这里就可以
    progress: {
      season: { type: Number, min: 1 },
      episode: { type: Number, min: 1 },
      updatedAt: { type: Date },
    },
  },
  { timestamps: true }
);

watchlistItemSchema.index({ userId: 1, titleId: 1 }, { unique: true });

export default mongoose.model("WatchlistItem", watchlistItemSchema);