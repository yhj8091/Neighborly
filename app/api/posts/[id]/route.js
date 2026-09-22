import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Post from "@/models/Post";
import User from "@/models/User";
import Comment from "@/models/Comment";
import Like from "@/models/Like";
import Bookmark from "@/models/Bookmark";
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

    const post = await Post.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("authorId", "nickname userId username")
      .lean();

    if (!post) {
      return NextResponse.json(
        { message: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const formattedPost = {
      ...post,
      id: post._id.toString(),
      author: post.authorId
        ? {
            id: post.authorId._id?.toString(),
            nickname: post.authorId.nickname || "알 수 없음",
            userId: post.authorId.userId || post.authorId.username,
          }
        : { nickname: "알 수 없음" },
    };

    return NextResponse.json(
      {
        post: formattedPost,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("게시글 상세 조회 오류:", error);
    return NextResponse.json(
      { message: "게시글을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
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
        { message: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // Check author permission
    if (post.authorId.toString() !== user.userId) {
      return NextResponse.json(
        { message: "게시글 수정 권한이 없습니다." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, category, imageUrl, neighborhood } = body;

    if (title !== undefined) {
      if (!title.trim()) {
        return NextResponse.json(
          { message: "게시글 제목을 입력해주세요." },
          { status: 400 }
        );
      }
      post.title = title.trim();
    }

    if (content !== undefined) {
      if (!content.trim()) {
        return NextResponse.json(
          { message: "게시글 내용을 입력해주세요." },
          { status: 400 }
        );
      }
      post.content = content.trim();
    }

    if (category !== undefined) {
      post.category = category.trim();
    }

    if (neighborhood !== undefined && neighborhood.trim()) {
      post.neighborhood = neighborhood.trim();
    }

    if (imageUrl !== undefined) {
      post.imageUrl = imageUrl;
    }

    post.updatedAt = new Date();
    await post.save();

    return NextResponse.json(
      {
        message: "게시글이 수정되었습니다.",
        post: {
          id: post._id.toString(),
          title: post.title,
          content: post.content,
          category: post.category,
          imageUrl: post.imageUrl,
          updatedAt: post.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("게시글 수정 오류:", error);
    return NextResponse.json(
      { message: "게시글 수정 중 오류가 발생했습니다." },
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

    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json(
        { message: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // Check author permission
    if (post.authorId.toString() !== user.userId) {
      return NextResponse.json(
        { message: "게시글 삭제 권한이 없습니다." },
        { status: 403 }
      );
    }

    // Cascade delete comments, likes, bookmarks
    await Promise.all([
      Post.findByIdAndDelete(id),
      Comment.deleteMany({ postId: id }),
      Like.deleteMany({ postId: id }),
      Bookmark.deleteMany({ postId: id }),
    ]);

    return NextResponse.json(
      {
        message: "게시글이 삭제되었습니다.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("게시글 삭제 오류:", error);
    return NextResponse.json(
      { message: "게시글 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}