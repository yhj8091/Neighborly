import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Like from "@/models/Like";
import Post from "@/models/Post";
import { getUserFromToken } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "올바르지 않은 게시글 ID입니다." },
        { status: 400 }
      );
    }

    const post = await Post.findById(id).select("likeCount").lean();
    if (!post) {
      return NextResponse.json(
        { message: "존재하지 않는 게시글입니다." },
        { status: 404 }
      );
    }

    const user = getUserFromToken(request);
    let liked = false;

    if (user) {
      const existingLike = await Like.findOne({
        postId: id,
        userId: user.userId,
      });
      liked = Boolean(existingLike);
    }

    return NextResponse.json(
      {
        liked,
        likeCount: post.likeCount || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("좋아요 상태 조회 오류:", error);
    return NextResponse.json(
      { message: "좋아요 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
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
        { message: "올바르지 않은 게시글 ID입니다." },
        { status: 400 }
      );
    }

    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json(
        { message: "존재하지 않는 게시글입니다." },
        { status: 404 }
      );
    }

    const existingLike = await Like.findOne({
      postId: id,
      userId: user.userId,
    });

    if (existingLike) {
      return NextResponse.json(
        {
          message: "이미 좋아요를 누른 게시글입니다.",
          liked: true,
          likeCount: post.likeCount,
        },
        { status: 200 }
      );
    }

    await Like.create({
      postId: id,
      userId: user.userId,
      createdAt: new Date(),
    });

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $inc: { likeCount: 1 } },
      { new: true }
    );

    return NextResponse.json(
      {
        message: "좋아요를 눌렀습니다.",
        liked: true,
        likeCount: updatedPost.likeCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("좋아요 처리 오류:", error);
    return NextResponse.json(
      { message: "좋아요 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

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
        { message: "올바르지 않은 게시글 ID입니다." },
        { status: 400 }
      );
    }

    const like = await Like.findOne({
      postId: id,
      userId: user.userId,
    });

    if (!like) {
      const currentPost = await Post.findById(id).select("likeCount");
      return NextResponse.json(
        {
          message: "좋아요를 누르지 않은 게시글입니다.",
          liked: false,
          likeCount: currentPost?.likeCount || 0,
        },
        { status: 200 }
      );
    }

    await Like.deleteOne({ _id: like._id });

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $inc: { likeCount: -1 } },
      { new: true }
    );

    const safeCount = Math.max(0, updatedPost?.likeCount || 0);
    if (updatedPost && updatedPost.likeCount < 0) {
      await Post.findByIdAndUpdate(id, { likeCount: 0 });
    }

    return NextResponse.json(
      {
        message: "좋아요를 취소했습니다.",
        liked: false,
        likeCount: safeCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("좋아요 취소 오류:", error);
    return NextResponse.json(
      { message: "좋아요 취소 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}