import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/lib/auth";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId, username, password, nickname, neighborhood } = body;

    const finalUserId = (userId || username || "").trim();
    const finalNickname = (nickname || "").trim();
    const finalNeighborhood = (neighborhood || "역삼동").trim();

    if (!finalUserId || !password || !finalNickname) {
      return NextResponse.json(
        { message: "필수 정보를 모두 입력해주세요." },
        { status: 400 }
      );
    }

    if (finalUserId.length < 3 || finalUserId.length > 20) {
      return NextResponse.json(
        { message: "아이디는 3~20자로 입력해주세요." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "비밀번호는 6자 이상 입력해주세요." },
        { status: 400 }
      );
    }

    // Check if user already exists by userId or username
    const existingUser = await User.findOne({
      $or: [{ userId: finalUserId }, { username: finalUserId }],
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "이미 사용 중인 아이디입니다." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      userId: finalUserId,
      username: finalUserId,
      password: hashedPassword,
      nickname: finalNickname,
      neighborhood: finalNeighborhood,
    });

    const token = signToken({
      userId: user._id.toString(),
      loginId: user.userId,
      nickname: user.nickname,
    });

    const response = NextResponse.json(
      {
        message: "회원가입이 완료되었습니다.",
        user: {
          id: user._id.toString(),
          userId: user.userId,
          nickname: user.nickname,
        },
      },
      { status: 201 }
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
    console.error("회원가입 오류:", error);
    return NextResponse.json(
      { message: "회원가입 중 서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}