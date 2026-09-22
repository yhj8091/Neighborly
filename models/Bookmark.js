import mongoose from "mongoose";

const BookmarkSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

BookmarkSchema.index({ postId: 1, userId: 1 }, { unique: true });

export default mongoose.models.Bookmark ||
  mongoose.model("Bookmark", BookmarkSchema);
