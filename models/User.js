import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      username,
      password,
      nickname,
    } = body;

    if (!username || !username.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "아이디를 입력해주세요.",
        },
        { status: 400 }
      );
    }

    if (!password || !password.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "비밀번호를 입력해주세요.",
        },
        { status: 400 }
      );
    }

    if (!nickname || !nickname.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "닉네임을 입력해주세요.",
        },
        { status: 400 }
      );
    }

    if (username.trim().length < 4) {
      return NextResponse.json(
        {
          success: false,
          message: "아이디는 4자 이상 입력해주세요.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "비밀번호는 6자 이상 입력해주세요.",
        },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({
      username: username.trim(),
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "이미 사용 중인 아이디입니다.",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      username: username.trim(),
      password: hashedPassword,
      nickname: nickname.trim(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "회원가입이 완료되었습니다.",
        user: {
          id: user._id,
          username: user.username,
          nickname: user.nickname,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("회원가입 오류:", error);

    return NextResponse.json(
      {
        success: false,
        message: "회원가입에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}