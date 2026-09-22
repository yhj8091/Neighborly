import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Post from "@/models/Post";
import Bookmark from "@/models/Bookmark";
import Comment from "@/models/Comment";
import { getUserFromToken } from "@/lib/auth";

export async function GET(request) {
  try {
    await connectDB();

    const decoded = getUserFromToken(request);

    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          message: "로그인이 필요합니다.",
        },
        { status: 401 }
      );
    }

    const user = await User.findById(decoded.userId)
      .select("-password")
      .lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "사용자를 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    // Get counts of user activities
    const [postCount, commentCount, bookmarkCount] = await Promise.all([
      Post.countDocuments({ authorId: user._id }),
      Comment.countDocuments({ authorId: user._id }),
      Bookmark.countDocuments({ userId: user._id }),
    ]);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          userId: user.userId || user.username,
          username: user.username || user.userId,
          nickname: user.nickname,
          neighborhood: user.neighborhood || "역삼동",
          profileImage: user.profileImage || "",
          createdAt: user.createdAt,
          postCount,
          commentCount,
          bookmarkCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("사용자 인증 확인 오류:", error);
    return NextResponse.json(
      {
        success: false,
        message: "사용자 정보를 확인할 수 없습니다.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    await connectDB();

    const decoded = getUserFromToken(request);

    if (!decoded) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { neighborhood, nickname } = body;

    const updateFields = {};
    if (neighborhood && neighborhood.trim()) {
      updateFields.neighborhood = neighborhood.trim();
    }
    if (nickname && nickname.trim()) {
      updateFields.nickname = nickname.trim();
    }

    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { $set: updateFields },
      { new: true }
    ).select("-password").lean();

    if (!updatedUser) {
      return NextResponse.json(
        { message: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "내 동네 설정이 업데이트되었습니다.",
        user: {
          id: updatedUser._id.toString(),
          userId: updatedUser.userId || updatedUser.username,
          nickname: updatedUser.nickname,
          neighborhood: updatedUser.neighborhood || "역삼동",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("내 정보 수정 오류:", error);
    return NextResponse.json(
      { message: "설정 변경 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}