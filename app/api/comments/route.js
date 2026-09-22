import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import User from "@/models/User";
import { getUserFromToken } from "@/lib/auth";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json(
        { message: "올바른 게시글 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const comments = await Comment.find({ postId })
      .populate("authorId", "nickname userId username")
      .sort({ createdAt: 1 })
      .lean();

    const formattedComments = comments.map((c) => ({
      ...c,
      id: c._id.toString(),
      author: c.authorId
        ? {
            id: c.authorId._id?.toString(),
            nickname: c.authorId.nickname || "알 수 없음",
            userId: c.authorId.userId || c.authorId.username,
          }
        : { nickname: "알 수 없음" },
    }));

    return NextResponse.json(
      {
        comments: formattedComments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("댓글 조회 오류:", error);
    return NextResponse.json(
      { message: "댓글을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { postId, content } = body;

    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json(
        { message: "올바른 게시글 ID가 필요합니다." },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { message: "댓글 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    if (content.trim().length > 500) {
      return NextResponse.json(
        { message: "댓글은 500자 이하로 입력해주세요." },
        { status: 400 }
      );
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json(
        { message: "존재하지 않는 게시글입니다." },
        { status: 404 }
      );
    }

    const newComment = await Comment.create({
      postId,
      authorId: user.userId,
      content: content.trim(),
      createdAt: new Date(),
    });

    await Post.findByIdAndUpdate(postId, {
      $inc: { commentCount: 1 },
    });

    const populatedComment = await Comment.findById(newComment._id)
      .populate("authorId", "nickname userId username")
      .lean();

    return NextResponse.json(
      {
        message: "댓글이 등록되었습니다.",
        comment: {
          id: populatedComment._id.toString(),
          _id: populatedComment._id.toString(),
          postId,
          content: populatedComment.content,
          createdAt: populatedComment.createdAt,
          author: {
            id: user.userId,
            nickname: user.nickname,
            userId: user.loginId,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("댓글 작성 오류:", error);
    return NextResponse.json(
      { message: "댓글 등록 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}