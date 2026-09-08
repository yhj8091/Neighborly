import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      username,
      password,
      nickname,
    } = body;

    // 필수값 확인
    if (!username || !password || !nickname) {
      return NextResponse.json(
        {
          message:
            "아이디, 비밀번호, 닉네임을 모두 입력해주세요.",
        },
        { status: 400 }
      );
    }

    // 공백 확인
    if (
      username.trim() === "" ||
      password.trim() === "" ||
      nickname.trim() === ""
    ) {
      return NextResponse.json(
        {
          message: "입력값을 확인해주세요.",
        },
        { status: 400 }
      );
    }

    // 아이디 길이 확인
    if (
      username.length < 3 ||
      username.length > 30
    ) {
      return NextResponse.json(
        {
          message:
            "아이디는 3~30자로 입력해주세요.",
        },
        { status: 400 }
      );
    }

    // 비밀번호 길이 확인
    if (
      password.length < 6 ||
      password.length > 100
    ) {
      return NextResponse.json(
        {
          message:
            "비밀번호는 6~100자로 입력해주세요.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // 중복 아이디 확인
    const existingUser = await User.findOne({
      username: username.trim(),
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "이미 사용 중인 아이디입니다.",
        },
        { status: 409 }
      );
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // 사용자 생성
    const user = await User.create({
      username: username.trim(),
      password: hashedPassword,
      nickname: nickname.trim(),
    });

    return NextResponse.json(
      {
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
        message:
          "회원가입 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}