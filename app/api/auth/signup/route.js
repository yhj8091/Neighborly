import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      userId,
      password,
      nickname,
    } = body;

    // 필수값 검사
    if (!userId || !password || !nickname) {
      return NextResponse.json(
        {
          message: "필수 정보를 모두 입력해주세요.",
        },
        { status: 400 }
      );
    }

    // 아이디 길이 검사
    if (userId.length < 4 || userId.length > 20) {
      return NextResponse.json(
        {
          message: "아이디는 4~20자로 입력해주세요.",
        },
        { status: 400 }
      );
    }

    // 비밀번호 검사
    if (password.length < 6) {
      return NextResponse.json(
        {
          message: "비밀번호는 6자 이상 입력해주세요.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;

    const db = client.db("neighborly");

    const users = db.collection("User");

    // 이미 존재하는 아이디 확인
    const existingUser = await users.findOne({
      userId,
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

    // User 저장
    const result = await users.insertOne({
      userId,
      password: hashedPassword,
      nickname,
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        message: "회원가입이 완료되었습니다.",
        user: {
          id: result.insertedId.toString(),
          userId,
          nickname,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("회원가입 오류:", error);

    return NextResponse.json(
      {
        message: "서버 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}