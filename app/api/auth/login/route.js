import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/lib/auth";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId, username, password } = body;

    const inputId = (userId || username || "").trim();

    if (!inputId || !password) {
      return NextResponse.json(
        { message: "아이디와 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      $or: [{ userId: inputId }, { username: inputId }],
    });

    if (!user) {
      return NextResponse.json(
        { message: "아이디 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "아이디 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user._id.toString(),
      loginId: user.userId || user.username,
      nickname: user.nickname,
    });

    const response = NextResponse.json(
      {
        message: "로그인 성공",
        user: {
          id: user._id.toString(),
          userId: user.userId || user.username,
          nickname: user.nickname,
        },
      },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("로그인 오류:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}