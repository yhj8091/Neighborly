import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
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

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          username: user.username,
          nickname: user.nickname,
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