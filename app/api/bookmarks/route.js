import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Bookmark from "@/models/Bookmark";
import Post from "@/models/Post";
import User from "@/models/User";
import { getUserFromToken } from "@/lib/auth";

export async function GET(request) {
  try {
    await connectDB();
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json(
        { message: "로그인이 필요합니다.", bookmarks: [] },
        { status: 401 }
      );
    }

    const bookmarks = await Bookmark.find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "postId",
        populate: {
          path: "authorId",
          select: "nickname userId username",
        },
      })
      .lean();

    // Filter out bookmarks where the post might have been deleted
    const validPosts = bookmarks
      .filter((b) => b.postId)
      .map((b) => {
        const post = b.postId;
        return {
          ...post,
          id: post._id.toString(),
          bookmarkedAt: b.createdAt,
          author: post.authorId
            ? {
                nickname: post.authorId.nickname || "알 수 없음",
                userId: post.authorId.userId || post.authorId.username,
              }
            : { nickname: "알 수 없음" },
        };
      });

    return NextResponse.json(
      {
        success: true,
        bookmarks: validPosts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("북마크 목록 조회 오류:", error);
    return NextResponse.json(
      { message: "북마크 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
