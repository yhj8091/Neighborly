import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import { getUserFromToken } from "@/lib/auth";

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "올바르지 않은 댓글 ID입니다." },
        { status: 400 }
      );
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return NextResponse.json(
        { message: "댓글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // Check author permission
    if (comment.authorId.toString() !== user.userId) {
      return NextResponse.json(
        { message: "본인이 작성한 댓글만 삭제할 수 있습니다." },
        { status: 403 }
      );
    }

    await Comment.findByIdAndDelete(id);

    await Post.findByIdAndUpdate(comment.postId, {
      $inc: { commentCount: -1 },
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
      { message: "댓글 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}