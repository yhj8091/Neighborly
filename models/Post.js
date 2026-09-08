import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["맛집", "카페", "행사", "생활정보"],
    },

    imageUrl: {
      type: String,
      default: "",
    },

    likeCount: {
      type: Number,
      default: 0,
    },

    commentCount: {
      type: Number,
      default: 0,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

export default mongoose.models.Post ||
  mongoose.model("Post", PostSchema);