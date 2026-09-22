import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Bookmark from "@/models/Bookmark";
import Post from "@/models/Post";
import { getUserFromToken } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ bookmarked: false }, { status: 200 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "올바르지 않은 게시글 ID입니다." },
        { status: 400 }
      );
    }

    const bookmark = await Bookmark.findOne({
      postId: id,
      userId: user.userId,
    });

    return NextResponse.json(
      { bookmarked: Boolean(bookmark) },
      { status: 200 }
    );
  } catch (error) {
    console.error("북마크 확인 오류:", error);
    return NextResponse.json(
      { message: "북마크 상태 확인에 실패했습니다." },
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
        { message: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const existing = await Bookmark.findOne({
      postId: id,
      userId: user.userId,
    });

    if (existing) {
      return NextResponse.json(
        { message: "이미 북마크에 저장된 게시글입니다.", bookmarked: true },
        { status: 200 }
      );
    }

    await Bookmark.create({
      postId: id,
      userId: user.userId,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: "북마크에 저장되었습니다.", bookmarked: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("북마크 추가 오류:", error);
    return NextResponse.json(
      { message: "북마크 저장 중 오류가 발생했습니다." },
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

    await Bookmark.deleteOne({
      postId: id,
      userId: user.userId,
    });

    return NextResponse.json(
      { message: "북마크를 취소했습니다.", bookmarked: false },
      { status: 200 }
    );
  } catch (error) {
    console.error("북마크 취소 오류:", error);
    return NextResponse.json(
      { message: "북마크 취소 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
