import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Post from "@/models/Post";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const keyword = searchParams.get("keyword") || "";
    const category = searchParams.get("category") || "";

    const query = {};

    if (keyword.trim()) {
      query.$or = [
        {
          title: {
            $regex: keyword.trim(),
            $options: "i",
          },
        },
        {
          content: {
            $regex: keyword.trim(),
            $options: "i",
          },
        },
      ];
    }

    if (category && category !== "전체") {
      query.category = category;
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        posts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("게시글 검색 오류:", error);

    return NextResponse.json(
      {
        success: false,
        message: "게시글 검색에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}