import mongoose from "mongoose";

const LikeSchema = new mongoose.Schema(
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

// 한 사용자가 같은 게시글에 여러 번 좋아요를 누르지 못하도록 설정
LikeSchema.index(
  { postId: 1, userId: 1 },
  { unique: true }
);

export default mongoose.models.Like ||
  mongoose.model("Like", LikeSchema);