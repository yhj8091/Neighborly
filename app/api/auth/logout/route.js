import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    {
      success: true,
      message: "로그아웃되었습니다.",
    },
    { status: 200 }
  );

  response.cookies.set("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}