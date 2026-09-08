import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const body = await request.json();

    const { userId, password } = body;

    if (!userId || !password) {
      return NextResponse.json(
        {
          message: "아이디와 비밀번호를 입력해주세요.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("neighborly");
    const users = db.collection("User");

    const user = await users.findOne({ userId });

    if (!user) {
      return NextResponse.json(
        {
          message: "아이디 또는 비밀번호가 올바르지 않습니다.",
        },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return NextResponse.json(
        {
          message: "아이디 또는 비밀번호가 올바르지 않습니다.",
        },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        loginId: user.userId,
        nickname: user.nickname,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const response = NextResponse.json(
      {
        message: "로그인 성공",
        user: {
          id: user._id.toString(),
          userId: user.userId,
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
      {
        message: "서버 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}