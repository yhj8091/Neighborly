import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import jwt from "jsonwebtoken";

function getUserFromRequest(request) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("neighborly");

    const posts = await db
      .collection("Post")
      .aggregate([
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $lookup: {
            from: "User",
            localField: "authorId",
            foreignField: "_id",
            as: "author",
          },
        },
        {
          $unwind: {
            path: "$author",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            title: 1,
            content: 1,
            category: 1,
            imageUrl: 1,
            likeCount: 1,
            createdAt: 1,
            authorId: 1,
            "author.nickname": 1,
          },
        },
      ])
      .toArray();

    return NextResponse.json(
      {
        posts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("게시글 목록 조회 오류:", error);

    return NextResponse.json(
      {
        message: "게시글을 불러오는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        {
          message: "로그인이 필요합니다.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      title,
      content,
      category,
      imageUrl,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        {
          message: "게시글 제목을 입력해주세요.",
        },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        {
          message: "게시글 내용을 입력해주세요.",
        },
        { status: 400 }
      );
    }

    if (!category || !category.trim()) {
      return NextResponse.json(
        {
          message: "카테고리를 선택해주세요.",
        },
        { status: 400 }
      );
    }

    if (title.trim().length > 100) {
      return NextResponse.json(
        {
          message: "제목은 100자 이하로 입력해주세요.",
        },
        { status: 400 }
      );
    }

    if (content.trim().length > 5000) {
      return NextResponse.json(
        {
          message: "내용은 5000자 이하로 입력해주세요.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("neighborly");

    const { ObjectId } = require("mongodb");

    const authorId = new ObjectId(user.userId);

    const post = {
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
      authorId,
      imageUrl: imageUrl || "",
      likeCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("Post").insertOne(post);

    return NextResponse.json(
      {
        message: "게시글이 등록되었습니다.",
        post: {
          id: result.insertedId.toString(),
          title: post.title,
          content: post.content,
          category: post.category,
          authorId: post.authorId.toString(),
          imageUrl: post.imageUrl,
          likeCount: post.likeCount,
          createdAt: post.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("게시글 작성 오류:", error);

    return NextResponse.json(
      {
        message: "게시글 등록 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}