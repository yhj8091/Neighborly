import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Comment from "@/models/Comment";
import Post from "@/models/Post";

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "올바르지 않은 댓글 ID입니다.",
        },
        { status: 400 }
      );
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return NextResponse.json(
        {
          success: false,
          message: "댓글을 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    await Comment.findByIdAndDelete(id);

    await Post.findByIdAndUpdate(comment.postId, {
      $inc: {
        commentCount: -1,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "댓글이 삭제되었습니다.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("댓글 삭제 오류:", error);

    return NextResponse.json(
      {
        success: false,
        message: "댓글 삭제에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}